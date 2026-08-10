import { ArrowRight } from "lucide-react";

import { BRONNEN, CV_KETEL_AANVOER, getal, RENDEMENT, VERWARMINGSTEST } from "@/data/warmtepomp";
import { Accent, SectieKop } from "@/components/maatregel/primitieven";
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
      <p
        className="mt-4 mx-auto text-base leading-relaxed"
        style={{ color: KLEUR.navy, opacity: 0.75, maxWidth: 720 }}
      >
        Een warmtepomp maakt water dat een stuk minder heet is dan wat je cv-ketel levert. De vraag
        is dus of jouw woning warm blijft op lagere temperaturen. Dat hoef je niet te schatten: je
        kunt het deze winter zelf uitproberen, zonder dat je iets hoeft te kopen.
      </p>
    </div>

    {/* Bewust items-stretch: de twee kaarten verschillen in lengte, en een
        rafelige onderrand oogt slordiger dan wat witruimte in de kortste. */}
    <div className="mt-10 grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-6 lg:gap-8 items-stretch">
      {/* De test */}
      <div
        className="rounded-2xl p-6 md:p-7"
        style={{ backgroundColor: KLEUR.wit, border: `1px solid ${KLEUR.rand}` }}
      >
        <span className="label-eyebrow">De verwarmingstest</span>
        <h3
          className="mt-2 text-[20px] font-semibold"
          style={{ color: KLEUR.navy, margin: "8px 0 0 0", lineHeight: 1.3 }}
        >
          Zet je cv-ketel een winter lang op {VERWARMINGSTEST.temperatuur} graden
        </h3>
        <ol
          className="mt-6 flex flex-col gap-5"
          style={{ listStyle: "none", padding: 0, margin: "24px 0 0 0" }}
        >
          {VERWARMINGSTEST.stappen.map((stap, i) => (
            <li key={stap.kop} className="flex items-start gap-4">
              <span
                className="flex items-center justify-center rounded-full shrink-0 text-[13px] font-bold"
                style={{
                  width: 28,
                  height: 28,
                  backgroundColor: "hsl(var(--accent) / 0.2)",
                  color: KLEUR.navy,
                }}
                aria-hidden="true"
              >
                {i + 1}
              </span>
              <span className="min-w-0">
                <span
                  className="block text-[16px] font-semibold"
                  style={{ color: KLEUR.navy, lineHeight: 1.4 }}
                >
                  {stap.kop}
                </span>
                <span
                  className="mt-1 block text-[14.5px] leading-relaxed"
                  style={{ color: KLEUR.navy, opacity: 0.75 }}
                >
                  {stap.tekst}
                </span>
              </span>
            </li>
          ))}
        </ol>
        <p className="mt-6 text-[13px] leading-relaxed" style={{ color: KLEUR.navy, opacity: 0.55 }}>
          De test komt van{" "}
          <a
            href={BRONNEN.verwarmingstest.url}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2"
          >
            {BRONNEN.verwarmingstest.naam}
          </a>
          , gecontroleerd op {BRONNEN.verwarmingstest.gecontroleerd}. Je kunt je daar aanmelden en
          krijgt dan een seintje zodra er een koude periode aankomt.
        </p>
      </div>

      {/* Waarom juist vijftig graden */}
      <div
        className="rounded-2xl p-6 md:p-7"
        style={{ backgroundColor: KLEUR.wit, border: `1px solid ${KLEUR.rand}` }}
      >
        <span className="label-eyebrow">Waarom juist dat getal</span>
        <p
          className="text-[15px] leading-relaxed"
          style={{ color: KLEUR.navy, opacity: 0.8, margin: "12px 0 0 0" }}
        >
          Een cv-ketel staat meestal op {CV_KETEL_AANVOER} en heeft warmte in overvloed. Een
          warmtepomp komt daar niet bij in de buurt, en dat is geen gebrek: juist door het water
          minder heet te maken haalt hij zijn rendement. Vijftig graden ligt precies in dat gebied.
        </p>

        <div className="mt-7 flex flex-col gap-4">
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
            className="relative block flex-1 text-[12px] tabular-nums"
            style={{ color: KLEUR.navy, opacity: 0.55, height: 18 }}
          >
            <span className="absolute left-0">{SCHAAL_MIN}°</span>
            <span
              className="absolute -translate-x-1/2 font-semibold"
              style={{ left: `${positie(VERWARMINGSTEST.temperatuur)}%`, opacity: 1 }}
            >
              {VERWARMINGSTEST.temperatuur}°
            </span>
            <span className="absolute right-0">{SCHAAL_MAX}°</span>
          </span>
        </div>

        <p
          className="mt-5 text-[14.5px] leading-relaxed"
          style={{ color: KLEUR.navy, opacity: 0.8, margin: "20px 0 0 0" }}
        >
          Blijft het comfortabel op {VERWARMINGSTEST.temperatuur} graden, dan zit je woning in het
          bereik waarin een volledig elektrische warmtepomp uit de voeten kan. Lukt dat niet, dan
          weet je meteen waar de winst zit: isoleren, of grotere radiatoren, of allebei.
        </p>
        <a
          href="/verduurzamen/isolatie"
          className="mt-5 inline-flex items-center gap-2 text-[15px] font-semibold underline-offset-4 transition-colors hover:underline"
          style={{ color: KLEUR.navy }}
        >
          Zie wat isoleren in jouw woning oplevert
          <ArrowRight size={16} aria-hidden="true" />
        </a>
      </div>
    </div>

    {/* Wat de temperatuur met het rendement doet */}
    <div
      className="mt-6 rounded-2xl p-6 md:p-7"
      style={{ backgroundColor: KLEUR.wit, border: `1px solid ${KLEUR.rand}` }}
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
        <span className="label-eyebrow">Wat dat met het rendement doet</span>
        <span className="text-[14px]" style={{ color: KLEUR.navy, opacity: 0.6 }}>
          Kilowattuur warmte per kilowattuur stroom
        </span>
      </div>

      <p
        className="text-[15px] leading-relaxed"
        style={{ color: KLEUR.navy, opacity: 0.8, margin: "16px 0 0 0", maxWidth: 760 }}
      >
        Een warmtepomp maakt van één kilowattuur stroom meerdere kilowatturen warmte, {RENDEMENT.bereik}.
        Hoeveel precies hangt af van hoe heet het water moet worden en hoe koud het buiten is.
        Dezelfde warmtepomp presteert daardoor heel verschillend in twee huizen.
      </p>

      <div className="mt-7 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        {RENDEMENT.metingen.map((meting) => (
          <div key={meting.buiten}>
            <div className="flex items-baseline gap-2">
              <span className="text-[15px] font-semibold" style={{ color: KLEUR.navy }}>
                {meting.buiten}
              </span>
              <span className="text-[13px]" style={{ color: KLEUR.navy, opacity: 0.6 }}>
                {meting.omschrijving}
              </span>
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

      <p
        className="mt-7 text-[13px] leading-relaxed"
        style={{ color: KLEUR.navy, opacity: 0.55, margin: "28px 0 0 0" }}
      >
        Over een heel jaar gemeten heet dit de SCOP. Met alleen radiatoren komt een
        lucht-warmtepomp uit op ongeveer {getal(RENDEMENT.scopRadiatoren)}; haalt hij de warmte uit
        de bodem, dan is {RENDEMENT.scopBodem} haalbaar. Cijfers van{" "}
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
      <span
        className="block text-[13px] font-semibold"
        style={{ color: KLEUR.navy, opacity: 0.8 }}
      >
        {label}
      </span>
      <span
        className="block text-[12px] tabular-nums"
        style={{ color: KLEUR.navy, opacity: 0.6 }}
      >
        {tekst}
      </span>
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
    <span
      className="shrink-0 text-[14px]"
      style={{ color: KLEUR.navy, opacity: 0.8, width: 116 }}
    >
      {label}
    </span>
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
    <span
      className="shrink-0 text-[15px] font-bold tabular-nums"
      style={{ color: KLEUR.navy, width: 34, textAlign: "right" }}
    >
      {getal(waarde)}
    </span>
  </div>
);
