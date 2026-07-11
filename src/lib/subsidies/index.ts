import { mockSubsidieProvider } from "./mockProvider";
import type { SubsidieProvider } from "./provider";

export * from "./types";
export type { SubsidieProvider } from "./provider";

// Dé plek om van bron te wisselen: zodra de Milieu Centraal-provider er is,
// vervangt die hier de mock — de rest van de app merkt daar niets van.
export const subsidieProvider: SubsidieProvider = mockSubsidieProvider;
