import { Gauge, Zap } from "lucide-react";

import {
  AANSLUITINGEN,
  AANSLUITWAARDEN,
  BEREIK_PER_UUR,
  BRONNEN,
  VERZWAREN,
} from "@/data/laadpaal";
import { Accent, IconCirkel, SectieKop } from "@/components/maatregel/primitieven";

/**
 * De eerste vraag bij een laadpaal is niet welk merk, maar wat er in je
 * meterkast binnenkomt. Op een 1-faseaansluiting is 3,7 kW het plafond, hoe
 * duur de paal ook is. Dat stond nergens op de pagina; wat er stond waren drie
 * pillen met Laag, Gemiddeld en Hoog.
 *
 * Verzwaren staat er bewust als voetnoot bij en niet als oplossing: bij een vol
 * net loopt de wachttijd op tot jaren, en dat raakt Groningen en Drenthe.
 */

type CelVeld = "meterkast" | "vol" | "ruimte" | "logisch";

const RIJEN: { label: string; veld: CelVeld }[] = [
  { label: "Je meterkast", veld: "meterkast" },
  { label: "Accu helemaal vol", veld: "vol" },
  { label: "Ruimte voor de rest van je huis", veld: "ruimte" },
  { label: "Wanneer dit logisch is", veld: "logisch" },
];

/** Eén raster voor kop en rijen, zodat de kolommen echt onder elkaar staan. */
const KOLOMMEN = "md:grid-cols-[230px_1fr_1fr]";

export const EenOfDrieFase = () => (
  <>
    <div className="text-center">
      <SectieKop center>
        <Accent tekst="1-fase of 3-fase: wat kan er [[bij jou]]?" />
      </SectieKop>
      <p className="vd-lead mx-auto mt-3 max-w-[640px]">
        Je aansluiting bepaalt hoe snel je thuis kunt laden. Niet de auto, niet de laadpaal.
      </p>
    </div>

    <div className="hs-tegel hs-blauw-zacht mt-7 p-3 md:mt-10 md:p-4" data-veer>
      {/* Kop: de twee aansluitingen met het vermogen dat erop past */}
      <div className={`grid grid-cols-1 gap-3 md:gap-4 ${KOLOMMEN}`}>
        <div className="hidden md:block" />
        {AANSLUITINGEN.map((a) => (
          <div key={a.id} className="vd-wit flex flex-col p-5 md:p-6">
            <div className="flex items-center justify-between gap-3">
              <h3 className="hs-h3 m-0">{a.naam}</h3>
              <IconCirkel Icon={a.id === "een" ? Gauge : Zap} size={36} />
            </div>
            <p className="vd-tekst m-0 mt-2">{a.kort}</p>
            <div className="vd-inzet mt-4 px-4 py-3 md:mt-auto">
              <span className="vd-label text-[12px]">Vermogen van de laadpaal</span>
              <div className="vd-getal mt-1 text-[30px]">{a.laadvermogen}</div>
              <p className="vd-tekst m-0 mt-2 text-[13.5px]">{a.laadvermogenNoot}</p>
            </div>
          </div>
        ))}
      </div>

      {/* De vergelijking zelf: rijen als zachte zebra, geen lijnen */}
      <div className="vd-zebra mt-3 flex flex-col gap-1 md:mt-4">
        {RIJEN.map((rij) => (
          <div key={rij.label} className={`grid grid-cols-1 gap-x-4 px-3 py-4 md:px-4 ${KOLOMMEN}`}>
            <div className="pb-2 md:py-1">
              <span className="vd-label">{rij.label}</span>
            </div>
            {AANSLUITINGEN.map((a) => (
              <div key={a.id} className="pb-3 last:pb-0 md:py-1 md:pb-1">
                {/* Op mobiel staan de twee waarden onder elkaar, dus dan is een
                    kort label nodig om ze uit elkaar te houden. Op desktop doet
                    de kolomkop dat werk al. */}
                <span className="mb-0.5 block text-[12px] font-extrabold uppercase tracking-wider text-[hsl(var(--rs-getal))] md:hidden">
                  {a.id === "een" ? "1-fase" : "3-fase"}
                </span>
                <span className="block text-[16px] font-bold leading-[1.4] text-primary">
                  {a[rij.veld].kern}
                </span>
                {a[rij.veld].toelichting && (
                  <span className="vd-tekst mt-1 block text-[14px]">{a[rij.veld].toelichting}</span>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>

    <div className="mt-4 grid grid-cols-1 gap-4 md:mt-8 md:grid-cols-2 md:gap-5">
      <div className="hs-tegel hs-zand p-5 md:p-6" data-veer>
        <span className="vd-label">Wat een uur laden oplevert</span>
        <p className="m-0 mt-2.5 text-[15.5px] leading-relaxed text-foreground">
          Eén uur thuisladen geeft {BEREIK_PER_UUR} bereik, afhankelijk van het vermogen. In vijf
          uur heb je er zo 100 tot 300 km bij. Voor de meeste ritten hoeft een accu dus helemaal
          niet vol.
        </p>
      </div>
      <div className="hs-tegel hs-zand p-5 md:p-6" data-veer>
        <span className="vd-label">En als je wilt verzwaren</span>
        <p className="m-0 mt-2.5 text-[15.5px] leading-relaxed text-foreground">
          {VERZWAREN} Reken er dus niet op als oplossing voor volgende maand. Bij Enexis is{" "}
          {AANSLUITWAARDEN.map((w, i) => (
            <span key={w.naam}>
              {i > 0 ? (i === AANSLUITWAARDEN.length - 1 ? " en " : ", ") : ""}
              {w.naam} goed voor {w.vermogen}
            </span>
          ))}
          .
        </p>
      </div>
    </div>

    <p className="vd-tekst mt-5 text-[13.5px]">
      Laadvermogens en laadtijden van{" "}
      <a
        href={BRONNEN.opladen.url}
        target="_blank"
        rel="noopener noreferrer"
        className="underline underline-offset-2"
      >
        {BRONNEN.opladen.naam}
      </a>
      , het aandeel 1-faseaansluitingen van{" "}
      <a
        href={BRONNEN.laadpunt.url}
        target="_blank"
        rel="noopener noreferrer"
        className="underline underline-offset-2"
      >
        {BRONNEN.laadpunt.naam}
      </a>
      , aansluitwaarden en doorlooptijden van{" "}
      <a
        href={BRONNEN.aansluiting.url}
        target="_blank"
        rel="noopener noreferrer"
        className="underline underline-offset-2"
      >
        {BRONNEN.aansluiting.naam}
      </a>
      . Gecontroleerd op {BRONNEN.opladen.gecontroleerd}.
    </p>
  </>
);
