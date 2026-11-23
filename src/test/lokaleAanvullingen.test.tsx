import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

// Milieu Centraal kent de Oldambtse regeling niet (live gecontroleerd op
// 2026-11-23 met 9671 CD). Deze tests houden de lokale aanvulling daarop vast.
// Zie src/lib/subsidies/lokaleAanvullingen.ts.

import { SubsidieCard } from "@/components/subsidiecheck/SubsidieCard";
import { naarRegeling, type EswApiRegeling } from "@/lib/subsidies/energiesubsidiewijzerApi";
import {
  LOKALE_AANVULLINGEN,
  OLDAMBT,
  OLDAMBT_VERWARMT,
  invoerUitFunctieQuery,
  pasLokaleAanvullingenToe,
  type AanvullingInvoer,
} from "@/lib/subsidies/lokaleAanvullingen";
import { topBedragen, type SubsidieRegeling } from "@/lib/subsidies/types";

const fixture = JSON.parse(
  readFileSync(resolve(__dirname, "fixtures/esw-api-9742hj-woningeigenaar.json"), "utf8"),
) as EswApiRegeling[];
const echt = fixture.map(naarRegeling);

const ID = OLDAMBT_VERWARMT.id;
const ids = (lijst: SubsidieRegeling[]) => lijst.map((r) => r.id);
const invoer = (extra: Partial<AanvullingInvoer> = {}): AanvullingInvoer => ({
  postcode: "9671CD",
  bewonertype: "woningeigenaar",
  maatregelen: [],
  ...extra,
});
const met = (extra: Partial<AanvullingInvoer> = {}, lijst: SubsidieRegeling[] = echt) =>
  ids(pasLokaleAanvullingenToe(lijst, invoer(extra)));

describe("Oldambt Verwarmt: alleen in Oldambt", () => {
  it("een Oldambtse postcode krijgt hem", () => {
    expect(met()).toContain(ID);
    expect(met({ postcode: "9944AA" })).toContain(ID); // Nieuwolda
  });

  it("9945 (Eemsdelta) en 9641 (Veendam) niet", () => {
    expect(met({ postcode: "9945AA" })).not.toContain(ID);
    expect(met({ postcode: "9641AA" })).not.toContain(ID);
  });

  it("een onleesbare postcode niet", () => {
    expect(met({ postcode: "" })).not.toContain(ID);
    expect(met({ postcode: "onzin" })).not.toContain(ID);
  });

  it("verdraagt spaties en kleine letters", () => {
    expect(met({ postcode: " 9671 cd " })).toContain(ID);
  });

  it("de bestaande regelingen blijven staan, in dezelfde volgorde", () => {
    const uit = pasLokaleAanvullingenToe(echt, invoer());
    expect(uit.slice(0, echt.length)).toEqual(echt);
    expect(uit).toHaveLength(echt.length + 1);
  });
});

describe("Oldambt Verwarmt: alleen voor wie hem kan krijgen", () => {
  it("een huurder niet", () => {
    expect(met({ bewonertype: "huurder" })).not.toContain(ID);
  });

  it("zonder bewonertype niet", () => {
    expect(met({ bewonertype: undefined })).not.toContain(ID);
  });

  it("alleen zonnepanelen gekozen: niet", () => {
    expect(met({ maatregelen: ["zonnepanelen"] })).not.toContain(ID);
  });

  it("isolatie of ventilatie gekozen, of niets (= alles): wel", () => {
    expect(met({ maatregelen: ["isolatie"] })).toContain(ID);
    expect(met({ maatregelen: ["ventilatie", "zonnepanelen"] })).toContain(ID);
    expect(met({ maatregelen: [] })).toContain(ID);
  });

  it("maatregelen die we niet kunnen lezen: niet", () => {
    expect(met({ maatregelen: undefined })).not.toContain(ID);
  });
});

describe("Oldambt Verwarmt: nooit dubbel", () => {
  it("levert Milieu Centraal hem zelf, dan zetten we hem er niet bij", () => {
    const vanMc: SubsidieRegeling = {
      ...OLDAMBT_VERWARMT,
      id: "subsidieregeling-oldambt-verwarmt",
      titel: "Subsidieregeling Oldambt Verwarmt",
    };
    const uit = pasLokaleAanvullingenToe([...echt, vanMc], invoer());
    expect(ids(uit)).not.toContain(ID);
    expect(ids(uit)).toContain("subsidieregeling-oldambt-verwarmt");
  });

  it("herkent de titel ook in andere hoofdletters", () => {
    const vanMc = { ...OLDAMBT_VERWARMT, id: "x", titel: "Subsidie isolatie OLDAMBT VERWARMT" };
    expect(met({}, [vanMc])).toEqual(["x"]);
  });

  it("twee keer toepassen geeft hetzelfde als één keer", () => {
    const een = pasLokaleAanvullingenToe(echt, invoer());
    const twee = pasLokaleAanvullingenToe(een, invoer());
    expect(twee).toEqual(een);
    expect(ids(twee).filter((id) => id === ID)).toHaveLength(1);
  });
});

