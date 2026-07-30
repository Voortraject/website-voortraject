import { energiesubsidiewijzerProvider } from "./energiesubsidiewijzerProvider";
import type { SubsidieProvider } from "./provider";

export * from "./types";
export type { SubsidieProvider } from "./provider";

// Dé plek om van bron te wisselen. Nu actief: de live Energiesubsidiewijzer
// (via een edge function; zonder `VITE_SUBSIDIECHECK_URL` via de Vite-dev-proxy).
// Bewust GEEN terugval op voorbeelddata bij een bronfout: de fout gaat door naar
// react-query, dat retry't en anders de eerlijke foutstaat toont. Wie puur op
// voorbeelddata wil draaien, zet hier tijdelijk `mockSubsidieProvider` neer
// (importeren uit "./mockProvider").
export const subsidieProvider: SubsidieProvider = energiesubsidiewijzerProvider;
