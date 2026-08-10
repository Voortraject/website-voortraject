import { Check, ShieldCheck } from "lucide-react";

import { BRONNEN, CERTIFICERING, GELUID } from "@/data/warmtepomp";
import { Accent, SectieKop } from "@/components/maatregel/primitieven";
import { KLEUR } from "@/components/maatregel/stijl";
import { BuitenunitSchema } from "./BuitenunitSchema";

/**
 * Geluid is de vraag die het vaakst gesteld wordt en het vaakst vaag wordt
 * beantwoord. Er is een norm, hij staat in de bouwregels, en hij geldt op de
 * perceelgrens en niet bij de unit. Dat maakt het een plaatsingsvraag, en
 * plaatsing is precies waar een goede installateur het verschil maakt. Daarom
 * staat het vakmanschap in dezelfde sectie.
 */

export const GeluidPlaatsingVakmanschap = () => (
  <>
    <div className="text-center">
      <SectieKop center>
        <Accent tekst="Geluid, plaatsing en [[vakmanschap]]" />
      </SectieKop>
      <p
        className="mt-4 mx-auto text-base leading-relaxed"
        style={{ color: KLEUR.navy, opacity: 0.75, maxWidth: 720 }}
      >
        Bijna elk gesprek over een warmtepomp gaat op enig moment over de buitenunit. Er is een
        harde norm, en die geldt niet bij de unit maar op de grens met je buren. Daarmee is het
        vooral een kwestie van waar hij komt te staan en wie hem plaatst.
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
            Op de perceelgrens mag een buitenunit in de avond en de nacht niet meer dan{" "}
            <strong>{GELUID.grenswaarde} dB</strong> laten horen, en onder voorwaarden overdag{" "}
            {GELUID.dagwaarde} dB. Dat staat in {GELUID.artikel}. Meet je bij de unit zelf, dan
            hoor je meer; dat is niet waar de regel over gaat.
          </p>
        </div>
        <div>
          <span className="label-eyebrow">In de praktijk</span>
          <p
            className="text-[15px] leading-relaxed"
            style={{ color: KLEUR.navy, opacity: 0.85, margin: "12px 0 0 0" }}
          >
            <strong>{GELUID.tevreden} procent</strong> van de mensen met een warmtepomp heeft er
            nooit geluidsoverlast van. De klachten die er zijn, komen vrijwel altijd door de plek
            waar de unit is neergezet, niet door het apparaat.
          </p>
        </div>
      </div>
    </div>

    {/* Plaatsing en vakmanschap staan onder elkaar in plaats van naast elkaar:
        de lijstjes verschillen sterk in lengte, en naast elkaar levert dat een
        kaart op die voor de helft leeg is. */}
    <div
      className="mt-6 rounded-2xl p-6 md:p-7"
      style={{ backgroundColor: KLEUR.wit, border: `1px solid ${KLEUR.rand}` }}
    >
      <span className="label-eyebrow">Waar je op let bij de plaatsing</span>
      <ul
        className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4"
        style={{ listStyle: "none", padding: 0, margin: "20px 0 0 0" }}
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
            <span style={{ fontSize: 15, lineHeight: 1.6, color: KLEUR.navy, opacity: 0.85 }}>
              {tip}
            </span>
          </li>
        ))}
      </ul>
    </div>

    <div
      className="mt-6 rounded-2xl p-6 md:p-7"
      style={{ backgroundColor: KLEUR.wit, border: `1px solid ${KLEUR.rand}` }}
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8">
        <span className="label-eyebrow">Wie hem mag installeren</span>
        <span
          className="text-[14px] leading-relaxed"
          style={{ color: KLEUR.navy, opacity: 0.65, maxWidth: 520 }}
        >
          Een warmtepomp werkt met koudemiddelen, en daar gelden regels voor. Vraag een offerte
          altijd met de papieren erbij.
        </span>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
        <CertificaatGroep kop={CERTIFICERING.moet.kop} items={CERTIFICERING.moet.items} nadruk />
        <CertificaatGroep kop={CERTIFICERING.extra.kop} items={CERTIFICERING.extra.items} />
      </div>

      <p
        className="text-[14.5px] leading-relaxed"
        style={{ color: KLEUR.navy, opacity: 0.8, margin: "24px 0 0 0" }}
      >
        Wij koppelen je alleen aan uitvoerders die dit op orde hebben, en controleren het voor je.
      </p>
    </div>

    <p className="mt-5 text-[13px] leading-relaxed" style={{ color: KLEUR.navy, opacity: 0.55 }}>
      De geluidsnorm komt van het{" "}
      <a
        href={BRONNEN.geluid.url}
        target="_blank"
        rel="noopener noreferrer"
        className="underline underline-offset-2"
      >
        {BRONNEN.geluid.naam}
      </a>
      , de plaatsingstips en de certificeringen van{" "}
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

const CertificaatGroep = ({
  kop,
  items,
  nadruk = false,
}: {
  kop: string;
  items: readonly { naam: string; tekst: string }[];
  nadruk?: boolean;
}) => (
  <div>
    <div className="flex items-center gap-2">
      {nadruk && <ShieldCheck size={16} style={{ color: KLEUR.goud }} aria-hidden="true" />}
      <span
        className="text-[13px] font-bold uppercase tracking-wider"
        style={{ color: KLEUR.navy, opacity: nadruk ? 0.8 : 0.5 }}
      >
        {kop}
      </span>
    </div>
    <dl className="mt-3 flex flex-col gap-3.5" style={{ margin: "14px 0 0 0" }}>
      {items.map((item) => (
        <div key={item.naam}>
          <dt className="text-[15px] font-semibold" style={{ color: KLEUR.navy }}>
            {item.naam}
          </dt>
          <dd
            className="text-[14px] leading-relaxed"
            style={{ color: KLEUR.navy, opacity: 0.7, margin: "2px 0 0 0" }}
          >
            {item.tekst}
          </dd>
        </div>
      ))}
    </dl>
  </div>
);
