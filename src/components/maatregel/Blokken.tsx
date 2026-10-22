import { ArrowRight, Check, ShieldCheck, Wrench } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Accent, IconCirkel, Kaart, KaartTekst, KaartTitel, NummerRondje, SectieIntro, SectieKop } from "./primitieven";

/* ------------------------------------------------------------------ *
 * Wat valt hieronder
 * ------------------------------------------------------------------ */

/**
 * De onderdelen die onder een maatregel vallen. Stond al op elke pagina in
 * `watValtEronder`, maar werd niet gerenderd.
 *
 * Bewust géén sectiekop: dit is de afbakening van de maatregel, geen
 * hoofdstuk. Een volle kop kostte een derde van de breedte aan witruimte voor
 * drie woorden. Nu één strip over de volle breedte met een klein bovenschrift,
 * zodat de inhoud de ruimte krijgt in plaats van de titel.
 */
export const WatValtEronder = ({
  kop = "Wat valt hieronder",
  intro,
  items,
}: {
  kop?: string;
  intro?: string;
  items: string[];
}) => (
  <div className="hs-tegel hs-zand p-5 md:p-8" data-veer>
    <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
      <span className="vd-label">{kop.replace(/\[\[|\]\]/g, "")}</span>
      {intro && <span className="vd-tekst text-[14px]">{intro}</span>}
    </div>
    <ul className="mt-5 grid list-none grid-cols-1 gap-x-10 gap-y-3.5 p-0 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3">
          <Check
            size={17}
            className="mt-[3px] shrink-0 text-[hsl(var(--subsidie))]"
            strokeWidth={2.6}
            aria-hidden="true"
          />
          <span className="text-[15.5px] leading-[1.55] text-foreground">{item}</span>
        </li>
      ))}
    </ul>
  </div>
);

/* ------------------------------------------------------------------ *
 * Aandachtspunten
 * ------------------------------------------------------------------ */

/**
 * "Waar wij in de praktijk op letten". Ook dit stond al op elke pagina
 * (`aandachtspunten`) en werd niet getoond, terwijl het juist het advies is
 * waar Voortraject op wordt beoordeeld.
 */
export const Aandachtspunten = ({
  kop = "Waar wij in de praktijk op [[letten]]",
  items,
}: {
  kop?: string;
  items: string[];
}) => (
  <>
    <div className="text-center">
      <SectieKop center>
        <Accent tekst={kop} />
      </SectieKop>
    </div>
    {/* Eén tegel met genummerde regels in plaats van losse kaarten in een
        raster. Een raster laat bij drie of vijf punten een gat vallen en de
        korte teksten zwemmen dan in te brede kaarten. Als doorlopende lijst
        oogt het compleet bij elk aantal en leest het als advies. Inktblauwe
        rondjes in plaats van lijnen tussen de regels. */}
    <ol
      className="hs-tegel hs-blauw-zacht mx-auto mt-7 grid max-w-[880px] list-none gap-5 p-5 md:mt-10 md:gap-6 md:p-8"
      data-veer
    >
      {items.map((item, i) => (
        <li key={item} className="flex items-start gap-4">
          <NummerRondje n={i + 1} />
          <span className="pt-1.5 text-[16px] leading-[1.6] text-foreground">{item}</span>
        </li>
      ))}
    </ol>
  </>
);

/* ------------------------------------------------------------------ *
 * Keurmerken en certificeringen
 * ------------------------------------------------------------------ */

export interface KeurmerkenData {
  kop?: string;
  intro: string;
  items: string[];
  voetregel?: string;
}

/**
 * Certificeringen die bij deze maatregel horen, als tegels met een schildicoon:
 * het is een van de sterkste vertrouwenssignalen op deze pagina's.
 */
