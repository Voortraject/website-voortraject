import { afterEach, describe, expect, it, vi } from "vitest";

// De lead-insert van de function subsidiecheck-mail, met zijn terugval.
//
// De herkomstkolommen (utm_*, fbclid, meta_event_id) komen met een aparte
// CRM-migratie, en de function kan eerder live gaan. Zolang de kolommen er niet
// zijn, weigert PostgREST de insert (PGRST204). Dan mag de lead niet verloren
// gaan, en ook de verrijking en het toestemmingsbewijs niet.

import { insertLead, isOnbekendeKolom, type LeadClient } from "../../supabase/functions/subsidiecheck-mail/leadInsert";

type Uitkomst = { data: { id?: unknown } | null; error: unknown };

/** Een nep-client die per poging een uitkomst teruggeeft en elke rij bewaart. */
const nepClient = (...uitkomsten: Uitkomst[]) => {
  const rijen: Record<string, unknown>[] = [];
  const tabellen: string[] = [];
  const client: LeadClient = {
    from: (tabel) => ({
      insert: (rij) => ({
        select: () => ({
          maybeSingle: async () => {
            tabellen.push(tabel);
            rijen.push(rij);
            return uitkomsten[rijen.length - 1] ?? { data: null, error: { message: "geen uitkomst meer" } };
          },
        }),
      }),
    }),
  };
  return { client, rijen, tabellen };
};

const OK: Uitkomst = { data: { id: "lead-1" }, error: null };
const KOLOM_ONBEKEND: Uitkomst = {
  data: null,
  error: { code: "PGRST204", message: "Could not find the 'utm_source' column of 'leads_bewoners' in the schema cache" },
};
const CHECK_FOUT: Uitkomst = { data: null, error: { code: "23514", message: "violates check constraint" } };

const basis = { email: "jan@example.nl", postcode: "9711AB" };
const verrijking = { energielabel: "B", toestemming_tekst: "Ja" };
const herkomst = { utm_source: "meta", fbclid: "IwAR1", meta_event_id: "6f9619ff-8b86-4011-b42d-00c04fc964ff" };

afterEach(() => vi.restoreAllMocks());

describe("insertLead", () => {
  it("schrijft alles in één keer als de kolommen bestaan", async () => {
    const { client, rijen, tabellen } = nepClient(OK);
    const uitkomst = await insertLead(client, basis, verrijking, herkomst);

    expect(uitkomst).toEqual(OK);
    expect(tabellen).toEqual(["leads_bewoners"]);
    expect(rijen).toEqual([{ ...basis, ...verrijking, ...herkomst }]);
  });

  it.each([
    ["PostgREST (PGRST204)", KOLOM_ONBEKEND],
    ["Postgres (42703)", { data: null, error: { code: "42703", message: 'column "fbclid" does not exist' } }],
  ])("probeert bij een onbekende kolom van %s opnieuw zonder alleen de herkomst", async (_naam, fout) => {
    const waarschuwing = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { client, rijen } = nepClient(fout as Uitkomst, OK);

    const uitkomst = await insertLead(client, basis, verrijking, herkomst);

    expect(uitkomst).toEqual(OK);
    expect(rijen).toHaveLength(2);
    // Verrijking en toestemming blijven staan; alleen de herkomst valt weg.
    expect(rijen[1]).toEqual({ ...basis, ...verrijking });
    expect(waarschuwing).toHaveBeenCalledTimes(1);
  });

  it("laat bij een andere fout eerst de verrijking vallen en houdt de herkomst", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { client, rijen } = nepClient(CHECK_FOUT, OK);

    await insertLead(client, basis, verrijking, herkomst);

    expect(rijen[1]).toEqual({ ...basis, ...herkomst });
  });

  it("valt in het slechtste geval terug op alleen de basis, in hooguit drie pogingen", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { client, rijen } = nepClient(KOLOM_ONBEKEND, CHECK_FOUT, OK);

    const uitkomst = await insertLead(client, basis, verrijking, herkomst);

    expect(uitkomst).toEqual(OK);
    expect(rijen).toEqual([{ ...basis, ...verrijking, ...herkomst }, { ...basis, ...verrijking }, basis]);
  });

  it("geeft een fout op de basis zelf terug in plaats van eindeloos te proberen", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { client, rijen } = nepClient(CHECK_FOUT, CHECK_FOUT, CHECK_FOUT, CHECK_FOUT);

    const uitkomst = await insertLead(client, basis, verrijking, herkomst);

    expect(uitkomst.error).toBe(CHECK_FOUT.error);
    expect(rijen).toHaveLength(3);
  });

  it("doet zonder herkomst precies wat hij altijd deed", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { client, rijen } = nepClient(CHECK_FOUT, OK);

    await insertLead(client, basis, verrijking);

    expect(rijen).toEqual([{ ...basis, ...verrijking }, basis]);
  });

  it("herkent alleen een onbekende kolom als onbekende kolom", () => {
    expect(isOnbekendeKolom(KOLOM_ONBEKEND.error)).toBe(true);
    expect(isOnbekendeKolom({ code: "42703" })).toBe(true);
    expect(isOnbekendeKolom(CHECK_FOUT.error)).toBe(false);
    expect(isOnbekendeKolom(null)).toBe(false);
    expect(isOnbekendeKolom("PGRST204")).toBe(false);
  });
});

describe("de function gebruikt insertLead", () => {
  it("voor beide schrijfroutes, met de herkomst erbij", async () => {
    const { readFileSync } = await import("fs");
    // De gewone route staat in index.ts, de route "bericht" in bericht.ts.
    for (const bestand of ["index.ts", "bericht.ts"]) {
      const bron = readFileSync(`supabase/functions/subsidiecheck-mail/${bestand}`, "utf8");
      expect(bron).toContain("import { insertLead");
      // Geen eigen insert op leads_bewoners naast insertLead.
      expect(bron).not.toMatch(/from\("leads_bewoners"\)\s*\.insert/);
      expect([...bron.matchAll(/insertLead\(/g)]).toHaveLength(1);
      expect([...bron.matchAll(/verrijking,\s*(?:args\.)?herkomst\s*,?\s*\)/g)]).toHaveLength(1);
    }
  });
});
