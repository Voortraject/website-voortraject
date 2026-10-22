import { ArrowRight, CalendarClock, Check, Undo2 } from "lucide-react";

import {
  BRONNEN,
  euro,
  getal,
  PANEEL,
  SALDERING,
  SETS,
  ZELFVERBRUIK,
} from "@/data/zonnepanelen";
import { Accent, IconCirkel, SectieKop } from "@/components/maatregel/primitieven";

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
      <p className="vd-lead mx-auto mt-3 max-w-[660px]">
        Niet stapsgewijs, maar in één keer. Dat verandert de rekensom van zonnepanelen ingrijpend,
        dus je leest het hier eerst.
      </p>
    </div>

    {/* Voor en na, als twee tegels */}
    <div className="mt-7 grid grid-cols-1 gap-3 md:mt-10 md:grid-cols-2 md:gap-5">
      <div className="hs-tegel hs-blauw-zacht p-5 md:p-6" data-veer>
        <div className="flex items-center justify-between gap-3">
          <span className="vd-label">Tot en met {SALDERING.laatsteDag}</span>
          <IconCirkel Icon={Undo2} size={36} />
        </div>
        <p className="mb-0 mt-3 text-[15.5px] leading-relaxed text-foreground">
          Alles wat je teruglevert streep je weg tegen wat je afneemt. Een kilowattuur die je
          overdag het net op stuurt, haal je er 's avonds voor dezelfde prijs weer af.
        </p>
      </div>
      <div className="hs-tegel vd-oker p-5 md:p-6" data-veer>
        <div className="flex items-center justify-between gap-3">
          <span className="vd-label">Vanaf {SALDERING.stopt}</span>
          <IconCirkel Icon={CalendarClock} size={36} kleur="oker" />
        </div>
        <p className="mb-0 mt-3 text-[15.5px] leading-relaxed text-foreground">
          Wegstrepen kan niet meer. Je mag blijven terugleveren en krijgt daar een vergoeding voor,
          die tot {SALDERING.ondergrensTot} minstens {SALDERING.ondergrens} moet zijn. Dat is een
          stuk minder dan wat je voor stroom betaalt.
        </p>
      </div>
    </div>

    {/* Wat dat per set panelen betekent: rijen in zebra, geen lijnen */}
    <div className="hs-tegel mt-4 p-3 md:mt-6 md:p-4" data-veer>
      <div className="flex flex-col gap-1 px-3 pb-2 pt-2 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6 md:px-5">
        <span className="vd-label">Wat het scheelt op je energierekening</span>
        <span className="vd-tekst text-[14px]">Bij {ZELFVERBRUIK.gemiddeld} procent zelfverbruik</span>
      </div>

      <div className="vd-zebra grid gap-1">
        {SETS.map((set) => (
          <div
            key={set.panelen}
            className="grid grid-cols-1 items-center gap-3 px-3 py-4 md:grid-cols-[1fr_auto] md:gap-8 md:px-5"
          >
            <div>
              <span className="hs-h3 block">{set.panelen} panelen</span>
              <span className="vd-tekst mt-0.5 block text-[14px]">
                {euro(set.prijs)} en ongeveer {getal(set.opbrengst)} kWh per jaar
              </span>
            </div>
            <div className="flex items-center gap-4 sm:gap-6">
              <Bedrag label="In 2026" waarde={set.besparingNu} />
              <ArrowRight
                size={18}
                className="shrink-0 text-[hsl(var(--rs-tekst-zacht))]"
                aria-hidden="true"
              />
              <Bedrag label="Vanaf 2027" waarde={set.besparingStraks} nadruk />
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* De knop waar je zelf aan kunt draaien */}
    <div className="hs-tegel hs-groen mt-4 p-5 md:mt-6 md:p-8" data-veer>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8">
        <span className="vd-label">Wat je er wél aan kunt doen</span>
        <span className="vd-tekst max-w-[620px] text-[14px]">
          Alleen het deel dat je zelf gebruikt is nog echt geld waard, en dat is{" "}
          {ZELFVERBRUIK.verhouding} dan stroom die je inkoopt. Zonder erop te sturen gebruikt een
          huishouden ongeveer {ZELFVERBRUIK.gemiddeld} procent zelf.
        </span>
      </div>
      <div className="mt-4 grid grid-cols-1 gap-x-8 gap-y-4 sm:mt-6 sm:grid-cols-2 lg:grid-cols-4">
        {ZELFVERBRUIK.manieren.map((manier) => (
          <div key={manier.kop} className="flex items-start gap-3">
            <Check
              size={17}
              strokeWidth={2.6}
              className="mt-[3px] shrink-0 text-[hsl(var(--subsidie))]"
              aria-hidden="true"
            />
            <div className="min-w-0">
              <span className="block text-[15.5px] font-bold leading-[1.4] text-primary">{manier.kop}</span>
              <span className="vd-tekst mt-0.5 block text-[14px]">{manier.tekst}</span>
            </div>
          </div>
        ))}
      </div>
    </div>

    <p className="vd-tekst mb-0 mt-4 text-[13.5px] md:mt-5">
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
    <span className="block whitespace-nowrap text-[12px] font-extrabold uppercase tracking-wider text-[hsl(var(--rs-tekst-zacht))]">
      {label}
    </span>
    <span
      className={
        nadruk
          ? "vd-getal block text-[28px]"
          : "vd-getal block text-[24px] text-[hsl(var(--rs-tekst-zacht))]"
      }
    >
      {euro(waarde)}
    </span>
  </div>
);
