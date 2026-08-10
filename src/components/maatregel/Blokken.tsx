import { ArrowRight, Check, ShieldCheck, Wrench } from "lucide-react";
import type { ReactNode } from "react";

import { Accent, IconCirkel, Kaart, KaartTekst, KaartTitel, SectieIntro, SectieKop } from "./primitieven";
import { KLEUR } from "./stijl";

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
  <div
    className="rounded-2xl p-6 md:p-8"
    style={{ backgroundColor: KLEUR.zand, border: `1px solid ${KLEUR.rand}` }}
  >
    <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
      <span className="label-eyebrow">{kop.replace(/\[\[|\]\]/g, "")}</span>
      {intro && (
        <span className="text-[14px]" style={{ color: KLEUR.navy, opacity: 0.6 }}>
          {intro}
        </span>
      )}
    </div>
    <ul
      className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-3.5"
      style={{ listStyle: "none", padding: 0, margin: "20px 0 0 0" }}
    >
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3">
          <Check
            size={17}
            className="mt-[3px] shrink-0"
            style={{ color: KLEUR.goud }}
            strokeWidth={2.5}
            aria-hidden="true"
          />
          <span style={{ fontSize: 15.5, lineHeight: 1.55, color: KLEUR.navy, opacity: 0.85 }}>
            {item}
          </span>
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
 * (`aandachtspunten`) en werd niet getoond, terwijl het juist het onafhankelijke
 * advies is waar Voortraject op wordt beoordeeld.
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
      <SectieKop center><Accent tekst={kop} /></SectieKop>
    </div>
    {/* Eén paneel met genummerde regels in plaats van losse kaarten in een
        raster. Een raster laat bij drie of vijf punten een gat vallen en de
        korte teksten zwemmen dan in te brede kaarten. Als doorlopende lijst
        oogt het compleet bij elk aantal en leest het als advies. */}
    <ol
      className="mt-10 mx-auto max-w-[880px] rounded-2xl overflow-hidden"
      style={{
        backgroundColor: KLEUR.wit,
        border: `1px solid ${KLEUR.rand}`,
        listStyle: "none",
        padding: 0,
        margin: "40px auto 0 auto",
      }}
    >
      {items.map((item, i) => (
        <li
          key={item}
          className="flex items-baseline gap-5 px-6 py-5 md:px-8"
          style={{
            borderTop: i === 0 ? "none" : `1px solid ${KLEUR.rand}`,
          }}
        >
          <span
            className="font-display shrink-0 tabular-nums"
            style={{
              color: KLEUR.goud,
              fontWeight: 700,
              fontSize: 26,
              lineHeight: 1,
              width: 30,
            }}
            aria-hidden="true"
          >
            {String(i + 1).padStart(2, "0")}
          </span>
          <span style={{ fontSize: 16, lineHeight: 1.6, color: KLEUR.navy, opacity: 0.85 }}>
            {item}
          </span>
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
 * Certificeringen die bij deze maatregel horen. Nu zichtbaar als kaarten met
 * een schildicoon: het is een van de sterkste vertrouwenssignalen op deze
 * pagina's en het stond volledig verstopt.
 */
export const Keurmerken = ({ data }: { data: KeurmerkenData }) => (
  <>
    <div className="text-center">
      <SectieKop center><Accent tekst={data.kop ?? "Let op [[keurmerken]] en certificeringen"} /></SectieKop>
      <SectieIntro center>{data.intro}</SectieIntro>
    </div>
    <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
      {data.items.map((item) => (
        <div
          key={item}
          className="rounded-2xl p-5 flex items-start gap-4"
          style={{ backgroundColor: KLEUR.zand, border: `1px solid ${KLEUR.rand}` }}
        >
          <span
            className="flex items-center justify-center rounded-full shrink-0"
            style={{ width: 34, height: 34, backgroundColor: "hsl(var(--accent) / 0.2)" }}
          >
            <ShieldCheck size={18} color={KLEUR.navy} aria-hidden="true" />
          </span>
          <span style={{ fontSize: 15.5, lineHeight: 1.6, color: KLEUR.navy, opacity: 0.85 }}>
            {item}
          </span>
        </div>
      ))}
    </div>
    {data.voetregel && (
      <p
        className="mt-7 text-center text-[15px] leading-relaxed mx-auto"
        style={{ color: KLEUR.navy, opacity: 0.7, maxWidth: 640 }}
      >
        {data.voetregel}
      </p>
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
  <div className="grid grid-cols-1 md:grid-cols-5 gap-8 md:gap-12 items-start">
    <div className="md:col-span-2">
      <SectieKop><Accent tekst="Subsidies bij deze [[maatregel]]" /></SectieKop>
      <p
        className="mt-4 text-base leading-relaxed"
        style={{ color: KLEUR.navy, opacity: 0.78 }}
      >
        {intro}
      </p>
      <a
        href={linkHref}
        className="mt-6 inline-flex items-center gap-2 text-[15px] font-semibold underline-offset-4 transition-colors hover:underline"
        style={{ color: KLEUR.navy }}
      >
        {linkLabel}
        <ArrowRight size={16} aria-hidden="true" />
      </a>
    </div>
    {items.length > 0 && (
      <div className="md:col-span-3">
        <ul
          className="flex flex-col gap-3"
          style={{ listStyle: "none", padding: 0, margin: 0 }}
        >
          {items.map((item) => (
            <li
              key={item}
              className="flex items-start gap-3.5 rounded-2xl p-5"
              style={{ backgroundColor: KLEUR.zand, border: `1px solid ${KLEUR.rand}` }}
            >
              <Check
                size={18}
                className="mt-[3px] shrink-0"
                style={{ color: KLEUR.goud }}
                strokeWidth={2.5}
                aria-hidden="true"
              />
              <span style={{ fontSize: 15.5, lineHeight: 1.6, color: KLEUR.navy, opacity: 0.85 }}>
                {item}
              </span>
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
      <SectieKop center><Accent tekst={kop} /></SectieKop>
      {intro && <SectieIntro center>{intro}</SectieIntro>}
    </div>
    <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
      {items.map((item, i) => (
        <div
          key={item}
          className="rounded-2xl p-5"
          style={{ backgroundColor: KLEUR.wit, border: `1px solid ${KLEUR.rand}` }}
        >
          <span
            className="inline-flex items-center justify-center rounded-full text-[13px] font-bold"
            style={{ width: 28, height: 28, backgroundColor: "hsl(var(--accent) / 0.2)", color: KLEUR.navy }}
          >
            {i + 1}
          </span>
          <p
            className="mt-3 text-[15px] leading-relaxed"
            style={{ color: KLEUR.navy, opacity: 0.85, margin: "12px 0 0 0" }}
          >
            {item}
          </p>
        </div>
      ))}
    </div>
    {voetregel && (
      <p
        className="mt-7 text-center text-[15px] leading-relaxed mx-auto"
        style={{ color: KLEUR.navy, opacity: 0.7, maxWidth: 700 }}
      >
        {voetregel}
      </p>
    )}
  </>
);

/** Kaart met één alinea en één link. Voor onderhoud- en combineerblokken. */
export const LinkKaart = ({
  Icon = Wrench,
  kop,
  tekst,
  links,
}: {
  Icon?: React.ComponentType<{ size?: number; "aria-hidden"?: boolean }>;
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
        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="inline-flex items-center gap-1.5 text-[15px] font-semibold underline-offset-4 transition-colors hover:underline"
              style={{ color: KLEUR.navy }}
            >
              {l.label}
              <ArrowRight size={15} aria-hidden="true" />
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
    <SectieKop><Accent tekst={kop} /></SectieKop>
    <div className="mt-8">{children}</div>
  </>
);
