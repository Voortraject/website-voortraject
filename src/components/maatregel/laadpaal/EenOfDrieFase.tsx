import {
  AANSLUITINGEN,
  AANSLUITWAARDEN,
  BEREIK_PER_UUR,
  BRONNEN,
  VERZWAREN,
} from "@/data/laadpaal";
import { Accent, SectieKop } from "@/components/maatregel/primitieven";
import { KLEUR } from "@/components/maatregel/stijl";

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
      <p
        className="mt-4 mx-auto text-base leading-relaxed"
        style={{ color: KLEUR.navy, opacity: 0.75, maxWidth: 640 }}
      >
        Je aansluiting bepaalt hoe snel je thuis kunt laden. Niet de auto, niet de laadpaal.
      </p>
    </div>

    <div
      className="mt-10 rounded-2xl overflow-hidden"
      style={{ backgroundColor: KLEUR.wit, border: `1px solid ${KLEUR.rand}` }}
    >
      {/* Kop: de twee aansluitingen met het vermogen dat erop past */}
      <div className={`grid grid-cols-1 ${KOLOMMEN}`}>
        <div className="hidden md:block" style={{ backgroundColor: KLEUR.zand }} />
        {AANSLUITINGEN.map((a, i) => (
          <div
            key={a.id}
            // Op mobiel staan de twee koppen onder elkaar op dezelfde
            // achtergrond; zonder streepje lopen ze in elkaar over.
            className={`p-6 md:p-7 flex flex-col ${i > 0 ? "border-t md:border-t-0" : ""}`}
            style={{ backgroundColor: KLEUR.zand, borderTopColor: KLEUR.rand }}
          >
            <h3
              className="text-[19px] font-semibold"
              style={{ color: KLEUR.navy, margin: 0, lineHeight: 1.3 }}
            >
              {a.naam}
            </h3>
            <p
              className="text-[15px] leading-relaxed"
              style={{ color: KLEUR.navy, opacity: 0.78, margin: "10px 0 0 0" }}
            >
              {a.kort}
            </p>
            <div
              className="mt-5 md:mt-auto rounded-xl px-4 py-3"
              style={{
                backgroundColor: "hsl(var(--accent) / 0.14)",
                border: "1px solid hsl(var(--accent) / 0.4)",
              }}
            >
              <span className="label-eyebrow">Vermogen van de laadpaal</span>
              <div
                className="font-display mt-1 tabular-nums"
                style={{ color: KLEUR.navy, fontWeight: 700, fontSize: 28, lineHeight: 1.1 }}
              >
                {a.laadvermogen}
              </div>
              <p
                className="text-[13px] leading-relaxed"
                style={{ color: KLEUR.navy, opacity: 0.7, margin: "8px 0 0 0" }}
              >
                {a.laadvermogenNoot}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* De vergelijking zelf */}
      {RIJEN.map((rij) => (
        <div key={rij.label} className={`grid grid-cols-1 ${KOLOMMEN}`}>
          <div
            className="px-6 pt-6 pb-2 md:py-6 md:px-7"
            style={{ borderTop: `1px solid ${KLEUR.rand}`, backgroundColor: KLEUR.zand }}
          >
            <span className="label-eyebrow">{rij.label}</span>
          </div>
          {AANSLUITINGEN.map((a) => (
            <div
              key={a.id}
              className="px-6 pb-5 md:py-5 md:px-7 md:border-t"
              style={{ borderTopColor: KLEUR.rand }}
            >
              {/* Op mobiel staan de twee waarden onder elkaar, dus dan is een
                  kort label nodig om ze uit elkaar te houden. Op desktop doet
                  de kolomkop dat werk al. */}
              <span
                className="md:hidden mb-1 block text-[11px] font-bold uppercase tracking-wider"
                style={{ color: KLEUR.navy, opacity: 0.45 }}
              >
                {a.id === "een" ? "1-fase" : "3-fase"}
              </span>
              <span
                className="block text-[16px] font-semibold"
                style={{ color: KLEUR.navy, lineHeight: 1.4 }}
              >
                {a[rij.veld].kern}
              </span>
              {a[rij.veld].toelichting && (
                <span
                  className="mt-1 block text-[14px] leading-relaxed"
                  style={{ color: KLEUR.navy, opacity: 0.65 }}
                >
                  {a[rij.veld].toelichting}
                </span>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>

    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
      <div
        className="rounded-2xl p-5 md:p-6"
        style={{ backgroundColor: KLEUR.zand, border: `1px solid ${KLEUR.rand}` }}
      >
        <span className="label-eyebrow">Wat een uur laden oplevert</span>
        <p
          className="text-[15.5px] leading-relaxed"
          style={{ color: KLEUR.navy, opacity: 0.85, margin: "10px 0 0 0" }}
        >
          Eén uur thuisladen geeft {BEREIK_PER_UUR} bereik, afhankelijk van het vermogen. In vijf
          uur heb je er zo 100 tot 300 km bij. Voor de meeste ritten hoeft een accu dus helemaal
          niet vol.
        </p>
      </div>
      <div
        className="rounded-2xl p-5 md:p-6"
        style={{ backgroundColor: KLEUR.zand, border: `1px solid ${KLEUR.rand}` }}
      >
        <span className="label-eyebrow">En als je wilt verzwaren</span>
        <p
          className="text-[15.5px] leading-relaxed"
          style={{ color: KLEUR.navy, opacity: 0.85, margin: "10px 0 0 0" }}
        >
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

    <p className="mt-5 text-[13px] leading-relaxed" style={{ color: KLEUR.navy, opacity: 0.55 }}>
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
