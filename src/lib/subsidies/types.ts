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
  | "thuisbatterij";

export const ALLE_MAATREGELEN: Maatregel[] = [
  "isolatie",
  "warmtepomp",
  "zonnepanelen",
  "zonneboiler",
  "ventilatie",
  "warmtenet",
  "elektrisch-koken",
  "thuisbatterij",
];

export const MAATREGEL_LABELS: Record<Maatregel, string> = {
  isolatie: "Isolatie & glas",
  warmtepomp: "Warmtepomp",
  zonnepanelen: "Zonnepanelen",
  zonneboiler: "Zonneboiler",
  ventilatie: "Ventilatie",
  warmtenet: "Warmtenet-aansluiting",
  "elektrisch-koken": "Elektrisch koken",
  thuisbatterij: "Thuisbatterij",
};

export const BEWONERTYPE_LABELS: Record<Bewonertype, string> = {
  woningeigenaar: "Woningeigenaar",
  huurder: "Huurder",
  vve: "VvE",
  verhuurder: "Verhuurder",
};

// --- Bron-koppeling: Energiesubsidiewijzer (Verbeterjehuis) ---
// Verbeterjehuis filtert server-side op bewonertype (`type-of-resident`) én
// maatregel (`filter=<id>`). We mappen onze types 1-op-1 op hun waarden, zodat
// de bron exact dezelfde lijst teruggeeft als hun eigen tool (geverifieerd
// 2026-07-13: 9742HJ + woningeigenaar + onze 8 maatregelen = 10 regelingen).
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
};

// Bouwt de filter-parameters voor de Energiesubsidiewijzer: bewonertype + de
// gekozen maatregelen (lege lijst = alle 8, want dat is onze "Alles"-optie).
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

// Korte varianten voor de legenda in de samenvatting (waar ruimte krap is).
export const NIVEAU_KORT: Record<SubsidieNiveau, string> = {
  rijk: "Landelijk",
  provincie: "Provinciaal",
  gemeente: "Gemeentelijk",
  overig: "Leningen/overig",
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

export function groepeerPerNiveau(regelingen: SubsidieRegeling[]) {
  return NIVEAU_VOLGORDE.map((niveau) => ({
    niveau,
    regelingen: regelingen.filter((r) => r.niveau === niveau),
  })).filter((groep) => groep.regelingen.length > 0);
}

export type Samenvatting = {
  totaal: number;
  subsidies: number;
  leningen: number;
  /** Aantal per niveau, in vaste volgorde, lege niveaus weggelaten. */
  perNiveau: { niveau: SubsidieNiveau; aantal: number }[];
};

// Kern voor het samenvattingsblok bovenaan het resultaat (inverted pyramid):
// het aantal, de subsidie/lening-verdeling en de spreiding over de niveaus.
// Bewust géén opgeteld totaalbedrag: regelingen zijn niet zomaar stapelbaar en
// een verzonnen maximumbedrag ondermijnt het vertrouwen.
export function maakSamenvatting(regelingen: SubsidieRegeling[]): Samenvatting {
  return {
    totaal: regelingen.length,
    subsidies: regelingen.filter((r) => r.type === "subsidie").length,
    leningen: regelingen.filter((r) => r.type === "lening").length,
    perNiveau: NIVEAU_VOLGORDE.map((niveau) => ({
      niveau,
      aantal: regelingen.filter((r) => r.niveau === niveau).length,
    })).filter((g) => g.aantal > 0),
  };
}
