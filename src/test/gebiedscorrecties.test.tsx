import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

// Milieu Centraal koppelt sommige regelingen aan hele gemeenten terwijl ze maar
// in een deel daarvan gelden. VVG € 10.000 stond zo bij 9367 (De Wilp), dat niet
// op de lijst van SNN staat. Deze tests houden de correcties daarop vast. Zie
// src/lib/subsidies/postcodegebieden.ts.

import { SubsidieCard } from "@/components/subsidiecheck/SubsidieCard";
import { naarRegeling, type EswApiRegeling } from "@/lib/subsidies/energiesubsidiewijzerApi";
import {
  inPostcodegebied,
  pasGebiedscorrectiesToe,
  valtOnder,
} from "@/lib/subsidies/gebiedscorrecties";
import {
  GEBIEDSCORRECTIES,
  HOOGEVEEN,
  TEN_POST,
  VOLKSHUISVESTING_DRENTHE,
  VVG_10000,
} from "@/lib/subsidies/postcodegebieden";
import { topBedragen, type SubsidieRegeling } from "@/lib/subsidies/types";

// Echt API-antwoord; bevat VVG € 10.000, de Isolatieaanpak en de Ten Post-regeling.
const fixture = JSON.parse(
  readFileSync(resolve(__dirname, "fixtures/esw-api-9742hj-woningeigenaar.json"), "utf8"),
) as EswApiRegeling[];
const echt = fixture.map(naarRegeling);

const VVG10 = "subsidie-verduurzaming-en-verbetering-groningen-10-000";
const VVG10_ZAKELIJK = "subsidie-verduurzaming-en-verbetering-groningen-10-000-zakelijk";
const VVG17 = "subsidie-verduurzaming-en-verbetering-groningen-17-000";
const DRENTHE = "subsidie-verduurzaming-volkshuisvesting-drenthe";
const TEN_POST_ID = "subsidie-energiemaatregelen-groningen";
const ISOLATIEAANPAK = "isolatieaanpak-groningen-en-noord-drenthe";

function regeling(id: string, extra: Partial<SubsidieRegeling> = {}): SubsidieRegeling {
  return {
    id,
    titel: id,
    niveau: "provincie",
    type: "subsidie",
    aanbieder: "SNN",
    omschrijving: "Omschrijving.",
    bronUrl: "https://www.snn.nl/",
    maatregelen: ["isolatie"],
    doelgroepen: ["woningeigenaar"],
    ...extra,
  };
}

const ids = (lijst: SubsidieRegeling[]) => lijst.map((r) => r.id);
const metId = (postcode: string, id: string) => ids(pasGebiedscorrectiesToe([regeling(id)], postcode));

describe("VVG € 10.000: alleen op de postcodelijst van SNN", () => {
  it("de fixture bevat de regeling echt, onder de id die we corrigeren", () => {
    expect(ids(echt)).toContain(VVG10);
  });

  it("9367 (De Wilp, Westerkwartier) krijgt hem niet", () => {
    expect(ids(pasGebiedscorrectiesToe(echt, "9367VC"))).not.toContain(VVG10);
  });

  it("9901 (Appingedam) krijgt hem wel", () => {
    expect(ids(pasGebiedscorrectiesToe(echt, "9901HT"))).toContain(VVG10);
  });

  it("de zakelijke variant volgt dezelfde lijst", () => {
    expect(metId("9367VC", VVG10_ZAKELIJK)).toEqual([]);
    expect(metId("9901HT", VVG10_ZAKELIJK)).toEqual([VVG10_ZAKELIJK]);
  });

  it("de Drentse postcodes op de lijst horen er ook bij", () => {
    expect(metId("9479AA", VVG10)).toEqual([VVG10]);
    expect(metId("9512AB", VVG10)).toEqual([VVG10]);
  });

  it("zegt erbij dat het alleen buiten het NCG-programma geldt", () => {
    const [r] = pasGebiedscorrectiesToe(echt, "9901HT").filter((x) => x.id === VVG10);
    expect(r.alleenAls).toBe("je woning niet in het versterkingsprogramma van de NCG zit");
  });
});

