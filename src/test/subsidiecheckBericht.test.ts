import { afterEach, describe, expect, it, vi } from "vitest";

// Route "bericht" van subsidiecheck-mail: wat de bezoeker na de poort doet. Een
// klik (uitzoeken, lastigst) wordt een veld op de lead zonder mail; alleen een
// getypte vraag gaat via de RPC naar de communicatietab en per mail naar het
// team. `notities` raakt deze route niet meer aan. De logica leeft in Deno, maar
// is puur → hier testbaar, net als leadInsert.ts.

import {
  bepaalBericht,
  bepaalHulpvragen,
  HULPREGEL_PREFIX,
  MAX_LABEL_LENGTE,
  MAX_LABELS,
  schoonLabels,
  UITZOEK_BERICHT as FUNCTIE_UITZOEK_BERICHT,
  verwerkBericht,
  VRAAG_RPC,
  type BerichtClient,
} from "../../supabase/functions/subsidiecheck-mail/bericht";
import { lastigstTekst, UITZOEK_BERICHT } from "@/components/subsidiecheck/uitzoekAanvraag";

afterEach(() => vi.restoreAllMocks());

describe("de kopieën in de function", () => {
  it("de uitzoektekst is gelijk aan die van de site, anders herkent de function een oude bundel niet", () => {
    expect(FUNCTIE_UITZOEK_BERICHT).toBe(UITZOEK_BERICHT);
  });

  it("de lastigst-tekst van de site is terug te lezen als dezelfde keuzes", () => {
    const keuzes = ["Door de bomen het bos niet meer zien", "De subsidies maximaal benutten", "Het papierwerk"];
    expect(bepaalBericht({ bericht: lastigstTekst(keuzes) })).toEqual({ soort: "lastigst", keuzes });
  });

  it("de hulpregel heeft dezelfde kop als in StapGegevens", () => {
    expect(HULPREGEL_PREFIX).toBe("Wil hulp met: ");
  });
});

describe("schoonLabels", () => {
  it("trimt, laat lege en dubbele weg, houdt de volgorde", () => {
    expect(schoonLabels([" Subsidies uitzoeken ", "", "Een plan voor mijn huis", "Subsidies uitzoeken"])).toEqual([
      "Subsidies uitzoeken",
      "Een plan voor mijn huis",
    ]);
  });

  it.each([
    ["geen lijst", "Subsidies uitzoeken"],
    ["null", null],
    ["leeg", []],
    ["alleen lege", ["  ", ""]],
    ["een getal erin", ["Subsidies uitzoeken", 3]],
    ["een object erin", [{ label: "x" }]],
    ["te lang label", ["x".repeat(MAX_LABEL_LENGTE + 1)]],
    ["te veel labels", Array.from({ length: MAX_LABELS + 1 }, (_, i) => `Label ${i}`)],
    ["html", ["<b>Subsidies</b>"]],
  ])("weigert de hele lijst bij %s", (_naam, waarde) => {
    expect(schoonLabels(waarde)).toBeNull();
  });

  it("laat precies de grenzen toe", () => {
    expect(schoonLabels(["x".repeat(MAX_LABEL_LENGTE)])).toHaveLength(1);
    expect(schoonLabels(Array.from({ length: MAX_LABELS }, (_, i) => `Label ${i}`))).toHaveLength(MAX_LABELS);
  });
});

