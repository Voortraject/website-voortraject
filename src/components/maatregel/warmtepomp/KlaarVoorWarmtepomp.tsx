import { ArrowRight } from "lucide-react";

import { BRONNEN, CV_KETEL_AANVOER, getal, RENDEMENT, VERWARMINGSTEST } from "@/data/warmtepomp";
import { Accent, NummerRondje, SectieKop } from "@/components/maatregel/primitieven";
import { KLEUR } from "@/components/maatregel/stijl";

/**
 * "Is mijn woning er klaar voor" is de vraag achter de vraag, en het antwoord
 * is niet iets wat je hoeft te geloven: je kunt het zelf meten met de ketel die
 * er nu hangt. Vijftig graden is ongeveer wat een warmtepomp levert, dus blijft
 * je woning daarop warm, dan kan hij het aan.
 *
 * De schaal ernaast laat zien waarom juist dat getal, en het rendementsblok
 * eronder laat zien wat er op het spel staat: dezelfde warmtepomp levert met
 * vloerverwarming ruim een derde meer warmte per kilowattuur dan met alleen
 * radiatoren.
 */

/** De schaal loopt van 20 tot 90 graden; alles daarbinnen is een percentage. */
const SCHAAL_MIN = 20;
const SCHAAL_MAX = 90;
const positie = (graden: number) => ((graden - SCHAAL_MIN) / (SCHAAL_MAX - SCHAAL_MIN)) * 100;

/** Hoogste rendementswaarde in het blok, zodat de balken een vaste maat delen. */
const COP_SCHAAL = 6;

export const KlaarVoorWarmtepomp = () => (
  <>
    <div className="text-center">
      <SectieKop center>
        <Accent tekst="Is jouw woning er [[klaar voor]]?" />
      </SectieKop>
      <p className="vd-lead mx-auto mt-3 max-w-[640px]">
        Een warmtepomp maakt minder heet water dan je cv-ketel. Blijft jouw woning daarop warm? Dat
        hoef je niet te schatten, je kunt het deze winter zelf uitproberen.
      </p>
    </div>

    {/* Bewust items-stretch: de twee kaarten verschillen in lengte, en een
        rafelige onderrand oogt slordiger dan wat witruimte in de kortste. */}
    <div className="mt-7 grid grid-cols-1 items-stretch gap-4 md:mt-10 lg:grid-cols-[1.05fr_1fr] lg:gap-6">
      {/* De test */}
      <div className="hs-tegel hs-blauw-zacht p-5 md:p-7" data-veer>
        <span className="vd-label">De verwarmingstest</span>
        <h3 className="hs-h3 mb-0 mt-2">
          Zet je cv-ketel een winter lang op {VERWARMINGSTEST.temperatuur} graden
        </h3>
        <ol className="mx-0 mb-0 mt-5 flex list-none flex-col gap-4 p-0 md:mt-6 md:gap-5">
          {VERWARMINGSTEST.stappen.map((stap, i) => (
            <li key={stap.kop} className="flex items-start gap-4">
              <NummerRondje n={i + 1} size={32} />
              <span className="min-w-0 pt-1">
                <span className="block text-[16px] font-bold leading-[1.4] text-primary">{stap.kop}</span>
                <span className="vd-tekst mt-1 block text-[14.5px]">
                  {stap.tekst}
                </span>
              </span>
            </li>
          ))}
        </ol>
        <p className="mb-0 mt-5 text-[13.5px] leading-relaxed text-[hsl(var(--rs-tekst-zacht))] md:mt-6">
          De test komt van{" "}
          <a
            href={BRONNEN.verwarmingstest.url}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2"
          >
            {BRONNEN.verwarmingstest.naam}
          </a>
          , gecontroleerd op {BRONNEN.verwarmingstest.gecontroleerd}. Daar kun je je aanmelden voor
          een seintje zodra het koud wordt.
        </p>
      </div>

      {/* Waarom juist vijftig graden */}
      <div className="hs-tegel hs-zand p-5 md:p-7" data-veer>
        <span className="vd-label">Waarom juist dat getal</span>
        <p className="vd-tekst mb-0 mt-3">
          Een cv-ketel staat meestal op {CV_KETEL_AANVOER}. Een warmtepomp komt daar niet bij in de
          buurt, en dat is geen gebrek: juist door het water minder heet te maken haalt hij zijn
          rendement. Vijftig graden ligt precies in dat gebied.
        </p>

        <div className="mt-6 flex flex-col gap-4 md:mt-7">
          <Balk
            label="Warmtepomp"
            van={30}
            tot={55}
            kleur={KLEUR.goud}
            tekst="30 tot 55 graden"
          />
          <Balk
            label="Cv-ketel"
            van={60}
            tot={80}
            kleur="hsl(var(--primary) / 0.35)"
            tekst={`${CV_KETEL_AANVOER}`}
          />
        </div>

        {/* Aslabels: alleen de uiteinden en het testgetal. Zelfde indeling als
            de balken hierboven, zodat de streep bij 50 graden echt onder de
            streep in de balken staat. */}
        <div className="mt-2 flex gap-3" aria-hidden="true">
          <span className="shrink-0" style={{ width: 96 }} />
          <span
            className="relative block h-[18px] flex-1 text-[12px] tabular-nums text-[hsl(var(--rs-tekst-zacht))]"
          >
            <span className="absolute left-0">{SCHAAL_MIN}°</span>
            <span
              className="absolute -translate-x-1/2 font-bold text-primary"
              style={{ left: `${positie(VERWARMINGSTEST.temperatuur)}%` }}
            >
              {VERWARMINGSTEST.temperatuur}°
            </span>
            <span className="absolute right-0">{SCHAAL_MAX}°</span>
          </span>
        </div>

        <p className="vd-tekst mb-0 mt-5 text-[14.5px]">
          Lukt het niet op {VERWARMINGSTEST.temperatuur} graden, dan weet je meteen waar de winst
          zit: isoleren, of grotere radiatoren, of allebei.
        </p>
        <a href="/verduurzamen/isolatie" className="hs-pijl-link mt-3">
          Zie wat isoleren in jouw woning oplevert
          <ArrowRight size={17} strokeWidth={2.2} className="hs-pijl" aria-hidden="true" />
        </a>
      </div>
    </div>

    {/* Wat de temperatuur met het rendement doet */}
    <div className="hs-tegel hs-blauw-zacht mt-4 p-5 md:mt-6 md:p-7" data-veer>
      <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
        <span className="vd-label">Wat dat met het rendement doet</span>
        <span className="vd-tekst text-[14px]">Kilowattuur warmte per kilowattuur stroom</span>
      </div>

      <p className="vd-tekst mb-0 mt-3 max-w-[760px]">
        Eén kilowattuur stroom levert {RENDEMENT.bereik} kilowattuur warmte op. Hoeveel precies
        hangt af van je afgiftesysteem en de buitentemperatuur, dus dezelfde warmtepomp presteert in
        twee huizen heel verschillend.
      </p>

      <div className="mt-5 grid grid-cols-1 gap-3 md:mt-7 md:grid-cols-2 md:gap-5">
        {RENDEMENT.metingen.map((meting) => (
          <div key={meting.buiten} className="vd-wit p-4 md:p-5">
            <div className="flex flex-wrap items-baseline gap-x-2">
              <span className="text-[15px] font-bold text-primary">{meting.buiten}</span>
              <span className="text-[13.5px] text-[hsl(var(--rs-tekst-zacht))]">{meting.omschrijving}</span>
            </div>
            <div className="mt-4 flex flex-col gap-3">
              <CopBalk label="Vloerverwarming" waarde={meting.vloer} kleur={KLEUR.goud} />
              <CopBalk
                label="Radiatoren"
                waarde={meting.radiator}
                kleur="hsl(var(--accent) / 0.45)"
              />
            </div>
          </div>
        ))}
      </div>

      <p className="mb-0 mt-5 text-[13.5px] leading-relaxed text-[hsl(var(--rs-tekst-zacht))] md:mt-7">
        Over een heel jaar gemeten heet dit de SCOP: met alleen radiatoren ongeveer{" "}
        {getal(RENDEMENT.scopRadiatoren)}, met warmte uit de bodem {RENDEMENT.scopBodem}. Cijfers
        van{" "}
        <a
          href={BRONNEN.rendement.url}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2"
        >
          {BRONNEN.rendement.naam}
        </a>
        , gecontroleerd op {BRONNEN.rendement.gecontroleerd}.
      </p>
    </div>
  </>
);