describe("VVG € 17.000: alleen in het NCG-programma", () => {
  it("blijft staan, maar met de voorwaarde erbij", () => {
    const [r] = pasGebiedscorrectiesToe([regeling(VVG17)], "9367VC");
    expect(r.alleenAls).toBe("je woning in het versterkingsprogramma van de NCG zit en niet volgens een oud advies wordt versterkt");
  });
});

describe("Volkshuisvesting Drenthe: hele gebieden en losse straten", () => {
  it("Gieten (9461) wel, Gasselte (9462) niet", () => {
    expect(metId("9461TH", DRENTHE)).toEqual([DRENTHE]);
    expect(metId("9462RE", DRENTHE)).toEqual([]);
  });

  it("in Coevorden alleen de straten op de lijst", () => {
    expect(metId("7741AC", DRENTHE)).toEqual([DRENTHE]); // in "7741 AA t/m AE"
    expect(metId("7741AG", DRENTHE)).toEqual([DRENTHE]); // los genoemd
    expect(metId("7741GE", DRENTHE)).toEqual([]); // wel Coevorden, niet op de lijst
    expect(metId("7848CX", DRENTHE)).toEqual([DRENTHE]); // Schoonoord
  });
});

describe("Ten Post: alleen 9792", () => {
  it("Ten Post wel, de rest van de gemeente Groningen niet", () => {
    expect(ids(pasGebiedscorrectiesToe(echt, "9792PJ"))).toContain(TEN_POST_ID);
    expect(ids(pasGebiedscorrectiesToe(echt, "9711CR"))).not.toContain(TEN_POST_ID);
  });

  it("zegt erbij dat je de € 7.000 van SNN al moet hebben aangevraagd", () => {
    const [r] = pasGebiedscorrectiesToe([regeling(TEN_POST_ID)], "9792PJ");
    expect(r.alleenAls).toBe("je de subsidie van € 7.000 van SNN al hebt aangevraagd");
  });
});

describe("Isolatieaanpak: niet in Hoogeveen", () => {
  it("Hoogeveen niet, Vries (Tynaarlo) en de stad Groningen wel", () => {
    expect(ids(pasGebiedscorrectiesToe(echt, "7901JA"))).not.toContain(ISOLATIEAANPAK);
    expect(ids(pasGebiedscorrectiesToe(echt, "9481BM"))).toContain(ISOLATIEAANPAK);
    expect(ids(pasGebiedscorrectiesToe(echt, "9711CR"))).toContain(ISOLATIEAANPAK);
  });
});

describe("de correctielaag zelf", () => {
  it("laat regelingen zonder correctie ongemoeid, als hetzelfde object", () => {
    const isde = echt.find((r) => r.id === "isde-subsidie-rijksoverheid")!;
    expect(pasGebiedscorrectiesToe([isde], "9367VC")[0]).toBe(isde);
  });

  it("voegt nooit iets toe", () => {
    expect(pasGebiedscorrectiesToe([], "9901HT")).toEqual([]);
  });

  it("toont een regeling met een postcodelijst niet als de postcode onleesbaar is", () => {
    expect(metId("", VVG10)).toEqual([]);
    expect(metId("onzin", VVG10)).toEqual([]);
  });

  it("ook een regeling met een uitsluiting valt weg als de postcode onleesbaar is", () => {
    // Bij twijfel niet tonen: zonder postcode weten we niet of het Hoogeveen is.
    expect(metId("", ISOLATIEAANPAK)).toEqual([]);
    // Een regeling zonder gebiedsregel (VVG € 17.000) hoeft geen postcode.
    expect(metId("", VVG17)).toEqual([VVG17]);
  });

  it("twee keer toepassen geeft hetzelfde als één keer", () => {
    const een = pasGebiedscorrectiesToe(echt, "9901HT");
    expect(pasGebiedscorrectiesToe(een, "9901HT")).toEqual(een);
  });

  it("verdraagt spaties en kleine letters", () => {
    expect(inPostcodegebied("9901 ht", VVG_10000)).toBe(true);
    expect(inPostcodegebied(" 7741 ac ", VOLKSHUISVESTING_DRENTHE)).toBe(true);
  });

  it("een reeks telt alleen binnen dezelfde vier cijfers", () => {
    expect(valtOnder("7741AE", "7741 AA t/m AE")).toBe(true);
    expect(valtOnder("7741AF", "7741 AA t/m AE")).toBe(false);
    expect(valtOnder("7742AC", "7741 AA t/m AE")).toBe(false);
    // Een losse PC4 als invoer valt niet onder een zescijferige regel.
    expect(valtOnder("7741", "7741 AA t/m AE")).toBe(false);
  });
});

