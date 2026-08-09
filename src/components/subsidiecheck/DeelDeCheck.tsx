import { useEffect, useRef, useState } from "react";
import { Check, Link2 } from "lucide-react";

import { pushGtmEvent } from "@/lib/gtm";
import type { Bewonertype } from "@/lib/subsidies";

import { deelUrl } from "./delen";

interface DeelDeCheckProps {
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
// van ons gekregen heeft. Dat is het moment waarop mensen wél iets terugdoen.
//
// Eén knop, bewust. Er stond hier ook een "Deel via WhatsApp"; die is eruit op
// verzoek van de opdrachtgever. De gekopieerde link werkt in élk kanaal —
// WhatsApp, mail, een appgroep — en de pagina heeft al twee WhatsApp-knoppen
// (het adviesblok erboven en de balk onderin op mobiel).
export const DeelDeCheck = ({ bewonertype }: DeelDeCheckProps) => {
  const [gekopieerd, setGekopieerd] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => () => clearTimeout(timer.current), []);

  const kopieer = async () => {
    try {
      await navigator.clipboard.writeText(deelUrl("link"));
      setGekopieerd(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setGekopieerd(false), 2500);
      pushGtmEvent("subsidiecheck_deel", { bewonertype });
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
      {/* Tekst en knop naast elkaar: onder elkaar werden dit vier regels op rij
          voor een terzijde, en dan weegt het zwaarder dan het adviesblok erboven.
          Op mobiel klapt het alsnog netjes onder elkaar. */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <div className="min-w-0">
          {/* Geen "moet doen": niemand moet iets. Dit is een tip die de ander
              geld kan schelen, dus wie hem doorgeeft bewijst een dienst — dat is
              ook precies de reden dat mensen zoiets doorsturen. */}
          <h3 className="font-display text-[19px] font-semibold text-primary md:text-[21px]">
            Ken je buren of familie die hier wat aan hebben?
          </h3>
          {/* De link zichtbaar maken laat zien dat er géén adres in zit. */}
          <p className="mt-1.5 text-[13.5px] text-muted-foreground">
            Je deelt <span className="font-medium text-foreground">voortraject.nl/subsidiecheck</span>, niet jouw
            gegevens.
          </p>
        </div>

        <button
          type="button"
          onClick={kopieer}
          aria-live="polite"
          className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-full border border-border bg-card px-5 py-3 text-[15px] font-semibold text-primary transition-colors hover:border-primary/40 min-h-[48px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:self-auto"
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
    </section>
  );
};
