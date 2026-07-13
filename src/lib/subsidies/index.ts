import { energiesubsidiewijzerProvider } from "./energiesubsidiewijzerProvider";
import { mockSubsidieProvider } from "./mockProvider";
import type { SubsidieProvider } from "./provider";

export * from "./types";
export type { SubsidieProvider } from "./provider";

// Dé plek om van bron te wisselen. Nu actief: de live Energiesubsidiewijzer
// (via de Vite-dev-proxy; in prod via een edge function). Valt intern terug op
// mockSubsidieProvider als de bron faalt. Zet terug op mockSubsidieProvider om
// puur op voorbeelddata te draaien.
export const subsidieProvider: SubsidieProvider = energiesubsidiewijzerProvider;
