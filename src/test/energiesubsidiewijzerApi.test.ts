import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import {
  filterOpMaatregelen,
  idVan,
  maatregelenVan,
  naarRegeling,
  niveauVan,
  typeVan,
  type EswApiRegeling,
} from "@/lib/subsidies/energiesubsidiewijzerApi";
import { ALLE_MAATREGELEN } from "@/lib/subsidies/types";

// Echt antwoord van de officiële API (search, 9742HJ, Woningeigenaar), alleen
// ontdaan van `Details` en `Share` — die zijn obsolete respectievelijk ongebruikt
// en maakten de fixture onnodig groot.
const fixture = JSON.parse(
  readFileSync(resolve(__dirname, "fixtures/esw-api-9742hj-woningeigenaar.json"), "utf8"),
) as EswApiRegeling[];

// De acht maatregelen die onze tool aanbiedt (de "Alles"-keuze).
const ONZE_ACHT = filterOpMaatregelen(fixture, [...ALLE_MAATREGELEN]);

describe("Energiesubsidiewijzer-API: filteren op maatregelen", () => {
  it("houdt precies de regelingen over die de live tool nu toont", () => {
    // De bron geeft er twaalf voor deze postcode; twee gaan alleen over
    // asbest (1613) en natuurinclusief bouwen (1614), maatregelen die wij niet
    // aanbieden. Dit is exact de tien die er op dit moment live staan.
    expect(ONZE_ACHT).toHaveLength(10);
    expect(ONZE_ACHT.map(idVan)).toEqual([
      "isolatieaanpak-groningen-en-noord-drenthe",
      "isde-subsidie-rijksoverheid",
      "subsidie-verduurzaming-en-verbetering-groningen-10-000",
      "energiebespaarlening-warmtefonds",
      "energiebespaarlening-voor-mensen-met-onvoldoende-leencapaciteit-warmtefonds",
      "subsidie-energiemaatregelen-groningen",
      "verzilverlening",
      "subsidie-waardevermeerdering-drenthe-en-groningen",
      "extra-geld-voor-energiebesparing-in-hypotheek-met-nhg",
      "laag-btw-tarief-voor-isolatiewerkzaamheden",
    ]);
  });

  it("een lege keuze betekent alle acht, niet 'niets'", () => {
    expect(filterOpMaatregelen(fixture, []).map(idVan)).toEqual(ONZE_ACHT.map(idVan));
  });

  it("filtert op één maatregel", () => {
    // Alleen de Subsidie Verduurzaming en Verbetering Groningen dekt de thuisbatterij.
    expect(filterOpMaatregelen(fixture, ["thuisbatterij"]).map(idVan)).toEqual([
      "subsidie-verduurzaming-en-verbetering-groningen-10-000",
    ]);
  });
});

