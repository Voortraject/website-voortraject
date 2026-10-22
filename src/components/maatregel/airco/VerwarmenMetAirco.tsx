import { ArrowRight, Check, Flame, Minus, Snowflake } from "lucide-react";

import { VERWARMEN } from "@/data/airco";
import { Accent, IconCirkel, SectieKop } from "@/components/maatregel/primitieven";

/**
 * Waar de airco ophoudt en de warmtepomp begint.
 *
 * Dit is het onderdeel waar mensen de verkeerde oplossing kopen: een airco is
 * technisch een lucht-lucht warmtepomp, dus "hij kan ook verwarmen" klopt, maar
 * de hele woning gasloos krijgen doe je er niet mee. Die grens uitleggen en
 * doorverwijzen is precies de rol van een intermediair die zelf niets verkoopt.
 */

export const VerwarmenMetAirco = () => (
  <>
    <div className="text-center">
      <SectieKop center>
        <Accent tekst="Een airco is ook een [[warmtepomp]]" />
      </SectieKop>
      <p className="vd-lead mx-auto mt-3 max-w-[660px]">{VERWARMEN.kern}</p>
    </div>

    <div className="mt-7 grid grid-cols-1 items-stretch gap-4 md:mt-10 md:grid-cols-2 md:gap-5">
      <div className="hs-tegel hs-groen p-5 md:p-7" data-veer>
        <div className="flex items-center justify-between gap-3">
          <span className="vd-label">Daar is hij goed in</span>
          <IconCirkel Icon={Snowflake} kleur="groen" size={36} />
        </div>
        <ul className="m-0 mt-4 flex list-none flex-col gap-3 p-0">
          {VERWARMEN.past.map((punt) => (
            <li key={punt} className="flex items-start gap-3">
              <Check
                size={18}
                className="mt-[3px] shrink-0 text-[hsl(var(--subsidie))]"
                strokeWidth={2.6}
                aria-hidden="true"
              />
              <span className="text-[15.5px] leading-[1.55] text-foreground">{punt}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="hs-tegel hs-zand p-5 md:p-7" data-veer>
        <div className="flex items-center justify-between gap-3">
          <span className="vd-label">Daar hoort een warmtepomp</span>
          <IconCirkel Icon={Flame} kleur="wit" size={36} />
        </div>
        <ul className="m-0 mt-4 flex list-none flex-col gap-3 p-0">
          {VERWARMEN.pastNiet.map((punt) => (
            <li key={punt} className="flex items-start gap-3">
              <Minus
                size={18}
                className="mt-[3px] shrink-0 text-[hsl(var(--rs-tekst-zacht))]"
                aria-hidden="true"
              />
              <span className="text-[15.5px] leading-[1.55] text-foreground">{punt}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>

    <div
      className="hs-tegel vd-oker mt-4 flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between md:mt-6 md:p-7"
      data-veer
    >
      <p className="m-0 max-w-[720px] text-[15.5px] leading-relaxed text-foreground">{VERWARMEN.grens}</p>
      <a href="/verduurzamen/warmtepomp" className="hs-pijl-link shrink-0">
        Naar de warmtepomp
        <ArrowRight size={17} strokeWidth={2.2} className="hs-pijl" aria-hidden="true" />
      </a>
    </div>
  </>
);
