import { readFileSync } from "fs";
import { describe, expect, it, vi } from "vitest";

// De beveiliging leeft in de edge function (Deno), maar is puur → hier testbaar.
// Zelfde patroon als src/test/cachesleutel.test.ts.
import {
  BEWONERTYPE_RESIDENT,
  bouwEswFilterQuery,
  controleerTurnstile,
  EMAIL_RE,
  emailSyntaxGeldig,
  escapeIlike,
  heeftMailserver,
  isSysteemadres,
  looptBinnenkortAf,
  MAATREGEL_FILTER_ID,
  MIN_INVULTIJD_MS,
  naarMailRegeling,
  regelingenUitBrowser,
  schoonOverzichtUrl,
  SYSTEEMADRESSEN,
  teSnelIngevuld,
} from "../../supabase/functions/subsidiecheck-mail/beveiliging";
import {
  EMAIL_RE as CLIENT_EMAIL_RE,
  SYSTEEMADRESSEN as CLIENT_SYSTEEMADRESSEN,
  valideerContact,
} from "@/components/subsidiecheck/leadFormulier";
import { MIN_INVULTIJD_MS as CLIENT_MIN_INVULTIJD_MS } from "@/lib/invultijd";
import {
  ALLE_MAATREGELEN,
  BEWONERTYPE_RESIDENT as CLIENT_RESIDENT,
  bouwEswFilterQuery as clientFilterQuery,
  looptBinnenkortAf as clientLooptBinnenkortAf,
  MAATREGEL_FILTER_ID as CLIENT_FILTER_ID,
  type Bewonertype,
} from "@/lib/subsidies/types";

describe("kopieën tussen de function en de site blijven gelijk", () => {
  it("mailregels, systeemadressen en invultijd", () => {
    expect(EMAIL_RE.source).toBe(CLIENT_EMAIL_RE.source);
    expect([...SYSTEEMADRESSEN]).toEqual([...CLIENT_SYSTEEMADRESSEN]);
    expect(MIN_INVULTIJD_MS).toBe(CLIENT_MIN_INVULTIJD_MS);
  });

  it("de aanvraag aan de bron is dezelfde als die van de browser", () => {
    expect(BEWONERTYPE_RESIDENT).toEqual(CLIENT_RESIDENT);
    expect(MAATREGEL_FILTER_ID).toEqual(CLIENT_FILTER_ID);
    const combinaties = [[], ["isolatie"], ["warmtepomp", "zonnepanelen"], [...ALLE_MAATREGELEN]] as const;
    for (const type of Object.keys(CLIENT_RESIDENT) as Bewonertype[]) {
      for (const m of combinaties) {
        expect(bouwEswFilterQuery(type, [...m])).toBe(clientFilterQuery(type, [...m]));
      }
    }
  });

  it("de deadline-regel is dezelfde", () => {
    const nu = new Date("2026-10-12T10:00:00Z");
    for (const iso of ["2026-10-01", "2026-11-30", "2027-01-11", "2027-01-13", "2050-12-31", "onzin", undefined]) {
      expect(looptBinnenkortAf(iso, nu), String(iso)).toBe(clientLooptBinnenkortAf(iso, nu));
    }
  });
});

describe("tijdscontrole", () => {
  it("negeert een inzending onder de 3 seconden", () => {
    expect(teSnelIngevuld(0)).toBe(true);
    expect(teSnelIngevuld(2999)).toBe(true);
    expect(teSnelIngevuld(-5)).toBe(true);
    expect(teSnelIngevuld(3000)).toBe(false);
    expect(teSnelIngevuld(45_000)).toBe(false);
  });

  it("ziet een ontbrekende duur niet als bewijs (oude gecachete bundle)", () => {
    expect(teSnelIngevuld(undefined)).toBe(false);
    expect(teSnelIngevuld("100")).toBe(false);
    expect(teSnelIngevuld(Number.NaN)).toBe(false);
  });
});

