import { ArrowRight } from "lucide-react";

import {
  BRONNEN,
  euro,
  getal,
  PANEEL,
  SALDERING,
  SETS,
  ZELFVERBRUIK,
} from "@/data/zonnepanelen";
import { Accent, SectieKop } from "@/components/maatregel/primitieven";
import { KLEUR } from "@/components/maatregel/stijl";

/**
 * De verandering waar deze pagina om draait.
 *
 * De oude tekst zei dat saldering "de komende jaren stapsgewijs wordt
 * afgebouwd". Dat is achterhaald: hij stopt in één keer, op 1 januari 2027, en
 * dat is over een paar maanden. Wat een set panelen oplevert wordt daardoor
 * ruwweg drie keer zo klein, en dat hoort een bezoeker van ons te horen vóór
 * hij tekent, niet erna.
 *
 * Meteen erbij: waar je het wél mee terugverdient, namelijk het deel dat je
 * zelf gebruikt.
 */

export const SalderingStopt = () => (
  <>
    <div className="text-center">
      <SectieKop center>
        <Accent tekst="Salderen stopt op [[1 januari 2027]]" />
      </SectieKop>
      <p
        className="mt-4 mx-auto text-base leading-relaxed"
        style={{ color: KLEUR.navy, opacity: 0.75, maxWidth: 660 }}
      >
        Niet stapsgewijs, maar in één keer. Dat verandert de rekensom van zonnepanelen ingrijpend,
        dus je leest het hier eerst.
      </p>
    </div>

    {/* Voor en na, als twee blokken */}
    <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
      <div
        className="rounded-2xl p-6"
        style={{ backgroundColor: KLEUR.wit, border: `1px solid ${KLEUR.rand}` }}
      >
        <span className="label-eyebrow">Tot en met {SALDERING.laatsteDag}</span>
        <p
          className="text-[15.5px] leading-relaxed"
          style={{ color: KLEUR.navy, opacity: 0.85, margin: "12px 0 0 0" }}
        >
          Alles wat je teruglevert streep je weg tegen wat je afneemt. Een kilowattuur die je
          overdag het net op stuurt, haal je er 's avonds voor dezelfde prijs weer af.
        </p>
      </div>
      <div
        className="rounded-2xl p-6"
        style={{
          backgroundColor: "hsl(var(--accent) / 0.12)",
          border: "1px solid hsl(var(--accent) / 0.45)",
        }}
      >
        <span className="label-eyebrow">Vanaf {SALDERING.stopt}</span>
        <p
          className="text-[15.5px] leading-relaxed"
          style={{ color: KLEUR.navy, opacity: 0.85, margin: "12px 0 0 0" }}
        >
          Wegstrepen kan niet meer. Je mag blijven terugleveren en krijgt daar een vergoeding voor,
          die tot {SALDERING.ondergrensTot} minstens {SALDERING.ondergrens} moet zijn. Dat is een
          stuk minder dan wat je voor stroom betaalt.
        </p>
      </div>
    </div>

    {/* Wat dat per set panelen betekent */}
    <div
      className="mt-6 rounded-2xl overflow-hidden"
      style={{ backgroundColor: KLEUR.wit, border: `1px solid ${KLEUR.rand}` }}
    >
      <div
        className="px-6 py-4 md:px-8 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
        style={{ backgroundColor: KLEUR.zand, borderBottom: `1px solid ${KLEUR.rand}` }}
      >
        <span className="label-eyebrow">Wat het scheelt op je energierekening</span>
        <span className="text-[14px]" style={{ color: KLEUR.navy, opacity: 0.6 }}>
          Bij {ZELFVERBRUIK.gemiddeld} procent zelfverbruik
        </span>
      </div>

      {SETS.map((set, i) => (
        <div
          key={set.panelen}
          className="px-6 py-5 md:px-8 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 md:gap-8 items-center"
          style={{ borderTop: i === 0 ? "none" : `1px solid ${KLEUR.rand}` }}
        >
          <div>
            <span className="text-[17px] font-semibold" style={{ color: KLEUR.navy }}>
              {set.panelen} panelen
            </span>
            <span
              className="mt-1 block text-[14px] leading-relaxed"
              style={{ color: KLEUR.navy, opacity: 0.65 }}
            >
              {euro(set.prijs)} en ongeveer {getal(set.opbrengst)} kWh per jaar
            </span>
          </div>
          <div className="flex items-center gap-4 sm:gap-6">
            <Bedrag label="In 2026" waarde={set.besparingNu} />
            <ArrowRight
              size={18}
              className="shrink-0"
              style={{ color: KLEUR.navy, opacity: 0.35 }}
              aria-hidden="true"
            />
            <Bedrag label="Vanaf 2027" waarde={set.besparingStraks} nadruk />
          </div>
        </div>
      ))}
    </div>

    {/* De knop waar je zelf aan kunt draaien */}
    <div
      className="mt-6 rounded-2xl p-6 md:p-8"
      style={{ backgroundColor: KLEUR.wit, border: `1px solid ${KLEUR.rand}` }}
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8">
        <span className="label-eyebrow">Wat je er wél aan kunt doen</span>
        <span
          className="text-[14px] leading-relaxed"
          style={{ color: KLEUR.navy, opacity: 0.65, maxWidth: 620 }}
        >
          Alleen het deel dat je zelf gebruikt is nog echt geld waard, en dat is{" "}
          {ZELFVERBRUIK.verhouding} dan stroom die je inkoopt. Zonder erop te sturen gebruikt een
          huishouden ongeveer {ZELFVERBRUIK.gemiddeld} procent zelf.
        </span>
      </div>
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-4">
        {ZELFVERBRUIK.manieren.map((manier) => (
          <div key={manier.kop}>
            <span
              className="block text-[15px] font-semibold"
              style={{ color: KLEUR.navy, lineHeight: 1.4 }}
            >
              {manier.kop}
            </span>
            <span
              className="mt-1 block text-[14px] leading-relaxed"
              style={{ color: KLEUR.navy, opacity: 0.65 }}
            >
              {manier.tekst}
            </span>
          </div>
        ))}
      </div>
    </div>

    <p className="mt-5 text-[13px] leading-relaxed" style={{ color: KLEUR.navy, opacity: 0.55 }}>
      Het stoppen van de salderingsregeling staat bij de{" "}
      <a
        href={BRONNEN.saldering.url}
        target="_blank"
        rel="noopener noreferrer"
        className="underline underline-offset-2"
      >
        {BRONNEN.saldering.naam}
      </a>
      ; de bedragen komen van{" "}
      <a
        href={BRONNEN.kosten.url}
        target="_blank"
        rel="noopener noreferrer"
        className="underline underline-offset-2"
      >
        {BRONNEN.kosten.naam}
      </a>
      , gecontroleerd op {BRONNEN.kosten.gecontroleerd}, voor panelen van {PANEEL.wattpiek} Wattpiek
      inclusief plaatsing. Op zonnepanelen geldt nu een btw-tarief van {PANEEL.btw}.
    </p>
  </>
);

const Bedrag = ({
  label,
  waarde,
  nadruk = false,
}: {
  label: string;
  waarde: number;
  nadruk?: boolean;
}) => (
  <div className="min-w-0">
    <span
      className="block text-[11px] font-bold uppercase tracking-wider whitespace-nowrap"
      style={{ color: KLEUR.navy, opacity: 0.5 }}
    >
      {label}
    </span>
    <span
      className="font-display block tabular-nums"
      style={{
        color: KLEUR.navy,
        fontWeight: 700,
        fontSize: nadruk ? 28 : 24,
        lineHeight: 1.15,
        opacity: nadruk ? 1 : 0.55,
      }}
    >
      {euro(waarde)}
    </span>
  </div>
);
