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
// bewonertype en maatregelen die we kunnen lezen, vóór de einddatum, en nooit
// als Milieu Centraal de regeling zelf al levert.
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

import { RESIDENT_NAAR_BEWONERTYPE } from "./energiesubsidiewijzerApi.ts";
import { inPostcodegebied } from "./gebiedscorrecties.ts";
import type { Postcodegebied } from "./postcodegebieden.ts";
import { MAATREGEL_FILTER_ID, type Bewonertype, type Maatregel, type SubsidieRegeling } from "./types.ts";

export type LokaleAanvulling = {
  /**
   * De regeling zoals hij op de kaart komt, in dezelfde vorm als uit de bron.
   * Na `looptAfOp` wordt hij niet meer bijgezet.
   */
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

// Oldambt Verwarmt, als twee kaarten: de verordening noemt in haar toelichting
// zelf twee onderdelen ("1. Extra isolatievergoeding", "2. Noodzakelijk
// onderhoud") met elk een eigen bedrag en eigen voorwaarden. Op één kaart
// spraken die elkaar tegen: het onderhoud is juist voor lage inkomens.
//
// Bronnen, gelezen op 2026-11-23:
//  - de gemeentepagina (OLDAMBT_PAGINA): omschrijving, voor wie, de voorwaarden
//    over label, bouwdelen en Nij Begun, en het bouwkundig rapport;
//  - de verordening, https://lokaleregelgeving.overheid.nl/CVDR761246: bedragen
//    (art. 7 lid 1, 2 en 4), slecht geïsoleerd (art. 1 sub h), geen (volledige)
//    vergoeding uit Nij Begun (art. 2 lid 5), het rapport (art. 10 lid 3), de
//    aanvraagtermijn (art. 11 lid 1) en de toelichting.
// Bewust niet overgenomen: "inkomen net boven 140% van het sociaal minimum" van
// de gemeentepagina. Voortraject bevestigde op 2026-11-23 dat er voor isolatie
// en ventilatie geen inkomensgrens geldt; de verordening noemt die grens alleen
// voor onderhoud (art. 7 lid 4, en de toelichting op hoofdstuk 1).
const OLDAMBT_PAGINA = "https://www.gemeente-oldambt.nl/subsidies-en-leningen-voor-verduurzaming";

// Aanvragen kan "tot en met 31 december 2028" (art. 11 lid 1). De grens is het
// eerste moment ná die dag in Nederlandse tijd: 1 januari 2029 00:00 in
// Amsterdam (wintertijd, UTC+1). Zo telt de hele laatste dag mee.
const OLDAMBT_AANVRAGEN_TOT = "2028-12-31T23:00:00Z";

const OLDAMBT_VOOR_WIE = "Eigenaren van een slecht geïsoleerde woning, woonboot of woonwagen in de gemeente Oldambt.";
const OLDAMBT_VOORWAARDE =
  "Je komt in aanmerking voor de Nij Begun subsidie en de aanpassingen voldoen aan de Nij Begun voorwaarden.";

export const OLDAMBT_ISOLATIE: SubsidieRegeling = {
  id: "oldambt-verwarmt-2026-2028-extra-isolatievergoeding",
  titel: "Oldambt Verwarmt 2026 – 2028: extra isolatievergoeding",
  niveau: "gemeente",
  type: "subsidie",
  aanbieder: "Gemeente Oldambt",
  omschrijving:
    "Deze aanvullende subsidie kun je met een toekenning van SNN (maatregel 29 van Nij Begun) bij de gemeente aanvragen.",
  bedragIndicatie: "tot € 5.000",
  bedragToelichting:
    "Maximaal een verdubbeling van het bedrag dat op grond van de Subsidie isolatieaanpak Nij Begun wordt verstrekt, met een maximum van € 5.000 per woning.",
  looptAfOp: OLDAMBT_AANVRAGEN_TOT,
  beperktTot: "isolatie en glas, ventilatie",
  alleenAls:
    "je huis energielabel D, E, F of G of minimaal twee slecht geïsoleerde bouwdelen heeft en je geen volledige vergoeding vanuit Nij Begun krijgt",
  voorWie: OLDAMBT_VOOR_WIE,
  belangrijksteVoorwaarde: OLDAMBT_VOORWAARDE,
  bronUrl: OLDAMBT_PAGINA,
  maatregelen: ["isolatie", "ventilatie"],
  doelgroepen: ["woningeigenaar"],
};

// Geen `beperktTot`: "Alleen isolatie en glas, ventilatie" boven een kaart over
// onderhoud leest verkeerd. De maatregelfilter blijft wel isolatie en
// ventilatie, want het onderhoud is er alleen om die uit te kunnen voeren.
export const OLDAMBT_ONDERHOUD: SubsidieRegeling = {
  id: "oldambt-verwarmt-2026-2028-noodzakelijk-onderhoud",
  titel: "Oldambt Verwarmt 2026 – 2028: noodzakelijk onderhoud",
  niveau: "gemeente",
  type: "subsidie",
  aanbieder: "Gemeente Oldambt",
  omschrijving:
    "Onderhoud dat echt nodig is om isolatie of ventilatie uit te voeren. Bijvoorbeeld het vervangen van rot hout voordat dakisolatie kan worden geplaatst.",
  bedragIndicatie: "tot € 5.000",
  bedragToelichting:
    "Maximaal € 5.000 per woning. Bij noodzakelijk onderhoud is het verplicht om eerst een bouwkundig rapport of isolatieplan op te stellen.",
  looptAfOp: OLDAMBT_AANVRAGEN_TOT,
  alleenAls:
    "je verzamelinkomen tot 140% van het sociaal minimum is, je huis energielabel D, E, F of G of minimaal twee slecht geïsoleerde bouwdelen heeft en een bouwkundig rapport of isolatieplan laat zien dat het onderhoud nodig is",
  voorWie: OLDAMBT_VOOR_WIE,
  belangrijksteVoorwaarde: OLDAMBT_VOORWAARDE,
  bronUrl: OLDAMBT_PAGINA,
  maatregelen: ["isolatie", "ventilatie"],
  doelgroepen: ["woningeigenaar"],
};

const OLDAMBT_WAAROM =
  "Gemeente Oldambt: aanvullend op Nij Begun voor eigenaren in de gemeente. Milieu Centraal had hem op 2026-11-23 niet (getest met 9671 CD).";

export const LOKALE_AANVULLINGEN: LokaleAanvulling[] = [
  { regeling: OLDAMBT_ISOLATIE, alleenIn: OLDAMBT, bronTitelBevat: "Oldambt Verwarmt", waarom: OLDAMBT_WAAROM },
  { regeling: OLDAMBT_ONDERHOUD, alleenIn: OLDAMBT, bronTitelBevat: "Oldambt Verwarmt", waarom: OLDAMBT_WAAROM },
];

function hoortErBij(regeling: SubsidieRegeling, invoer: AanvullingInvoer, nu: Date): boolean {
  if (regeling.looptAfOp && nu >= new Date(regeling.looptAfOp)) return false;
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
  nu: Date = new Date(),
): SubsidieRegeling[] {
  const erbij: SubsidieRegeling[] = [];
  for (const a of aanvullingen) {
    if (!inPostcodegebied(invoer.postcode, a.alleenIn)) continue;
    if (!hoortErBij(a.regeling, invoer, nu)) continue;
    // Alleen tegen wat de bron leverde, niet tegen wat we hier net bijzetten:
    // twee kaarten met dezelfde naam in de titel mogen allebei.
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
  const bewonertype = RESIDENT_NAAR_BEWONERTYPE.get((resident ?? "").trim().toLowerCase());
  const bekend = (Object.entries(MAATREGEL_FILTER_ID) as [Maatregel, string][])
    .filter(([, id]) => filterIds.includes(id))
    .map(([m]) => m);
  const maatregelen = filterIds.length === 0 ? [] : bekend.length > 0 ? bekend : undefined;
  return { postcode, bewonertype, maatregelen };
}
