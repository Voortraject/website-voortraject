import { ArrowRight, Check, ShieldCheck, Wrench } from "lucide-react";

import { BRONNEN, GELUID } from "@/data/airco";
import { Accent, IconCirkel, SectieKop } from "@/components/maatregel/primitieven";

/**
 * Een airco werkt met koudemiddel, net als een warmtepomp, en de buitenunit
 * valt onder dezelfde geluidsregel. Daarom staan certificering, geluid en
 * onderhoud hier bij elkaar: het is één verhaal over goed uitvoeren.
 */

const PAPIEREN = [
  {
    naam: "F-gassen",
    tekst: "Verplicht voor de monteur die met koudemiddel werkt. Zonder dat certificaat mag hij het systeem niet vullen of aansluiten.",
  },
  {
    naam: "BRL 100",
    tekst: "De erkenning van het installatiebedrijf.",
  },
  {
    naam: "STEK",
    tekst: "Aanvullende erkenning voor bedrijven die met koudemiddelen werken. Geen wettelijke eis, wel een goed teken.",
  },
];

const ONDERHOUD = [
  "Filters schoonmaken of vervangen kun je vaak zelf, een paar keer per seizoen.",
  "De controle van het systeem en het koudemiddel laat je aan een specialist over.",
  "Een vervuilde airco verbruikt meer en blaast slechtere lucht de kamer in.",
];

export const VakmanschapEnOnderhoud = () => (
  <>
    <div className="text-center">
      <SectieKop center>
        <Accent tekst="Goed geplaatst en [[onderhouden]]" />
      </SectieKop>
      <p className="vd-lead mx-auto mt-3 max-w-[640px]">
        Een airco werkt met koudemiddel en heeft een buitenunit. Dat stelt eisen aan wie hem plaatst
        en aan waar hij komt te hangen.
      </p>
    </div>

    <div className="mt-7 grid grid-cols-1 gap-4 md:mt-10 lg:grid-cols-2 lg:gap-6">
      <div className="hs-tegel hs-blauw-zacht p-5 md:p-7" data-veer>
        <div className="flex items-center justify-between gap-3">
          <span className="vd-label">Papieren die de installateur moet hebben</span>
          <IconCirkel Icon={ShieldCheck} size={36} />
        </div>
        <dl className="vd-zebra m-0 mt-4 flex flex-col gap-1">
          {PAPIEREN.map((item) => (
            <div key={item.naam} className="px-3 py-2.5">
              <dt className="text-[15px] font-bold text-primary">{item.naam}</dt>
              <dd className="vd-tekst m-0 mt-0.5 text-[14px]">{item.tekst}</dd>
            </div>
          ))}
        </dl>
        <p className="vd-tekst m-0 mt-4 text-[14px]">
          De buitenunit valt onder dezelfde geluidsregel als die van een warmtepomp: maximaal{" "}
          <strong className="text-primary">{GELUID.grenswaarde} dB</strong> op de perceelgrens in de avond en de nacht, en
          overdag onder voorwaarden {GELUID.dagwaarde} dB. Dat staat in {GELUID.artikel}.
        </p>
      </div>

      <div className="hs-tegel hs-zand p-5 md:p-7" data-veer>
        <div className="flex items-center justify-between gap-3">
          <span className="vd-label">Onderhoud</span>
          <IconCirkel Icon={Wrench} size={36} />
        </div>
        <ul className="m-0 mt-4 flex list-none flex-col gap-3 p-0">
          {ONDERHOUD.map((punt) => (
            <li key={punt} className="flex items-start gap-3">
              <Check
                size={17}
                className="mt-[3px] shrink-0 text-[hsl(var(--subsidie))]"
                strokeWidth={2.6}
                aria-hidden="true"
              />
              <span className="text-[15px] leading-[1.6] text-foreground">{punt}</span>
            </li>
          ))}
        </ul>
        <a href="/verduurzamen/onderhoud" className="hs-pijl-link mt-4">
          Lees meer over onderhoud
          <ArrowRight size={17} strokeWidth={2.2} className="hs-pijl" aria-hidden="true" />
        </a>
      </div>
    </div>

    <p className="vd-tekst mt-5 text-[13.5px]">
      De geluidsnorm komt van het{" "}
      <a
        href={BRONNEN.geluid.url}
        target="_blank"
        rel="noopener noreferrer"
        className="underline underline-offset-2"
      >
        {BRONNEN.geluid.naam}
      </a>
      , gecontroleerd op {BRONNEN.geluid.gecontroleerd}. Wij koppelen je alleen aan uitvoerders die
      hun papieren op orde hebben.
    </p>
  </>
);
