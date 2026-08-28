// Datamodel van de subsidiecheck. Bewust bron-onafhankelijk: de UI bouwt
// tegen deze types, de provider (mock, Milieu Centraal, …) vertaalt zijn
// eigen formaat hiernaartoe. Zie provider.ts voor de interface.

export type SubsidieNiveau = "rijk" | "provincie" | "gemeente" | "overig";

// Subsidie (geld dat je niet terugbetaalt) versus lening. Cruciaal onderscheid
// voor de bezoeker: een lening van "€ 71.000" is geen cadeau. Stuurt het label
// op de kaart zodat een lening nooit als subsidie gelezen wordt.
export type SubsidieType = "subsidie" | "lening";

export type Bewonertype = "woningeigenaar" | "huurder" | "vve" | "verhuurder";

export type Maatregel =
  | "isolatie"
  | "warmtepomp"
  | "zonnepanelen"
  | "zonneboiler"
  | "ventilatie"
  | "warmtenet"
  | "elektrisch-koken"
  | "thuisbatterij"
  | "asbest";

export const ALLE_MAATREGELEN: Maatregel[] = [
  "isolatie",
  "warmtepomp",
  "zonnepanelen",
  "zonneboiler",
  "ventilatie",
  "warmtenet",
  "elektrisch-koken",
  "thuisbatterij",
  "asbest",
];

// Bewust de schrijfwijze van Milieu Centraal zelf, niet onze eigen variant.
// Deze labels staan naast hun filters in de bron én gaan als platte tekst naar
// `leads_bewoners.subsidiecheck_interesses` in het CRM; dezelfde woorden aan
// beide kanten scheelt vertaalwerk en verwarring. Wijzigt de bron een naam, dan
// meldt de filtercontrole dat (zie scripts/controleer-esw-filters.mjs).
export const MAATREGEL_LABELS: Record<Maatregel, string> = {
  isolatie: "Isolatie en glas",
  warmtepomp: "Warmtepomp",
  zonnepanelen: "Zonnepanelen",
  zonneboiler: "Zonneboiler",
  ventilatie: "Ventilatie",
  warmtenet: "Warmtenet-aansluiting",
  "elektrisch-koken": "Koken op elektriciteit",
  thuisbatterij: "Thuisbatterij",
  asbest: "Asbest verwijderen",
};

export const BEWONERTYPE_LABELS: Record<Bewonertype, string> = {
  woningeigenaar: "Woningeigenaar",
  huurder: "Huurder",
  vve: "VvE",
  verhuurder: "Verhuurder",
};

// Meervoud, voor waar het label middenin een zin staat ("We zoeken voor
// woningeigenaren op alle maatregelen").
export const BEWONERTYPE_MEERVOUD: Record<Bewonertype, string> = {
  woningeigenaar: "woningeigenaren",
  huurder: "huurders",
  vve: "VvE's",
  verhuurder: "verhuurders",
};

// --- Bron-koppeling: Energiesubsidiewijzer (Verbeterjehuis) ---
// Verbeterjehuis filtert server-side op bewonertype (`type-of-resident`) én
// maatregel (`filter=<id>`). We mappen onze types 1-op-1 op hun waarden, zodat
// de bron exact dezelfde lijst teruggeeft als hun eigen tool (geverifieerd
// 2026-07-13: 9742HJ + woningeigenaar + onze maatregelen = 10 regelingen).
export const BEWONERTYPE_RESIDENT: Record<Bewonertype, string> = {
  woningeigenaar: "Woningeigenaar",
  vve: "Vereniging van Eigenaren",
  huurder: "Huurder",
  verhuurder: "Particuliere woningverhuurder",
};

export const MAATREGEL_FILTER_ID: Record<Maatregel, string> = {
  isolatie: "1503",
  warmtepomp: "1564",
  zonnepanelen: "1571",
  zonneboiler: "1584",
  ventilatie: "1581",
  warmtenet: "1594",
  "elektrisch-koken": "1601",
  thuisbatterij: "1602",
  // Asbest staat er niet omdat wij asbest saneren, maar omdat een asbestdak
  // eraf en isolatie erop in Groningen en Drenthe hetzelfde traject is. Levert
  // in Noord-Nederland twee regelingen op die we anders misliepen: de
  // Maatwerklening en de Lening verwijderen asbestdaken Drenthe.
  asbest: "1613",
};

