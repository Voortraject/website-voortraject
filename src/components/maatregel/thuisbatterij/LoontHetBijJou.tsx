import { ArrowRight } from "lucide-react";

import { BRONNEN, EERST_DIT, MILIEU, ONTWIKKELINGEN, OORDEEL, UITZONDERINGEN } from "@/data/thuisbatterij";
import { Accent, SectieKop } from "@/components/maatregel/primitieven";
import { KLEUR } from "@/components/maatregel/stijl";

/**
 * Het antwoord vooraan, en dat antwoord begint bij waarvoor een batterij nu al
 * wél zinvol is.
 *
 * Milieu Centraal is stellig over terugverdienen: met wat een batterij op je
 * stroomrekening bespaart, kom je er op dit moment niet uit. Dat blijft hier
 * staan, met bron, want wij verkopen geen batterijen. Alleen is dat een
 * antwoord op één vraag, niet op de vraag of een batterij bij jou past: bij
 * netcongestie, noodstroom of een dynamisch contract ligt de afweging anders.
 * Daarom staat die kant vooraan en het terugverdienen erachter.
 *
 * Daarna de nuance: waarom je er overal over hoort, wanneer het nu al loont, en
 * wat op dit moment meer oplevert.
 */

export const LoontHetBijJou = () => (
  <>
    <div className="text-center">
      <SectieKop center>
        <Accent tekst="Loont een thuisbatterij [[bij jou]]?" />
      </SectieKop>
    </div>

    {/* Het antwoord, groot en zonder omweg */}
    <div
      className="mt-8 mx-auto rounded-2xl p-6 md:p-8 text-center"
      style={{
        maxWidth: 820,
        backgroundColor: "hsl(var(--accent) / 0.14)",
        border: "1px solid hsl(var(--accent) / 0.45)",
      }}
    >
      <span className="label-eyebrow">Ons eerlijke antwoord</span>
      <h3
        className="font-display mt-3"
        style={{
          color: KLEUR.navy,
          fontWeight: 700,
          fontSize: "clamp(24px, 3vw, 32px)",
          lineHeight: 1.2,
          margin: "12px 0 0 0",
        }}
      >
        {OORDEEL.kop}
      </h3>
      <p
        className="mx-auto text-[16px] leading-relaxed"
        style={{ color: KLEUR.navy, opacity: 0.85, margin: "14px auto 0 auto", maxWidth: 620 }}
      >
        {OORDEEL.kern} Dat je hem op je stroomrekening niet terugverdient is niet onze mening
        maar de conclusie van {OORDEEL.bron}, en wij zeggen het er liever bij dan dat je er
        achteraf achter komt. Hieronder staat wanneer de rekensom bij jou anders uitpakt.
      </p>
    </div>

    {/* Waarom je er tóch over hoort */}
    <div
      className="mt-6 rounded-2xl p-6 md:p-8"
      style={{ backgroundColor: KLEUR.wit, border: `1px solid ${KLEUR.rand}` }}
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8">
        <span className="label-eyebrow">Waarom je er overal over hoort</span>
        <span
          className="text-[14px] leading-relaxed"
          style={{ color: KLEUR.navy, opacity: 0.65, maxWidth: 560 }}
        >
          Er verandert echt iets aan hoe stroom wordt afgerekend. Dat maakt opslaan elk jaar
          aantrekkelijker; of het bij jou uit kan hangt af van je verbruik en je contract.
        </span>
      </div>
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-4">
        {ONTWIKKELINGEN.map((punt) => (
          <div key={punt.kop}>
            <span
              className="block text-[15px] font-semibold"
              style={{ color: KLEUR.navy, lineHeight: 1.4 }}
            >
              {punt.kop}
            </span>
            <span
              className="mt-1 block text-[14px] leading-relaxed"
              style={{ color: KLEUR.navy, opacity: 0.65 }}
            >
              {punt.tekst}
            </span>
          </div>
        ))}
      </div>
    </div>

    <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Wanneer het nu al loont */}
      <div
        className="rounded-2xl p-6 md:p-7"
        style={{ backgroundColor: KLEUR.wit, border: `1px solid ${KLEUR.rand}` }}
      >
        <span className="label-eyebrow">Wanneer het nu al loont</span>
        <div className="mt-5 flex flex-col gap-4">
          {UITZONDERINGEN.map((geval) => (
            <div key={geval.kop}>
              <span className="block text-[15.5px] font-semibold" style={{ color: KLEUR.navy }}>
                {geval.kop}
              </span>
              <span
                className="mt-1 block text-[14.5px] leading-relaxed"
                style={{ color: KLEUR.navy, opacity: 0.7 }}
              >
                {geval.tekst}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Wat nu wel meer oplevert */}
      <div
        className="rounded-2xl p-6 md:p-7"
        style={{ backgroundColor: KLEUR.wit, border: `1px solid ${KLEUR.rand}` }}
      >
        <span className="label-eyebrow">Wat nu wél meer oplevert</span>
        <p
          className="text-[15px] leading-relaxed"
          style={{ color: KLEUR.navy, opacity: 0.75, margin: "12px 0 0 0" }}
        >
          Wil je meer uit je zonnepanelen halen, dan komt dat er in deze volgorde eerder uit dan uit
          opslag.
        </p>
        <div className="mt-5 flex flex-col gap-4">
          {EERST_DIT.map((item) => (
            <div key={item.href}>
              <a
                href={item.href}
                className="inline-flex items-center gap-2 text-[15.5px] font-semibold underline-offset-4 transition-colors hover:underline"
                style={{ color: KLEUR.navy }}
              >
                {item.label}
                <ArrowRight size={15} aria-hidden="true" />
              </a>
              <span
                className="mt-0.5 block text-[14.5px] leading-relaxed"
                style={{ color: KLEUR.navy, opacity: 0.7 }}
              >
                {item.tekst}
              </span>
            </div>
          ))}
        </div>
        <p
          className="text-[14px] leading-relaxed"
          style={{ color: KLEUR.navy, opacity: 0.65, margin: "20px 0 0 0" }}
        >
          {MILIEU}
        </p>
      </div>
    </div>

    <p className="mt-5 text-[13px] leading-relaxed" style={{ color: KLEUR.navy, opacity: 0.55 }}>
      Het oordeel en de milieu-afweging komen van{" "}
      <a
        href={BRONNEN.analyse.url}
        target="_blank"
        rel="noopener noreferrer"
        className="underline underline-offset-2"
      >
        {BRONNEN.analyse.naam}
      </a>
      , gecontroleerd op {BRONNEN.analyse.gecontroleerd}. Dat salderen op 1 januari 2027 stopt staat
      bij de{" "}
      <a
        href={BRONNEN.saldering.url}
        target="_blank"
        rel="noopener noreferrer"
        className="underline underline-offset-2"
      >
        {BRONNEN.saldering.naam}
      </a>
      .
    </p>
  </>
);
