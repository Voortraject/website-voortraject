import { ArrowRight, Leaf, TrendingUp, Zap } from "lucide-react";

import { BRONNEN, EERST_DIT, MILIEU, ONTWIKKELINGEN, OORDEEL, UITZONDERINGEN } from "@/data/thuisbatterij";
import { Accent, IconCirkel, SectieKop } from "@/components/maatregel/primitieven";

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
    <div className="hs-tegel vd-oker mx-auto mt-7 max-w-[820px] p-5 text-center md:mt-8 md:p-8" data-veer>
      <span className="vd-label">Ons eerlijke antwoord</span>
      <h3 className="m-0 mt-2.5 font-['Inter_Tight',sans-serif] text-[clamp(23px,3vw,32px)] font-bold leading-[1.2] tracking-[-0.02em] text-primary [text-wrap:balance]">
        {OORDEEL.kop}
      </h3>
      <p className="mx-auto mb-0 mt-3 max-w-[620px] text-[16px] leading-relaxed text-foreground">
        {OORDEEL.kern} Dat je hem op je stroomrekening niet terugverdient is niet onze mening
        maar de conclusie van {OORDEEL.bron}, en wij zeggen het er liever bij dan dat je er
        achteraf achter komt. Hieronder staat wanneer de rekensom bij jou anders uitpakt.
      </p>
    </div>

    {/* Waarom je er tóch over hoort */}
    <div className="hs-tegel hs-blauw-zacht mt-4 p-5 md:mt-6 md:p-8" data-veer>
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8">
          <span className="vd-label">Waarom je er overal over hoort</span>
          <span className="vd-tekst max-w-[560px] text-[14px]">
            Er verandert echt iets aan hoe stroom wordt afgerekend. Dat maakt opslaan elk jaar
            aantrekkelijker; of het bij jou uit kan hangt af van je verbruik en je contract.
          </span>
        </div>
        <IconCirkel Icon={TrendingUp} size={36} />
      </div>
      <div className="mt-5 grid grid-cols-1 gap-x-8 gap-y-3.5 sm:grid-cols-2 md:mt-6 lg:grid-cols-4">
        {ONTWIKKELINGEN.map((punt) => (
          <div key={punt.kop}>
            <span className="block text-[15px] font-bold leading-[1.4] text-primary">{punt.kop}</span>
            <span className="vd-tekst mt-1 block text-[14px]">{punt.tekst}</span>
          </div>
        ))}
      </div>
    </div>

    <div className="mt-4 grid grid-cols-1 gap-4 md:mt-6 lg:grid-cols-2 lg:gap-6">
      {/* Wanneer het nu al loont */}
      <div className="hs-tegel hs-groen p-5 md:p-7" data-veer>
        <div className="flex items-center justify-between gap-3">
          <span className="vd-label">Wanneer het nu al loont</span>
          <IconCirkel Icon={Zap} kleur="groen" size={36} />
        </div>
        <div className="mt-4 flex flex-col gap-3.5">
          {UITZONDERINGEN.map((geval) => (
            <div key={geval.kop}>
              <span className="block text-[15.5px] font-bold text-primary">{geval.kop}</span>
              <span className="vd-tekst mt-1 block text-[14.5px]">{geval.tekst}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Wat nu wel meer oplevert */}
      <div className="hs-tegel hs-zand p-5 md:p-7" data-veer>
        <div className="flex items-center justify-between gap-3">
          <span className="vd-label">Wat nu wél meer oplevert</span>
          <IconCirkel Icon={Leaf} kleur="wit" size={36} />
        </div>
        <p className="vd-tekst m-0 mt-3">
          Wil je meer uit je zonnepanelen halen, dan komt dat er in deze volgorde eerder uit dan uit
          opslag.
        </p>
        <div className="mt-4 flex flex-col gap-3">
          {EERST_DIT.map((item) => (
            <div key={item.href}>
              <a href={item.href} className="hs-pijl-link text-[15.5px]">
                {item.label}
                <ArrowRight size={17} strokeWidth={2.2} className="hs-pijl" aria-hidden="true" />
              </a>
              <span className="vd-tekst block text-[14.5px]">{item.tekst}</span>
            </div>
          ))}
        </div>
        <p className="vd-tekst m-0 mt-4 text-[14px]">{MILIEU}</p>
      </div>
    </div>

    <p className="vd-tekst mt-5 text-[13.5px]">
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
