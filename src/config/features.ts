// Feature-flags voor de site. Eén plek om functionaliteit aan/uit te zetten.
//
// Let op: dit bestand bewust zónder React-/Vite-imports houden, zodat ook het
// sitemap-script (scripts/generate-sitemap.ts, draait via `bunx tsx`) het kan
// importeren.

/**
 * Staat de subsidiecheck echt live?
 *
 * - `false` → /subsidiecheck toont een "binnenkort beschikbaar"-melding; de
 *   postcodecheck wordt niet eens gerenderd (dus ook niet te gebruiken via een
 *   directe link of oude Google-hit). De pagina staat dan op `noindex` en valt
 *   uit de sitemap.
 * - `true` → de echte check en de sitemap-vermelding komen in één keer terug.
 *
 * Zet deze op `true` bij de echte launch. Verder is geen enkele wijziging nodig.
 */
export const SUBSIDIECHECK_LIVE = false;
