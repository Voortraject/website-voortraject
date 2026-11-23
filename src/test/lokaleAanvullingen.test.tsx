import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

// Milieu Centraal kent de Oldambtse regeling niet (live gecontroleerd op
// 2026-11-23 met 9671 CD). Deze tests houden de lokale aanvulling daarop vast:
// twee kaarten, zoals de verordening zelf twee onderdelen noemt. Zie
// src/lib/subsidies/lokaleAanvullingen.ts.

import { SubsidieCard } from "@/components/subsidiecheck/SubsidieCard";
import { naarRegeling, type EswApiRegeling } from "@/lib/subsidies/energiesubsidiewijzerApi";
import {
  LOKALE_AANVULLINGEN,
  OLDAMBT,
  OLDAMBT_ISOLATIE,
  OLDAMBT_ONDERHOUD,
  invoerUitFunctieQuery,
  pasLokaleAanvullingenToe,
  type AanvullingInvoer,
} from "@/lib/subsidies/lokaleAanvullingen";
import { topBedragen, type SubsidieRegeling } from "@/lib/subsidies/types";

const fixture = JSON.parse(
  readFileSync(resolve(__dirname, "fixtures/esw-api-9742hj-woningeigenaar.json"), "utf8"),
) as EswApiRegeling[];
const echt = fixture.map(naarRegeling);

const ISOLATIE = OLDAMBT_ISOLATIE.id;
const ONDERHOUD = OLDAMBT_ONDERHOUD.id;
const BEIDE = [ISOLATIE, ONDERHOUD];
const KAARTEN = [OLDAMBT_ISOLATIE, OLDAMBT_ONDERHOUD];

// Een vaste datum ruim vóór de einddatum, zodat de tests niet in 2029 omvallen.
const NU = new Date("2026-11-23T12:00:00Z");

const ids = (lijst: SubsidieRegeling[]) => lijst.map((r) => r.id);
const invoer = (extra: Partial<AanvullingInvoer> = {}): AanvullingInvoer => ({
  postcode: "9671CD",
  bewonertype: "woningeigenaar",
  maatregelen: [],
  ...extra,
});
const toepassen = (lijst: SubsidieRegeling[], extra: Partial<AanvullingInvoer> = {}, nu = NU) =>
  pasLokaleAanvullingenToe(lijst, invoer(extra), LOKALE_AANVULLINGEN, nu);
const erbij = (extra: Partial<AanvullingInvoer> = {}, lijst: SubsidieRegeling[] = echt) =>
  ids(toepassen(lijst, extra)).filter((id) => BEIDE.includes(id));

describe("Oldambt Verwarmt: alleen in Oldambt", () => {
  it("een Oldambtse postcode krijgt beide kaarten", () => {
    expect(erbij()).toEqual(BEIDE);
    expect(erbij({ postcode: "9944AA" })).toEqual(BEIDE); // Nieuwolda
  });

  it("9945 (Eemsdelta) en 9641 (Veendam) niet", () => {
    expect(erbij({ postcode: "9945AA" })).toEqual([]);
    expect(erbij({ postcode: "9641AA" })).toEqual([]);
  });

  it("een onleesbare postcode niet", () => {
    expect(erbij({ postcode: "" })).toEqual([]);
    expect(erbij({ postcode: "onzin" })).toEqual([]);
  });

  it("verdraagt spaties en kleine letters", () => {
    expect(erbij({ postcode: " 9671 cd " })).toEqual(BEIDE);
  });

  it("de bestaande regelingen blijven staan, in dezelfde volgorde", () => {
    const uit = toepassen(echt);
    expect(uit.slice(0, echt.length)).toEqual(echt);
    expect(uit).toHaveLength(echt.length + 2);
  });
});

