import { energiesubsidiewijzerProvider } from "./energiesubsidiewijzerProvider";
import { mockSubsidieProvider } from "./mockProvider";
import type { SubsidieProvider } from "./provider";

export * from "./types";
export type { SubsidieProvider } from "./provider";

// Dé plek om van bron te wisselen. Nu actief: de live Energiesubsidiewijzer
// (via de Vite-dev-proxy; in prod via een edge function). Faalt de bron, dan
// retry't react-query en toont de UI de eerlijke foutmelding — er is bewust
// GEEN stille mock-terugval (verzonnen regelingen tonen én mailen is erger dan
// een nette fout). Zet om op voorbeelddata te draaien deze export op
// mockSubsidieProvider; de UI toont dan vanzelf de voorbeeldgegevens-banner.
export const subsidieProvider: SubsidieProvider = energiesubsidiewijzerProvider;
