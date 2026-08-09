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
export const SUBSIDIECHECK_LIVE = true;

// Hier stond SUBSIDIECHECK_GEGEVENS_POORT, waarmee de gegevensstap tussen "Jouw
// woning" en het resultaat uit kon. Die schakelaar is verwijderd. De poort is
// geen tussenoplossing meer maar hoe de check werkt, en zolang de vlag bestond
// kon één verkeerd gezette boolean het hele overzicht weggeven zonder dat er ook
// maar iemand iets had ingevuld. Wie hem terug wil, haalt hem uit de historie —
// dan hoort daar ook opnieuw een besluit bij.