describe("Oldambt Verwarmt: alleen voor wie hem kan krijgen", () => {
  it("een huurder niet", () => {
    expect(erbij({ bewonertype: "huurder" })).toEqual([]);
  });

  it("zonder bewonertype niet", () => {
    expect(erbij({ bewonertype: undefined })).toEqual([]);
  });

  it("alleen zonnepanelen gekozen: niet", () => {
    expect(erbij({ maatregelen: ["zonnepanelen"] })).toEqual([]);
  });

  it("isolatie of ventilatie gekozen, of niets (= alles): wel", () => {
    expect(erbij({ maatregelen: ["isolatie"] })).toEqual(BEIDE);
    expect(erbij({ maatregelen: ["ventilatie", "zonnepanelen"] })).toEqual(BEIDE);
    expect(erbij({ maatregelen: [] })).toEqual(BEIDE);
  });

  it("maatregelen die we niet kunnen lezen: niet", () => {
    expect(erbij({ maatregelen: undefined })).toEqual([]);
  });
});

describe("Oldambt Verwarmt: na de einddatum niet meer", () => {
  // "tot en met 31 december 2028" (art. 11 lid 1), in Nederlandse tijd.
  it("op de laatste dag nog wel, tot middernacht in Amsterdam", () => {
    expect(ids(toepassen([], {}, new Date("2028-12-31T22:59:59Z")))).toEqual(BEIDE);
  });

  it("vanaf 1 januari 2029 00:00 in Amsterdam niet meer", () => {
    expect(ids(toepassen([], {}, new Date("2028-12-31T23:00:00Z")))).toEqual([]);
    expect(ids(toepassen([], {}, new Date("2029-03-01T12:00:00Z")))).toEqual([]);
  });

  it("de einddatum is 1 januari 2029 00:00 Amsterdam (UTC+1)", () => {
    for (const r of KAARTEN) expect(r.looptAfOp, r.id).toBe("2028-12-31T23:00:00Z");
  });
});

describe("Oldambt Verwarmt: nooit dubbel", () => {
  it("levert Milieu Centraal hem zelf, dan zetten we geen van beide erbij", () => {
    const vanMc: SubsidieRegeling = {
      ...OLDAMBT_ISOLATIE,
      id: "subsidieregeling-oldambt-verwarmt",
      titel: "Subsidieregeling isolatie en ventilatie Oldambt Verwarmt 2026 – 2028",
    };
    const uit = toepassen([...echt, vanMc]);
    expect(ids(uit).filter((id) => BEIDE.includes(id))).toEqual([]);
    expect(ids(uit)).toContain("subsidieregeling-oldambt-verwarmt");
  });

  it("herkent de titel ook in andere hoofdletters", () => {
    const vanMc = { ...OLDAMBT_ISOLATIE, id: "x", titel: "Subsidie isolatie OLDAMBT VERWARMT" };
    expect(ids(toepassen([vanMc]))).toEqual(["x"]);
  });

  it("twee keer toepassen geeft hetzelfde als één keer", () => {
    const een = toepassen(echt);
    const twee = toepassen(een);
    expect(twee).toEqual(een);
    for (const id of BEIDE) expect(ids(twee).filter((x) => x === id)).toHaveLength(1);
  });

  it("elke kaart heeft een eigen id", () => {
    expect(new Set(LOKALE_AANVULLINGEN.map((a) => a.regeling.id)).size).toBe(LOKALE_AANVULLINGEN.length);
  });
});

