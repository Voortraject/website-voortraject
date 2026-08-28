// ⚠️ KOPIE — bron van waarheid is src/lib/subsidies/types.ts.
// Deze kopie bestaat omdat de edge function (Deno) geïsoleerd bundelt en geen
// import uit de Vite-app kan gebruiken. Bij wijzigingen in de types: dit bestand
// gelijk houden. Het is een verbatim kopie (Deno-veilig: pure TS, geen React /
// import.meta), zodat syncen simpel blijft.

export type SubsidieNiveau = "rijk" | "provincie" | "gemeente" | "overig";

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

export type SubsidieRegeling = {
  id: string;
  titel: string;
  niveau: SubsidieNiveau;
  type: SubsidieType;
  aanbieder: string;
  omschrijving: string;
  bedragIndicatie?: string;
  bedragToelichting?: string;
  letOp?: string;
  looptAfOp?: string;
  beperktTot?: string;
  voorWie?: string;
  belangrijksteVoorwaarde?: string;
  bronUrl: string;
  maatregelen: Maatregel[];
  doelgroepen: Bewonertype[];
};

// --- Bron-koppeling: Energiesubsidiewijzer (verbatim uit src/lib/subsidies/types.ts) ---
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
  asbest: "1613",
};
