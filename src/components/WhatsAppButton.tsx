/**
 * Vaste WhatsApp-knop rechtsonder, zichtbaar op elke pagina.
 * Klik opent direct een WhatsApp-chat met ons nummer.
 *
 * Stijl: dezelfde frosted-glass "pill" als de header (bg-white/70 +
 * backdrop-blur-xl + zachte navy-schaduw), zodat hij aansluit op het
 * hamburgermenu en logo. Het WhatsApp-logo houdt zijn merk-groen (#25D366)
 * voor herkenbaarheid — dat is een merk-asset en staat daarom bewust los van
 * de huisstijl-tokens.
 *
 * Positie rechtsonder botst niet met de Axeptio cookie-widget (linksonder).
 *
 * Verbergt zichzelf zolang er een pagina-eigen actiebalk onderin staat (de
 * mobiele balk op het subsidiecheck-resultaat, die WhatsApp zelf al aanbiedt).
 * Zie `.heeft-actiebalk` in src/index.css.
 */
import { WhatsAppLogo } from "@/components/WhatsAppLogo";
import { pushGtmEvent } from "@/lib/gtm";
import { whatsappUrl } from "@/lib/whatsapp";

const WHATSAPP_URL = whatsappUrl();

// Zelfde zachte navy-schaduw als de header-pills (zie Header.tsx).
const pillShadow = {
  boxShadow:
    "0 8px 32px -8px hsl(var(--primary) / 0.22), 0 2px 8px -2px hsl(var(--primary) / 0.14)",
};

export const WhatsAppButton = () => {
  // plek onderscheidt deze sitebrede knop van de WhatsApp-knoppen ín de
  // subsidiecheck, die hun eigen subsidiecheck_whatsapp pushen.
  const meldKlik = () => pushGtmEvent("whatsapp_klik", { plek: "zwevend" });

  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      onClick={meldKlik}
      aria-label="Stuur ons een WhatsApp-bericht"
      title="Stuur ons een WhatsApp-bericht"
      className="vt-whatsapp-zwevend fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-white/70 backdrop-blur-xl transition-all duration-200 hover:bg-white/80 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:bottom-6 sm:right-6"
      style={pillShadow}
    >
      <WhatsAppLogo size={30} />
    </a>
  );
};

export default WhatsAppButton;