describe("kaart 1: extra isolatievergoeding", () => {
  it("is een gemeentelijke subsidie tot € 5.000, met de gemeentepagina als bron", () => {
    expect(OLDAMBT_ISOLATIE).toMatchObject({
      titel: "Oldambt Verwarmt 2026 – 2028: extra isolatievergoeding",
      niveau: "gemeente",
      type: "subsidie",
      aanbieder: "Gemeente Oldambt",
      bedragIndicatie: "tot € 5.000",
      bedragToelichting:
        "Maximaal een verdubbeling van het bedrag dat op grond van de Subsidie isolatieaanpak Nij Begun wordt verstrekt, met een maximum van € 5.000 per woning.",
      bronUrl: "https://www.gemeente-oldambt.nl/subsidies-en-leningen-voor-verduurzaming",
      doelgroepen: ["woningeigenaar"],
      maatregelen: ["isolatie", "ventilatie"],
    });
  });

  it("noemt geen onderhoud en geen inkomensgrens", () => {
    // Voortraject 2026-11-23: voor isolatie en ventilatie geldt geen
    // inkomensgrens. Die geldt alleen voor het onderhoud (art. 7 lid 4).
    const tekst = Object.values(OLDAMBT_ISOLATIE).join(" ");
    expect(tekst).not.toMatch(/onderhoud/i);
    expect(tekst).not.toMatch(/140%|inkomen/i);
  });
});

describe("kaart 2: noodzakelijk onderhoud", () => {
  it("is een gemeentelijke subsidie tot € 5.000, met de gemeentepagina als bron", () => {
    expect(OLDAMBT_ONDERHOUD).toMatchObject({
      titel: "Oldambt Verwarmt 2026 – 2028: noodzakelijk onderhoud",
      niveau: "gemeente",
      type: "subsidie",
      aanbieder: "Gemeente Oldambt",
      bedragIndicatie: "tot € 5.000",
      bronUrl: "https://www.gemeente-oldambt.nl/subsidies-en-leningen-voor-verduurzaming",
      doelgroepen: ["woningeigenaar"],
      maatregelen: ["isolatie", "ventilatie"],
    });
    expect(OLDAMBT_ONDERHOUD.beperktTot).toBeUndefined();
  });

  it("de inkomensgrens en het rapport staan in de voorwaarde onder de titel", () => {
    expect(OLDAMBT_ONDERHOUD.alleenAls).toMatch(/^je verzamelinkomen tot 140% van het sociaal minimum is/);
    expect(OLDAMBT_ONDERHOUD.alleenAls).toMatch(/bouwkundig rapport of isolatieplan/);
    expect(OLDAMBT_ONDERHOUD.bedragToelichting).toMatch(/bouwkundig rapport of isolatieplan/);
  });

  it("de inkomensgrens staat alleen op deze kaart", () => {
    const metGrens = KAARTEN.filter((r) => /140%/.test(Object.values(r).join(" ")));
    expect(metGrens).toEqual([OLDAMBT_ONDERHOUD]);
  });
});

describe("beide kaarten", () => {
  it("zetten de voorwaarde die we niet uit het adres halen onder de titel", () => {
    for (const r of toepassen([])) {
      const { unmount } = render(<SubsidieCard regeling={r} />);
      expect(screen.getByText(`Alleen als ${r.alleenAls}`)).toBeInTheDocument();
      expect(screen.getByText("tot € 5.000")).toBeInTheDocument();
      unmount();
    }
  });

  it("worden nooit het grote getal bovenaan (voorwaardelijk)", () => {
    expect(topBedragen(toepassen([])).subsidie).toBeUndefined();
  });

  it("geen gedachtestreepje in de zinnen voor bewoners", () => {
    for (const r of KAARTEN) {
      for (const veld of ["omschrijving", "alleenAls", "voorWie", "belangrijksteVoorwaarde", "bedragToelichting"] as const) {
        expect(r[veld], `${r.id}.${veld}`).not.toMatch(/[—–]/);
      }
    }
  });

  it("de voorwaarde past in de mail (300 tekens)", () => {
    for (const r of KAARTEN) expect(r.alleenAls!.length, r.id).toBeLessThanOrEqual(300);
  });
});

