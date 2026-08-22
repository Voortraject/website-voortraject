import { useEffect } from "react";
import { Send } from "lucide-react";

import { WhatsAppLogo } from "@/components/WhatsAppLogo";
import { pushGtmEvent } from "@/lib/gtm";
import { whatsappUrl } from "@/lib/whatsapp";

import { scrollNaarVraag } from "./vraagFocus";

interface MobieleActiebalkProps {
  /** Vooringevuld WhatsApp-bericht (bevat het adres van de bezoeker). */
  whatsappBericht: string;
  /** Voor het event-label; nooit persoonsgegevens naar GTM. */
  bewonertype: string;
}

// Vaste actiebalk onderaan het resultaat, alleen op mobiel. Het resultaat is lang
// (samenvatting, traject, bronvermelding, kaarten per niveau) en de contactactie
// stond daardoor ver onder de vouw. Zo is die altijd binnen duimbereik.
//
// Zet `heeft-actiebalk` op <body> zodat de vaste WhatsApp-knop rechtsonder zich
// verbergt: die balk biedt WhatsApp zelf al aan. Zie src/index.css.
//
// De balk zelf heeft geen achtergrond: alleen de twee knoppen zweven boven het
// resultaat. Een wit vlak over de volle breedte sneed de kaarten eronder af.
// Daarom `pointer-events-none` op de balk en `pointer-events-auto` op de knoppen,
// anders vangt de onzichtbare strook taps op die voor de inhoud bedoeld zijn.
export const MobieleActiebalk = ({ whatsappBericht, bewonertype }: MobieleActiebalkProps) => {
  useEffect(() => {
    document.body.classList.add("heeft-actiebalk");
    return () => document.body.classList.remove("heeft-actiebalk");
  }, []);

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-0 z-40 md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-center gap-2.5 px-4 py-3">
        <button
          type="button"
          onClick={scrollNaarVraag}
          className="pointer-events-auto inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-accent shadow-lg px-5 py-3 text-[15px] font-semibold text-primary transition-colors hover:bg-accent-hover min-h-[48px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <Send size={16} strokeWidth={2} aria-hidden="true" />
          Stel je vraag
        </button>
        <a
          href={whatsappUrl(whatsappBericht)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Stel je vraag via WhatsApp"
          onClick={() => pushGtmEvent("subsidiecheck_whatsapp", { bewonertype, plek: "actiebalk" })}
          className="pointer-events-auto inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-border bg-card shadow-lg text-primary transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {/* Deze balk vervangt op het resultaat de zwevende WhatsApp-knop, dus
              hoort hier hetzelfde logo te staan als daar. */}
          <WhatsAppLogo size={22} />
        </a>
      </div>
    </div>
  );
};
