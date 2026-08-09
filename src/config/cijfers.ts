// Harde cijfers die we op de site tonen. Eén plek, want dit zijn feitelijke
// uitspraken op een publieke marketingsite: ze moeten waar zijn, controleerbaar
// zijn en waar blijven. Zelfde gedachte als src/config/beloftes.ts.
//
// Zet hier niets neer wat je niet kunt nameten.

/**
 * Gemiddeld aantal regelingen dat de check op één adres vindt, voor een
 * woningeigenaar die op alle maatregelen zoekt. Dat is precies de
 * standaardinstelling van stap 1.
 *
 * Gemeten op 2026-08-09 met `node scripts/meet-subsidieaantal.mjs`, tegen
 * dezelfde productie-edge-function als de site zelf: 51 bestaande adressen,
 * verspreid over heel Nederland, met het zwaartepunt in het werkgebied (één
 * plaats per gemeente in Groningen en Drenthe). Elk adres is bij PDOK opgehaald,
 * dus geen verzonnen postcodes.
 *
 *   heel Nederland (51 adressen)
 *     regelingen  gemiddeld  9,12   min 5   max 13
 *     waarvan subsidies      4,41   min 2   max  7
 *
 *   werkgebied Groningen en Drenthe (26 adressen)
 *     regelingen  gemiddeld 10,27   min 8   max 13
 *     waarvan subsidies      5,38   min 4   max  7
 *
 * We tonen 9 en niet 9,12: naar beneden afgerond, zodat het cijfer eerder te
 * laag dan te hoog is.
 *
 * Twee keuzes die bewust zo zijn:
 *
 *  - Het is het LANDELIJKE gemiddelde, niet dat van het werkgebied (dat ligt
 *    hoger). De regel op de site noemt geen regio, want iemand uit Friesland of
 *    Overijssel hoort zich hier niet buitengesloten te voelen. Dan moet het
 *    getal ook voor die bezoeker kloppen, en dus telt het laagste gemiddelde.
 *  - Het gaat om "regelingen" en niet om "subsidies". Onder die 9 zitten ook
 *    leningen, en een lening is geen subsidie (zie SubsidieType in
 *    lib/subsidies/types). "Regelingen" is precies het woord dat de
 *    resultaatpagina zelf gebruikt als ze de lijst telt, dus de bezoeker ziet
 *    straks hetzelfde begrip terug.
 *
 * Verandert het aanbod, dan draai je het script opnieuw en pas je dit getal aan.
 * `subsidiecheckEersteStap.test.tsx` bewaakt dat het getal en de zin die we
 * tonen niet uit elkaar lopen.
 */
export const GEMIDDELD_AANTAL_REGELINGEN = 9;

/**
 * Het feitje zoals de bezoeker het op stap 1 leest, gesplitst zodat het getal
 * vet kan staan zonder dat de zin op twee plekken leeft.
 *
 * "Gemiddeld" is hier een gemeten gemiddelde over adressen, geen schatting, en
 * geldt voor woningeigenaren: dat is de groep waarop gemeten is en de standaard
 * op stap 1. Voor huurders, VvE's en verhuurders tonen we de regel daarom niet.
 */
export const GEMIDDELDE_REGELINGEN_KOP = `Gemiddeld ${GEMIDDELD_AANTAL_REGELINGEN} regelingen`;
export const GEMIDDELDE_REGELINGEN_STAART = "per adres";
export const GEMIDDELDE_REGELINGEN_ZIN = `${GEMIDDELDE_REGELINGEN_KOP} ${GEMIDDELDE_REGELINGEN_STAART}`;
