import { describe, expect, it } from "vitest";

import { validatePhoneNL } from "@/lib/telefoon";

// De validatie moet bewust ruim zijn: een geldig nummer in een ongebruikelijke
// schrijfwijze afkeuren kost stille afhakers. Vaste nummers wegen hier net zo
// zwaar als mobiele.

describe("validatePhoneNL", () => {
  it("accepteert mobiele nummers in elke schrijfwijze", () => {
    for (const nummer of ["0612345678", "06 12345678", "06 12 34 56 78", "06-12345678", "06.12345678"]) {
      expect(validatePhoneNL(nummer), nummer).toBe(true);
    }
  });

  it("accepteert vaste nummers, ook met 4-cijferig netnummer", () => {
    for (const nummer of [
      "0502112689", // Groningen, 3-cijferig netnummer
      "050 211 2689",
      "050-211 26 89",
      "(050) 2112689",
      "050.211.2689",
      "0592 123456", // Assen, 4-cijferig netnummer
      "0598-123456", // Veendam
      "0512 123456", // Drachten (Friesland)
      "088 1234567", // bedrijfsnummer
    ]) {
      expect(validatePhoneNL(nummer), nummer).toBe(true);
    }
  });

  it("accepteert internationale notaties van NL-nummers", () => {
    for (const nummer of [
      "+31612345678",
      "+31 6 12345678",
      "+31 (0)6 12345678",
      "+31 (0)50 211 2689",
      "+31 50 211 2689",
      "0031612345678",
      "0031 50 211 2689",
    ]) {
      expect(validatePhoneNL(nummer), nummer).toBe(true);
    }
  });

  it("accepteert een vergeten trunk-nul en een buitenlands nummer", () => {
    expect(validatePhoneNL("612345678")).toBe(true);
    expect(validatePhoneNL("+32 470 12 34 56")).toBe(true); // België
    expect(validatePhoneNL("+49 491 1234567")).toBe(true); // Duitsland, grensstreek
  });

  it("weigert nummers van de verkeerde lengte of met letters", () => {
    for (const nummer of [
      "",
      "0612",
      "12345678", // te kort
      "06123456789", // te lang
      "+3161234567", // NL via landcode, te kort
      "+31612345678901", // NL via landcode, te lang
      "abcdefghij",
      "06 1234 abcd",
      "0800-1234", // servicenummer, geen contactnummer
    ]) {
      expect(validatePhoneNL(nummer), nummer).toBe(false);
    }
  });
});