describe("mailadres", () => {
  it("laat echte adressen door, ook met een + en info@ van een eigen domein", () => {
    for (const adres of [
      "jan@example.nl",
      "info+subsidietest1@voortraject.nl",
      "info@dejong.nl",
      "j.de.vries@ziggo.nl",
      "doet_multiplex_4b@icloud.com",
      "El4A40@gmail.com",
      "a@b.co",
      "naam@sub.domein-met-streep.nl",
    ]) {
      expect(emailSyntaxGeldig(adres), adres).toBe(true);
      expect(isSysteemadres(adres), adres).toBe(false);
      expect("waarden" in valideerContact({ voornaam: "Jan", tussenvoegsel: "", achternaam: "Test", email: adres, telefoon: "0612345678" }), adres).toBe(true);
    }
  });

  it("weigert wat geen adres is", () => {
    for (const adres of [
      "geen-apenstaart",
      "jan@localhost",
      "jan@domein.n",
      ".jan@example.nl",
      "jan.@example.nl",
      "jan..de@example.nl",
      "jan@-domein.nl",
      "jan@domein-.nl",
      "jan de@example.nl",
      "jan@exa mple.nl",
      "<script>@example.nl",
      `${"a".repeat(65)}@example.nl`,
      `jan@${"a".repeat(250)}.nl`,
    ]) {
      expect(emailSyntaxGeldig(adres), adres).toBe(false);
    }
  });

  it("weigert systeemadressen, ook met een +label, maar niet info@", () => {
    for (const adres of [
      "abuse@example.nl",
      "Postmaster@example.nl",
      "noreply@example.nl",
      "no-reply@example.nl",
      "mailer-daemon@example.nl",
      "abuse+x@example.nl",
    ]) {
      expect(isSysteemadres(adres), adres).toBe(true);
      expect(valideerContact({ voornaam: "Jan", tussenvoegsel: "", achternaam: "Test", email: adres, telefoon: "0612345678" })).toEqual({
        fout: "Gebruik een persoonlijk e-mailadres.",
      });
    }
    expect(isSysteemadres("info@achternaam.nl")).toBe(false);
  });

  it("escapet wildcards voor de opzoeking per adres", () => {
    expect(escapeIlike("jan_de%vries\\x@example.nl")).toBe("jan\\_de\\%vries\\\\x@example.nl");
  });
});

describe("mailserver van het domein", () => {
  const nietGevonden = () => Object.assign(new Error("geen"), { name: "NotFound" });

  it("ja bij een MX-record", async () => {
    const opzoeken = vi.fn(async () => [{ preference: 10, exchange: "mx.example.nl." }]);
    expect(await heeftMailserver("example.nl", opzoeken)).toBe("ja");
    expect(opzoeken).toHaveBeenCalledTimes(1);
  });

  it("ja zonder MX maar met een A-record (impliciete MX)", async () => {
    const opzoeken = vi.fn(async (_d: string, t: string) => {
      if (t === "MX") throw nietGevonden();
      if (t === "A") return ["192.0.2.1"];
      throw nietGevonden();
    });
    expect(await heeftMailserver("example.nl", opzoeken)).toBe("ja");
  });

  it("nee als het domein niet bestaat", async () => {
    const opzoeken = vi.fn(async () => {
      throw nietGevonden();
    });
    expect(await heeftMailserver("gmial.con", opzoeken)).toBe("nee");
  });

  it("onbekend bij een storing of time-out: dan laten we door", async () => {
    expect(await heeftMailserver("example.nl", async () => Promise.reject(new Error("storing")))).toBe("onbekend");
    expect(await heeftMailserver("example.nl", () => new Promise(() => {}), 20)).toBe("onbekend");
  });
});

describe("link naar het overzicht", () => {
  it("houdt alleen onze eigen subsidiecheck over, op de vaste basis", () => {
    expect(schoonOverzichtUrl("https://voortraject.nl/subsidiecheck?pc=9711AA&hn=1")).toBe(
      "https://voortraject.nl/subsidiecheck?pc=9711AA&hn=1",
    );
    expect(schoonOverzichtUrl("https://www.voortraject.nl/subsidiecheck/?pc=1")).toBe(
      "https://voortraject.nl/subsidiecheck?pc=1",
    );
  });

  it("gooit al het andere weg", () => {
    for (const url of [
      "https://evil.example/subsidiecheck",
      "https://voortraject.nl.evil.example/subsidiecheck",
      "https://voortraject.nl@evil.example/subsidiecheck",
      "https://user@voortraject.nl/subsidiecheck",
      "http://voortraject.nl/subsidiecheck",
      "https://voortraject.nl/contact",
      "https://voortraject.nl:8443/subsidiecheck",
      "javascript:alert(1)",
      "geen url",
      42,
      undefined,
    ]) {
      expect(schoonOverzichtUrl(url), String(url)).toBeUndefined();
    }
  });
});

