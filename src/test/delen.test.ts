import { readFileSync } from "fs";
import { describe, expect, it } from "vitest";

import { deelBericht, deelUrl, deelViaWhatsappUrl } from "../components/subsidiecheck/delen";

// De hele reden dat delen apart staat van "deel dit overzicht": de link mag geen
// adres bevatten. Wie hem doorstuurt deelt anders zijn eigen postcode en
// huisnummer, en de ontvanger kijkt naar het verkeerde huis.
describe("de deelbare link", () => {
  it("wijst naar de kale check, zonder adresgegevens", () => {
    for (const kanaal of ["whatsapp", "link", "mail"] as const) {
      const url = new URL(deelUrl(kanaal));
      expect(url.origin + url.pathname).toBe("https://voortraject.nl/subsidiecheck");
      for (const param of ["pc", "hn", "tv", "str", "pl"]) {
        expect(url.searchParams.has(param)).toBe(false);
      }
    }
  });

  it("draagt utm-tags mee, anders is delen via WhatsApp niet te meten", () => {
    const url = new URL(deelUrl("whatsapp"));
    expect(url.searchParams.get("utm_source")).toBe("deel");
    expect(url.searchParams.get("utm_medium")).toBe("whatsapp");
    expect(new URL(deelUrl("link")).searchParams.get("utm_medium")).toBe("link");
  });
});

describe("het WhatsApp-bericht", () => {
  it("noemt het eigen aantal en de link", () => {
    const bericht = deelBericht(10);
    expect(bericht).toContain("10 regelingen");
    expect(bericht).toContain("https://voortraject.nl/subsidiecheck");
  });

  it("schrijft één regeling in het enkelvoud", () => {
    expect(deelBericht(1)).toContain("1 regeling.");
    expect(deelBericht(1)).not.toContain("1 regelingen");
  });

  it("gaat naar de contactkiezer, niet naar ons eigen nummer", () => {
    const url = deelViaWhatsappUrl(10);
    expect(url.startsWith("https://wa.me/?text=")).toBe(true);
    // Ons nummer hoort hier juist niet in te staan: de bezoeker deelt met zijn
    // buren, niet met ons.
    expect(url).not.toContain("31502112689");
  });
});

// De overzichtsmail draait op Deno en kan `delen.ts` niet importeren, dus staat
// de deel-URL daar een tweede keer. Loopt die weg, dan komt het verkeer uit
// doorgestuurde mails in GA4 onder een ander medium binnen dan het verkeer uit
// de site — of helemaal niet.
describe("de deel-URL in de overzichtsmail", () => {
  it("is dezelfde link, met medium 'mail'", () => {
    const mail = readFileSync("supabase/functions/subsidiecheck-mail/index.ts", "utf8");
    expect(mail).toContain(deelUrl("mail"));
  });
});
