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
