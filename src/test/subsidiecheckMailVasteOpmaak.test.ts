import { describe, expect, it } from "vitest";

import { afsluitingTeam, afsluitingTeamTekst, knop } from "../../supabase/functions/subsidiecheck-mail/opmaak";
import { maakOverzichtMail } from "../../supabase/functions/subsidiecheck-mail/overzichtMail";
import { AFSLUITING_TEAM, controleerVasteOpmaak, zonderMso } from "./vasteOpmaakControles";

/**
 * De overzichtsmail van de subsidiecheck heeft de vaste mailopmaak van Voortraject (goedgekeurd door de eigenaar op
 * 24-11-2026; spec in de CRM-repo, docs/mail/vaste-opmaak.md). Dezelfde controles als het CRM op zijn eigen mails
 * draait (vasteOpmaakControles.ts, een kopie), op elke vorm die de mail kan aannemen.
 */

const OVER_EEN_MAAND = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

const VOLLEDIG = [
  {
    titel: "ISDE",
    niveau: "rijk",
    type: "subsidie",
    bedragIndicatie: "tot € 2.000",
    omschrijving: "Voor isolatie. Tweede zin.",
    letOp: "In Groningen en Noord-Drenthe is de Isolatieaanpak vaak gunstiger.",
    bronUrl: "https://www.rvo.nl/isde",
  },
  { titel: "Energiebespaarlening", niveau: "rijk", type: "lening", looptAfOp: OVER_EEN_MAAND },
  {
    titel: "Subsidie Verduurzaming en Verbetering Groningen",
    niveau: "provincie",
    type: "subsidie",
    bedragIndicatie: "€ 17.000",
    alleenAls: "je woning in het versterkingsprogramma van de NCG zit",
  },
  { titel: "Duurzaamheidslening", niveau: "gemeente", type: "lening" },
];

const maak = (regelingen: typeof VOLLEDIG | null, extra: Partial<Parameters<typeof maakOverzichtMail>[0]> = {}) =>
  maakOverzichtMail({
    payload: {
      input: { postcode: "9722AB", huisnummer: "12", bewonertype: "woningeigenaar" },
      overzichtUrl: "https://voortraject.nl/subsidiecheck?pc=9722AB&hn=12&type=woningeigenaar",
    },
    aanhef: "Hallo Sanne",
    haalRegelingen: async () => regelingen,
    haalBagAdres: async () => ({ straat: "Verlengde Hereweg", plaats: "Groningen" }),
    ...extra,
  });

const GEVALLEN: [string, () => ReturnType<typeof maak>][] = [
  ["met lijst, alles erin", () => maak(VOLLEDIG, { bouwjaar: 1962, beoordeling: { score: "4,9", aantal: 87 } })],
  ["met lijst, alleen subsidies, één groep, zonder score", () => maak(VOLLEDIG.filter((r) => r.niveau === "provincie"))],
  ["met lijst, leeg", () => maak([])],
  ["met lijst, zonder link naar het overzicht", () => maak(VOLLEDIG, { payload: { input: { postcode: "9722AB", huisnummer: "12", bewonertype: "woningeigenaar" } } })],
  ["zonder lijst", () => maak(null, { bouwjaar: 2001, beoordeling: { score: "4,9", aantal: 87 } })],
  ["zonder lijst en zonder bouwjaar of BAG", () => maak(null, { haalBagAdres: async () => null })],
];

describe("de overzichtsmail heeft de vaste mailopmaak", () => {
  for (const [naam, bouw] of GEVALLEN) {
    describe(naam, () => {
      it("voldoet aan elke regel van de spec (zelfde controles als het CRM en de bewaking)", async () => {
        const mail = (await bouw())!;
        expect(controleerVasteOpmaak(mail.html, { afsluiting: "team" })).toEqual([]);
      });

      it("heeft een tekstversie met dezelfde afsluiting", async () => {
        const mail = (await bouw())!;
        expect(mail.tekst).toContain("Jouw subsidieoverzicht");
        expect(mail.tekst).toContain(afsluitingTeamTekst());
        expect(mail.tekst).not.toMatch(/<[a-z]/i);
        expect(mail.tekst).not.toMatch(/&(amp|lt|gt|quot|#\d+);/);
      });
    });
  }

  it("zet de achtergrond alleen in de logobalk vast, niet achter de knop of de blokken", async () => {
    const { html } = (await maak(VOLLEDIG))!;
    expect(html.match(/linear-gradient/g)).toHaveLength(1);
    // De blend-truc, het <style>-blok en de schaduwen van variant D zijn weg (de mso-letterstijl van de spec telt niet).
    expect(zonderMso(html)).not.toMatch(/mix-blend-mode|<style>|box-shadow|class="/);
  });

  it("geeft elke regeling een eigen blok met subsidie of lening als kop", async () => {
    const { html, tekst } = (await maak(VOLLEDIG))!;
    expect(html.match(/border-left:3px solid #D9A441;background-color:#F6F5F1;/g)).toHaveLength(4);
    expect(html.match(/text-transform:uppercase;color:#5C6B80;font-weight:600;">Subsidie</g)).toHaveLength(2);
    expect(html.match(/text-transform:uppercase;color:#5C6B80;font-weight:600;">Lening</g)).toHaveLength(2);
    expect(tekst).toContain("- ISDE (subsidie, tot € 2.000)");
    expect(tekst).toContain("- Energiebespaarlening (lening)");
    expect(tekst).toContain("  Meer info: https://www.rvo.nl/isde");
  });

  it("noemt de deadline, de voorwaarde en de Let op in het blok", async () => {
    const { html, tekst } = (await maak(VOLLEDIG))!;
    expect(html).toContain("<strong>Let op:</strong> aanvragen kan tot ");
    expect(html).toContain("Alleen als je woning in het versterkingsprogramma van de NCG zit");
    expect(html).toContain("<strong>Let op:</strong> In Groningen en Noord-Drenthe is de Isolatieaanpak vaak gunstiger.");
    expect(tekst).toContain("  Let op: aanvragen kan tot ");
  });

  it("is in de kopie van opmaak.ts letterlijk gelijk aan de spec", () => {
    expect(afsluitingTeam()).toBe(AFSLUITING_TEAM);
    expect(knop("https://x.nl/?a=1&b=2", "Ga <nu>")).toBe(
      '<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;"><tr><td bgcolor="#152C4E" style="background-color:#152C4E;border-radius:8px;"><a href="https://x.nl/?a=1&amp;b=2" style="display:inline-block;padding:14px 28px;font-size:16px;line-height:20px;font-weight:600;color:#FFFFFF;text-decoration:none;font-family:-apple-system,BlinkMacSystemFont,\'Segoe UI\',Roboto,Helvetica,Arial,sans-serif;">Ga &lt;nu&gt;</a></td></tr></table>',
    );
  });
});