describe("de postcodelijsten", () => {
  const gebieden = [VVG_10000, VOLKSHUISVESTING_DRENTHE, TEN_POST, HOOGEVEEN];

  it("elke regel is te lezen", () => {
    for (const g of gebieden) {
      for (const regel of g.postcodes) expect(valtOnder("0000AA", regel), `${g.naam}: "${regel}"`).not.toBeNull();
    }
  });

  it("geen dubbele regels", () => {
    for (const g of gebieden) expect(new Set(g.postcodes).size, g.naam).toBe(g.postcodes.length);
  });

  it("een reeks loopt van laag naar hoog", () => {
    for (const regel of VOLKSHUISVESTING_DRENTHE.postcodes) {
      const m = regel.match(/^\d{4} ([A-Z]{2}) t\/m ([A-Z]{2})$/);
      if (m) expect(m[1] < m[2], regel).toBe(true);
    }
  });

  // Werk je de lijst bij, pas dan ook deze aantallen aan (en `versie`, `sha256`
  // en `vastgesteld` in postcodegebieden.ts).
  it("VVG € 10.000: 170 postcodes van vier cijfers, versie VVG 3 - 26-02", () => {
    expect(VVG_10000.postcodes).toHaveLength(170);
    expect(VVG_10000.postcodes.every((p) => /^9\d{3}$/.test(p))).toBe(true);
    expect(VVG_10000.versie).toBe("VVG 3 - 26-02");
  });

  it("Volkshuisvesting Drenthe: 6 hele gebieden en 91 straten of reeksen", () => {
    expect(VOLKSHUISVESTING_DRENTHE.postcodes.filter((p) => /^\d{4}$/.test(p))).toHaveLength(6);
    expect(VOLKSHUISVESTING_DRENTHE.postcodes.filter((p) => /[A-Z]/.test(p))).toHaveLength(91);
  });

  it("elke correctie haalt iets weg of zegt iets; geen lege regels", () => {
    for (const c of GEBIEDSCORRECTIES) {
      expect(c.regelingen.length).toBeGreaterThan(0);
      expect(Boolean(c.alleenIn || c.nietIn || c.alleenAls), c.regelingen[0]).toBe(true);
    }
  });

  it("geen regeling staat in twee correcties", () => {
    const alle = GEBIEDSCORRECTIES.flatMap((c) => c.regelingen);
    expect(new Set(alle).size).toBe(alle.length);
  });

  it("de teksten voor bewoners: geen gedachtestreepje, niet 'onafhankelijk'", () => {
    for (const c of GEBIEDSCORRECTIES) {
      if (!c.alleenAls) continue;
      expect(c.alleenAls).not.toMatch(/[—–]/);
      expect(c.alleenAls).not.toMatch(/onafhankelijk/i);
    }
  });
});

