import { ArrowRight } from "lucide-react";

import { ACCU, BRONNEN, LAADVENSTERS, SALDERING, ZELFVERBRUIK } from "@/data/laadpaal";
import { Accent, SectieKop } from "@/components/maatregel/primitieven";
import { KLEUR } from "@/components/maatregel/stijl";

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
      <p
        className="mt-4 mx-auto text-base leading-relaxed"
        style={{ color: KLEUR.navy, opacity: 0.75, maxWidth: 680 }}
      >
        Op {SALDERING.stopt} stopt de salderingsregeling. Vanaf dan telt alleen het deel van je
        zonnestroom dat je zelf gebruikt nog vol mee; voor de rest krijg je een
        terugleververgoeding, die tot {SALDERING.ondergrensTot} minstens {SALDERING.ondergrens} moet
        zijn. Een elektrische auto is het grootste apparaat waarmee je dat eigen deel omhoog krijgt.
      </p>
    </div>

    <div
      className="mt-10 rounded-2xl overflow-hidden"
      style={{ backgroundColor: KLEUR.wit, border: `1px solid ${KLEUR.rand}` }}
    >
      <div
        className="px-6 py-4 md:px-8 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
        style={{ backgroundColor: KLEUR.zand, borderBottom: `1px solid ${KLEUR.rand}` }}
      >
        <span className="label-eyebrow">Deel van je zonnestroom dat je zelf verbruikt</span>
        <span className="text-[14px]" style={{ color: KLEUR.navy, opacity: 0.6 }}>
          Gemiddelden voor een huishouden
        </span>
      </div>

      {ZELFVERBRUIK.map((rij, i) => (
        <div
          key={rij.naam}
          className="px-6 py-5 md:px-8 grid grid-cols-1 md:grid-cols-[230px_1fr_auto] gap-2 md:gap-8 md:items-center"
          style={{ borderTop: i === 0 ? "none" : `1px solid ${KLEUR.rand}` }}
        >
          <div>
            <span className="block text-[16px] font-semibold" style={{ color: KLEUR.navy }}>
              {rij.naam}
            </span>
            <span
              className="mt-1 block text-[13.5px] leading-snug md:hidden lg:block"
              style={{ color: KLEUR.navy, opacity: 0.6 }}
            >
              {rij.toelichting}
            </span>
          </div>
          <div
            className="h-8 w-full overflow-hidden rounded-md"
            style={{ backgroundColor: "hsl(var(--primary) / 0.06)" }}
            aria-hidden="true"
          >
            <div
              className="h-full"
              style={{
                width: `${rij.deel}%`,
                backgroundColor: i === 0 ? "hsl(var(--primary) / 0.3)" : KLEUR.goud,
              }}
            />
          </div>
          <span
            className="font-display tabular-nums text-right"
            style={{ color: KLEUR.navy, fontWeight: 700, fontSize: 22, lineHeight: 1.1 }}
          >
            {rij.deel} procent
          </span>
        </div>
      ))}

      <div
        className="px-6 py-5 md:px-8 flex flex-wrap gap-x-8 gap-y-3"
        style={{ backgroundColor: KLEUR.zand, borderTop: `1px solid ${KLEUR.rand}` }}
      >
        {KRUISLINKS.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="inline-flex items-center gap-1.5 text-[15px] font-semibold underline-offset-4 transition-colors hover:underline"
            style={{ color: KLEUR.navy }}
          >
            {link.label}
            <ArrowRight size={15} aria-hidden="true" />
          </a>
        ))}
      </div>
    </div>

    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
      <div
        className="rounded-2xl p-5 md:p-6"
        style={{ backgroundColor: KLEUR.wit, border: `1px solid ${KLEUR.rand}` }}
      >
        <span className="label-eyebrow">De beste momenten om te laden</span>
        {/* Inline margin, want een `mt-4`-klasse verliest het van deze style. */}
        <ul className="flex flex-col gap-3" style={{ listStyle: "none", padding: 0, margin: "14px 0 0 0" }}>
          {LAADVENSTERS.map((venster) => (
            <li key={venster.naam}>
              <span className="block text-[16px] font-semibold" style={{ color: KLEUR.navy }}>
                {venster.naam}
              </span>
              <span
                className="text-[14.5px] leading-relaxed"
                style={{ color: KLEUR.navy, opacity: 0.7 }}
              >
                {venster.waarom}
              </span>
            </li>
          ))}
        </ul>
      </div>
      <div
        className="rounded-2xl p-5 md:p-6"
        style={{ backgroundColor: KLEUR.wit, border: `1px solid ${KLEUR.rand}` }}
      >
        <span className="label-eyebrow">Waarom het zoveel uitmaakt</span>
        <p
          className="text-[15.5px] leading-relaxed"
          style={{ color: KLEUR.navy, opacity: 0.85, margin: "14px 0 0 0" }}
        >
          Een nieuwe accu is gemiddeld {ACCU.gemiddeld} kWh. Een huishouden verbruikt op een dag
          minder dan {ACCU.huishoudenPerDag} kWh. Eén keer volladen is dus meer dan zes dagen
          huishouden. Waar en wanneer je die stroom haalt, weegt daarom zwaarder dan bijna elke
          andere keuze in huis.
        </p>
      </div>
    </div>

    <p className="mt-5 text-[13px] leading-relaxed" style={{ color: KLEUR.navy, opacity: 0.55 }}>
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
