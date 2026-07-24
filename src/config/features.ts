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

/**
 * Tussenoplossing: vraagt de bezoeker eerst zijn gegevens (naam, e-mail,
 * telefoon) als extra stap "Je gegevens" tussen "Jouw woning" en het resultaat.
 * Zo verzamelen we alvast leads terwijl de echte lancering (afscherming) nog
 * een paar weken weg is.
 *
 * - `true`  → flow is 3 stappen: Jouw woning → Je gegevens (poort) → Resultaat.
 *   Het "mail mij dit overzicht"-blok onderaan het resultaat vervalt (die
 *   gegevens zijn dan al binnen).
 * - `false` → de gewone 2-stappenflow (adres → resultaat), zonder poort.
 *
 * Zet deze op `false` bij de echte launch als de poort dan niet meer gewenst is.
 */
export const SUBSIDIECHECK_GEGEVENS_POORT = true;
