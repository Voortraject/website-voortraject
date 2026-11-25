import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

// Milieu Centraal kent het Volkshuisvestingsfonds Eemsdelta niet (live
// gecontroleerd op 2026-11-25 met 9934 GD en 9901 AA). Deze tests houden de
// lokale aanvulling daarop vast. Zie src/lib/subsidies/lokaleAanvullingen.ts.

import { SubsidieCard } from "@/components/subsidiecheck/SubsidieCard";
import { naarRegeling, type EswApiRegeling } from "@/lib/subsidies/energiesubsidiewijzerApi";
import {
  EEMSDELTA_VHF,
  EEMSDELTA_VHF_GEBIED,
  LOKALE_AANVULLINGEN,
  pasLokaleAanvullingenToe,
  type AanvullingInvoer,
} from "@/lib/subsidies/lokaleAanvullingen";
import { topBedragen, type SubsidieRegeling } from "@/lib/subsidies/types";

const fixture = JSON.parse(
  readFileSync(resolve(__dirname, "fixtures/esw-api-9742hj-woningeigenaar.json"), "utf8"),
) as EswApiRegeling[];
const echt = fixture.map(naarRegeling);

const VHF = EEMSDELTA_VHF.id;
const NU = new Date("2026-11-25T12:00:00Z");

const ids = (lijst: SubsidieRegeling[]) => lijst.map((r) => r.id);
const invoer = (extra: Partial<AanvullingInvoer> = {}): AanvullingInvoer => ({
  postcode: "9934GD",
  bewonertype: "woningeigenaar",
  maatregelen: [],
  ...extra,
});
const toepassen = (lijst: SubsidieRegeling[], extra: Partial<AanvullingInvoer> = {}) =>
  pasLokaleAanvullingenToe(lijst, invoer(extra), LOKALE_AANVULLINGEN, NU);
const erbij = (extra: Partial<AanvullingInvoer> = {}) =>
  ids(toepassen(echt, extra)).filter((id) => id === VHF);

describe("Volkshuisvestingsfonds Eemsdelta: alleen in de zeven wijken en dorpen", () => {
  it("elk van de zeven postcodes uit art. 4 krijgt de kaart", () => {
    for (const pc4 of ["9901", "9902", "9915", "9933", "9934", "9936", "9987"]) {
      expect(erbij({ postcode: `${pc4}AA` }), pc4).toEqual([VHF]);
    }
  });

  it("de rest van Eemsdelta niet (Loppersum 9919, Termunten 9948, Woldendorp 9946)", () => {
    for (const pc of ["9919AA", "9948AA", "9946AA", "9945AA"]) expect(erbij({ postcode: pc }), pc).toEqual([]);
  });

  it("Oldambt krijgt hem niet, en Eemsdelta krijgt Oldambt Verwarmt niet", () => {
    expect(erbij({ postcode: "9671CD" })).toEqual([]);
    const inDelfzijl = ids(toepassen(echt));
    expect(inDelfzijl.filter((id) => id.startsWith("oldambt"))).toEqual([]);
  });

  it("de lijst is precies de zeven postcodes, met datum", () => {
    expect(EEMSDELTA_VHF_GEBIED.postcodes).toEqual(["9901", "9902", "9915", "9933", "9934", "9936", "9987"]);
    expect(EEMSDELTA_VHF_GEBIED.vastgesteld).toBe("2026-11-25");
  });
});

describe("Volkshuisvestingsfonds Eemsdelta: alleen voor wie hem kan krijgen", () => {
  it("alleen woningeigenaren", () => {
    expect(erbij({ bewonertype: "huurder" })).toEqual([]);
    expect(erbij({ bewonertype: "vve" })).toEqual([]);
    expect(erbij({ bewonertype: undefined })).toEqual([]);
  });

  it("isolatie of ventilatie gekozen, of niets (= alles): wel", () => {
    expect(erbij({ maatregelen: ["isolatie"] })).toEqual([VHF]);
    expect(erbij({ maatregelen: ["ventilatie"] })).toEqual([VHF]);
    expect(erbij({ maatregelen: [] })).toEqual([VHF]);
  });

  it("alleen warmtepomp of zonnepanelen: niet (art. 5 lid 1 sluit ze uit)", () => {
    expect(erbij({ maatregelen: ["warmtepomp"] })).toEqual([]);
    expect(erbij({ maatregelen: ["zonnepanelen"] })).toEqual([]);
  });

  it("levert Milieu Centraal hem zelf, dan niet dubbel", () => {
    const vanMc: SubsidieRegeling = { ...EEMSDELTA_VHF, id: "mc-vhf", titel: "Subsidie Volkshuisvestingsfonds voor koopwoningen" };
    expect(ids(toepassen([vanMc]))).toEqual(["mc-vhf"]);
  });
});

describe("de kaart", () => {
  it("70% tot € 14.500, met de gemeentepagina als bron", () => {
    expect(EEMSDELTA_VHF).toMatchObject({
      niveau: "gemeente",
      type: "subsidie",
      aanbieder: "Gemeente Eemsdelta",
      bedragIndicatie: "tot € 14.500",
      bronUrl: "https://www.eemsdelta.nl/subsidie-volkshuisvestingsfonds-voor-koopwoningen",
      doelgroepen: ["woningeigenaar"],
      maatregelen: ["isolatie", "ventilatie"],
    });
    expect(EEMSDELTA_VHF.bedragToelichting).toMatch(/^70% van de kosten, tot maximaal € 14\.500 per woning inclusief btw\./);
    expect(EEMSDELTA_VHF.looptAfOp).toBeUndefined();
  });

  it("de voorwaarden die we niet uit het adres halen staan onder de titel", () => {
    render(<SubsidieCard regeling={EEMSDELTA_VHF} />);
    expect(
      screen.getByText("Alleen als je woning vóór 1991 is gebouwd, geen appartement is en je er zelf woont"),
    ).toBeInTheDocument();
    expect(screen.getByText("tot € 14.500")).toBeInTheDocument();
  });

  it("aanvragen vóór de start, het energieadvies en het beperkte budget staan in de voorwaarde", () => {
    expect(EEMSDELTA_VHF.belangrijksteVoorwaarde).toMatch(/vóór de werkzaamheden starten/);
    expect(EEMSDELTA_VHF.belangrijksteVoorwaarde).toMatch(/energieadviseur die de gemeente aanwijst/);
    expect(EEMSDELTA_VHF.belangrijksteVoorwaarde).toMatch(/volgorde van binnenkomst/);
  });

  it("geen labeleis en geen stellige regel over Nij Begun (besluit Voortraject 2026-11-25)", () => {
    const tekst = Object.values(EEMSDELTA_VHF).join(" ");
    expect(tekst).not.toMatch(/label|labelstap/i);
    expect(EEMSDELTA_VHF.letOp).toBeUndefined();
    expect(EEMSDELTA_VHF.bedragToelichting).toMatch(/Wij zoeken het voor je uit\.$/);
  });

  it("wordt nooit het grote getal bovenaan (voorwaardelijk)", () => {
    expect(topBedragen(toepassen([])).subsidie).toBeUndefined();
  });

  it("geen gedachtestreepje, en de voorwaarde past in de mail (300 tekens)", () => {
    for (const veld of ["omschrijving", "alleenAls", "voorWie", "belangrijksteVoorwaarde", "bedragToelichting"] as const) {
      expect(EEMSDELTA_VHF[veld], veld).not.toMatch(/[—–]/);
    }
    expect(EEMSDELTA_VHF.alleenAls!.length).toBeLessThanOrEqual(300);
  });
});
