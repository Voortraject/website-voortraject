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

/** Kanaal waarlangs gedeeld wordt; komt terug in de meting en in de utm-tags. */
export type DeelKanaal = "whatsapp" | "link" | "mail";

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

/**
 * Het bericht dat al klaarstaat in WhatsApp. De bezoeker hoeft alleen nog een
 * ontvanger te kiezen.
 *
 * Het aantal is dat van de deler zelf en dus waar; het is ook precies wat de
 * boodschap concreet maakt ("10 regelingen" zegt meer dan "handige tool").
 * Bewust in de ik-vorm: dit is een bericht van hem aan zijn buurman, geen
 * advertentie van ons.
 */
export const deelBericht = (aantalRegelingen: number): string => {
  const aantal = `${aantalRegelingen} ${aantalRegelingen === 1 ? "regeling" : "regelingen"}`;
  return `Ik heb net gecheckt welke subsidies er voor mijn huis zijn: ${aantal}. Doe 'm ook voor je eigen adres, het duurt 2 minuten en het is gratis: ${deelUrl("whatsapp")}`;
};

/** WhatsApp zonder nummer: opent de contactkiezer i.p.v. een gesprek met ons. */
export const deelViaWhatsappUrl = (aantalRegelingen: number): string =>
  `https://wa.me/?text=${encodeURIComponent(deelBericht(aantalRegelingen))}`;
