import { ArrowRight } from "lucide-react";

import { BRONNEN, SIGNALEN } from "@/data/onderhoud";
import { Accent, SectieKop } from "@/components/maatregel/primitieven";

/**
 * Waar je aan merkt dat er iets mis is, voordat het duur wordt.
 *
 * Allemaal signalen die een bewoner zelf opmerkt zonder gereedschap: een
 * geluid, een geur, een getal dat zakt. Dat is bewust; een lijst met dingen die
 * alleen een monteur ziet, helpt niemand die deze pagina leest.
 */

export const Storingssignalen = () => (
  <>
    <div className="text-center">
      <SectieKop center>
        <Accent tekst="Waar je het aan [[merkt]]" />
      </SectieKop>
      <p className="vd-lead mx-auto mt-3 max-w-[660px]">
        Installaties gaan zelden ineens stuk. Ze geven eerst een signaal af, en dat is bijna altijd
        iets wat je zelf kunt horen, ruiken of aflezen.
      </p>
    </div>

    {/* Eén tegel met de signalen als zebra-rijen, zonder lijnen ertussen. */}
    <div className="hs-tegel mt-7 p-2 md:mt-10 md:p-3" data-veer>
      <div className="vd-zebra grid gap-1">
        {SIGNALEN.map((rij) => (
          <div
            key={rij.signaal}
            className="grid grid-cols-1 gap-1.5 px-3 py-3.5 md:grid-cols-[1fr_1fr] md:items-baseline md:gap-8 md:px-5 md:py-4"
          >
            <span className="text-[16px] font-bold leading-[1.45] text-primary">{rij.signaal}</span>
            <span>
              <span className="vd-tekst block">{rij.betekent}</span>
              <span className="mt-1.5 flex items-baseline gap-2">
                <ArrowRight
                  size={14}
                  strokeWidth={2.4}
                  className="shrink-0 translate-y-[2px] text-[hsl(var(--niveau-gemeente))]"
                  aria-hidden="true"
                />
                <span className="text-[15px] font-semibold leading-relaxed text-primary">{rij.doen}</span>
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>

    <p className="vd-tekst mb-0 mt-4 text-[13.5px] md:mt-5">
      Signalen van{" "}
      <a
        href={BRONNEN.mechanisch.url}
        target="_blank"
        rel="noopener noreferrer"
        className="underline underline-offset-2"
      >
        {BRONNEN.mechanisch.naam}
      </a>{" "}
      en{" "}
      <a
        href={BRONNEN.meterkast.url}
        target="_blank"
        rel="noopener noreferrer"
        className="underline underline-offset-2"
      >
        {BRONNEN.meterkast.naam}
      </a>
      , gecontroleerd op {BRONNEN.mechanisch.gecontroleerd}.
    </p>
  </>
);