// Bouwt de filter-parameters voor de Energiesubsidiewijzer: bewonertype + de
// gekozen maatregelen (lege lijst = allemaal, want dat is onze "Alles"-optie).
// Retourneert alleen de query zónder postcode, zodat de dev-proxy én de edge
// function dezelfde logica delen.
export function bouwEswFilterQuery(bewonertype: Bewonertype, maatregelen: Maatregel[]): string {
  const gekozen = maatregelen.length > 0 ? maatregelen : ALLE_MAATREGELEN;
  const params = new URLSearchParams();
  params.set("type-of-resident", BEWONERTYPE_RESIDENT[bewonertype]);
  for (const m of gekozen) {
    const id = MAATREGEL_FILTER_ID[m];
    if (id) params.append("filter", id);
  }
  return params.toString();
}

export const NIVEAU_LABELS: Record<SubsidieNiveau, string> = {
  rijk: "Rijksoverheid",
  provincie: "Provincie",
  gemeente: "Gemeente",
  overig: "Leningen en overig",
};

export const TYPE_LABELS: Record<SubsidieType, string> = {
  subsidie: "Subsidie",
  lening: "Lening",
};

export type SubsidieRegeling = {
  id: string;
  titel: string;
  niveau: SubsidieNiveau;
  /** Subsidie of lening — bepaalt het kaartlabel. */
  type: SubsidieType;
  /** Wie de regeling uitvoert, bijv. "Rijksoverheid (RVO)" of "Gemeente Emmen". */
  aanbieder: string;
  /** Eén à twee rustige zinnen — geen marketingtaal. */
  omschrijving: string;
  /** Indicatie zoals "tot € 10.000" of "0%-lening". Weglaten als onbekend. */
  bedragIndicatie?: string;
  /** De bedragzin van de bron zelf, voor de uitklap. Vult het korte slot aan. */
  bedragToelichting?: string;
  /**
   * Uitzondering die de bron zelf als "Let op" markeert. Zeldzaam (één op de
   * dertig), dus het valt op als het er staat, en dat hoort ook: bij ISDE staat
   * hier dat je in Groningen en Noord-Drenthe beter de Isolatieaanpak kunt
   * nemen en de ISDE dan niet hoeft aan te vragen.
   */
  letOp?: string;
  /** Einddatum van de regeling (ISO). De bron gebruikt 2050 voor "onbepaald". */
  looptAfOp?: string;
  /**
   * Alleen gevuld als de regeling écht smal is: "isolatie en glas". Dat is voor
   * de bezoeker een beperking en hoort dus vóór de uitklap te staan. Is een
   * regeling breder, dan blijft dit leeg: een opsomming van zeven maatregelen
   * voegt niets toe aan de omschrijving.
   */
  beperktTot?: string;
  /** Uitklap-verdieping (drielagenmodel): voor wie de regeling bedoeld is. */
  voorWie?: string;
  /** Uitklap-verdieping: de belangrijkste voorwaarde in één zin. */
  belangrijksteVoorwaarde?: string;
  /** Link naar de officiële bron (RVO, SNN, gemeente, …). */
  bronUrl: string;
  /** Welke maatregelen de regeling dekt (voor filtering). */
  maatregelen: Maatregel[];
  /** Voor wie de regeling openstaat. */
  doelgroepen: Bewonertype[];
};

export type SubsidieCheckInput = {
  /** Genormaliseerd, bijv. "7823BR". */
  postcode: string;
  huisnummer: string;
  /** Optioneel, bijv. "A" of "2" — alleen voor adresweergave en leaddata. */
  toevoeging?: string;
  /** Uit de PDOK-lookup; regionale providers filteren hierop. */
  gemeente?: string;
  provincie?: string;
  bewonertype: Bewonertype;
  /** Lege lijst = alle maatregelen tonen. */
  maatregelen: Maatregel[];
};

/** Vaste volgorde waarin de niveaus in het resultaat getoond worden. */
export const NIVEAU_VOLGORDE: SubsidieNiveau[] = ["rijk", "provincie", "gemeente", "overig"];

// Binnen een niveaugroep eerst alle subsidies, dan de leningen: geld dat je niet
// terugbetaalt is het interessantst en hoort bovenaan. Stabiele sort, dus de
// bronvolgorde binnen één type blijft behouden.
const TYPE_VOLGORDE: Record<SubsidieType, number> = { subsidie: 0, lening: 1 };

export function groepeerPerNiveau(regelingen: SubsidieRegeling[]) {
  return NIVEAU_VOLGORDE.map((niveau) => ({
    niveau,
    regelingen: regelingen
      .filter((r) => r.niveau === niveau)
      .sort((a, b) => TYPE_VOLGORDE[a.type] - TYPE_VOLGORDE[b.type]),
  })).filter((groep) => groep.regelingen.length > 0);
}

