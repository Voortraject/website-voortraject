import { ArrowRight } from "lucide-react";

import { BRONNEN, SIGNALEN } from "@/data/onderhoud";
import { Accent, SectieKop } from "@/components/maatregel/primitieven";
import { KLEUR } from "@/components/maatregel/stijl";

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
      <p
        className="mt-4 mx-auto text-base leading-relaxed"
        style={{ color: KLEUR.navy, opacity: 0.75, maxWidth: 660 }}
      >
        Installaties gaan zelden ineens stuk. Ze geven eerst een signaal af, en dat is bijna altijd
        iets wat je zelf kunt horen, ruiken of aflezen.
      </p>
    </div>

    <div
      className="mt-10 rounded-2xl overflow-hidden"
      style={{ backgroundColor: KLEUR.wit, border: `1px solid ${KLEUR.rand}` }}
    >
      {SIGNALEN.map((rij, i) => (
        <div
          key={rij.signaal}
          className="px-6 py-5 md:px-8 grid grid-cols-1 md:grid-cols-[1fr_1fr] gap-2 md:gap-8 md:items-baseline"
          style={{ borderTop: i === 0 ? "none" : `1px solid ${KLEUR.rand}` }}
        >
          <span
            className="text-[16px] font-semibold"
            style={{ color: KLEUR.navy, lineHeight: 1.45 }}
          >
            {rij.signaal}
          </span>
          <span>
            <span
              className="block text-[15px] leading-relaxed"
              style={{ color: KLEUR.navy, opacity: 0.75 }}
            >
              {rij.betekent}
            </span>
            <span className="mt-2 flex items-baseline gap-2">
              <ArrowRight
                size={14}
                className="shrink-0 translate-y-[2px]"
                style={{ color: KLEUR.goud }}
                aria-hidden="true"
              />
              <span
                className="text-[15px] font-medium leading-relaxed"
                style={{ color: KLEUR.navy }}
              >
                {rij.doen}
              </span>
            </span>
          </span>
        </div>
      ))}
    </div>

    <p className="mt-5 text-[13px] leading-relaxed" style={{ color: KLEUR.navy, opacity: 0.55 }}>
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