describe("regelingen in de mail", () => {
  it("uit onze eigen bron: zelfde velden, deadline alleen binnen drie maanden", () => {
    const nu = new Date("2026-10-12T10:00:00Z");
    const r = naarMailRegeling(
      {
        id: "x",
        titel: "ISDE",
        niveau: "rijk",
        type: "subsidie",
        bedragIndicatie: "tot € 1.000",
        omschrijving: "Voor isolatie",
        letOp: "Kies in Groningen de Isolatieaanpak",
        looptAfOp: "2050-12-31",
        bronUrl: "https://www.rvo.nl/isde",
        aanbieder: "RVO",
      },
      nu,
    );
    expect(r).toEqual({
      titel: "ISDE",
      niveau: "rijk",
      type: "subsidie",
      bedragIndicatie: "tot € 1.000",
      omschrijving: "Voor isolatie",
      letOp: "Kies in Groningen de Isolatieaanpak",
      looptAfOp: undefined,
      bronUrl: "https://www.rvo.nl/isde",
    });
    expect(naarMailRegeling({ looptAfOp: "2026-11-30" }, nu).looptAfOp).toBe("2026-11-30");
    expect(naarMailRegeling({ bronUrl: "javascript:alert(1)" }, nu).bronUrl).toBeUndefined();
  });

  it("terugval uit de browser: geen links, geen datums, ingekort en begrensd", () => {
    const lijst = Array.from({ length: 80 }, () => ({
      titel: "Win een prijs ".repeat(50),
      omschrijving: "Klik hier",
      bronUrl: "https://evil.example",
      letOp: "<a href=https://evil.example>klik</a>",
      looptAfOp: "2026-11-01",
    }));
    const schoon = regelingenUitBrowser(lijst);
    expect(schoon).toHaveLength(60);
    expect(schoon[0].titel!.length).toBeLessThanOrEqual(120);
    for (const r of schoon) {
      expect(r).not.toHaveProperty("bronUrl");
      expect(r).not.toHaveProperty("letOp");
      expect(r).not.toHaveProperty("looptAfOp");
    }
    expect(regelingenUitBrowser("geen lijst")).toEqual([]);
    expect(regelingenUitBrowser([null, 3])).toHaveLength(2);
  });

  it("de function zet nooit de rauwe lijst uit de request in de mail", () => {
    // Bewaakt het gat dat tot oktober 2026 openstond: `payload.regelingen` mag
    // alleen nog via de terugval regelingenUitBrowser naar binnen.
    const bron = readFileSync("supabase/functions/subsidiecheck-mail/index.ts", "utf8");
    const gebruik = bron.match(/payload\.regelingen/g) ?? [];
    expect(gebruik).toHaveLength(1);
    expect(bron).toContain("regelingenUitBrowser(payload.regelingen)");
    expect(bron).not.toMatch(/payload\.overzichtUrl(?!\))/);
  });
});

describe("Turnstile", () => {
  const antwoord = (data: unknown, ok = true) =>
    vi.fn(async () => ({ ok, json: async () => data }) as unknown as Response) as unknown as typeof fetch;

  it("staat uit zonder secret", async () => {
    expect(await controleerTurnstile("tok", undefined, "1.2.3.4", antwoord({ success: true }))).toBe("uit");
    expect(await controleerTurnstile(undefined, "", "1.2.3.4", antwoord({ success: true }))).toBe("uit");
  });

  it("weigert zonder token als de controle aan staat", async () => {
    const f = antwoord({ success: true });
    expect(await controleerTurnstile(undefined, "geheim", "1.2.3.4", f)).toBe("geweigerd");
    expect(f).not.toHaveBeenCalled();
  });

  it("volgt het oordeel van Cloudflare", async () => {
    expect(await controleerTurnstile("tok", "geheim", "1.2.3.4", antwoord({ success: true }))).toBe("ok");
    expect(await controleerTurnstile("tok", "geheim", "1.2.3.4", antwoord({ success: false }))).toBe("geweigerd");
  });

  it("onbekend als Cloudflare niet antwoordt", async () => {
    expect(await controleerTurnstile("tok", "geheim", "1.2.3.4", antwoord({}, false))).toBe("onbekend");
    const kapot = vi.fn(async () => {
      throw new Error("netwerk");
    }) as unknown as typeof fetch;
    expect(await controleerTurnstile("tok", "geheim", "1.2.3.4", kapot)).toBe("onbekend");
  });
});