describe("bepaalBericht", () => {
  it("volgt `soort` uit de request", () => {
    expect(bepaalBericht({ soort: "uitzoeken", bericht: UITZOEK_BERICHT })).toEqual({ soort: "uitzoeken" });
    expect(bepaalBericht({ soort: "lastigst", keuzes: ["Het papierwerk"], bericht: "Lastigst: Het papierwerk" })).toEqual(
      { soort: "lastigst", keuzes: ["Het papierwerk"] },
    );
    expect(bepaalBericht({ soort: "vraag", bericht: " Kan ik ISDE krijgen? " })).toEqual({
      soort: "vraag",
      tekst: "Kan ik ISDE krijgen?",
    });
  });

  it("een getypte vraag blijft een vraag, ook als hij toevallig op de uitzoektekst lijkt", () => {
    expect(bepaalBericht({ soort: "vraag", bericht: UITZOEK_BERICHT })).toEqual({ soort: "vraag", tekst: UITZOEK_BERICHT });
  });

  describe("zonder soort (oude gecachte bundel)", () => {
    it("herkent de oker knop aan de vaste tekst", () => {
      expect(bepaalBericht({ bericht: UITZOEK_BERICHT })).toEqual({ soort: "uitzoeken" });
    });

    it("herkent 'Lastigst:' en haalt de keuzes uit de tekst", () => {
      expect(bepaalBericht({ bericht: "Lastigst: Het papierwerk, Een betrouwbare uitvoerder vinden" })).toEqual({
        soort: "lastigst",
        keuzes: ["Het papierwerk", "Een betrouwbare uitvoerder vinden"],
      });
    });

    it("herkent ook de oudere vorm 'Lastigst (bijgewerkt):'", () => {
      expect(bepaalBericht({ bericht: "Lastigst (bijgewerkt): De subsidies maximaal benutten" })).toEqual({
        soort: "lastigst",
        keuzes: ["De subsidies maximaal benutten"],
      });
    });

    it("al het andere is een vraag: dan raakt er niets kwijt", () => {
      expect(bepaalBericht({ bericht: "Ik wil graag een energielabel aanvragen." })).toEqual({
        soort: "vraag",
        tekst: "Ik wil graag een energielabel aanvragen.",
      });
    });

    it("een onbekende soort telt als ontbrekend", () => {
      expect(bepaalBericht({ soort: "iets", bericht: UITZOEK_BERICHT })).toEqual({ soort: "uitzoeken" });
    });
  });

  it("lastigst zonder bruikbare keuzes is ongeldig", () => {
    expect(bepaalBericht({ soort: "lastigst", keuzes: [42], bericht: "iets" })).toEqual({ soort: "ongeldig" });
    expect(bepaalBericht({ bericht: "Lastigst: " })).toEqual({ soort: "ongeldig" });
  });

  it("ongeldige keuzes uit de request vallen terug op de tekst", () => {
    expect(bepaalBericht({ soort: "lastigst", keuzes: "Het papierwerk", bericht: "Lastigst: Het papierwerk" })).toEqual({
      soort: "lastigst",
      keuzes: ["Het papierwerk"],
    });
  });
});

describe("bepaalHulpvragen", () => {
  it("neemt `hulpvragen` uit de request en negeert de hulpregel ernaast", () => {
    expect(
      bepaalHulpvragen(["Subsidies uitzoeken", "De aanvraag regelen"], "Wil hulp met: Subsidies uitzoeken, De aanvraag regelen"),
    ).toEqual({ hulpvragen: ["Subsidies uitzoeken", "De aanvraag regelen"], notitie: null });
  });

  it("valt bij een oude bundel terug op de labels uit de hulpregel", () => {
    expect(bepaalHulpvragen(undefined, "Wil hulp met: Subsidies uitzoeken, Betrouwbare uitvoerder")).toEqual({
      hulpvragen: ["Subsidies uitzoeken", "Betrouwbare uitvoerder"],
      notitie: null,
    });
  });

  it("gooit een notitie die geen hulpregel is niet weg", () => {
    expect(bepaalHulpvragen(["Subsidies uitzoeken"], "Wil aan de slag: Binnen 3 maanden")).toEqual({
      hulpvragen: ["Subsidies uitzoeken"],
      notitie: "Wil aan de slag: Binnen 3 maanden",
    });
  });

  it("laat een niet te ontleden hulpregel als tekst staan", () => {
    const teLang = `Wil hulp met: ${"x".repeat(MAX_LABEL_LENGTE + 1)}`;
    expect(bepaalHulpvragen(undefined, teLang)).toEqual({ hulpvragen: null, notitie: teLang });
  });

  it("zonder notitie en zonder lijst: niets", () => {
    expect(bepaalHulpvragen(undefined, null)).toEqual({ hulpvragen: null, notitie: null });
  });
});

// ---- verwerkBericht met een nep-client ----

type Fout = { code?: string; message?: string } | null;

