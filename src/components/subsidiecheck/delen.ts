import { SITE_URL } from "@/lib/site";

// Delen van de check zelf, niet van dít overzicht.
//
// Er stond eerder één knop: "Kopieer link naar dit overzicht". Die kopieerde
// `window.location.href`, en daar staan postcode en huisnummer in. Wie dat naar
// de buurman stuurde, deelde dus zijn eigen adres én zag de buurman het
// overzicht van een ander huis — precies niet wat hij wilde. De deelbare link is
// nu de kale tool, zodat de ontvanger zijn éígen adres invult.
//
// De link naar het persoonlijke overzicht bestaat nog wel: die staat in de mail
// ("bekijk of deel je volledige overzicht online"), waar hij hoort, want daar is
// de ontvanger de bezoeker zelf.

/**
 * Waar de gedeelde link vandaan komt: gekopieerd van het resultaat, of
 * aangeklikt in de overzichtsmail. Alleen voor de utm-tags — aan de ontvangkant
 * is dat het enige verschil dat we kunnen zien.
 */
export type DeelKanaal = "link" | "mail";

/**
 * De deelbare link naar de check, met utm-tags zodat binnenkomend verkeer uit
 * een gedeelde link in GA4 gewoon onder Bron/Medium terugkomt.
 *
 * Zonder die tags is delen via WhatsApp onzichtbaar ("dark social"): de app
 * stuurt geen referrer mee, dus zo'n bezoeker telt als direct verkeer en het
 * effect van delen is niet te meten. Kort gehouden — de ontvanger ziet deze URL
 * in zijn chat staan, en een regel vol parameters leest als spam.
 */
export const deelUrl = (kanaal: DeelKanaal): string =>
  `${SITE_URL}/subsidiecheck?utm_source=deel&utm_medium=${kanaal}`;
