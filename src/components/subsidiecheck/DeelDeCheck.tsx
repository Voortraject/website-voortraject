import { useEffect, useRef, useState } from "react";
import { Check, Link2, MessageCircle } from "lucide-react";

import { pushGtmEvent } from "@/lib/gtm";
import type { Bewonertype } from "@/lib/subsidies";

import { deelUrl, deelViaWhatsappUrl } from "./delen";

interface DeelDeCheckProps {
  /** Wat de bezoeker zelf gevonden heeft; gaat mee in het WhatsApp-bericht. */
  aantalRegelingen: number;
  /** Alleen voor het event; nooit persoonsgegevens naar GTM. */
  bewonertype: Bewonertype;
}

// Het slot van het resultaat: geef de check door.
//
// Hier stond eerst een tekstknopje ("Kopieer link naar dit overzicht") naast de
// juridische disclaimer, onderaan de lijst. Dat is drie keer verkeerd: het viel
// niet op, het kopieerde de link mét adres, en het vroeg nergens om iets. Een
// deelknop die niets vraagt wordt niet gebruikt.
//
// Nu is het een blok met een vraag erboven, op de plek waar de bezoeker net iets
// van ons gekregen heeft. Dat is het moment waarop mensen wél iets terugdoen —
// en het is ook precies wat een bewoner uit zichzelf al doet in een straat waar
// iedereen dezelfde bouwjaren en dezelfde regelingen heeft.
//
// Twee routes, in de volgorde van hoe er in Nederland gedeeld wordt: WhatsApp
// eerst (de bezoeker kiest zelf een contact, wij zien geen nummers), kopiëren
// als terugval voor de mail, Signal of een appgroep.
export const DeelDeCheck = ({ aantalRegelingen, bewonertype }: DeelDeCheckProps) => {
  const [gekopieerd, setGekopieerd] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => () => clearTimeout(timer.current), []);

  const kopieer = async () => {
    try {
      await navigator.clipboard.writeText(deelUrl("link"));
      setGekopieerd(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setGekopieerd(false), 2500);
      pushGtmEvent("subsidiecheck_deel", { kanaal: "link", bewonertype });
    } catch {
      /* clipboard geweigerd → knop doet stil niets */
    }
  };

  // Bewust géén gevuld kaartje zoals het adviesblok erboven. Twee identieke
  // vlakken onder elkaar lezen als twee even harde oproepen, en dan wint geen van
  // beide. Het adviesblok is de belangrijkste stap; dit is een gunst die we
  // vragen. Een scheidingslijn markeert genoeg dat er iets nieuws begint.
  return (
    <section aria-label="Deel de subsidiecheck" className="mt-10 border-t border-border pt-8">
      <h3 className="font-display text-[19px] font-semibold text-primary md:text-[21px]">
        Ken je iemand die dit ook moet doen?
      </h3>
      {/* Waarom de buren: woningen in dezelfde straat zijn meestal uit hetzelfde
          jaar, dus dezelfde regelingen. Dat maakt het doorgeven concreet in
          plaats van een algemeen "deel deze pagina". */}
      <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-foreground/80">
        Je buren, je ouders, iemand uit je straat: huizen uit dezelfde tijd komen vaak voor dezelfde regelingen in
        aanmerking. Ze doen de check gratis voor hun eigen adres.
      </p>

      <div className="mt-5 flex flex-col gap-2.5 sm:flex-row">
        <a
          href={deelViaWhatsappUrl(aantalRegelingen)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => pushGtmEvent("subsidiecheck_deel", { kanaal: "whatsapp", bewonertype })}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-7 py-3 text-[15px] font-semibold text-primary transition-colors hover:bg-accent-hover min-h-[48px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <MessageCircle size={17} strokeWidth={2} aria-hidden="true" />
          Deel via WhatsApp
        </a>
        <button
          type="button"
          onClick={kopieer}
          aria-live="polite"
          className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-card px-5 py-3 text-[15px] font-semibold text-primary transition-colors hover:border-primary/40 min-h-[48px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {gekopieerd ? (
            <>
              <Check size={17} strokeWidth={2.5} className="text-accent" aria-hidden="true" />
              Link gekopieerd
            </>
          ) : (
            <>
              <Link2 size={17} strokeWidth={2} aria-hidden="true" />
              Kopieer de link
            </>
          )}
        </button>
      </div>

      {/* De link zichtbaar maken doet twee dingen: het laat zien dat er géén
          adres in zit, en het is kort genoeg om te onthouden of voor te lezen. */}
      <p className="mt-3 text-[13px] text-muted-foreground">
        Je deelt <span className="font-medium text-foreground">voortraject.nl/subsidiecheck</span>, niet jouw gegevens.
      </p>
    </section>
  );
};
