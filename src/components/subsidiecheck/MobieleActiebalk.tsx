import { useEffect, useState, type RefObject } from "react";
import { Check, Loader2, Send } from "lucide-react";

import { WhatsAppLogo } from "@/components/WhatsAppLogo";
import { pushGtmEvent } from "@/lib/gtm";
import { whatsappUrl } from "@/lib/whatsapp";

import type { UitzoekStatus } from "./useUitzoek";
import { scrollNaarVraag } from "./vraagFocus";

interface MobieleActiebalkProps {
  /** Vooringevuld WhatsApp-bericht (bevat het adres van de bezoeker). */
  whatsappBericht: string;
  /** Voor het event-label; nooit persoonsgegevens naar GTM. */
  bewonertype: string;
  /**
   * De oker knop van de hoofdtegel. Gegeven? Dan is de balk dézelfde knop en
   * verschijnt hij pas als die knop uit beeld is. Zonder (het resultaat zonder
   * regelingen) blijft het de knop naar het vraagblok.
   */
  aanvraag?: { status: UitzoekStatus; start: () => void; knopZone: RefObject<HTMLElement> };
}

// Vaste actiebalk onderaan het resultaat, alleen op mobiel: het resultaat is
// lang en de volgende stap moet binnen duimbereik blijven.
//
// Zet `heeft-actiebalk` op <body> zodat de vaste WhatsApp-knop rechtsonder zich
// verbergt: deze balk biedt WhatsApp zelf al aan. Zie src/index.css.
//
// Geen achtergrond over de volle breedte (die sneed de kaarten af): alleen de
// knoppen zweven, met `pointer-events-none` op de balk zelf.
export const MobieleActiebalk = ({ whatsappBericht, bewonertype, aanvraag }: MobieleActiebalkProps) => {
  useEffect(() => {
    document.body.classList.add("heeft-actiebalk");
    return () => document.body.classList.remove("heeft-actiebalk");
  }, []);

  // Nooit twee keer dezelfde knop tegelijk in beeld: zolang de knopzone van de
  // hoofdtegel zichtbaar is, of nog onder de vouw staat, blijft de balk weg.
  const knopZone = aanvraag?.knopZone;
  const [weg, setWeg] = useState(!!aanvraag);
  useEffect(() => {
    const el = knopZone?.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setWeg(false);
      return;
    }
    const io = new IntersectionObserver(([e]) => {
      setWeg(e.isIntersecting || e.boundingClientRect.top > window.innerHeight);
    });
    io.observe(el);
    return () => io.disconnect();
  }, [knopZone]);

  const knopKlasse =
    "pointer-events-auto rs-knop flex-1 px-4 py-3 text-[14.5px] shadow-lg focus-visible:outline-none";

  return (
    <div
      className="rs-actiebalk pointer-events-none fixed inset-x-0 bottom-0 z-40 md:hidden"
      data-weg={weg}
      aria-hidden={weg || undefined}
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-center gap-2.5 px-4 py-3">
        {aanvraag ? (
          aanvraag.status === "binnen" ? (
            <p role="status" className={`${knopKlasse} rs-knop-licht gap-2`}>
              <Check size={17} strokeWidth={3} className="text-[hsl(var(--subsidie))]" aria-hidden="true" />
              Je aanvraag is binnen
            </p>
          ) : (
            <button
              type="button"
              onClick={aanvraag.start}
              disabled={aanvraag.status === "bezig"}
              tabIndex={weg ? -1 : undefined}
              className={`${knopKlasse} rs-knop-oker`}
            >
              {aanvraag.status === "bezig" && <Loader2 size={16} className="animate-spin" aria-hidden="true" />}
              Laat gratis uitzoeken wat ik krijg
            </button>
          )
        ) : (
          <button type="button" onClick={scrollNaarVraag} className={`${knopKlasse} rs-knop-oker`}>
            <Send size={16} strokeWidth={2} aria-hidden="true" />
            Stel je vraag
          </button>
        )}
        <a
          href={whatsappUrl(whatsappBericht)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Stel je vraag via WhatsApp"
          tabIndex={weg ? -1 : undefined}
          onClick={() => pushGtmEvent("subsidiecheck_whatsapp", { bewonertype, plek: "actiebalk" })}
          className="rs-knop rs-knop-licht pointer-events-auto h-12 w-12 shrink-0 p-0 shadow-lg"
        >
          {/* Deze balk vervangt op het resultaat de zwevende WhatsApp-knop, dus
              hoort hier hetzelfde logo te staan als daar. */}
          <WhatsAppLogo size={22} />
        </a>
      </div>
    </div>
  );
};