describe("Energiesubsidiewijzer-API: velden vertalen", () => {
  it("gebruikt de slug uit de Verbeterjehuis-URL als id, niet hun Id", () => {
    const isde = fixture.find((r) => r.Id === "1629")!;
    expect(idVan(isde)).toBe("isde-subsidie-rijksoverheid");
  });

  it("valt terug op hun Id als de URL ontbreekt", () => {
    expect(idVan({ Id: "1629" })).toBe("1629");
  });

  it("leest 'loan' als lening en 'subsidy' en 'other' als subsidie", () => {
    expect(typeVan({ Type: "loan" })).toBe("lening");
    expect(typeVan({ Type: "subsidy" })).toBe("subsidie");
    // Een btw-verlaging is geen lening, dus staat hij aan de subsidiekant.
    expect(typeVan({ Type: "other" })).toBe("subsidie");
  });

  it("neemt alleen de eerste alinea van de bedragtekst mee", () => {
    // De Isolatieaanpak noemt eerst het percentage en daarna in een opsomming
    // bedragen tot € 40.000. Dat hoogste getal zou een verkeerd beeld geven.
    const isolatieaanpak = naarRegeling(fixture.find((r) => r.Id === "3143")!);
    expect(isolatieaanpak.bedragIndicatie).toBe("50–100% van de kosten");
  });

  it("laat het bedrag leeg als de bron geen getal noemt", () => {
    // ISDE verschilt per maatregel; de provider zet er een curated indicatie bij.
    const isde = naarRegeling(fixture.find((r) => r.Id === "1629")!);
    expect(isde.bedragIndicatie).toBeUndefined();
  });

  it("gebruikt ProviderUrl als officiële bron", () => {
    const isde = naarRegeling(fixture.find((r) => r.Id === "1629")!);
    expect(isde.bronUrl).toBe("https://www.rvo.nl/subsidie-en-financieringswijzer/isde/woningeigenaren");
  });

  it("pakt de eerste voorwaarde uit de lijst", () => {
    const gemeente = naarRegeling(fixture.find((r) => r.Id === "3018")!);
    expect(gemeente.belangrijksteVoorwaarde).toBe(
      "De woning staat in Ten Post, Kröddeburen of Wittewierum en ligt in het postcodegebied 9792",
    );
  });

  it("vertaalt de tags naar onze maatregelcodes", () => {
    const gemeente = fixture.find((r) => r.Id === "3018")!;
    expect(maatregelenVan(gemeente)).toEqual(["isolatie", "warmtepomp", "zonnepanelen", "zonneboiler"]);
  });

  it("laat maatregelen die wij niet aanbieden buiten beschouwing", () => {
    // 1613 is asbest verwijderen; dat staat niet in onze acht.
    expect(maatregelenVan({ Tags: [{ Value: "1613" }, { Value: "1503" }] })).toEqual(["isolatie"]);
  });

  it("houdt entities en tags uit de zichtbare tekst", () => {
    const regeling = naarRegeling({ Title: "Isolatie &amp; glas", Intro: "<p>Een&nbsp;zin.</p>" });
    expect(regeling.titel).toBe("Isolatie & glas");
    expect(regeling.omschrijving).toBe("Een zin.");
  });
});

describe("Energiesubsidiewijzer-API: overheidslaag afleiden", () => {
  it("zet een gemeente op gemeente", () => {
    expect(niveauVan({ ProviderName: "Gemeente Groningen", Locations: ["Groningen", "9792"] })).toBe(
      "gemeente",
    );
  });

  it("zet SNN en de provincie op provincie", () => {
    expect(niveauVan({ ProviderName: "SNN", Locations: ["Groningen"] })).toBe("provincie");
    expect(niveauVan({ ProviderName: "Samenwerkingsverband Noord-Nederland", Locations: ["Drenthe"] })).toBe(
      "provincie",
    );
    expect(niveauVan({ ProviderName: "Provincie Fryslân", Locations: ["Leeuwarden"] })).toBe("provincie");
  });

  it("zet een landelijk werkgebied op rijk, in beide schrijfwijzen", () => {
    expect(niveauVan({ ProviderName: "Nationaal Warmtefonds", Locations: ["0000 - 9999"] })).toBe("rijk");
    expect(niveauVan({ ProviderName: "Belastingdienst", Locations: ["0000-9999"] })).toBe("rijk");
  });

  it("zet een rijksinstantie met een regionaal werkgebied toch op rijk", () => {
    // De Isolatieaanpak (Nij Begun) is rijksbeleid dat RVO uitvoert, maar staat
    // op een lijst gemeenten.
    expect(
      niveauVan({
        ProviderName: "Rijksdienst voor Ondernemend Nederland (RVO)",
        Locations: ["Aa en Hunze", "Eemsdelta"],
      }),
    ).toBe("rijk");
  });

  it("zet een regeling die per gemeente geregeld is op gemeente", () => {
    // De Verzilverlening loopt via SVn, maar de voorwaarden verschillen per gemeente.
    expect(
      niveauVan({ ProviderName: "Stimuleringsfonds Volkshuisvesting", Locations: ["Leeuwarden", "Assen"] }),
    ).toBe("gemeente");
  });

  it("valt terug op overig als er niets te zeggen valt", () => {
    expect(niveauVan({})).toBe("overig");
    expect(niveauVan({ ProviderName: "Onbekende stichting", Locations: [] })).toBe("overig");
  });

  it("deelt 9742HJ in zoals afgesproken", () => {
    const perNiveau = ONZE_ACHT.map(naarRegeling).reduce<Record<string, number>>((acc, r) => {
      acc[r.niveau] = (acc[r.niveau] ?? 0) + 1;
      return acc;
    }, {});
    expect(perNiveau).toEqual({ rijk: 6, provincie: 2, gemeente: 2 });
  });
});
