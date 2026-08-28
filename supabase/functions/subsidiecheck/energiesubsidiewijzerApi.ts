// ⚠️ KOPIE — bron van waarheid is src/lib/subsidies/energiesubsidiewijzerApi.ts.
// Gegenereerd, niet met de hand bewerken: zie de kop van tekst.ts hiernaast.

// Vertaling van de officiële Energiesubsidiewijzer-API (Milieu Centraal) naar
// onze bron-onafhankelijke types.
//
// Dit vervangt de HTML-scrape in energiesubsidiewijzer.ts. De API levert per
// regeling in één keer alles wat wij tonen, dus de detailpagina's hoeven niet
// meer los opgehaald te worden (`getdetail` geeft exact hetzelfde object als
// `search`). Zie de API Guide van 21 mei 2025 en tasks/todo.md.
//
// Twee dingen zitten NIET in de API en leiden we hier zelf af:
//  - het `id`: wij houden de slug uit `Url` aan (bijv. "isde-subsidie-
//    rijksoverheid") en niet hun `Id`, zodat onze id's identiek blijven aan die
//    van de scrape. Daar hangen curated bedragen en gedeelde links aan.
//  - het `niveau`: de overheidslaag stond alleen als CSS-klasse in hun HTML.
//    We leiden hem af uit aanbieder plus werkgebied, zie niveauVan().

import { beknoptBedrag, eersteRegel, schoon } from "./tekst.ts";
import {
  ALLE_MAATREGELEN,
  BEWONERTYPE_RESIDENT,
  MAATREGEL_FILTER_ID,
  type Bewonertype,
  type Maatregel,
  type SubsidieNiveau,
  type SubsidieRegeling,
  type SubsidieType,
} from "./types.ts";

/** Eén regeling zoals de API hem teruggeeft (alleen de velden die wij lezen). */
export type EswApiRegeling = {
  Id?: string;
  Title?: string;
  Intro?: string;
  AmountsText?: string;
  Conditions?: string;
  /** "subsidy" | "loan" | "other" */
  Type?: string;
  TargetGroup?: string;
  /** Werkgebied: "0000-9999" voor heel Nederland, anders gemeente-/provincienamen. */
  Locations?: string[];
  ProviderName?: string;
  ProviderUrl?: string;
  Url?: string;
  Tags?: { Label?: string; Value?: string }[];
};

// Het generieke aanbiederlabel dat de kaart nu toont. De API kent de échte naam
// ("Gemeente Groningen", "SNN"); die tonen is een aparte, zichtbare wijziging
// en gaat in een volgende PR (zie tasks/todo.md 5b).
const NIVEAU_AANBIEDER: Record<SubsidieNiveau, string> = {
  rijk: "Rijksoverheid",
  provincie: "Provincie",
  gemeente: "Gemeente",
  overig: "Overige aanbieders",
};

const ALLE_BEWONERTYPES: Bewonertype[] = ["woningeigenaar", "huurder", "vve", "verhuurder"];

// Omgekeerde opzoektabellen: van de waarden van de bron terug naar onze codes.
const FILTER_ID_NAAR_MAATREGEL = new Map<string, Maatregel>(
  (Object.entries(MAATREGEL_FILTER_ID) as [Maatregel, string][]).map(([m, id]) => [id, m]),
);
const RESIDENT_NAAR_BEWONERTYPE = new Map<string, Bewonertype>(
  (Object.entries(BEWONERTYPE_RESIDENT) as [Bewonertype, string][]).map(([b, label]) => [
    label.toLowerCase(),
    b,
  ]),
);

/** Werkgebied "heel Nederland": de bron schrijft het als "0000-9999" of "0000 - 9999". */
const LANDELIJK_RE = /^0{4}\s*-\s*9{4}$/;
const GEMEENTE_RE = /^gemeente\b/i;
const PROVINCIE_RE = /^provincie\b/i;
// SNN voert de noordelijke provincieregelingen uit (Nij Begun, Waardevermeerdering).
const NOORDELIJK_SAMENWERKINGSVERBAND_RE = /\bSNN\b|samenwerkingsverband noord-nederland/i;
// Landelijke uitvoerders die niet altijd een landelijk werkgebied meekrijgen
// (de Isolatieaanpak van RVO staat op een lijst gemeenten, maar is rijksbeleid).
const RIJKSINSTANTIE_RE = /\b(rvo|rijksdienst voor ondernemend nederland|belastingdienst|rijksoverheid|ministerie)\b/i;

/**
 * Leidt de overheidslaag af uit aanbieder plus werkgebied. De volgorde is
 * bewust: de aanbieder is het sterkste signaal, het werkgebied vult aan.
 */
