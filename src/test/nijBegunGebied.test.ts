import { describe, expect, it } from "vitest";

import { inNijBegunGebied } from "@/lib/nijBegun";

// Het gebied van de Isolatieaanpak Nij Begun: de hele provincie Groningen plus
// drie Drentse gemeenten. Daar staat op het resultaat de isolatieplan-tegel in
// plaats van de energielabel-tegel.
describe("inNijBegunGebied", () => {
  it("de hele provincie Groningen hoort erbij", () => {
    expect(inNijBegunGebied({ provincienaam: "Groningen", gemeentenaam: "Groningen" })).toBe(true);
    expect(inNijBegunGebied({ provincienaam: "Groningen", gemeentenaam: "Het Hogeland" })).toBe(true);
    expect(inNijBegunGebied({ provincienaam: "Groningen", gemeentenaam: "Westerkwartier" })).toBe(true);
  });

  it("in Drenthe alleen Aa en Hunze, Noordenveld en Tynaarlo", () => {
    // Eelderwolde ligt in Tynaarlo: de woonplaats telt niet, de gemeente wel.
    expect(inNijBegunGebied({ provincienaam: "Drenthe", gemeentenaam: "Tynaarlo" })).toBe(true);
    expect(inNijBegunGebied({ provincienaam: "Drenthe", gemeentenaam: "Aa en Hunze" })).toBe(true);
    expect(inNijBegunGebied({ provincienaam: "Drenthe", gemeentenaam: "Noordenveld" })).toBe(true);
    expect(inNijBegunGebied({ provincienaam: "Drenthe", gemeentenaam: "Assen" })).toBe(false);
    expect(inNijBegunGebied({ provincienaam: "Drenthe", gemeentenaam: "Emmen" })).toBe(false);
  });

  it("verdraagt hoofdletters en witruimte uit de bron", () => {
    expect(inNijBegunGebied({ provincienaam: " groningen ", gemeentenaam: "" })).toBe(true);
    expect(inNijBegunGebied({ provincienaam: "Drenthe", gemeentenaam: "aa en hunze" })).toBe(true);
  });

  it("zonder gegevens of daarbuiten: nee", () => {
    expect(inNijBegunGebied({ provincienaam: "", gemeentenaam: "" })).toBe(false);
    expect(inNijBegunGebied({ provincienaam: "Friesland", gemeentenaam: "Leeuwarden" })).toBe(false);
    // Een Groningse gemeentenaam elders telt niet: alleen de provincie beslist daar.
    expect(inNijBegunGebied({ provincienaam: "Utrecht", gemeentenaam: "Groningen" })).toBe(false);
  });
});