/** Een nep-client die elke schrijfactie bewaart. */
function nepClient(opties: { bestaand?: boolean; insertId?: string | null; rpcFout?: Fout } = {}) {
  const updates: { rij: Record<string, unknown>; filters: [string, string, unknown][] }[] = [];
  const inserts: Record<string, unknown>[] = [];
  const rpcs: { naam: string; args: Record<string, unknown> }[] = [];
  const lezingen: [string, unknown][][] = [];

  const client = {
    from: (tabel: string) => {
      expect(tabel).toBe("leads_bewoners");
      return {
        select: () => {
          const filters: [string, unknown][] = [];
          lezingen.push(filters);
          const lees = {
            eq: (k: string, v: string) => {
              filters.push([k, v]);
              return lees;
            },
            maybeSingle: async () => ({ data: opties.bestaand ? { id: "lead-1" } : null, error: null }),
          };
          return lees;
        },
        update: (rij: Record<string, unknown>) => {
          const regel = { rij, filters: [] as [string, string, unknown][] };
          updates.push(regel);
          const bouwer = {
            eq: (k: string, v: string) => {
              regel.filters.push(["eq", k, v]);
              return bouwer;
            },
            is: (k: string, v: null) => {
              regel.filters.push(["is", k, v]);
              return bouwer;
            },
            then: (klaar: (u: { error: unknown }) => unknown) => Promise.resolve({ error: null }).then(klaar),
          };
          return bouwer;
        },
        insert: (rij: Record<string, unknown>) => ({
          select: () => ({
            maybeSingle: async () => {
              inserts.push(rij);
              const id = opties.insertId === undefined ? "lead-nieuw" : opties.insertId;
              return { data: id ? { id } : null, error: null };
            },
          }),
        }),
      };
    },
    rpc: async (naam: string, args: Record<string, unknown>) => {
      rpcs.push({ naam, args });
      return { data: "log-1", error: opties.rpcFout ?? null };
    },
  } as unknown as BerichtClient;

  return { client, updates, inserts, rpcs, lezingen };
}

const NU = new Date("2026-10-25T10:07:00.000Z");
const leadVelden = {
  tenant_id: "t-1",
  email: "sanne@example.nl",
  formulier: "subsidietool",
  subsidiecheck_hulpvragen: ["Subsidies uitzoeken"],
};

function voerUit(
  nep: ReturnType<typeof nepClient>,
  bericht: Parameters<typeof verwerkBericht>[1]["bericht"],
  leadId: string | null = "lead-1",
  mailUitkomst = true,
) {
  const stuurTeamMail = vi.fn(async () => mailUitkomst);
  const uitkomst = verwerkBericht(
    { supabase: nep.client, stuurTeamMail, nu: () => NU },
    {
      bericht,
      leadId,
      email: "sanne@example.nl",
      tenantId: "t-1",
      leadVelden,
      verrijking: { energielabel: "C" },
      herkomst: {},
    },
  );
  return { uitkomst, stuurTeamMail };
}

