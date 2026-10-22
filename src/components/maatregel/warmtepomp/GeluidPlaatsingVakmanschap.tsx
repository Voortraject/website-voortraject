import { Check, ShieldCheck } from "lucide-react";

import { BRONNEN, CERTIFICERING, GELUID } from "@/data/warmtepomp";
import { Accent, IconCirkel, SectieKop } from "@/components/maatregel/primitieven";
import { BuitenunitSchema } from "./BuitenunitSchema";

/**
 * Geluid is de vraag die het vaakst gesteld wordt en het vaakst vaag wordt
 * beantwoord. Er is een norm, hij staat in de bouwregels, en hij geldt op de
 * perceelgrens en niet bij de unit. Daarmee is het een plaatsingsvraag, en
 * plaatsing is precies waar een goede installateur het verschil maakt. Daarom
 * staan plaatsing en vakmanschap naast elkaar in één kaart.
 */

export const GeluidPlaatsingVakmanschap = () => (
  <>
    <div className="text-center">
      <SectieKop center>
        <Accent tekst="Geluid, plaatsing en [[vakmanschap]]" />
      </SectieKop>
      <p className="vd-lead mx-auto mt-3 max-w-[640px]">
        Elk gesprek over een warmtepomp gaat op enig moment over de buitenunit. Er is een harde
        norm, en die geldt niet bij de unit maar op de grens met je buren.
      </p>
    </div>

    {/* De norm, met het schema erbij */}
    <div className="hs-tegel mt-7 overflow-hidden md:mt-10" data-veer>
      {/* Weinig zijruimte op mobiel: de tekening heeft de breedte harder nodig
          dan de kaart de marge. */}
      <div className="px-3 py-6 md:p-8">
        <BuitenunitSchema />
      </div>
      <div className="hs-blauw-zacht grid grid-cols-1 gap-5 px-5 py-5 md:grid-cols-2 md:gap-10 md:px-8 md:py-6">
        <div>
          <span className="vd-label">De norm</span>
          <p className="mb-0 mt-2 text-[15px] leading-relaxed text-foreground">
            In de avond en de nacht maximaal <strong className="text-primary">{GELUID.grenswaarde} dB</strong> op de
            perceelgrens, overdag onder voorwaarden {GELUID.dagwaarde} dB. Dat staat in{" "}
            {GELUID.artikel}.
          </p>
        </div>
        <div>
          <span className="vd-label">In de praktijk</span>
          <p className="mb-0 mt-2 text-[15px] leading-relaxed text-foreground">
            <strong className="text-primary">{GELUID.tevreden} procent</strong> van de mensen met een warmtepomp heeft er
            nooit last van. Klachten komen vrijwel altijd door de plek van de unit, niet door het
            apparaat.
          </p>
        </div>
      </div>
    </div>

    {/* Plaatsing en vakmanschap: twee korte lijstjes naast elkaar */}
    <div className="mt-4 grid grid-cols-1 gap-4 md:mt-6 md:grid-cols-2 md:gap-5">
      <div className="hs-tegel hs-zand p-5 md:p-7" data-veer>
        <span className="vd-label">Waar je op let bij de plaatsing</span>
        <ul className="mx-0 mb-0 mt-4 flex list-none flex-col gap-3 p-0">
          {GELUID.tips.map((tip) => (
            <li key={tip} className="flex items-start gap-3">
              <Check
                size={17}
                className="mt-[3px] shrink-0 text-[hsl(var(--subsidie))]"
                strokeWidth={2.6}
                aria-hidden="true"
              />
              <span className="text-[15px] leading-[1.55] text-foreground">{tip}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="hs-tegel hs-blauw-zacht p-5 md:p-7" data-veer>
        <div className="flex items-center justify-between gap-3">
          <span className="vd-label">Papieren die de installateur moet hebben</span>
          <IconCirkel Icon={ShieldCheck} size={36} />
        </div>
        <dl className="mx-0 mb-0 mt-4 flex flex-col gap-3">
          {CERTIFICERING.moet.map((item) => (
            <div key={item.naam} className="flex flex-wrap items-baseline gap-x-2">
              <dt className="text-[15px] font-bold text-primary">{item.naam}</dt>
              <dd className="vd-tekst m-0 flex-[1_1_180px] text-[14px] leading-snug">{item.tekst}</dd>
            </div>
          ))}
        </dl>
        <p className="vd-tekst mb-0 mt-4 text-[14px]">
          Aanvullend zie je soms {CERTIFICERING.extra}. Geen eis, wel een goed teken. Wij koppelen
          je alleen aan uitvoerders die dit op orde hebben, en controleren het voor je.
        </p>
      </div>
    </div>

    <p className="mb-0 mt-5 text-[13.5px] leading-relaxed text-[hsl(var(--rs-tekst-zacht))]">
      Geluidsnorm van het{" "}
      <a
        href={BRONNEN.geluid.url}
        target="_blank"
        rel="noopener noreferrer"
        className="underline underline-offset-2"
      >
        {BRONNEN.geluid.naam}
      </a>
      , plaatsingstips en certificeringen van{" "}
      <a
        href={BRONNEN.certificering.url}
        target="_blank"
        rel="noopener noreferrer"
        className="underline underline-offset-2"
      >
        {BRONNEN.certificering.naam}
      </a>
      . Gecontroleerd op {BRONNEN.geluid.gecontroleerd}.
    </p>
  </>
);
