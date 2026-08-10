import { ArrowRight, Check, X } from "lucide-react";

import { VERWARMEN } from "@/data/airco";
import { Accent, SectieKop } from "@/components/maatregel/primitieven";
import { KLEUR } from "@/components/maatregel/stijl";

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
      <p
        className="mt-4 mx-auto text-base leading-relaxed"
        style={{ color: KLEUR.navy, opacity: 0.75, maxWidth: 660 }}
      >
        {VERWARMEN.kern}
      </p>
    </div>

    <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 items-stretch">
      <div
        className="rounded-2xl p-6 md:p-7"
        style={{ backgroundColor: KLEUR.wit, border: `1px solid ${KLEUR.rand}` }}
      >
        <span
          className="text-sm font-bold uppercase tracking-wider"
          style={{ color: KLEUR.goud }}
        >
          Daar is hij goed in
        </span>
        <ul className="mt-5 flex flex-col gap-4" style={{ listStyle: "none", padding: 0, margin: "20px 0 0 0" }}>
          {VERWARMEN.past.map((punt) => (
            <li key={punt} className="flex items-start gap-3">
              <Check
                size={18}
                className="mt-1 shrink-0"
                style={{ color: KLEUR.goud }}
                strokeWidth={2.5}
                aria-hidden="true"
              />
              <span style={{ fontSize: 15.5, lineHeight: 1.55, color: KLEUR.navy, opacity: 0.85 }}>
                {punt}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div
        className="rounded-2xl p-6 md:p-7"
        style={{ backgroundColor: "#FEF7F7", border: "1px solid #F5D9D9" }}
      >
        <span className="text-sm font-bold uppercase tracking-wider" style={{ color: "#C0392B" }}>
          Daar niet
        </span>
        <ul className="mt-5 flex flex-col gap-4" style={{ listStyle: "none", padding: 0, margin: "20px 0 0 0" }}>
          {VERWARMEN.pastNiet.map((punt) => (
            <li key={punt} className="flex items-start gap-3">
              <X
                size={18}
                className="mt-1 shrink-0"
                style={{ color: "#C0392B" }}
                aria-hidden="true"
              />
              <span style={{ fontSize: 15.5, lineHeight: 1.55, color: KLEUR.navy, opacity: 0.85 }}>
                {punt}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>

    <div
      className="mt-6 rounded-2xl p-6 md:p-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      style={{
        backgroundColor: "hsl(var(--accent) / 0.12)",
        border: "1px solid hsl(var(--accent) / 0.4)",
      }}
    >
      <p
        className="text-[15.5px] leading-relaxed"
        style={{ color: KLEUR.navy, margin: 0, maxWidth: 720 }}
      >
        {VERWARMEN.grens}
      </p>
      <a
        href="/verduurzamen/warmtepomp"
        className="inline-flex items-center gap-2 shrink-0 text-[15px] font-semibold underline-offset-4 transition-colors hover:underline"
        style={{ color: KLEUR.navy }}
      >
        Naar de warmtepomp
        <ArrowRight size={16} aria-hidden="true" />
      </a>
    </div>
  </>
);