export type Samenvatting = {
  totaal: number;
  subsidies: number;
  leningen: number;
};

// Kern voor het samenvattingsblok bovenaan het resultaat (inverted pyramid):
// het aantal en de subsidie/lening-verdeling. Bewust géén opgeteld
// totaalbedrag: regelingen zijn niet zomaar stapelbaar en een verzonnen
// maximumbedrag ondermijnt het vertrouwen. De spreiding over de niveaus zat
// hier ook in, maar die kwam dubbel terug als groepskoppen op het resultaat en
// is daar in PR #47 uit de samenvatting gehaald.
export function maakSamenvatting(regelingen: SubsidieRegeling[]): Samenvatting {
  return {
    totaal: regelingen.length,
    subsidies: regelingen.filter((r) => r.type === "subsidie").length,
    leningen: regelingen.filter((r) => r.type === "lening").length,
  };
}

// --- Bedrag-teaser: het sterkste concrete cijfer uitlichten ---
// Leest de al genormaliseerde `bedragIndicatie` ("tot € X" of "X–Y% van de
// kosten"). Nooit optellen of verzinnen: we tonen altijd één écht bestaand
// cijfer uit een gevonden regeling. Voor subsidies lichten we bij voorkeur het
// hoogste percentage uit (100% spreekt het meeste aan), anders het hoogste
// bedrag; voor leningen het hoogste bedrag, anders een percentage.
export type BedragSoort = "euro" | "pct";
export type TopBedrag = { soort: BedragSoort; waarde: number };

function euroUit(indicatie?: string): number | undefined {
  const m = indicatie?.match(/€\s?([\d.]+)/);
  if (!m) return undefined;
  const n = parseInt(m[1].replace(/\./g, ""), 10);
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

function pctUit(indicatie?: string): number | undefined {
  if (!indicatie) return undefined;
  const waarden = [...indicatie.matchAll(/(\d{1,3})\s*%/g)]
    .map((m) => parseInt(m[1], 10))
    .filter((n) => Number.isFinite(n) && n > 0);
  return waarden.length ? Math.max(...waarden) : undefined;
}

function hoogste(regelingen: SubsidieRegeling[], uit: (s?: string) => number | undefined): number | undefined {
  const waarden = regelingen.map((r) => uit(r.bedragIndicatie)).filter((n): n is number => n != null);
  return waarden.length ? Math.max(...waarden) : undefined;
}

export function topBedragen(regelingen: SubsidieRegeling[]): { subsidie?: TopBedrag; lening?: TopBedrag } {
  const subs = regelingen.filter((r) => r.type === "subsidie");
  const len = regelingen.filter((r) => r.type === "lening");
  const subPct = hoogste(subs, pctUit);
  const subEuro = hoogste(subs, euroUit);
  const lenEuro = hoogste(len, euroUit);
  const lenPct = hoogste(len, pctUit);
  return {
    subsidie:
      subPct != null ? { soort: "pct", waarde: subPct } : subEuro != null ? { soort: "euro", waarde: subEuro } : undefined,
    lening:
      lenEuro != null ? { soort: "euro", waarde: lenEuro } : lenPct != null ? { soort: "pct", waarde: lenPct } : undefined,
  };
}

/** Euro met NL-duizendtallen, bijv. 28000 → "28.000". */
export function formatEuro(n: number): string {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

// --- Einddatum ---
// De bron zet `DateEnd` op elke regeling, maar gebruikt 2050 als "loopt
// voorlopig door" (25 van de 42 regelingen in Noord-Nederland staan zo).
// Alleen een datum die écht in zicht is zegt iets tegen de bezoeker; de rest is
// ruis. Drie maanden is de grens: kort genoeg om te haasten, lang genoeg om nog
// een aanvraag rond te krijgen.
const BINNENKORT_MAANDEN = 3;

export function looptBinnenkortAf(iso: string | undefined, nu = new Date()): boolean {
  if (!iso) return false;
  const eind = new Date(iso);
  if (Number.isNaN(eind.getTime()) || eind <= nu) return false;
  const grens = new Date(nu);
  grens.setMonth(grens.getMonth() + BINNENKORT_MAANDEN);
  return eind <= grens;
}

/** "2026-09-01T00:00:00Z" → "1 september 2026". */
export function formateerDatum(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("nl-NL", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(d);
}
