// ⚠️ KOPIE — bron van waarheid is src/lib/subsidies/lokaleAanvullingen.ts.
// Gegenereerd, niet met de hand bewerken: zie de kop van tekst.ts hiernaast.

// Lokale aanvullingen: regelingen die Milieu Centraal (nog) niet kent, maar die
// op een adres wél gelden. Het tegenovergestelde van de gebiedscorrecties
// (gebiedscorrecties.ts), die alleen wéghalen; dit bestand is de enige plek die
// een regeling bijzet. Bewust apart gehouden, zodat de belofte "voegt nooit
// toe" voor pasGebiedscorrectiesToe waar blijft.
//
// Dit draait in de edge function (als kopie) én in de site, net als de
// gebiedscorrecties. De mail en de CRM-app lezen alleen de function.
//
// Bij twijfel niet bijzetten. Een regeling beloven die niet geldt is erger dan
// er één missen: de bezoeker neemt beslissingen op dit overzicht en krijgt het
// ook per mail. Daarom alleen bij een leesbare postcode in het gebied, een
// bewonertype en maatregelen die we kunnen lezen, en nooit als Milieu Centraal
// de regeling zelf al levert.
//
// Teksten: alleen letterlijk of bijna letterlijk uit de bron van de aanbieder,
// met "je" in plaats van "u" zoals op de rest van de site. Geen eigen
// rekenvoorbeelden of percentages: geld- en subsidieregels zijn van Voortraject.
//
// AANPASSEN: wijzig dit bestand, draai `node scripts/kopieer-gebiedscorrecties.mjs`
// (maakt ook deze kopie voor de function), dan `bun run test`, en deploy de
// function: `bunx supabase functions deploy subsidiecheck --project-ref lfelnfukbrxznkevnevr`.
// Gaat Milieu Centraal de regeling zelf leveren, dan doet de regel hier vanzelf
// niets meer (zie `bronTitelBevat`); haal hem dan weg.

import { inPostcodegebied } from "./gebiedscorrecties.ts";
import type { Postcodegebied } from "./postcodegebieden.ts";
import {
  BEWONERTYPE_RESIDENT,
  MAATREGEL_FILTER_ID,
  type Bewonertype,
  type Maatregel,
  type SubsidieRegeling,
} from "./types.ts";

export type LokaleAanvulling = {
  /** De regeling zoals hij op de kaart komt, in dezelfde vorm als uit de bron. */
  regeling: SubsidieRegeling;
  /** Alleen bijzetten in dit gebied. */
  alleenIn: Postcodegebied;
  /**
   * Levert Milieu Centraal al een regeling met deze woorden in de titel, dan
   * zetten we hem niet bij. Hoofdletters tellen niet.
   */
  bronTitelBevat: string;
  /** Waarom, met de bron. */
  waarom: string;
};

export type AanvullingInvoer = {
  postcode: string;
  /** Onbekend: niet bijzetten. */
  bewonertype?: Bewonertype;
  /** Lege lijst = alle maatregelen. Onbekend (niet te lezen): niet bijzetten. */
  maatregelen?: Maatregel[];
};

// Gemeente Oldambt volgens PDOK: 1392 postcodes in 20 postcodegebieden. Geen
// van die gebieden deelt Oldambt met een andere gemeente (per gebied het aantal
// postcodes in Oldambt vergeleken met het totaal); de buren 9945 (Eemsdelta) en
// 9641 (Veendam) vallen er dus buiten.
export const OLDAMBT: Postcodegebied = {
  naam: "Gemeente Oldambt",
  bron: "https://api.pdok.nl/bzk/locatieserver/search/v3_1/free (gemeentenaam Oldambt)",
  versie: "afgeleid uit PDOK",
  vastgesteld: "2026-11-23",
  postcodes: [
    "9671", "9672", "9673", "9674", "9675", "9677", "9678", "9679",
    "9681", "9682", "9684", "9685", "9686", "9687", "9688",
    "9691", "9693",
    "9942", "9943", "9944",
  ],
};

const OLDAMBT_PAGINA = "https://www.gemeente-oldambt.nl/subsidies-en-leningen-voor-verduurzaming";

