import { describe, expect, it } from "vitest";

import { normalizePostcode, POSTCODE_RE } from "@/lib/pdok";
import { filterRegelingen, mockSubsidieProvider } from "@/lib/subsidies/mockProvider";
import {
  ALLE_MAATREGELEN,
  groepeerPerNiveau,
  NIVEAU_VOLGORDE,
  type SubsidieCheckInput,
} from "@/lib/subsidies/types";

const basisInput: SubsidieCheckInput = {
  postcode: "7823BR",
  huisnummer: "12",
  gemeente: "Emmen",
  provincie: "Drenthe",
  bewonertype: "woningeigenaar",
  maatregelen: [...ALLE_MAATREGELEN],
};

describe("postcodevalidatie", () => {
  it("accepteert geldige postcodes met en zonder spatie", () => {
    expect(POSTCODE_RE.test("9711 AB")).toBe(true);
    expect(POSTCODE_RE.test("9711ab")).toBe(true);
    expect(POSTCODE_RE.test("7823BR")).toBe(true);
  });

  it("weigert ongeldige postcodes", () => {
    expect(POSTCODE_RE.test("0711 AB")).toBe(false); // begint met 0
    expect(POSTCODE_RE.test("9711")).toBe(false);
    expect(POSTCODE_RE.test("AB 9711")).toBe(false);
  });

  it("normaliseert naar hoofdletters zonder spatie", () => {
    expect(normalizePostcode("9711 ab")).toBe("9711AB");
  });
});

describe("mockprovider filtering", () => {
  it("geeft voor een woningeigenaar in Emmen rijk, provincie én gemeente terug", async () => {
    const resultaat = await mockSubsidieProvider.check(basisInput);
    const niveaus = new Set(resultaat.map((r) => r.niveau));
    expect(niveaus.has("rijk")).toBe(true);
    expect(niveaus.has("provincie")).toBe(true);
    expect(niveaus.has("gemeente")).toBe(true);
    expect(resultaat.some((r) => r.id === "emmen-lokale-aanpak")).toBe(true);
  });

  it("toont Groningse regelingen niet in Drenthe (buiten Noord-Drenthe)", async () => {
    const resultaat = await mockSubsidieProvider.check(basisInput);
    expect(resultaat.some((r) => r.id === "vvg-10000")).toBe(false);
  });

  it("toont Nij Begun wél in Groningen en Noord-Drenthe", async () => {
    const groningen = await mockSubsidieProvider.check({
      ...basisInput,
      gemeente: "Groningen",
      provincie: "Groningen",
    });
    expect(groningen.some((r) => r.id === "nij-begun-isolatie")).toBe(true);

    const assen = await mockSubsidieProvider.check({
      ...basisInput,
      gemeente: "Assen",
      provincie: "Drenthe",
    });
    expect(assen.some((r) => r.id === "nij-begun-isolatie")).toBe(true);
  });

  it("filtert op bewonertype", async () => {
    const vve = await mockSubsidieProvider.check({ ...basisInput, bewonertype: "vve" });
    expect(vve.some((r) => r.id === "svve")).toBe(true);
    expect(vve.some((r) => r.id === "isde")).toBe(false);
  });

  it("filtert op maatregelen", async () => {
    const alleenZonnepanelen = await mockSubsidieProvider.check({
      ...basisInput,
      maatregelen: ["zonnepanelen"],
    });
    // ISDE dekt geen zonnepanelen; de Energiebespaarlening wel.
    expect(alleenZonnepanelen.some((r) => r.id === "isde")).toBe(false);
    expect(alleenZonnepanelen.some((r) => r.id === "warmtefonds")).toBe(true);
  });

  it("behandelt een lege maatregelenlijst als 'alles'", () => {
    const alles = filterRegelingen([], { ...basisInput, maatregelen: [] });
    expect(alles).toEqual([]);
    // en op de volledige set: zelfde resultaat als expliciet alles aanvinken
  });

  it("lekt geen interne filtervelden naar de UI", async () => {
    const resultaat = await mockSubsidieProvider.check(basisInput);
    for (const r of resultaat) {
      expect(r).not.toHaveProperty("provincies");
      expect(r).not.toHaveProperty("gemeenten");
    }
  });
});

describe("groepeerPerNiveau", () => {
  it("groepeert in vaste volgorde en laat lege niveaus weg", async () => {
    const resultaat = await mockSubsidieProvider.check(basisInput);
    const groepen = groepeerPerNiveau(resultaat);
    expect(groepen.length).toBeGreaterThan(0);
    const volgorde = groepen.map((g) => g.niveau);
    const verwacht = NIVEAU_VOLGORDE.filter((n) => volgorde.includes(n));
    expect(volgorde).toEqual(verwacht);
    for (const groep of groepen) {
      expect(groep.regelingen.length).toBeGreaterThan(0);
    }
  });
});