describe("verwerkBericht", () => {
  describe("bij een bestaande lead", () => {
    it("uitzoeken: zet alleen de eerste klik, en mailt het team niet", async () => {
      const nep = nepClient({ bestaand: true });
      const { uitkomst, stuurTeamMail } = voerUit(nep, { soort: "uitzoeken" });

      expect(await uitkomst).toEqual({ ok: true, mailed: false, nieuweLead: false });
      expect(stuurTeamMail).not.toHaveBeenCalled();
      expect(nep.updates).toEqual([
        {
          rij: { uitzoeken_aangevraagd_op: NU.toISOString() },
          filters: [
            ["eq", "id", "lead-1"],
            ["is", "uitzoeken_aangevraagd_op", null],
          ],
        },
      ]);
      expect(nep.inserts).toEqual([]);
      expect(nep.rpcs).toEqual([]);
    });

    it("lastigst: overschrijft de keuzes (laatste wint), en mailt het team niet", async () => {
      const nep = nepClient({ bestaand: true });
      const { uitkomst, stuurTeamMail } = voerUit(nep, { soort: "lastigst", keuzes: ["Het papierwerk"] });

      expect(await uitkomst).toEqual({ ok: true, mailed: false, nieuweLead: false });
      expect(stuurTeamMail).not.toHaveBeenCalled();
      expect(nep.updates).toEqual([{ rij: { subsidiecheck_lastigst: ["Het papierwerk"] }, filters: [["eq", "id", "lead-1"]] }]);
    });

    it("vraag: registreert via de RPC en mailt het team", async () => {
      const nep = nepClient({ bestaand: true });
      const { uitkomst, stuurTeamMail } = voerUit(nep, { soort: "vraag", tekst: "Hoi" });

      expect(await uitkomst).toEqual({ ok: true, mailed: true, nieuweLead: false });
      expect(nep.rpcs).toEqual([
        { naam: VRAAG_RPC, args: { p_lead_id: "lead-1", p_email: "sanne@example.nl", p_tekst: "Hoi" } },
      ]);
      expect(stuurTeamMail).toHaveBeenCalledTimes(1);
      expect(stuurTeamMail).toHaveBeenCalledWith({ tekst: "Hoi", nieuweLead: false, opgeslagen: true });
      expect(nep.updates).toEqual([]);
    });

    it("toetst id, tenant én e-mailadres voordat er iets wordt bijgewerkt", async () => {
      const nep = nepClient({ bestaand: true });
      await voerUit(nep, { soort: "uitzoeken" }).uitkomst;
      expect(nep.lezingen[0]).toEqual([
        ["id", "lead-1"],
        ["tenant_id", "t-1"],
        ["email", "sanne@example.nl"],
      ]);
    });

    it("raakt `notities` in geen enkel geval aan", async () => {
      for (const bericht of [
        { soort: "uitzoeken" as const },
        { soort: "lastigst" as const, keuzes: ["Het papierwerk"] },
        { soort: "vraag" as const, tekst: "Hoi" },
      ]) {
        const nep = nepClient({ bestaand: true });
        await voerUit(nep, bericht).uitkomst;
        for (const { rij } of nep.updates) expect(rij).not.toHaveProperty("notities");
      }
    });
  });

  describe("zonder bestaande lead", () => {
    it("uitzoeken: nieuwe lead met de klik en de hulpvragen in de basis, zonder notities en zonder mail", async () => {
      const nep = nepClient({ bestaand: false });
      const { uitkomst, stuurTeamMail } = voerUit(nep, { soort: "uitzoeken" });

      expect(await uitkomst).toEqual({ ok: true, mailed: false, nieuweLead: true });
      expect(stuurTeamMail).not.toHaveBeenCalled();
      expect(nep.inserts).toHaveLength(1);
      expect(nep.inserts[0]).toMatchObject({
        ...leadVelden,
        uitzoeken_aangevraagd_op: NU.toISOString(),
        energielabel: "C",
      });
      expect(nep.inserts[0]).not.toHaveProperty("notities");
    });

    it("lastigst: nieuwe lead met de keuzes, zonder mail", async () => {
      const nep = nepClient();
      const { uitkomst, stuurTeamMail } = voerUit(nep, { soort: "lastigst", keuzes: ["Het papierwerk"] }, null);

      expect(await uitkomst).toEqual({ ok: true, mailed: false, nieuweLead: true });
      expect(stuurTeamMail).not.toHaveBeenCalled();
      expect(nep.lezingen).toEqual([]); // geen lead-id → niet eens gezocht
      expect(nep.inserts[0]).toMatchObject({ subsidiecheck_lastigst: ["Het papierwerk"] });
    });

    it("vraag: eerst de lead, dan de RPC met het nieuwe id, dan de mail", async () => {
      const nep = nepClient({ bestaand: false });
      const { uitkomst, stuurTeamMail } = voerUit(nep, { soort: "vraag", tekst: "Hoi" });

      expect(await uitkomst).toEqual({ ok: true, mailed: true, nieuweLead: true });
      expect(nep.inserts[0]).not.toHaveProperty("notities");
      expect(nep.inserts[0]).not.toHaveProperty("uitzoeken_aangevraagd_op");
      expect(nep.rpcs[0].args).toEqual({ p_lead_id: "lead-nieuw", p_email: "sanne@example.nl", p_tekst: "Hoi" });
      expect(stuurTeamMail).toHaveBeenCalledWith({ tekst: "Hoi", nieuweLead: true, opgeslagen: true });
    });
  });

  describe("als de RPC hapert", () => {
    it("gaat de vraag nog wel per mail, met de melding dat hij niet in het CRM staat", async () => {
      vi.spyOn(console, "error").mockImplementation(() => {});
      const nep = nepClient({ bestaand: true, rpcFout: { code: "P0002", message: "Lead niet gevonden" } });
      const { uitkomst, stuurTeamMail } = voerUit(nep, { soort: "vraag", tekst: "Hoi" });

      expect(await uitkomst).toEqual({ ok: true, mailed: true, nieuweLead: false });
      expect(stuurTeamMail).toHaveBeenCalledWith({ tekst: "Hoi", nieuweLead: false, opgeslagen: false });
    });

    it("en faalt ook de mail, dan krijgt de bezoeker een fout: de vraag is dan nergens", async () => {
      vi.spyOn(console, "error").mockImplementation(() => {});
      const nep = nepClient({ bestaand: true, rpcFout: { code: "XX000", message: "stuk" } });
      const { uitkomst } = voerUit(nep, { soort: "vraag", tekst: "Hoi" }, "lead-1", false);
      expect(await uitkomst).toEqual({ ok: false, fout: "vraag-kwijt" });
    });

    it("een mislukte mail na een geslaagde registratie is geen fout", async () => {
      const nep = nepClient({ bestaand: true });
      const { uitkomst } = voerUit(nep, { soort: "vraag", tekst: "Hoi" }, "lead-1", false);
      expect(await uitkomst).toEqual({ ok: true, mailed: false, nieuweLead: false });
    });
  });
});
