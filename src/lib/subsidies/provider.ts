import type { SubsidieCheckInput, SubsidieRegeling } from "./types";

// De bron achter de subsidiecheck is bewust verwisselbaar: de UI kent alleen
// deze interface. mockProvider levert nu realistische data; zodra de
// documentatie van de Milieu Centraal / Energiesubsidiewijzer-API binnen is,
// komt daar een echte provider naast en wisselen we in index.ts om.
export interface SubsidieProvider {
  /** Korte naam voor bronvermelding in de UI, bijv. "Voorbeeldgegevens". */
  naam: string;
  check(input: SubsidieCheckInput): Promise<SubsidieRegeling[]>;
}
