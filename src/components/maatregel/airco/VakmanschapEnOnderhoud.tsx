import { ArrowRight, Check, ShieldCheck } from "lucide-react";

import { BRONNEN, GELUID } from "@/data/airco";
import { Accent, SectieKop } from "@/components/maatregel/primitieven";
import { KLEUR } from "@/components/maatregel/stijl";

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
      <p
        className="mt-4 mx-auto text-base leading-relaxed"
        style={{ color: KLEUR.navy, opacity: 0.75, maxWidth: 640 }}
      >
        Een airco werkt met koudemiddel en heeft een buitenunit. Dat stelt eisen aan wie hem plaatst
        en aan waar hij komt te hangen.
      </p>
    </div>

    <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div
        className="rounded-2xl p-6 md:p-7"
        style={{ backgroundColor: KLEUR.wit, border: `1px solid ${KLEUR.rand}` }}
      >
        <div className="flex items-center gap-2">
          <ShieldCheck size={16} style={{ color: KLEUR.goud }} aria-hidden="true" />
          <span className="label-eyebrow">Papieren die de installateur moet hebben</span>
        </div>
        <dl className="mt-4 flex flex-col gap-3" style={{ margin: "16px 0 0 0" }}>
          {PAPIEREN.map((item) => (
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
        <p
          className="text-[14px] leading-relaxed"
          style={{ color: KLEUR.navy, opacity: 0.7, margin: "20px 0 0 0" }}
        >
          De buitenunit valt onder dezelfde geluidsregel als die van een warmtepomp: maximaal{" "}
          <strong>{GELUID.grenswaarde} dB</strong> op de perceelgrens in de avond en de nacht, en
          overdag onder voorwaarden {GELUID.dagwaarde} dB. Dat staat in {GELUID.artikel}.
        </p>
      </div>

      <div
        className="rounded-2xl p-6 md:p-7"
        style={{ backgroundColor: KLEUR.wit, border: `1px solid ${KLEUR.rand}` }}
      >
        <span className="label-eyebrow">Onderhoud</span>
        <ul
          className="mt-4 flex flex-col gap-3"
          style={{ listStyle: "none", padding: 0, margin: "16px 0 0 0" }}
        >
          {ONDERHOUD.map((punt) => (
            <li key={punt} className="flex items-start gap-3">
              <Check
                size={17}
                className="mt-[3px] shrink-0"
                style={{ color: KLEUR.goud }}
                strokeWidth={2.5}
                aria-hidden="true"
              />
              <span style={{ fontSize: 15, lineHeight: 1.6, color: KLEUR.navy, opacity: 0.85 }}>
                {punt}
              </span>
            </li>
          ))}
        </ul>
        <a
          href="/verduurzamen/onderhoud"
          className="mt-5 inline-flex items-center gap-2 text-[15px] font-semibold underline-offset-4 transition-colors hover:underline"
          style={{ color: KLEUR.navy }}
        >
          Lees meer over onderhoud
          <ArrowRight size={16} aria-hidden="true" />
        </a>
      </div>
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
      , gecontroleerd op {BRONNEN.geluid.gecontroleerd}. Wij koppelen je alleen aan uitvoerders die
      hun papieren op orde hebben.
    </p>
  </>
);
