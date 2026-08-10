import { Check, ShieldCheck } from "lucide-react";

import { BRONNEN, CERTIFICERING, GELUID } from "@/data/warmtepomp";
import { Accent, SectieKop } from "@/components/maatregel/primitieven";
import { KLEUR } from "@/components/maatregel/stijl";
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
      <p
        className="mt-4 mx-auto text-base leading-relaxed"
        style={{ color: KLEUR.navy, opacity: 0.75, maxWidth: 640 }}
      >
        Elk gesprek over een warmtepomp gaat op enig moment over de buitenunit. Er is een harde
        norm, en die geldt niet bij de unit maar op de grens met je buren.
      </p>
    </div>

    {/* De norm, met het schema erbij */}
    <div
      className="mt-10 rounded-2xl overflow-hidden"
      style={{ backgroundColor: KLEUR.wit, border: `1px solid ${KLEUR.rand}` }}
    >
      {/* Weinig zijruimte op mobiel: de tekening heeft de breedte harder nodig
          dan de kaart de marge. */}
      <div className="px-3 py-7 md:p-8">
        <BuitenunitSchema />
      </div>
      <div
        className="px-6 py-6 md:px-8 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10"
        style={{ borderTop: `1px solid ${KLEUR.rand}`, backgroundColor: KLEUR.zand }}
      >
        <div>
          <span className="label-eyebrow">De norm</span>
          <p
            className="text-[15px] leading-relaxed"
            style={{ color: KLEUR.navy, opacity: 0.85, margin: "12px 0 0 0" }}
          >
            In de avond en de nacht maximaal <strong>{GELUID.grenswaarde} dB</strong> op de
            perceelgrens, overdag onder voorwaarden {GELUID.dagwaarde} dB. Dat staat in{" "}
            {GELUID.artikel}.
          </p>
        </div>
        <div>
          <span className="label-eyebrow">In de praktijk</span>
          <p
            className="text-[15px] leading-relaxed"
            style={{ color: KLEUR.navy, opacity: 0.85, margin: "12px 0 0 0" }}
          >
            <strong>{GELUID.tevreden} procent</strong> van de mensen met een warmtepomp heeft er
            nooit last van. Klachten komen vrijwel altijd door de plek van de unit, niet door het
            apparaat.
          </p>
        </div>
      </div>
    </div>

    {/* Plaatsing en vakmanschap: twee korte lijstjes naast elkaar */}
    <div
      className="mt-6 rounded-2xl p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12"
      style={{ backgroundColor: KLEUR.wit, border: `1px solid ${KLEUR.rand}` }}
    >
      <div>
        <span className="label-eyebrow">Waar je op let bij de plaatsing</span>
        <ul
          className="mt-4 flex flex-col gap-3"
          style={{ listStyle: "none", padding: 0, margin: "16px 0 0 0" }}
        >
          {GELUID.tips.map((tip) => (
            <li key={tip} className="flex items-start gap-3">
              <Check
                size={17}
                className="mt-[3px] shrink-0"
                style={{ color: KLEUR.goud }}
                strokeWidth={2.5}
                aria-hidden="true"
              />
              <span style={{ fontSize: 15, lineHeight: 1.55, color: KLEUR.navy, opacity: 0.85 }}>
                {tip}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <div className="flex items-center gap-2">
          <ShieldCheck size={16} style={{ color: KLEUR.goud }} aria-hidden="true" />
          <span className="label-eyebrow">Papieren die de installateur moet hebben</span>
        </div>
        <dl className="mt-4 flex flex-col gap-3" style={{ margin: "16px 0 0 0" }}>
          {CERTIFICERING.moet.map((item) => (
            <div key={item.naam} className="flex flex-wrap items-baseline gap-x-2">
              <dt className="text-[15px] font-semibold" style={{ color: KLEUR.navy }}>
                {item.naam}
              </dt>
              <dd
                className="text-[14px] leading-snug"
                style={{ color: KLEUR.navy, opacity: 0.65, margin: 0, flex: "1 1 180px" }}
              >
                {item.tekst}
              </dd>
            </div>
          ))}
        </dl>
        <p
          className="text-[14px] leading-relaxed"
          style={{ color: KLEUR.navy, opacity: 0.65, margin: "16px 0 0 0" }}
        >
          Aanvullend zie je soms {CERTIFICERING.extra}. Geen eis, wel een goed teken. Wij koppelen
          je alleen aan uitvoerders die dit op orde hebben, en controleren het voor je.
        </p>
      </div>
    </div>

    <p className="mt-5 text-[13px] leading-relaxed" style={{ color: KLEUR.navy, opacity: 0.55 }}>
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
