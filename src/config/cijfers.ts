// Harde cijfers die we op de site tonen. Eén plek, want dit zijn feitelijke
// uitspraken op een publieke marketingsite: ze moeten waar zijn, controleerbaar
// zijn en waar blijven. Zelfde gedachte als src/config/beloftes.ts.
//
// Zet hier niets neer wat je niet kunt nameten.

/**
 * Gemiddeld aantal échte subsidies (dus zonder leningen) dat de check vindt op
 * een adres in ons werkgebied, voor een woningeigenaar die op alle maatregelen
 * zoekt. Dat is precies de standaardinstelling van stap 1.
 *
 * Gemeten op 2026-08-09 met `bun run scripts/meet-subsidieaantal.mjs`, tegen
 * dezelfde productie-edge-function als de site zelf: één bestaand adres per
 * gemeente in Groningen en Drenthe, alle 22 gemeenten, 27 adressen in totaal.
 * Uitkomst:
 *
 *   subsidies   gemiddeld 5,41   min 4    max 7
 *   leningen    gemiddeld 4,85   min 4    max 6
 *   totaal      gemiddeld 10,26  min 8    max 13
 *
 * We tonen 5 en niet 5,4: naar beneden afgerond, zodat het cijfer eerder te laag
 * dan te hoog is. Bewust ook níet het totaal van 10, want daar zitten leningen
 * bij en een lening is geen subsidie (zie SubsidieType in lib/subsidies/types).
 *
 * Loopt het aanbod uiteen, dan draai je het script opnieuw en pas je dit getal
 * aan. `subsidiecheckCijfer.test.ts` bewaakt dat het getal en de zin die we
 * tonen niet uit elkaar lopen.
 */
export const GEMIDDELD_AANTAL_SUBSIDIES = 5;

/** Het werkgebied waarover dat gemiddelde gemeten is. */
export const CIJFER_WERKGEBIED = "Groningen en Drenthe";

/**
 * De zin zoals de bezoeker hem op stap 1 leest.
 *
 * "Gemiddeld" is hier een gemeten gemiddelde over adressen, geen schatting, en
 * geldt voor woningeigenaren: dat is de groep waarop gemeten is en de standaard
 * op stap 1. Voor huurders, VvE's en verhuurders tonen we de regel daarom niet.
 */
export const GEMIDDELDE_SUBSIDIES_KOP = `Gemiddeld ${GEMIDDELD_AANTAL_SUBSIDIES} subsidies`;
export const GEMIDDELDE_SUBSIDIES_STAART = `per adres in ${CIJFER_WERKGEBIED}`;
export const GEMIDDELDE_SUBSIDIES_ZIN = `${GEMIDDELDE_SUBSIDIES_KOP} ${GEMIDDELDE_SUBSIDIES_STAART}`;
