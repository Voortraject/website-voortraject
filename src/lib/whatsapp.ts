// Eén plek voor ons WhatsApp-nummer en de link ernaartoe. Gedeeld door de vaste
// knop rechtsonder (WhatsAppButton) en de contactroutes in de subsidiecheck, die
// een vooringevuld bericht meesturen.

/** +31 50 211 2689, zonder plus en zonder nul (wa.me-formaat). */
export const WHATSAPP_NUMMER = "31502112689";

/**
 * Link naar een WhatsApp-gesprek met ons. Met `bericht` staat die tekst al
 * klaar in het invoerveld: de bezoeker hoeft alleen nog te versturen of aan te
 * vullen. Dat scheelt de drempel van zelf moeten formuleren.
 */
export function whatsappUrl(bericht?: string): string {
  const basis = `https://wa.me/${WHATSAPP_NUMMER}`;
  const tekst = bericht?.trim();
  return tekst ? `${basis}?text=${encodeURIComponent(tekst)}` : basis;
}