describe("de kaart", () => {
  it("is een gemeentelijke subsidie tot € 5.000, met de gemeentepagina als bron", () => {
    expect(OLDAMBT_VERWARMT).toMatchObject({
      titel: "Subsidieregeling isolatie en ventilatie Oldambt Verwarmt 2026 – 2028",
      niveau: "gemeente",
      type: "subsidie",
      aanbieder: "Gemeente Oldambt",
      bedragIndicatie: "tot € 5.000",
      bronUrl: "https://www.gemeente-oldambt.nl/subsidies-en-leningen-voor-verduurzaming",
      looptAfOp: "2028-12-31T00:00:00Z",
      doelgroepen: ["woningeigenaar"],
    });
    expect(OLDAMBT_VERWARMT.maatregelen).toEqual(["isolatie", "ventilatie"]);
  });

  it("noemt geen inkomensgrens voor het isolatiedeel", () => {
    // Voortraject 2026-11-23: voor isolatie en ventilatie geldt geen
    // inkomensgrens. Alleen het onderhoud is beperkt tot 140% van het sociaal
    // minimum (art. 7 lid 4), en dat staat er dan ook zo bij.
    const tekst = [
      OLDAMBT_VERWARMT.omschrijving,
      OLDAMBT_VERWARMT.alleenAls,
      OLDAMBT_VERWARMT.voorWie,
      OLDAMBT_VERWARMT.belangrijksteVoorwaarde,
    ].join(" ");
    expect(tekst).not.toMatch(/140%|inkomen/);
    expect(OLDAMBT_VERWARMT.bedragToelichting).toMatch(/onderhoud.*140% van het sociaal minimum/);
  });

  it("zet de voorwaarde die we niet uit het adres halen onder de titel", () => {
    const [r] = pasLokaleAanvullingenToe([], invoer());
    render(<SubsidieCard regeling={r} />);
    expect(screen.getByText(`Alleen als ${OLDAMBT_VERWARMT.alleenAls}`)).toBeInTheDocument();
    expect(screen.getByText("tot € 5.000")).toBeInTheDocument();
  });

  it("wordt nooit het grote getal bovenaan (voorwaardelijk)", () => {
    const lijst = pasLokaleAanvullingenToe([], invoer());
    expect(topBedragen(lijst).subsidie).toBeUndefined();
  });

  it("geen gedachtestreepje in de zinnen voor bewoners", () => {
    for (const veld of ["omschrijving", "alleenAls", "voorWie", "belangrijksteVoorwaarde", "bedragToelichting"] as const) {
      expect(OLDAMBT_VERWARMT[veld], veld).not.toMatch(/[—–]/);
    }
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

  it("een huurder via de function krijgt hem niet, een eigenaar wel", () => {
    expect(ids(pasLokaleAanvullingenToe([], invoerUitFunctieQuery("9671CD", "Huurder", [])))).toEqual([]);
    expect(ids(pasLokaleAanvullingenToe([], invoerUitFunctieQuery("9671CD", "Woningeigenaar", ["1581"])))).toEqual([ID]);
  });
});

describe("de site vult zelf ook aan", () => {
  // De site gaat automatisch live met main, de function wordt met de hand
  // gedeployed. Tot die deploy moet de site de regeling toch tonen.
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  const check = async (antwoord: SubsidieRegeling[]) => {
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

  it("zet hem erbij als de function hem (nog) niet geeft", async () => {
    expect(ids(await check(echt))).toContain(ID);
  });

  it("niet dubbel als de function hem al geeft", async () => {
    const uit = await check([...echt, OLDAMBT_VERWARMT]);
    expect(ids(uit).filter((id) => id === ID)).toHaveLength(1);
  });
});

describe("Deno-kopie", () => {
  it("lokaleAanvullingen.ts is gelijk aan de bron", () => {
    const lees = (pad: string) => readFileSync(resolve(__dirname, pad), "utf8").replace(/\r\n/g, "\n");
    const bron = lees("../lib/subsidies/lokaleAanvullingen.ts");
    const kopie = lees("../../supabase/functions/subsidiecheck/lokaleAanvullingen.ts")
      .split("\n")
      .slice(3)
      .join("\n")
      .replace(/(from "\.\/[A-Za-z]+)\.ts";/g, '$1";');
    expect(kopie).toBe(bron);
  });

  it("de function past de aanvulling op beide routes toe", () => {
    const index = readFileSync(resolve(__dirname, "../../supabase/functions/subsidiecheck/index.ts"), "utf8");
    expect(index.match(/pasLokaleAanvullingenToe\(/g)).toHaveLength(2);
  });
});