// Bronnen, beide gelezen op 2026-11-23:
//  - de gemeentepagina (OLDAMBT_PAGINA): omschrijving, voor wie en de
//    voorwaarden over label, bouwdelen en Nij Begun;
//  - de verordening, https://lokaleregelgeving.overheid.nl/CVDR761246: titel
//    (art. 21), bedrag (art. 7 lid 1 en 4) en de aanvraagtermijn (art. 11 lid 1).
// Bewust niet overgenomen: "inkomen net boven 140% van het sociaal minimum" van
// de gemeentepagina. Voortraject bevestigde op 2026-11-23 dat er voor isolatie
// en ventilatie geen inkomensgrens geldt; de verordening noemt die grens alleen
// voor onderhoud (art. 7 lid 4).
export const OLDAMBT_VERWARMT: SubsidieRegeling = {
  id: "subsidieregeling-isolatie-en-ventilatie-oldambt-verwarmt-2026-2028",
  titel: "Subsidieregeling isolatie en ventilatie Oldambt Verwarmt 2026 – 2028",
  niveau: "gemeente",
  type: "subsidie",
  aanbieder: "Gemeente Oldambt",
  omschrijving:
    "Deze aanvullende subsidie kun je met een toekenning van SNN (maatregel 29 van Nij Begun) bij de gemeente aanvragen. Met deze vergoeding krijg je maximaal € 5.000 voor isolatie-, ventilatie óf voor noodzakelijke onderhoudswerkzaamheden.",
  bedragIndicatie: "tot € 5.000",
  bedragToelichting:
    "Maximaal een verdubbeling van het bedrag dat op grond van de Subsidie isolatieaanpak Nij Begun wordt verstrekt, met een maximum van € 5.000 per woning. Subsidie voor noodzakelijk onderhoud alleen bij een verzamelinkomen tot 140% van het sociaal minimum.",
  looptAfOp: "2028-12-31T00:00:00Z",
  beperktTot: "isolatie en glas, ventilatie",
  alleenAls:
    "je huis energielabel D, E, F of G of minimaal twee slecht geïsoleerde bouwdelen heeft en je geen volledige vergoeding vanuit Nij Begun krijgt",
  voorWie: "Eigenaren van een slecht geïsoleerde woning, woonboot of woonwagen in de gemeente Oldambt.",
  belangrijksteVoorwaarde:
    "Je komt in aanmerking voor de Nij Begun subsidie en de aanpassingen voldoen aan de Nij Begun voorwaarden.",
  bronUrl: OLDAMBT_PAGINA,
  maatregelen: ["isolatie", "ventilatie"],
  doelgroepen: ["woningeigenaar"],
};

export const LOKALE_AANVULLINGEN: LokaleAanvulling[] = [
  {
    regeling: OLDAMBT_VERWARMT,
    alleenIn: OLDAMBT,
    bronTitelBevat: "Oldambt Verwarmt",
    waarom:
      "Gemeente Oldambt: aanvullend op Nij Begun voor eigenaren in de gemeente. Milieu Centraal had hem op 2026-11-23 niet (getest met 9671 CD).",
  },
];

function hoortErBij(regeling: SubsidieRegeling, invoer: AanvullingInvoer): boolean {
  if (!invoer.bewonertype || !regeling.doelgroepen.includes(invoer.bewonertype)) return false;
  if (!invoer.maatregelen) return false;
  if (invoer.maatregelen.length === 0) return true;
  return invoer.maatregelen.some((m) => regeling.maatregelen.includes(m));
}

/**
 * Zet regelingen bij die Milieu Centraal niet levert, achteraan de lijst. De
 * bestaande regelingen komen ongewijzigd en in dezelfde volgorde terug. Twee
 * keer toepassen geeft hetzelfde als één keer.
 */
export function pasLokaleAanvullingenToe(
  regelingen: SubsidieRegeling[],
  invoer: AanvullingInvoer,
  aanvullingen: LokaleAanvulling[] = LOKALE_AANVULLINGEN,
): SubsidieRegeling[] {
  const erbij: SubsidieRegeling[] = [];
  for (const a of aanvullingen) {
    if (!inPostcodegebied(invoer.postcode, a.alleenIn)) continue;
    if (!hoortErBij(a.regeling, invoer)) continue;
    const titel = a.bronTitelBevat.toLowerCase();
    const alGeleverd = regelingen.some((r) => r.id === a.regeling.id || r.titel.toLowerCase().includes(titel));
    if (alGeleverd) continue;
    erbij.push(a.regeling);
  }
  return erbij.length > 0 ? [...regelingen, ...erbij] : regelingen;
}

/**
 * De edge function krijgt het bewonertype en de maatregelen binnen in de
 * waarden van de bron ("Woningeigenaar", "1503"). Dit zet ze terug naar onze
 * codes. Kennen we het bewonertype niet, of geen enkele van de gevraagde
 * maatregelen, dan blijft dat veld leeg en wordt er niets bijgezet.
 */
export function invoerUitFunctieQuery(
  postcode: string,
  resident: string | null,
  filterIds: string[],
): AanvullingInvoer {
  const bewoner = (resident ?? "").trim().toLowerCase();
  const bewonertype = (Object.entries(BEWONERTYPE_RESIDENT) as [Bewonertype, string][]).find(
    ([, label]) => label.toLowerCase() === bewoner,
  )?.[0];
  const bekend = (Object.entries(MAATREGEL_FILTER_ID) as [Maatregel, string][])
    .filter(([, id]) => filterIds.includes(id))
    .map(([m]) => m);
  const maatregelen = filterIds.length === 0 ? [] : bekend.length > 0 ? bekend : undefined;
  return { postcode, bewonertype, maatregelen };
}
