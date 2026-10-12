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
  schoonOverzichtUrl,
  SYSTEEMADRESSEN,
  teSnelIngevuld,
} from "../../supabase/functions/subsidiecheck-mail/beveiliging";
import {
  mailAdresregel,
  maakOverzichtMail,
  schoonHuisnummer,
} from "../../supabase/functions/subsidiecheck-mail/overzichtMail";
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

  it("de function leest de lijst en het adres uit de request nergens meer", () => {
    // Bewaakt het gat dat tot oktober 2026 openstond.
    for (const pad of ["index.ts", "overzichtMail.ts", "beveiliging.ts"]) {
      const bron = readFileSync(`supabase/functions/subsidiecheck-mail/${pad}`, "utf8");
      expect(bron, pad).not.toMatch(/payload\.regelingen|regelingenUitBrowser/);
    }
  });
});

describe("de overzichtsmail aan de bezoeker", () => {
  // Wat een bot zou meesturen: eigen titels, teksten, links en een eigen adres.
  const VREEMD = [
    "Win een iPhone",
    "Klik op evil.example",
    "https://evil.example/winactie",
    "Nepstraat",
    "Spamstad",
    "Gratis geld",
  ];
  const aanval = (input: Record<string, unknown>) => ({
    input: { postcode: "9711 AA", huisnummer: "12", ...input },
    adres: { straatnaam: "Nepstraat", woonplaatsnaam: "Spamstad" },
    overzichtUrl: "https://evil.example/winactie",
    regelingen: Array.from({ length: 60 }, () => ({
      titel: "Win een iPhone",
      omschrijving: "Klik op evil.example",
      bedragIndicatie: "Gratis geld",
      bronUrl: "https://evil.example/winactie",
      letOp: "Gratis geld",
    })),
  });
  const eigenLijst = [
    { titel: "ISDE", niveau: "rijk", type: "subsidie", omschrijving: "Voor isolatie", bronUrl: "https://www.rvo.nl/isde" },
  ];

  const maak = (payload: Parameters<typeof maakOverzichtMail>[0]["payload"], bron = vi.fn(async () => eigenLijst)) =>
    maakOverzichtMail({
      payload,
      aanhef: "Hallo Jan",
      haalRegelingen: bron,
      haalBagAdres: async () => null,
    });

  it("zonder bewonertype: geen enkele titel, tekst, link of adres uit de request in de mail", async () => {
    const bron = vi.fn(async () => eigenLijst);
    const mail = await maak(aanval({ bewonertype: undefined, maatregelen: ["isolatie"] }), bron);
    expect(mail).not.toBeNull();
    for (const vreemd of VREEMD) {
      expect(mail!.html, vreemd).not.toContain(vreemd);
      expect(mail!.onderwerp, vreemd).not.toContain(vreemd);
    }
    expect(mail!.html).not.toContain("evil");
    // Zonder geldig bewonertype vragen we de bron niet eens: dan geen lijst.
    expect(bron).not.toHaveBeenCalled();
    expect(mail!.metLijst).toBe(false);
    expect(mail!.onderwerp).toBe("Je subsidieoverzicht voor je woning");
    expect(mail!.html).toContain("staat online voor je klaar");
    expect(mail!.html).toContain('href="https://voortraject.nl/subsidiecheck"');
  });

  it("met een ongeldig bewonertype of als onze bron niet antwoordt: ook geen lijst", async () => {
    for (const mail of [
      await maak(aanval({ bewonertype: "toString" })),
      await maak(aanval({ bewonertype: "huurder" }), vi.fn(async () => null)),
    ]) {
      expect(mail!.metLijst).toBe(false);
      for (const vreemd of VREEMD) expect(mail!.html, vreemd).not.toContain(vreemd);
    }
  });

  it("met een geldig bewonertype: alleen de lijst uit onze eigen bron", async () => {
    const bron = vi.fn(async () => eigenLijst);
    const mail = await maak(aanval({ bewonertype: "woningeigenaar", maatregelen: ["isolatie"] }), bron);
    expect(bron).toHaveBeenCalledWith("9711AA", "type-of-resident=Woningeigenaar&filter=1503");
    expect(mail!.metLijst).toBe(true);
    expect(mail!.onderwerp).toBe("Je subsidieoverzicht: 1 regeling voor je woning");
    expect(mail!.html).toContain("ISDE");
    expect(mail!.html).toContain("https://www.rvo.nl/isde");
    for (const vreemd of VREEMD) expect(mail!.html, vreemd).not.toContain(vreemd);
  });

  it("neemt een geldige link naar ons eigen overzicht wel over", async () => {
    const mail = await maak({
      input: { postcode: "9711AA", huisnummer: "12", bewonertype: "huurder" },
      overzichtUrl: "https://voortraject.nl/subsidiecheck?pc=9711AA&hn=12",
    });
    expect(mail!.html).toContain('href="https://voortraject.nl/subsidiecheck?pc=9711AA&amp;hn=12"');
  });

  it("bouwt geen mail bij een ongeldige postcode of een huisnummer met tekst", async () => {
    expect(await maak({ input: { postcode: "evil.example", huisnummer: "12" } })).toBeNull();
    expect(await maak({ input: { postcode: "9711AA", huisnummer: "12 evil.example" } })).toBeNull();
  });
});

describe("adresregel in de mail aan de bezoeker", () => {
  it("straat en plaats uit de BAG, huisnummer en toevoeging alleen als ze streng kloppen", () => {
    const huis = schoonHuisnummer("12", "A")!;
    expect(mailAdresregel("9711AA", huis, { straat: "Burg. J. Grommersstraat", plaats: "Groningen" })).toBe(
      "Burg. J. Grommersstraat 12 A, Groningen",
    );
    expect(mailAdresregel("9711AA", huis, null)).toBe("postcode 9711 AA, huisnummer 12 A");
    expect(schoonHuisnummer("12", "evil.example")).toEqual({ nummer: "12", toevoeging: "" });
    expect(schoonHuisnummer("0", "")).toBeNull();
    expect(schoonHuisnummer("123456", "")).toBeNull();
  });

  it("valt terug op de postcode als de BAG iets onverwachts teruggeeft", () => {
    const huis = schoonHuisnummer("12", "")!;
    expect(mailAdresregel("9711AA", huis, { straat: "<a href=x>", plaats: "Groningen" })).toBe(
      "postcode 9711 AA, huisnummer 12",
    );
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
