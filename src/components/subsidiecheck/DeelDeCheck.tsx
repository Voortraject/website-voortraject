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
    // Geen scheidslijn erboven: het blok staat op zichzelf, met lucht eromheen.
    <section aria-label="Deel de subsidiecheck" data-veer className="mt-12 pb-4">
      {/* Vraag en knop naast elkaar, dus twee regels in plaats van vier. Onder
          elkaar woog dit terzijde zwaarder dan het adviesblok erboven, en dat is
          de stap die er zakelijk toe doet. Op mobiel klapt het netjes onder
          elkaar. */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        {/* Geen "moet doen": niemand moet iets. Dit is een tip die de ander geld
            kan schelen, dus wie hem doorgeeft bewijst een dienst, en dat is ook
            precies de reden dat mensen zoiets doorsturen. */}
        {/* Een extra verzoek staat onderaan, onder een kort vetgedrukt kopje,
            met één zin waarom het de ander iets oplevert. */}
        <div className="min-w-0">
          <h3 className="text-[17px] font-extrabold text-primary">Ken je buren of familie die hier wat aan hebben?</h3>
          <p className="mt-0.5 text-[15px] text-[hsl(var(--rs-tekst-zacht))]">
            Huizen uit dezelfde tijd komen vaak voor dezelfde subsidie in aanmerking.
          </p>
        </div>

        <button
          type="button"
          onClick={kopieer}
          aria-live="polite"
          className="rs-knop rs-knop-licht shrink-0 self-start px-5 py-3 text-[15px] sm:self-auto"
        >
          {gekopieerd ? (
            <>
              <Check size={17} strokeWidth={2.5} className="text-[hsl(var(--subsidie))]" aria-hidden="true" />
              Link gekopieerd
            </>
          ) : (
            <>
              <Link2 size={17} strokeWidth={2} aria-hidden="true" />
              Deel de tool
            </>
          )}
        </button>
      </div>
    </section>
  );
};
