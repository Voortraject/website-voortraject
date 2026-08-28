import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import {
  aanbiederVan,
  beperktTotVan,
  filterOpMaatregelen,
  idVan,
  maatregelenVan,
  naarRegeling,
  niveauVan,
  typeVan,
  type EswApiRegeling,
} from "@/lib/subsidies/energiesubsidiewijzerApi";
import { ALLE_MAATREGELEN, formateerDatum, looptBinnenkortAf } from "@/lib/subsidies/types";

// Echt antwoord van de officiële API (search, 9742HJ, Woningeigenaar), alleen
// ontdaan van `Details` en `Share` — die zijn obsolete respectievelijk ongebruikt
// en maakten de fixture onnodig groot.
const fixture = JSON.parse(
  readFileSync(resolve(__dirname, "fixtures/esw-api-9742hj-woningeigenaar.json"), "utf8"),
) as EswApiRegeling[];

// De maatregelen die onze tool aanbiedt (de "Alles"-keuze).
const ONZE_KEUZE = filterOpMaatregelen(fixture, [...ALLE_MAATREGELEN]);

describe("Energiesubsidiewijzer-API: filteren op maatregelen", () => {
  it("houdt precies de regelingen over die de live tool nu toont", () => {
    // De bron geeft er twaalf voor deze postcode. Er valt er één af: de
    // Stimuleringsregeling natuurinclusief (ver)bouwen, die alleen 1614 heeft
    // en dat bieden wij niet aan. De Maatwerklening (alleen asbest, 1613) komt
    // er sinds de negende maatregel wél bij; die misten we eerder.
    expect(ONZE_KEUZE).toHaveLength(11);
    expect(ONZE_KEUZE.map(idVan)).toEqual([
      "isolatieaanpak-groningen-en-noord-drenthe",
      "isde-subsidie-rijksoverheid",
      "subsidie-verduurzaming-en-verbetering-groningen-10-000",
      "energiebespaarlening-warmtefonds",
      "energiebespaarlening-voor-mensen-met-onvoldoende-leencapaciteit-warmtefonds",
      "subsidie-energiemaatregelen-groningen",
      "verzilverlening",
      "subsidie-waardevermeerdering-drenthe-en-groningen",
      "maatwerklening",
      "extra-geld-voor-energiebesparing-in-hypotheek-met-nhg",
      "laag-btw-tarief-voor-isolatiewerkzaamheden",
    ]);
  });

  it("een lege keuze betekent allemaal, niet 'niets'", () => {
    expect(filterOpMaatregelen(fixture, []).map(idVan)).toEqual(ONZE_KEUZE.map(idVan));
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

  it("zegt dat het bedrag per maatregel verschilt als de bron dat zelf zegt", () => {
    // ISDE noemt geen bedrag omdat het per maatregel verschilt. Hier stond
    // eerder onze eigen schatting "tot ± 30% van de kosten"; die is weg.
    const isde = naarRegeling(fixture.find((r) => r.Id === "1629")!);
    expect(isde.bedragIndicatie).toBe("verschilt per maatregel");
    expect(isde.bedragToelichting).toContain("hangt af van welke maatregel");
  });

  it("laat het bedrag leeg als de bron geen getal noemt en ook niet zegt waarom", () => {
    // Het lage btw-tarief noemt "9 procent", geen bedrag en geen uitleg dat het
    // per maatregel verschilt. Dan liever niets dan iets verzinnen.
    const btw = naarRegeling(fixture.find((r) => r.Id === "1647")!);
    expect(btw.bedragIndicatie).toBeUndefined();
    expect(btw.bedragToelichting).toContain("9 procent");
  });

  it("licht een 'Let op' van de bron eruit en haalt de aanhef weg", () => {
    // Bij ISDE staat dat je in Groningen en Noord-Drenthe de Isolatieaanpak
    // kunt nemen en de ISDE dan niet hoeft aan te vragen. Die tekst is het hele
    // punt van dit veld; de aanhef "Let op:" zetten we zelf al op de kaart.
    const isde = naarRegeling(fixture.find((r) => r.Id === "1629")!);
    expect(isde.letOp).toMatch(/^Woon je in Groningen of Noord-Drenthe\?/);
    expect(isde.letOp).toContain("géén ISDE-subsidie aan te vragen");
  });

  it("laat een gewone extra alinea staan waar hij staat", () => {
    // De Isolatieaanpak heeft ook een AdditionalIntro, maar zonder "Let op".
    // Dat is uitleg, geen uitzondering, en hoort niet als waarschuwing op de kaart.
    expect(naarRegeling(fixture.find((r) => r.Id === "3143")!).letOp).toBeUndefined();
  });

  it("neemt de einddatum over zoals de bron hem geeft", () => {
    const waardevermeerdering = naarRegeling(fixture.find((r) => r.Id === "2559")!);
    expect(waardevermeerdering.looptAfOp).toBe("2026-09-01T00:00:00Z");
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
    // 1609 is "Tuin vergroenen"; dat bieden wij niet aan, 1503 wel.
    expect(maatregelenVan({ Tags: [{ Value: "1609" }, { Value: "1503" }] })).toEqual(["isolatie"]);
  });

  it("toont de echte aanbieder, niet het generieke laaglabel", () => {
    const nhg = naarRegeling(fixture.find((r) => r.Id === "1731")!);
    // Stond eerst als "Overige aanbieders" op de kaart, en zou met de nieuwe
    // indeling "Rijksoverheid" hebben gezegd. NHG is geen rijksoverheid.
    expect(nhg.aanbieder).toBe("Nationale Hypotheek Garantie");
    expect(naarRegeling(fixture.find((r) => r.Id === "3018")!).aanbieder).toBe("Gemeente Groningen");
    expect(naarRegeling(fixture.find((r) => r.Id === "2559")!).aanbieder).toBe(
      "Samenwerkingsverband Noord-Nederland",
    );
  });

  it("gebruikt de afkorting die de bron zelf achter de naam zet", () => {
    // De bron noemt dezelfde instantie afwisselend "RVO" en voluit; zo heet hij
    // op elke kaart hetzelfde, en past hij ook op een telefoon.
    expect(aanbiederVan({ ProviderName: "Rijksdienst voor Ondernemend Nederland (RVO)" }, "rijk")).toBe("RVO");
    expect(aanbiederVan({ ProviderName: "Stimuleringsfonds Volkshuisvesting (SVn)" }, "gemeente")).toBe("SVn");
  });

  it("haalt een toelichting tussen haakjes weg in plaats van hem als afkorting te lezen", () => {
    expect(
      aanbiederVan({ ProviderName: "Nationale Hypotheek Garantie (verkrijgbaar via hypotheekverstrekkers)" }, "rijk"),
    ).toBe("Nationale Hypotheek Garantie");
  });

  it("kort niet in tot de afkorting als er twee organisaties voor de haakjes staan", () => {
    // "SVn" zou hier de gemeente wegpoetsen, en juist die herkent een bewoner.
    // De naam blijft dus voluit staan; de kaart laat hem over twee regels lopen.
    expect(
      aanbiederVan({ ProviderName: "Gemeente Den Haag en Stimuleringsfonds Volkshuisvesting (SVn)" }, "gemeente"),
    ).toBe("Gemeente Den Haag en Stimuleringsfonds Volkshuisvesting (SVn)");
  });

  it("valt terug op het laaglabel als de bron geen aanbieder noemt", () => {
    expect(aanbiederVan({}, "gemeente")).toBe("Gemeente");
    expect(aanbiederVan({ ProviderName: "   " }, "overig")).toBe("Overige aanbieders");
  });

  it("haalt de spatie weg die de bron soms achter een naam laat staan", () => {
    // De Belastingdienst komt binnen als "Belastingdienst " (met spatie).
    expect(naarRegeling(fixture.find((r) => r.Id === "1647")!).aanbieder).toBe("Belastingdienst");
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
    const perNiveau = ONZE_KEUZE.map(naarRegeling).reduce<Record<string, number>>((acc, r) => {
      acc[r.niveau] = (acc[r.niveau] ?? 0) + 1;
      return acc;
    }, {});
    expect(perNiveau).toEqual({ rijk: 6, provincie: 2, gemeente: 3 });
  });
});

describe("Einddatum: alleen tonen als hij in zicht is", () => {
  const nu = new Date("2026-08-28T12:00:00Z");

  it("toont een datum binnen drie maanden", () => {
    expect(looptBinnenkortAf("2026-09-01T00:00:00Z", nu)).toBe(true);
    expect(looptBinnenkortAf("2026-11-01T00:00:00Z", nu)).toBe(true);
  });

  it("negeert de 2050-plaatshouder waarmee de bron 'loopt door' bedoelt", () => {
    // Vijfentwintig van de tweeënveertig regelingen in Noord-Nederland staan zo.
    expect(looptBinnenkortAf("2050-01-01T00:00:00Z", nu)).toBe(false);
  });

  it("negeert een datum verderop en een datum die al voorbij is", () => {
    expect(looptBinnenkortAf("2027-12-31T00:00:00Z", nu)).toBe(false);
    expect(looptBinnenkortAf("2026-08-01T00:00:00Z", nu)).toBe(false);
  });

  it("kan overweg met niets en met onzin", () => {
    expect(looptBinnenkortAf(undefined, nu)).toBe(false);
    expect(looptBinnenkortAf("geen datum", nu)).toBe(false);
  });

  it("schrijft de datum voluit in het Nederlands", () => {
    expect(formateerDatum("2026-09-01T00:00:00Z")).toBe("1 september 2026");
  });
});

describe("De regel 'alleen voor …' op de kaart", () => {
  it("staat er alleen als de regeling écht smal is", () => {
    // Het lage btw-tarief heeft één tag: isolatie en glas.
    expect(naarRegeling(fixture.find((r) => r.Id === "1647")!).beperktTot).toBe("isolatie en glas");
  });

  it("blijft leeg bij een brede regeling", () => {
    // ISDE dekt er zes; die opsommen voegt niets toe aan de omschrijving.
    expect(naarRegeling(fixture.find((r) => r.Id === "1629")!).beperktTot).toBeUndefined();
  });

  it("kijkt naar álle maatregelen van de bron, niet alleen naar de onze", () => {
    // De Isolatieaanpak heeft vier tags, waarvan wij er twee aanbieden
    // (isolatie en ventilatie). "Alleen voor isolatie en ventilatie" zou dan
    // onwaar zijn: de regeling dekt ook energieadvies en procesondersteuning.
    const isolatieaanpak = fixture.find((r) => r.Id === "3143")!;
    expect(maatregelenVan(isolatieaanpak)).toHaveLength(2);
    expect(beperktTotVan(isolatieaanpak)).toBeUndefined();
  });

  it("schrijft de labels met een kleine letter, want ze staan midden in een zin", () => {
    expect(beperktTotVan({ Tags: [{ Label: "Isolatie en glas" }, { Label: "Ventilatie" }] })).toBe(
      "isolatie en glas, ventilatie",
    );
  });

  it("blijft leeg als de bron geen maatregelen meegeeft", () => {
    expect(beperktTotVan({})).toBeUndefined();
    expect(beperktTotVan({ Tags: [] })).toBeUndefined();
  });
});
