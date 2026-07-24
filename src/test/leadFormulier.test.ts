import { describe, expect, it } from "vitest";

import { valideerContact, validatePhoneNL } from "@/components/subsidiecheck/leadFormulier";

// Basis: een volledig geldige invoer waar de losse tests één veld van afwijken.
const basis = {
  voornaam: "Jan",
  tussenvoegsel: "",
  achternaam: "de Vries",
  email: "jan@example.nl",
  telefoon: "0612345678",
};

describe("validatePhoneNL", () => {
  it("accepteert geldige NL-nummers (met spatie/streepje/landcode)", () => {
    expect(validatePhoneNL("0612345678")).toBe(true);
    expect(validatePhoneNL("06 12345678")).toBe(true);
    expect(validatePhoneNL("06-12345678")).toBe(true);
    expect(validatePhoneNL("+31612345678")).toBe(true);
    expect(validatePhoneNL("0502112689")).toBe(true);
  });

  it("weigert ongeldige nummers", () => {
    expect(validatePhoneNL("0612")).toBe(false);
    expect(validatePhoneNL("12345678")).toBe(false);
    expect(validatePhoneNL("+3161234567")).toBe(false); // te kort
    expect(validatePhoneNL("abcdefghij")).toBe(false);
    expect(validatePhoneNL("")).toBe(false);
  });
});

describe("valideerContact", () => {
  it("geeft de getrimde waarden terug bij geldige invoer", () => {
    const r = valideerContact({ ...basis, voornaam: "  Jan  ", email: "  jan@example.nl " });
    expect("waarden" in r).toBe(true);
    if ("waarden" in r) {
      expect(r.waarden.voornaam).toBe("Jan");
      expect(r.waarden.email).toBe("jan@example.nl");
      expect(r.waarden.tussenvoegsel).toBe("");
    }
  });

  it("accepteert een geldig tussenvoegsel", () => {
    expect("waarden" in valideerContact({ ...basis, tussenvoegsel: "van der" })).toBe(true);
  });

  it("eist een voornaam", () => {
    expect(valideerContact({ ...basis, voornaam: "  " })).toEqual({ fout: "Vul je voornaam in." });
  });

  it("weigert ongeldige tekens in de voornaam", () => {
    expect(valideerContact({ ...basis, voornaam: "Jan123" })).toEqual({
      fout: "Je voornaam bevat ongeldige tekens.",
    });
  });

  it("weigert een ongeldig tussenvoegsel", () => {
    expect(valideerContact({ ...basis, tussenvoegsel: "v4n" })).toEqual({
      fout: "Het tussenvoegsel bevat ongeldige tekens.",
    });
  });

  it("eist een geldige achternaam (min. 2 tekens)", () => {
    expect(valideerContact({ ...basis, achternaam: "" })).toEqual({ fout: "Vul je achternaam in." });
    expect(valideerContact({ ...basis, achternaam: "L" })).toEqual({ fout: "Vul je achternaam in." });
  });

  it("weigert een ongeldig e-mailadres", () => {
    expect(valideerContact({ ...basis, email: "geen-email" })).toEqual({
      fout: "Dit lijkt geen geldig e-mailadres.",
    });
  });

  it("eist een telefoonnummer", () => {
    expect(valideerContact({ ...basis, telefoon: "" })).toEqual({ fout: "Vul je telefoonnummer in." });
  });

  it("weigert een ongeldig telefoonnummer", () => {
    expect(valideerContact({ ...basis, telefoon: "0612" })).toEqual({
      fout: "Vul een geldig Nederlands telefoonnummer in (bijvoorbeeld 06 12345678).",
    });
  });
});