describe("op de kaart en in de teaser", () => {
  it("de kaart zet de voorwaarde onder de titel", () => {
    const [r] = pasGebiedscorrectiesToe([regeling(VVG17, { bedragIndicatie: "€ 17.000" })], "9901HT");
    render(<SubsidieCard regeling={r} />);
    expect(
      screen.getByText("Alleen als je woning in het versterkingsprogramma van de NCG zit en niet volgens een oud advies wordt versterkt"),
    ).toBeInTheDocument();
  });

  it("een voorwaardelijk bedrag wordt nooit het grote getal bovenaan", () => {
    const lijst = [
      regeling(VVG17, { bedragIndicatie: "€ 17.000", alleenAls: "je woning in het NCG-programma zit" }),
      regeling("iets", { bedragIndicatie: "tot € 2.500" }),
    ];
    expect(topBedragen(lijst).subsidie).toEqual({ soort: "euro", waarde: 2500 });
  });
});

describe("in de mail", () => {
  it("staat de voorwaarde ook onder de titel", async () => {
    const { maakOverzichtMail } = await import("../../supabase/functions/subsidiecheck-mail/overzichtMail");
    const mail = await maakOverzichtMail({
      payload: {
        input: { postcode: "9901HT", huisnummer: "1", bewonertype: "woningeigenaar", maatregelen: [] },
        overzichtUrl: "https://voortraject.nl/subsidiecheck?pc=9901HT&hn=1&type=woningeigenaar",
      } as Parameters<typeof maakOverzichtMail>[0]["payload"],
      aanhef: "Hallo",
      haalRegelingen: async () => [
        {
          titel: "Subsidie Verduurzaming en Verbetering Groningen – € 17.000",
          niveau: "provincie",
          type: "subsidie",
          bedragIndicatie: "€ 17.000",
          alleenAls: "je woning in het versterkingsprogramma van de NCG zit",
        },
      ],
      haalBagAdres: async () => null,
    });
    expect(mail!.html).toContain("Alleen als je woning in het versterkingsprogramma van de NCG zit");
  });
});

describe("de site corrigeert zelf ook", () => {
  // De site gaat automatisch live met main, de function wordt met de hand
  // gedeployed. Draait de function nog een oude versie, dan mag de site toch
  // geen VVG € 10.000 in De Wilp tonen.
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it("haalt VVG € 10.000 weg, ook als de function hem ongecorrigeerd teruggeeft", async () => {
    vi.stubEnv("VITE_SUBSIDIECHECK_URL", "https://functie.test/subsidiecheck");
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(JSON.stringify({ regelingen: echt }), { status: 200 })),
    );
    vi.resetModules();
    const { energiesubsidiewijzerProvider } = await import("@/lib/subsidies/energiesubsidiewijzerProvider");
    const uit = await energiesubsidiewijzerProvider.check({
      postcode: "9367VC",
      huisnummer: "1",
      bewonertype: "woningeigenaar",
      maatregelen: [],
    });
    expect(ids(uit)).not.toContain(VVG10);
    expect(ids(uit)).toContain("isde-subsidie-rijksoverheid");
  });
});

describe("Deno-kopieën", () => {
  // De edge function kan niet uit de Vite-app importeren en heeft een eigen
  // kopie. Vergeet je die bij te werken, dan corrigeert de site wel en de live
  // function niet.
  for (const naam of ["postcodegebieden", "gebiedscorrecties"]) {
    it(`${naam}.ts is gelijk aan de bron`, () => {
      const lees = (pad: string) => readFileSync(resolve(__dirname, pad), "utf8").replace(/\r\n/g, "\n");
      const bron = lees(`../lib/subsidies/${naam}.ts`);
      const kopie = lees(`../../supabase/functions/subsidiecheck/${naam}.ts`)
        .split("\n")
        .slice(3)
        .join("\n")
        .replace(/(from "\.\/[A-Za-z]+)\.ts";/g, '$1";');
      expect(kopie).toBe(bron);
    });
  }
});
