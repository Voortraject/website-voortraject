import { ArrowRight, BatteryCharging, Clock } from "lucide-react";

import { ACCU, BRONNEN, LAADVENSTERS, SALDERING, ZELFVERBRUIK } from "@/data/laadpaal";
import { Accent, IconCirkel, SectieKop } from "@/components/maatregel/primitieven";

/**
 * Waarom laden op eigen zon vanaf 2027 anders ligt.
 *
 * Zolang je kunt salderen maakt het weinig uit wanneer je je zonnestroom
 * gebruikt: wat het net op gaat komt er tegen hetzelfde tarief weer af. Vanaf
 * 1 januari 2027 stopt dat, en dan telt alleen nog het deel dat je zelf
 * verbruikt vol mee. Een auto is het grootste apparaat waarmee je dat deel
 * omhoog krijgt.
 *
 * De kruislinks naar zonnepanelen en thuisbatterij staan hier bewust en niet in
 * een los "combineert goed met"-blok onderaan: dit is de plek waar de bezoeker
 * die vraag krijgt.
 */

const KRUISLINKS = [
  { label: "Zo werkt het met zonnepanelen", href: "/verduurzamen/zonnepanelen" },
  { label: "En met een thuisbatterij", href: "/verduurzamen/thuisbatterij" },
];

export const LadenOpEigenZon = () => (
  <>
    <div className="text-center">
      <SectieKop center>
        <Accent tekst="Laden op je eigen [[zon]]" />
      </SectieKop>
      <p className="vd-lead mx-auto mt-3 max-w-[680px]">
        Op {SALDERING.stopt} stopt de salderingsregeling. Vanaf dan telt alleen het deel van je
        zonnestroom dat je zelf gebruikt nog vol mee; voor de rest krijg je een
        terugleververgoeding, die tot {SALDERING.ondergrensTot} minstens {SALDERING.ondergrens} moet
        zijn. Een elektrische auto is het grootste apparaat waarmee je dat eigen deel omhoog krijgt.
      </p>
    </div>

    <div className="hs-tegel hs-blauw-zacht mt-7 p-3 md:mt-10 md:p-4" data-veer>
      <div className="flex flex-col gap-1 px-3 pb-3 pt-2 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6 md:px-5">
        <span className="vd-label">Deel van je zonnestroom dat je zelf verbruikt</span>
        <span className="vd-tekst text-[14px]">Gemiddelden voor een huishouden</span>
      </div>

      <div className="vd-zebra flex flex-col gap-1">
        {ZELFVERBRUIK.map((rij, i) => (
          <div
            key={rij.naam}
            className="grid grid-cols-1 gap-2 px-3 py-4 md:grid-cols-[230px_1fr_auto] md:items-center md:gap-8 md:px-5"
          >
            <div>
              <span className="block text-[16px] font-bold text-primary">{rij.naam}</span>
              <span className="vd-tekst mt-1 block text-[13.5px] leading-snug md:hidden lg:block">
                {rij.toelichting}
              </span>
            </div>
            <div className="h-7 w-full overflow-hidden rounded-full bg-[hsl(var(--primary)/0.07)]" aria-hidden="true">
              <div
                className={
                  i === 0
                    ? "h-full rounded-full bg-[hsl(var(--primary)/0.3)]"
                    : "h-full rounded-full bg-[linear-gradient(90deg,hsl(var(--rs-oker-licht)),hsl(var(--accent)))]"
                }
                style={{ width: `${rij.deel}%` }}
              />
            </div>
            <span className="vd-getal text-right text-[24px]">{rij.deel} procent</span>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-x-8 gap-y-1 px-3 pb-2 pt-3 md:px-5">
        {KRUISLINKS.map((link) => (
          <a key={link.href} href={link.href} className="hs-pijl-link">
            {link.label}
            <ArrowRight size={17} strokeWidth={2.2} className="hs-pijl" aria-hidden="true" />
          </a>
        ))}
      </div>
    </div>

    <div className="mt-4 grid grid-cols-1 gap-4 md:mt-8 md:grid-cols-2 md:gap-5">
      <div className="hs-tegel hs-zand p-5 md:p-6" data-veer>
        <div className="flex items-center justify-between gap-3">
          <span className="vd-label">De beste momenten om te laden</span>
          <IconCirkel Icon={Clock} kleur="wit" size={36} />
        </div>
        <ul className="m-0 mt-3.5 flex list-none flex-col gap-3 p-0">
          {LAADVENSTERS.map((venster) => (
            <li key={venster.naam}>
              <span className="block text-[16px] font-bold text-primary">{venster.naam}</span>
              <span className="vd-tekst text-[14.5px]">{venster.waarom}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="hs-tegel hs-blauw-zacht p-5 md:p-6" data-veer>
        <div className="flex items-center justify-between gap-3">
          <span className="vd-label">Waarom het zoveel uitmaakt</span>
          <IconCirkel Icon={BatteryCharging} size={36} />
        </div>
        <p className="m-0 mt-3.5 text-[15.5px] leading-relaxed text-foreground">
          Een nieuwe accu is gemiddeld {ACCU.gemiddeld} kWh. Een huishouden verbruikt op een dag
          minder dan {ACCU.huishoudenPerDag} kWh. Eén keer volladen is dus meer dan zes dagen
          huishouden. Waar en wanneer je die stroom haalt, weegt daarom zwaarder dan bijna elke
          andere keuze in huis.
        </p>
      </div>
    </div>

    <p className="vd-tekst mt-5 text-[13.5px]">
      Zelfverbruik, laadmomenten en accugrootte van{" "}
      <a
        href={BRONNEN.zelfverbruik.url}
        target="_blank"
        rel="noopener noreferrer"
        className="underline underline-offset-2"
      >
        {BRONNEN.zelfverbruik.naam}
      </a>
      , het einde van de saldering van{" "}
      <a
        href={BRONNEN.saldering.url}
        target="_blank"
        rel="noopener noreferrer"
        className="underline underline-offset-2"
      >
        {BRONNEN.saldering.naam}
      </a>
      . Gecontroleerd op {BRONNEN.zelfverbruik.gecontroleerd}.
    </p>
  </>
);
