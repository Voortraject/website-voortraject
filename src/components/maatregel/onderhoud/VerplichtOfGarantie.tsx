import { ScrollText, ShieldCheck } from "lucide-react";

import { BRONNEN, VERPLICHT } from "@/data/onderhoud";
import { Accent, SectieKop } from "@/components/maatregel/primitieven";
import { KLEUR } from "@/components/maatregel/stijl";

/**
 * Het onderscheid dat vrijwel niemand maakt: wat moet van de wet en wat moet
 * van je garantie.
 *
 * De uitkomst is contra-intuïtief en daarom het vermelden waard. Er is voor een
 * woning geen voorgeschreven onderhoudstermijn; de wet gaat over wie het werk
 * mag doen. Wat je wél aan een termijn houdt zijn je eigen garantievoorwaarden,
 * en die verschillen per merk. Precies daarom staat er geen algemeen getal op
 * deze pagina: dat zou voor de helft van de lezers verkeerd zijn.
 */

export const VerplichtOfGarantie = () => (
  <>
    <div className="text-center">
      <SectieKop center>
        <Accent tekst="Verplicht, of alleen voor je [[garantie]]?" />
      </SectieKop>
      <p
        className="mt-4 mx-auto text-base leading-relaxed"
        style={{ color: KLEUR.navy, opacity: 0.75, maxWidth: 680 }}
      >
        {VERPLICHT.kern} Dat verschil bepaalt wat er gebeurt als je een beurt overslaat, en het
        wordt bijna nooit uitgelegd.
      </p>
    </div>

    <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6 items-start">
      {/* Wat de wet eist: van de monteur, niet van jou */}
      <div
        className="rounded-2xl overflow-hidden h-full"
        style={{ backgroundColor: KLEUR.wit, border: `1px solid ${KLEUR.rand}` }}
      >
        <div
          className="px-6 py-4 md:px-7 flex items-center gap-3"
          style={{ backgroundColor: KLEUR.zand, borderBottom: `1px solid ${KLEUR.rand}` }}
        >
          <ShieldCheck size={18} color={KLEUR.navy} aria-hidden="true" />
          <span className="label-eyebrow">Wat de wet eist van de uitvoerder</span>
        </div>
        <ul
          className="flex flex-col"
          style={{ listStyle: "none", padding: 0, margin: 0 }}
        >
          {VERPLICHT.wettelijk.map((eis, i) => (
            <li
              key={eis.naam}
              className="px-6 py-4 md:px-7"
              style={{ borderTop: i === 0 ? "none" : `1px solid ${KLEUR.rand}` }}
            >
              <span className="block text-[16px] font-semibold" style={{ color: KLEUR.navy }}>
                {eis.naam}
              </span>
              <span
                className="mt-1 block text-[14.5px] leading-relaxed"
                style={{ color: KLEUR.navy, opacity: 0.7 }}
              >
                {eis.tekst}
              </span>
            </li>
          ))}
        </ul>
        <p
          className="px-6 py-4 md:px-7 text-[14px] leading-relaxed"
          style={{
            backgroundColor: KLEUR.zand,
            borderTop: `1px solid ${KLEUR.rand}`,
            color: KLEUR.navy,
            opacity: 0.7,
            margin: 0,
          }}
        >
          {VERPLICHT.extra}
        </p>
      </div>

      {/* Wat je garantie eist: van jou, en per toestel anders */}
      {/* Eén alinea naast een lijst van vier: even hoog laten lopen zou een gat
          onder de tekst geven, dus de tekst gaat in het midden staan. */}
      <div
        className="rounded-2xl overflow-hidden h-full flex flex-col"
        style={{ backgroundColor: KLEUR.wit, border: `1px solid ${KLEUR.rand}` }}
      >
        <div
          className="px-6 py-4 md:px-7 flex items-center gap-3"
          style={{ backgroundColor: KLEUR.zand, borderBottom: `1px solid ${KLEUR.rand}` }}
        >
          <ScrollText size={18} color={KLEUR.navy} aria-hidden="true" />
          <span className="label-eyebrow">Wat je garantie van jou vraagt</span>
        </div>
        <div className="flex-1 flex items-center px-6 py-6 md:px-7">
          <p
            className="text-[16px] leading-relaxed"
            style={{ color: KLEUR.navy, opacity: 0.85, margin: 0 }}
          >
            {VERPLICHT.garantie}
          </p>
        </div>
      </div>
    </div>

    <p className="mt-5 text-[13px] leading-relaxed" style={{ color: KLEUR.navy, opacity: 0.55 }}>
      Certificeringen van {BRONNEN.certificering.naam}, uit de{" "}
      <a
        href={BRONNEN.certificering.url}
        target="_blank"
        rel="noopener noreferrer"
        className="underline underline-offset-2"
      >
        checklist warmtepomp
      </a>{" "}
      en de pagina over{" "}
      <a
        href={BRONNEN.koelen.url}
        target="_blank"
        rel="noopener noreferrer"
        className="underline underline-offset-2"
      >
        airco en ventilatoren
      </a>
      . Gecontroleerd op {BRONNEN.certificering.gecontroleerd}.
    </p>
  </>
);
