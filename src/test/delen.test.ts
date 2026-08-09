import { readFileSync } from "fs";
import { describe, expect, it } from "vitest";

import { deelUrl } from "../components/subsidiecheck/delen";

// De hele reden dat delen apart staat van "deel dit overzicht": de link mag geen
// adres bevatten. Wie hem doorstuurt deelt anders zijn eigen postcode en
// huisnummer, en de ontvanger kijkt naar het verkeerde huis.
describe("de deelbare link", () => {
  it("wijst naar de kale check, zonder adresgegevens", () => {
    for (const kanaal of ["link", "mail"] as const) {
      const url = new URL(deelUrl(kanaal));
      expect(url.origin + url.pathname).toBe("https://voortraject.nl/subsidiecheck");
      for (const param of ["pc", "hn", "tv", "str", "pl"]) {
        expect(url.searchParams.has(param)).toBe(false);
      }
    }
  });

  it("draagt utm-tags mee, anders is een doorgestuurde link niet te meten", () => {
    // Een link die iemand in WhatsApp plakt komt zonder referrer binnen. Zonder
    // deze tags telt zo'n bezoeker als direct verkeer en is delen onzichtbaar.
    const url = new URL(deelUrl("link"));
    expect(url.searchParams.get("utm_source")).toBe("deel");
    expect(url.searchParams.get("utm_medium")).toBe("link");
    expect(new URL(deelUrl("mail")).searchParams.get("utm_medium")).toBe("mail");
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
