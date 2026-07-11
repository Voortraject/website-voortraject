// Datamodel van de subsidiecheck. Bewust bron-onafhankelijk: de UI bouwt
// tegen deze types, de provider (mock, Milieu Centraal, …) vertaalt zijn
// eigen formaat hiernaartoe. Zie provider.ts voor de interface.

export type SubsidieNiveau = "rijk" | "provincie" | "gemeente" | "overig";

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

export const NIVEAU_LABELS: Record<SubsidieNiveau, string> = {
  rijk: "Rijksoverheid",
  provincie: "Provincie",
  gemeente: "Gemeente",
  overig: "Overige regelingen",
};

export type SubsidieRegeling = {
  id: string;
  titel: string;
  niveau: SubsidieNiveau;
  /** Wie de regeling uitvoert, bijv. "Rijksoverheid (RVO)" of "Gemeente Emmen". */
  aanbieder: string;
  /** Eén à twee rustige zinnen — geen marketingtaal. */
  omschrijving: string;
  /** Indicatie zoals "tot € 10.000" of "0%-lening". Weglaten als onbekend. */
  bedragIndicatie?: string;
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