export const Keurmerken = ({ data }: { data: KeurmerkenData }) => (
  <>
    <div className="text-center">
      <SectieKop center>
        <Accent tekst={data.kop ?? "Let op [[keurmerken]] en certificeringen"} />
      </SectieKop>
      <SectieIntro center>{data.intro}</SectieIntro>
    </div>
    <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2 md:mt-10 md:gap-5">
      {data.items.map((item) => (
        <div key={item} className="hs-tegel hs-blauw-zacht flex items-start gap-4 p-5" data-veer>
          <IconCirkel Icon={ShieldCheck} size={36} />
          <span className="pt-1 text-[15.5px] leading-[1.6] text-foreground">{item}</span>
        </div>
      ))}
    </div>
    {data.voetregel && (
      <p className="vd-tekst mx-auto mt-6 max-w-[640px] text-center md:mt-7">{data.voetregel}</p>
    )}
  </>
);

/* ------------------------------------------------------------------ *
 * Subsidies bij deze maatregel
 * ------------------------------------------------------------------ */

export const SubsidieBlok = ({
  intro,
  items,
  linkHref = "/subsidies/stapelen",
  linkLabel = "Bekijk hoe je subsidies stapelt",
}: {
  intro: string;
  items: string[];
  linkHref?: string;
  linkLabel?: string;
}) => (
  <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-5 md:gap-12">
    <div className="md:col-span-2">
      <SectieKop>
        <Accent tekst="Subsidies bij deze [[maatregel]]" />
      </SectieKop>
      <p className="vd-lead mt-3">{intro}</p>
      <a href={linkHref} className="hs-pijl-link mt-4">
        {linkLabel}
        <ArrowRight size={17} strokeWidth={2.2} className="hs-pijl" aria-hidden="true" />
      </a>
    </div>
    {items.length > 0 && (
      <div className="md:col-span-3">
        <ul className="m-0 flex list-none flex-col gap-3 p-0">
          {items.map((item) => (
            <li key={item} className="hs-tegel hs-groen flex items-start gap-3.5 p-5" data-veer>
              <IconCirkel Icon={Check} kleur="groen" size={32} />
              <span className="pt-0.5 text-[15.5px] leading-[1.6] text-foreground">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    )}
  </div>
);

/* ------------------------------------------------------------------ *
 * Losse informatieblokken
 * ------------------------------------------------------------------ */

/** Contextblok, bijvoorbeeld "waarom een thuisbatterij nu in opkomst is". */
export const InfoBlok = ({
  kop,
  intro,
  items,
  voetregel,
}: {
  kop: string;
  intro?: string;
  items: string[];
  voetregel?: string;
}) => (
  <>
    <div className="text-center">
      <SectieKop center>
        <Accent tekst={kop} />
      </SectieKop>
      {intro && <SectieIntro center>{intro}</SectieIntro>}
    </div>
    <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2 md:mt-10 md:gap-5 lg:grid-cols-4">
      {items.map((item, i) => (
        <div key={item} className="hs-tegel hs-blauw-zacht flex items-start gap-4 p-5 sm:block" data-veer>
          <NummerRondje n={i + 1} size={32} />
          <p className="m-0 text-[15px] leading-relaxed text-foreground sm:mt-3">{item}</p>
        </div>
      ))}
    </div>
    {voetregel && <p className="vd-tekst mx-auto mt-6 max-w-[700px] text-center md:mt-7">{voetregel}</p>}
  </>
);

/** Kaart met één alinea en één link. Voor onderhoud- en combineerblokken. */
export const LinkKaart = ({
  Icon = Wrench,
  kop,
  tekst,
  links,
}: {
  Icon?: LucideIcon;
  kop: string;
  tekst: string;
  links: { label: string; href: string }[];
}) => (
  <Kaart>
    <div className="flex items-start gap-4">
      <IconCirkel Icon={Icon} size={40} />
      <div className="min-w-0 flex-1">
        <KaartTitel>{kop}</KaartTitel>
        <KaartTekst>{tekst}</KaartTekst>
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="hs-pijl-link">
              {l.label}
              <ArrowRight size={17} strokeWidth={2.2} className="hs-pijl" aria-hidden="true" />
            </a>
          ))}
        </div>
      </div>
    </div>
  </Kaart>
);

/** Wrapper zodat een sectie één centrale kop met vrije inhoud kan hebben. */
export const BlokMetKop = ({ kop, children }: { kop: string; children: ReactNode }) => (
  <>
    <SectieKop>
      <Accent tekst={kop} />
    </SectieKop>
    <div className="mt-7 md:mt-8">{children}</div>
  </>
);