export function niveauVan(regeling: EswApiRegeling): SubsidieNiveau {
  const aanbieder = (regeling.ProviderName ?? "").trim();
  if (GEMEENTE_RE.test(aanbieder)) return "gemeente";
  if (PROVINCIE_RE.test(aanbieder) || NOORDELIJK_SAMENWERKINGSVERBAND_RE.test(aanbieder)) {
    return "provincie";
  }
  const locaties = regeling.Locations ?? [];
  if (locaties.some((l) => LANDELIJK_RE.test(l.trim()))) return "rijk";
  if (RIJKSINSTANTIE_RE.test(aanbieder)) return "rijk";
  // Geen landelijke regeling en geen rijksinstantie, maar wel een lijst plaatsen:
  // dan is het per gemeente geregeld (bijv. de Verzilverlening via SVn).
  if (locaties.length > 0) return "gemeente";
  return "overig";
}

/**
 * "loan" wordt een lening, "subsidy" en "other" allebei een subsidie. Dat laatste
 * is dezelfde keuze als de scrape maakte: een btw-verlaging is geen lening, dus
 * hoort aan de kant van "geld dat je niet terugbetaalt".
 */
export function typeVan(regeling: EswApiRegeling): SubsidieType {
  return regeling.Type?.toLowerCase() === "loan" ? "lening" : "subsidie";
}

/** Laatste padsegment van de Verbeterjehuis-URL, ons stabiele id. */
export function idVan(regeling: EswApiRegeling): string {
  const url = regeling.Url ?? "";
  const slug = url.split(/[?#]/)[0].replace(/\/+$/, "").split("/").pop();
  return slug || String(regeling.Id ?? "");
}

/** De maatregelen die de bron aan deze regeling hangt, vertaald naar onze codes. */
export function maatregelenVan(regeling: EswApiRegeling): Maatregel[] {
  const uit: Maatregel[] = [];
  for (const tag of regeling.Tags ?? []) {
    const maatregel = tag.Value ? FILTER_ID_NAAR_MAATREGEL.get(tag.Value) : undefined;
    if (maatregel && !uit.includes(maatregel)) uit.push(maatregel);
  }
  return uit;
}

function doelgroepenVan(regeling: EswApiRegeling): Bewonertype[] {
  const bewonertype = RESIDENT_NAAR_BEWONERTYPE.get((regeling.TargetGroup ?? "").trim().toLowerCase());
  // De bron filtert al op bewonertype; kent hij de waarde niet, dan houden we
  // de regeling breed in plaats van hem stil weg te filteren.
  return bewonertype ? [bewonertype] : [...ALLE_BEWONERTYPES];
}

export function naarRegeling(regeling: EswApiRegeling): SubsidieRegeling {
  const niveau = niveauVan(regeling);
  return {
    id: idVan(regeling),
    titel: schoon(regeling.Title ?? ""),
    niveau,
    type: typeVan(regeling),
    aanbieder: NIVEAU_AANBIEDER[niveau],
    omschrijving: schoon(regeling.Intro ?? ""),
    // Alleen de eerste alinea van de bedragtekst, net als de scrape deed: daarna
    // volgt vaak een opsomming met uitzonderingsbedragen, en het hoogste getal
    // daaruit zou een verkeerd beeld geven (Isolatieaanpak is "50–100% van de
    // kosten", niet "tot € 40.000").
    bedragIndicatie: beknoptBedrag(eersteRegel(regeling.AmountsText)),
    belangrijksteVoorwaarde: eersteRegel(regeling.Conditions),
    bronUrl: regeling.ProviderUrl || regeling.Url || "",
    maatregelen: maatregelenVan(regeling),
    doelgroepen: doelgroepenVan(regeling),
  };
}

/**
 * Filtert op de gekozen maatregelen. De API kent hiervoor geen gedocumenteerde
 * parameter, maar levert de maatregelen per regeling mee (`Tags`), dus doen we
 * het zelf. Voordeel: één antwoord per postcode en bewonertype is bruikbaar
 * voor élke maatregelcombinatie, wat de cache veel vaker laat raken.
 * Lege keuze = onze "Alles"-optie = alle acht.
 */
export function filterOpMaatregelen(
  regelingen: EswApiRegeling[],
  maatregelen: Maatregel[],
): EswApiRegeling[] {
  const gekozen = maatregelen.length > 0 ? maatregelen : ALLE_MAATREGELEN;
  return filterOpFilterIds(regelingen, gekozen.map((m) => MAATREGEL_FILTER_ID[m]).filter(Boolean));
}

/**
 * Dezelfde filtering, maar op de ruwe filter-id's van de bron ("1503"). De edge
 * function krijgt die id's binnen van de client en geeft ze onvertaald door, net
 * zoals hij ze vroeger naar de bron doorstuurde: een id dat wij (nog) niet
 * kennen filtert dan niet stilletjes alles weg.
 */
export function filterOpFilterIds(regelingen: EswApiRegeling[], ids: string[]): EswApiRegeling[] {
  if (ids.length === 0) return regelingen;
  const gezocht = new Set(ids);
  return regelingen.filter((r) => (r.Tags ?? []).some((t) => t.Value && gezocht.has(t.Value)));
}
