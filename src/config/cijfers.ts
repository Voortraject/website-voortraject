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
 * Het feitje zoals de bezoeker het op stap 1 leest.
 *
 * "Gemiddeld" is hier een gemeten gemiddelde over adressen, geen schatting, en
 * geldt voor woningeigenaren: dat is de groep waarop gemeten is en de standaard
 * op stap 1. Voor huurders, VvE's en verhuurders tonen we de regel daarom niet.
 *
 * De zin sluit bewust aan op de subregel erboven ("… dan zoeken we alle
 * regelingen"): "er" zijn die regelingen. Zo staat het woord niet twee regels
 * onder elkaar en leest het als één alinea in plaats van twee losse mededelingen.
 * Verhuist deze zin ooit naar een plek zónder die subregel, schrijf het
 * onderwerp dan weer voluit.
 */
export const GEMIDDELDE_REGELINGEN_ZIN = `Gemiddeld vinden we er ${GEMIDDELD_AANTAL_REGELINGEN} per adres.`;

/* ------------------------------------------------------------------ *
 * "Voortraject in cijfers": de drie getallen in de cijferband
 * (src/components/sections/Cijfers.tsx, staat op de homepage en op
 * /over-ons).
 *
 * Alle drie geverifieerd op 2026-09-08 in de CRM-database. Deze getallen
 * groeien; bij een update pas je hier de waarde en de datum in het
 * commentaar aan, en verder niets. De eenheid en het onderschrift staan
 * er expres bij, zodat getal en tekst nooit uit elkaar kunnen lopen.
 *
 * De waarden zijn getallen en geen tekst, omdat de band ernaartoe telt
 * zodra hij in beeld komt. De opmaak (duizendtallen, decimalen) gebeurt
 * in het component, in nl-NL.
 * ------------------------------------------------------------------ */

/**
 * Vierkante meters isolatie in de offerteregels: 9.958 m² (dak 2.596,
 * gevel 3.698, vloer/zolder 2.499, glas 1.042). Geverifieerd 2026-09-08.
 * Getoond als "10.000+": de eerstvolgende ronde grens, waarbij de "+" de
 * groei sinds de meting dekt. Zakt het cijfer ooit, rond dan naar beneden
 * af.
 *
 * Het onderschrift zegt Noord-Nederland en niet Groningen en Drenthe.
 * Gemeten is er in Groningen en Drenthe, en dat ligt allebei in
 * Noord-Nederland, dus de claim blijft waar; de bredere formulering sluit
 * bezoekers uit Friesland niet uit.
 */
export const CIJFER_ISOLATIE = {
  waarde: 10000,
  achtervoegsel: "+",
  eenheid: "m²",
  onderschrift: "isolatie geregeld voor woningen in Noord-Nederland",
} as const;

/**
 * Wat de isolatie die wij regelen een woning per jaar aan gas scheelt,
 * gemiddeld en vóór subsidie.
 *
 * Dit cijfer is afgeleid en niet geteld, anders dan de m² hierboven. De
 * afleiding, zodat iedereen hem kan narekenen:
 *
 *  - De 9.958 m² hierboven, verdeeld over dak (26%), gevel (37%),
 *    vloer en zolder (25%) en glas (10%).
 *  - De besparing per maatregel uit src/data/isolatie.ts, de cijfers van
 *    Milieu Centraal, bij hun gasprijs van € 1,37 per m³ voor 2026 tot 2040.
 *    Gemiddeld over de vier woningtypen: dak € 550, spouw € 548,
 *    gevel € 733, vloer € 215, glas € 90 vanaf dubbel en € 350 vanaf enkel.
 *  - Gewogen met die verdeling levert één maatregel gemiddeld € 455 per jaar
 *    op. Een adres waar meer dan één maatregel is gedaan ligt hoger: bij
 *    gemiddeld 1,3 maatregelen per woning kom je op ongeveer € 590.
 *
 * € 500 ligt tussen die twee in, en is op 2026-09-09 door Voortraject zelf
 * bevestigd als het bedrag dat bij de praktijk hoort: een gemiddeld adres
 * neemt meer dan één maatregel af. De som hierboven is dus de controle op
 * dat getal, niet de enige onderbouwing. Wie het ooit herziet: € 455 is wat
 * de som geeft bij precies één maatregel per woning, en daarmee de
 * ondergrens van wat hier verdedigbaar is.
 *
 * Bewust géén subsidie in dit bedrag: dit is de lagere energierekening, niet
 * wat een regeling bijdraagt. En bewust geen "+": een gemiddelde met een
 * plusteken erachter is geen gemiddelde meer.
 */
export const CIJFER_BESPARING = {
  voorvoegsel: "€",
  waarde: 500,
  onderschrift: "gemiddeld per jaar lagere energierekening per woning",
} as const;

/**
 * Gemiddelde Google-beoordeling. Dit cijfer komt live uit
 * `google_place_stats` in het CRM-project (dagelijkse sync, zie
 * useGoogleReviews); de waarde hieronder is alleen de terugval als die
 * query niet lukt. Stond op 4,9 bij 26 beoordelingen op 2026-09-08.
 *
 * Het aantal beoordelingen tonen we hier bewust NIET: 26 maakt een 4,9
 * zwakker in plaats van sterker. Boven de 50 willen we het er juist wél
 * bij; dan is dit onderschrift het enige dat hoeft te veranderen, naar
 * bijvoorbeeld "gemiddelde beoordeling over 50+ beoordelingen op Google".
 */
export const CIJFER_GOOGLE = {
  terugval: 4.9,
  onderschrift: "gemiddelde beoordeling op Google",
} as const;