/** Eén temperatuurbereik op de gedeelde schaal van 20 tot 90 graden. */
const Balk = ({
  label,
  van,
  tot,
  kleur,
  tekst,
}: {
  label: string;
  van: number;
  tot: number;
  kleur: string;
  tekst: string;
}) => (
  <div className="flex items-center gap-3">
    <span className="shrink-0" style={{ width: 96 }}>
      <span className="block text-[13.5px] font-bold text-primary">{label}</span>
      <span className="block text-[12px] tabular-nums text-[hsl(var(--rs-tekst-zacht))]">{tekst}</span>
    </span>
    <span className="relative block flex-1" style={{ height: 30 }}>
      {/* De hele schaal als rustige onderlaag */}
      <span
        className="absolute rounded-full"
        style={{ inset: "12px 0", backgroundColor: "hsl(var(--primary) / 0.07)" }}
        aria-hidden="true"
      />
      <span
        className="absolute rounded-full"
        style={{
          left: `${positie(van)}%`,
          width: `${positie(tot) - positie(van)}%`,
          top: 6,
          bottom: 6,
          backgroundColor: kleur,
        }}
        aria-hidden="true"
      />
      {/* De testtemperatuur als streep door beide balken heen */}
      <span
        className="absolute"
        style={{
          left: `${positie(VERWARMINGSTEST.temperatuur)}%`,
          top: 0,
          bottom: 0,
          width: 2,
          backgroundColor: KLEUR.navy,
          opacity: 0.5,
        }}
        aria-hidden="true"
      />
      <span className="sr-only">
        {label}: {tekst}
      </span>
    </span>
  </div>
);

/** Eén rendementswaarde als balk, geschaald op COP_SCHAAL. */
const CopBalk = ({ label, waarde, kleur }: { label: string; waarde: number; kleur: string }) => (
  <div className="flex items-center gap-3">
    <span className="w-[116px] shrink-0 text-[14px] font-semibold text-foreground">{label}</span>
    <span className="relative block flex-1" style={{ height: 22 }}>
      <span
        className="absolute rounded-full"
        style={{ inset: "4px 0", backgroundColor: "hsl(var(--primary) / 0.07)" }}
        aria-hidden="true"
      />
      <span
        className="absolute rounded-full"
        style={{
          left: 0,
          width: `${(waarde / COP_SCHAAL) * 100}%`,
          top: 0,
          bottom: 0,
          backgroundColor: kleur,
        }}
        aria-hidden="true"
      />
    </span>
    <span className="w-[34px] shrink-0 text-right text-[15px] font-extrabold tabular-nums text-primary">
      {getal(waarde)}
    </span>
  </div>
);
