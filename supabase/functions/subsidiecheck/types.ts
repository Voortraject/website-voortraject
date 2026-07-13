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

export type SubsidieRegeling = {
  id: string;
  titel: string;
  niveau: SubsidieNiveau;
  type: SubsidieType;
  aanbieder: string;
  omschrijving: string;
  bedragIndicatie?: string;
  voorWie?: string;
  belangrijksteVoorwaarde?: string;
  bronUrl: string;
  maatregelen: Maatregel[];
  doelgroepen: Bewonertype[];
};
