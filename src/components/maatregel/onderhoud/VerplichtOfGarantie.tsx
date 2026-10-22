import { ScrollText, ShieldCheck } from "lucide-react";

import { BRONNEN, VERPLICHT } from "@/data/onderhoud";
import { Accent, IconCirkel, SectieKop } from "@/components/maatregel/primitieven";

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
      <p className="vd-lead mx-auto mt-3 max-w-[680px]">
        {VERPLICHT.kern} Dat verschil bepaalt wat er gebeurt als je een beurt overslaat, en het
        wordt bijna nooit uitgelegd.
      </p>
    </div>

    <div className="mt-7 grid grid-cols-1 items-start gap-4 md:mt-10 md:grid-cols-2 md:gap-6">
      {/* Wat de wet eist: van de monteur, niet van jou */}
      <div className="hs-tegel hs-blauw-zacht h-full p-5 md:p-7" data-veer>
        <div className="flex items-center gap-3">
          <IconCirkel Icon={ShieldCheck} size={36} />
          <span className="vd-label">Wat de wet eist van de uitvoerder</span>
        </div>
        <ul className="m-0 mt-4 flex list-none flex-col gap-2 p-0">
          {VERPLICHT.wettelijk.map((eis) => (
            <li key={eis.naam} className="vd-wit px-4 py-3">
              <span className="block text-[16px] font-bold text-primary">{eis.naam}</span>
              <span className="vd-tekst mt-0.5 block text-[14.5px]">{eis.tekst}</span>
            </li>
          ))}
        </ul>
        <p className="vd-tekst mb-0 mt-4 text-[14px]">{VERPLICHT.extra}</p>
      </div>

      {/* Wat je garantie eist: van jou, en per toestel anders */}
      {/* Eén alinea naast een lijst van vier: even hoog laten lopen zou een gat
          onder de tekst geven, dus de tekst gaat in het midden staan. */}
      <div className="hs-tegel hs-zand flex h-full flex-col p-5 md:p-7" data-veer>
        <div className="flex items-center gap-3">
          <IconCirkel Icon={ScrollText} size={36} />
          <span className="vd-label">Wat je garantie van jou vraagt</span>
        </div>
        <div className="flex flex-1 items-center pt-4">
          <p className="m-0 text-[16px] leading-relaxed text-foreground">{VERPLICHT.garantie}</p>
        </div>
      </div>
    </div>

    <p className="vd-tekst mb-0 mt-4 text-[13.5px] md:mt-5">
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