describe("de postcodelijst van Oldambt", () => {
  it("20 postcodes van vier cijfers, uit PDOK", () => {
    expect(OLDAMBT.postcodes).toHaveLength(20);
    expect(new Set(OLDAMBT.postcodes).size).toBe(20);
    expect(OLDAMBT.postcodes.every((p) => /^9\d{3}$/.test(p))).toBe(true);
    expect(OLDAMBT.vastgesteld).toBe("2026-11-23");
  });

  it("elke aanvulling heeft een gebied en een reden", () => {
    for (const a of LOKALE_AANVULLINGEN) {
      expect(a.alleenIn.postcodes.length, a.regeling.id).toBeGreaterThan(0);
      expect(a.waarom.length, a.regeling.id).toBeGreaterThan(0);
      expect(a.bronTitelBevat.length, a.regeling.id).toBeGreaterThan(0);
    }
  });
});

describe("in de edge function: de queryparameters van de bron", () => {
  it("leest bewonertype en maatregel-id's terug naar onze codes", () => {
    expect(invoerUitFunctieQuery("9671CD", "Woningeigenaar", ["1503", "1571"])).toEqual({
      postcode: "9671CD",
      bewonertype: "woningeigenaar",
      maatregelen: ["isolatie", "zonnepanelen"],
    });
  });

  it("geen filters = alles", () => {
    expect(invoerUitFunctieQuery("9671CD", "Woningeigenaar", []).maatregelen).toEqual([]);
  });

  it("onbekend bewonertype of alleen onbekende filters: niet te lezen", () => {
    expect(invoerUitFunctieQuery("9671CD", null, []).bewonertype).toBeUndefined();
    expect(invoerUitFunctieQuery("9671CD", "toString", []).bewonertype).toBeUndefined();
    expect(invoerUitFunctieQuery("9671CD", "Woningeigenaar", ["9999"]).maatregelen).toBeUndefined();
  });

  it("een huurder via de function krijgt ze niet, een eigenaar wel", () => {
    const via = (resident: string, filters: string[]) =>
      ids(pasLokaleAanvullingenToe([], invoerUitFunctieQuery("9671CD", resident, filters), LOKALE_AANVULLINGEN, NU));
    expect(via("Huurder", [])).toEqual([]);
    expect(via("Woningeigenaar", ["1581"])).toEqual(BEIDE);
  });
});

describe("de site vult zelf ook aan", () => {
  // De site gaat automatisch live met main, de function wordt met de hand
  // gedeployed. Tot die deploy moet de site de regeling toch tonen.
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  const check = async (antwoord: SubsidieRegeling[]) => {
    vi.useFakeTimers({ now: NU, toFake: ["Date"] });
    vi.stubEnv("VITE_SUBSIDIECHECK_URL", "https://functie.test/subsidiecheck");
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(JSON.stringify({ regelingen: antwoord }), { status: 200 })),
    );
    vi.resetModules();
    const { energiesubsidiewijzerProvider } = await import("@/lib/subsidies/energiesubsidiewijzerProvider");
    return energiesubsidiewijzerProvider.check({
      postcode: "9671CD",
      huisnummer: "1",
      bewonertype: "woningeigenaar",
      maatregelen: [],
    });
  };

  it("zet ze erbij als de function ze (nog) niet geeft", async () => {
    expect(ids(await check(echt)).filter((id) => BEIDE.includes(id))).toEqual(BEIDE);
  });

  it("niet dubbel als de function ze al geeft", async () => {
    const uit = await check([...echt, ...KAARTEN]);
    for (const id of BEIDE) expect(ids(uit).filter((x) => x === id)).toHaveLength(1);
  });
});

describe("Deno-kopieën", () => {
  // lokaleAanvullingen importeert energiesubsidiewijzerApi, dus die kopie moet
  // ook bij zijn. Beide maakt scripts/kopieer-gebiedscorrecties.mjs.
  for (const naam of ["lokaleAanvullingen", "energiesubsidiewijzerApi"]) {
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

  it("de function past de aanvulling op beide routes toe", () => {
    const index = readFileSync(resolve(__dirname, "../../supabase/functions/subsidiecheck/index.ts"), "utf8");
    expect(index.match(/pasLokaleAanvullingenToe\(/g)).toHaveLength(2);
  });
});
