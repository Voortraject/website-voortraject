import type { ReactNode } from "react";
import { ArrowRight, ChevronDown, Check, Clock, Wrench } from "lucide-react";
import { BorderRotate } from "@/components/ui/animated-gradient-border";
import type { LucideIcon } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Seo } from "@/components/Seo";
import { CtaButton } from "@/components/CtaButton";
import { OfBelOnsCta } from "@/components/OfBelOnsCta";
import { SubsidiecheckCta } from "@/components/sections/SubsidiecheckCta";
import { MAATREGELEN, type MaatregelSlug, type RouteStap } from "@/data/maatregelen";
import {
  Aandachtspunten,
  InfoBlok,
  Keurmerken,
  LinkKaart,
  SubsidieBlok,
  WatValtEronder,
  type KeurmerkenData,
} from "@/components/maatregel/Blokken";
import { Kruimelpad } from "@/components/maatregel/Kruimelpad";
import { RouteStrip } from "@/components/maatregel/RouteStrip";
import { maatregelJsonLd } from "@/components/maatregel/jsonLd";
import { Accent, Kaart, KaartTekst, KaartTitel, Sectie, SectieKop } from "@/components/maatregel/primitieven";
import { KLEUR, type SectieBg } from "@/components/maatregel/stijl";

export type RouteStep = RouteStap;

/**
 * De pillen benoemen wat een maatregel oplevert. Investering en
 * terugverdientijd horen daar alleen bij als ze gunstig zijn ("Laag", "Kort");
 * "Hoog" of "Lang" hangt aan de woning en niet aan de maatregel, en als stempel
 * op een kaart leest het als een afrader. Wat een maatregel duurder maakt,
 * staat in de tekst van de kaart, waar de nuance bij past.
 * src/test/maatregelToon.test.tsx bewaakt dat.
 */
export type KostenDimension =
  | "Investering"
  | "Terugverdientijd"
  | "Comfortwinst"
  | "Besparing"
  | "Geluidsdemping"
  | "Luchtkwaliteit"
  | "Warmteterugwinning"
  | "Onafhankelijkheid"
  | "Gebruiksgemak";

export interface KostenPill {
  dim: KostenDimension | string;
  value: string;
}

export interface CollapsibleItem {
  title: string;
  body: string;
  pills?: KostenPill[];
}

export interface MaatregelFaq {
  q: string;
  a: string;
}

export type KeurmerkenBlock = KeurmerkenData;

export interface ProcesStap {
  title: string;
  body: string;
}

/**
 * Een sectie die alleen op één maatregelpagina hoort. Het gedeelde template
 * levert het ritme en de chrome; de inhoud die een maatregel écht onderscheidt
 * komt van de pagina zelf.
 *
 * `na` bepaalt waar hij landt. `bg` hoort mee te bewegen met het ritme van de
 * pagina: src/test/maatregelPagina.test.tsx controleert dat er nooit twee
 * gelijke achtergronden naast elkaar komen.
 */
export interface EigenSectie {
  na: "hero" | "route" | "kosten" | "subsidies";
  bg: SectieBg;
  inhoud: ReactNode;
  id?: string;
}

export interface MaatregelPaginaProps {
  slug: MaatregelSlug;
  icon: LucideIcon;
  badge?: string;

  seoTitle: string;
  seoDescription: string;

  // Hero
  /** Wrap accent words in [[...]] to render them in gold. */
  heroTitle: string;
  heroSub: string;
  heroIntro: string;
  heroCtaLabel?: string;
  heroCtaHref?: string;
  heroImageSrc?: string;
  heroImageAlt?: string;
  /** CSS object-position voor de hero-afbeelding (bijv. "center 30%"). Default "center". */
  heroImagePosition?: string;

  // Is dit iets voor jou
  voorWieKop?: string;
  /** Regel onder de kop. Overschrijf hem als "past bij jouw woning" niet de vraag is. */
  voorWieIntro?: string;
  pastBij: string[];
  minderUrgent: string[];

  // Wat valt hieronder
  watValtEronderKop?: string;
  watValtEronder?: string[];

  // Waar dit staat in de route
  wanneerKop?: string;
  routeStep?: RouteStep;
  routeTekst?: string;

  // Kosten en opbrengst (waarde-kaartjes)
  /** Kop boven de waardekaarten. Onderhoud kent geen investering, dus die pagina zet hem om. */
  kostenKop?: string;
  kostenItems: CollapsibleItem[];
  kostenFooter?: string;
  /** "opties" = grid van kaarten; "single" = één blok over volle breedte. */
  kostenMode?: "opties" | "single";
  /** Pills voor de "single"-modus. */
  kostenSinglePills?: KostenPill[];
  /** Maand en jaar van de indicatie, bv. "juni 2026". */
  prijsPeil?: string;

  // Waar wij op letten
  aandachtspunten?: string[];

  // Keurmerken en subsidies
  keurmerken?: KeurmerkenBlock;
  subsidiesIntro?: string;
  subsidiesItems?: string[];
  subsidiesLinkHref?: string;
  subsidiesLinkLabel?: string;

  // Losse blokken
  extraInfo?: {
    kop: string;
    intro?: string;
    items: string[];
    voetregel?: string;
  };
  onderhoud?: {
    kop: string;
    tekst: string;
    linkHref: string;
    linkLabel: string;
  };
  combineren?: {
    kop: string;
    tekst: string;
    links: { label: string; href: string }[];
  };

  // Behouden voor compatibiliteit, niet meer apart gerenderd.
  // De processectie ("Zo pakken wij het voor je op") is er bewust uit: die stond
  // op alle zes de pagina's identiek en voegde niets toe aan de maatregel zelf.
  subsidiesPosition?: "side" | "below";
  zachteCtaTekst?: string;
  zachteCtaLabel?: string;
  zachteCtaHref?: string;
  procesKop?: string;
  procesStappen?: ProcesStap[];
  certificeringen?: string[];

  /** Pagina-eigen secties, ingevoegd op een vast aantal ankerpunten. */
  eigenSecties?: EigenSectie[];

  // FAQ
  faqs: MaatregelFaq[];

  // Afsluitende CTA-band
  finalCtaKop: string;
  finalCtaTekst: string;
  finalCtaLabel?: string;
  finalCtaHref?: string;
}

const STANDAARD_KOSTEN_VOETNOOT =
  "Deze inschatting klopt in veel gevallen, maar verschilt per woning. Bouwjaar, woningtype, huidige isolatie en de combinatie van maatregelen die je kiest, bepalen wat het bij jou oplevert.";

export const MaatregelPagina = (props: MaatregelPaginaProps) => {
  const {
    slug,
    icon: _Icon,
    badge,
    seoTitle,
    seoDescription,
    heroTitle,
    heroSub,
    heroIntro,
    heroCtaLabel = "Plan een gratis gesprek",
    heroCtaHref = "/contact",
    heroImageSrc,
    heroImageAlt,
    heroImagePosition = "center",
    voorWieKop = "Past dit bij [[jouw]] woning?",
    voorWieIntro = "We zijn er eerlijk over wanneer dit wel en niet bij jouw woning past.",
    pastBij,
    minderUrgent,
    watValtEronderKop,
    watValtEronder,
    wanneerKop,
    routeStep,
    routeTekst,
    kostenKop = "Wat je investering [[oplevert]]",
    kostenItems,
    kostenFooter,
    kostenMode = "opties",
    kostenSinglePills,
    prijsPeil = "juni 2026",
    aandachtspunten,
    keurmerken,
    subsidiesIntro,
    subsidiesItems,
    subsidiesLinkHref,
    subsidiesLinkLabel,
    extraInfo,
    onderhoud,
    combineren,
    eigenSecties = [],
    faqs,
    finalCtaKop,
    finalCtaTekst,
    finalCtaLabel = "Plan een gratis gesprek",
    finalCtaHref = "/contact",
  } = props;

  const label = MAATREGELEN[slug].label;

  const eigen = (anker: EigenSectie["na"]) =>
    eigenSecties
      .filter((sectie) => sectie.na === anker)
      .map((sectie, i) => (
        <Sectie key={`${anker}-${i}`} bg={sectie.bg} id={sectie.id}>
          {sectie.inhoud}
        </Sectie>
      ));

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: KLEUR.zand }}>
      <Seo
        title={seoTitle}
        description={seoDescription}
        path={`/verduurzamen/${slug}`}
        jsonLd={maatregelJsonLd({ slug, label, faqs })}
      />
      <Header />
      <main className="flex-1">
        {/* 1 — HERO */}
        <section
          data-bg="zand"
          className="w-full py-12 md:py-[72px]"
          style={{ backgroundColor: KLEUR.zand }}
        >
          <div className="mx-auto max-w-[1180px] px-6">
            <Kruimelpad label={label} />
            <div className="flex flex-col md:flex-row md:items-center gap-10 md:gap-12">
              <div className="md:flex-1 min-w-0">
                {badge && (
                  <span
                    className="mb-4 inline-flex items-center rounded-full px-3 py-1 text-[12px] font-bold uppercase tracking-wider"
                    style={{ backgroundColor: "hsl(var(--accent) / 0.2)", color: KLEUR.navy }}
                  >
                    {badge}
                  </span>
                )}
                <h1
                  className="font-display"
                  style={{
                    color: KLEUR.navy,
                    fontWeight: 700,
                    fontSize: "clamp(32px, 4.4vw, 48px)",
                    lineHeight: 1.1,
                    letterSpacing: "-0.02em",
                    margin: 0,
                  }}
                >
                  <Accent tekst={heroTitle} />
                </h1>
                <p
                  className="mt-5 text-base md:text-lg leading-relaxed"
                  style={{ color: KLEUR.navy, opacity: 0.85, maxWidth: 560 }}
                >
                  {heroSub}
                  {heroIntro ? ` ${heroIntro}` : ""}
                </p>
                <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5">
                  <CtaButton href={heroCtaHref} variant="primary">
                    {heroCtaLabel}
                    <ArrowRight size={16} />
                  </CtaButton>
                </div>
              </div>
              {heroImageSrc && (
                <div
                  className="md:flex-1 overflow-hidden rounded-2xl"
                  style={{
                    border: `1px solid ${KLEUR.rand}`,
                    aspectRatio: "4 / 3",
                  }}
                >
                  <img
                    src={heroImageSrc}
                    alt={heroImageAlt ?? ""}
                    className="w-full h-full object-cover"
                    style={{ objectPosition: heroImagePosition }}
                    width={1200}
                    height={900}
                  />
                </div>
              )}
            </div>
          </div>
        </section>

        {/* De achtergronden wisselen bewust per sectie. Omdat bijna elke sectie
            optioneel is, is de reeks zo gekozen dat er in élke combinatie van
            aanwezige blokken nooit twee dezelfde achtergronden naast elkaar
            komen. src/test/maatregelPagina.test.tsx bewaakt dat. */}

        {eigen("hero")}

        {/* 2 — WAT VALT HIERONDER */}
        {watValtEronder && watValtEronder.length > 0 && (
          <Sectie bg="wit">
            <WatValtEronder kop={watValtEronderKop} items={watValtEronder} />
          </Sectie>
        )}

        {/* 3 — PAST DIT BIJ JOUW WONING? */}
        <Sectie bg="warm">
          <div className="text-center">
            <SectieKop center><Accent tekst={voorWieKop} /></SectieKop>
            <p
              className="mt-3 text-base leading-relaxed mx-auto"
              style={{ color: KLEUR.navy, opacity: 0.75, maxWidth: 560 }}
            >
              {voorWieIntro}
            </p>
          </div>
          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
            {/* WEL (links) */}
            <BorderRotate
              animationMode="auto-rotate"
              animationSpeed={4}
              gradientColors={{ primary: '#92701a', secondary: '#c9a227', accent: '#f5d176' }}
              backgroundColor="#ffffff"
              borderWidth={2}
              borderRadius={12}
            >
              <div className="p-6 h-full" style={{ backgroundColor: KLEUR.wit, borderRadius: 10 }}>
                <div
                  className="mb-6 text-sm font-bold uppercase tracking-wider"
                  style={{ color: KLEUR.goud }}
                >
                  Wel
                </div>
                <ul className="flex flex-col gap-4">
                  {pastBij.map((t, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check
                        size={18}
                        className="mt-1 shrink-0"
                        style={{ color: KLEUR.goud }}
                        aria-hidden="true"
                      />
                      <span style={{ fontSize: 16, lineHeight: 1.5, color: "hsl(var(--foreground))", fontWeight: 500 }}>
                        {t}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </BorderRotate>

            {/* NIET (rechts) */}
            <div
              className="rounded-2xl p-6 shadow-sm h-full"
              style={{ backgroundColor: KLEUR.warm, border: `1px solid ${KLEUR.rand}` }}
            >
              <div
                className="mb-6 text-sm font-bold uppercase tracking-wider"
                style={{ color: KLEUR.navy, opacity: 0.7 }}
              >
                Nu even niet
              </div>
              <ul className="flex flex-col gap-4">
                {minderUrgent.map((t, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Clock
                      size={18}
                      className="mt-1 shrink-0"
                      style={{ color: KLEUR.navy, opacity: 0.5 }}
                      aria-hidden="true"
                    />
                    <span style={{ fontSize: 16, lineHeight: 1.5, color: "hsl(var(--foreground))", fontWeight: 400 }}>
                      {t}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Sectie>

        {/* 4 — CONTEXTBLOK (bv. waarom een thuisbatterij nu in opkomst is) */}
        {extraInfo && extraInfo.items.length > 0 && (
          <Sectie bg="zand">
            <InfoBlok
              kop={extraInfo.kop}
              intro={extraInfo.intro}
              items={extraInfo.items}
              voetregel={extraInfo.voetregel}
            />
          </Sectie>
        )}

        {/* 5 — WAAR DIT STAAT IN DE ROUTE */}
        {routeTekst && (
          <Sectie bg="navy">
            <RouteStrip
              actief={routeStep}
              tekst={routeTekst}
              kop={wanneerKop ? wanneerKop : undefined}
            />
          </Sectie>
        )}

        {eigen("route")}

        {/* 6 — WAT HET KOST EN OPLEVERT */}
        <Sectie bg="zand">
          <SectieKop center><Accent tekst={kostenKop} /></SectieKop>

          {kostenMode === "single" ? (
            <div className="mt-10">
              <Kaart>
                {kostenItems[0]?.body && (
                  <p
                    className="text-base leading-relaxed"
                    style={{ color: KLEUR.navy, opacity: 0.78, margin: 0, marginBottom: 20 }}
                  >
                    {kostenItems[0].body}
                  </p>
                )}
                <PillTiles pills={kostenSinglePills ?? kostenItems[0]?.pills ?? []} />
              </Kaart>
            </div>
          ) : (
            <div className="mt-10 flex flex-wrap justify-center gap-5">
              {kostenItems.map((item) => (
                <div key={item.title} className="flex flex-1 basis-[280px] min-w-[280px]">
                  <Kaart>
                    <KaartTitel>{item.title}</KaartTitel>
                    <KaartTekst>{item.body}</KaartTekst>
                    {item.pills && item.pills.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {item.pills.map((p, i) => (
                          <Pill key={i} pill={p} />
                        ))}
                      </div>
                    )}
                  </Kaart>
                </div>
              ))}
            </div>
          )}

          <p
            className="mt-8 text-sm max-w-[760px] mx-auto text-center"
            style={{ color: KLEUR.navy, opacity: 0.6 }}
          >
            {kostenFooter ?? STANDAARD_KOSTEN_VOETNOOT}
          </p>
        </Sectie>

        {eigen("kosten")}

        {/* 7 — SUBSIDIECHECK (conversie, halverwege de pagina) */}
        <SubsidiecheckCta />

        {/* 8 — SUBSIDIES BIJ DEZE MAATREGEL */}
        {subsidiesIntro && (
          <Sectie bg="wit">
            <SubsidieBlok
              intro={subsidiesIntro}
              items={subsidiesItems ?? []}
              linkHref={subsidiesLinkHref}
              linkLabel={subsidiesLinkLabel}
            />
          </Sectie>
        )}

        {eigen("subsidies")}

        {/* 9 — WAAR WIJ OP LETTEN */}
        {aandachtspunten && aandachtspunten.length > 0 && (
          <Sectie bg="warm">
            <Aandachtspunten items={aandachtspunten} />
            {onderhoud && (
              <div className="mt-6">
                <LinkKaart
                  Icon={Wrench}
                  kop={onderhoud.kop}
                  tekst={onderhoud.tekst}
                  links={[{ label: onderhoud.linkLabel, href: onderhoud.linkHref }]}
                />
              </div>
            )}
          </Sectie>
        )}

        {/* 10 — KEURMERKEN EN CERTIFICERINGEN */}
        {keurmerken && (
          <Sectie bg="wit">
            <Keurmerken data={keurmerken} />
          </Sectie>
        )}

        {/* 11 — COMBINEERT GOED MET */}
        {combineren && (
          <Sectie bg="warm">
            <LinkKaart kop={combineren.kop} tekst={combineren.tekst} links={combineren.links} />
          </Sectie>
        )}

        {/* 12 — VEELGESTELDE VRAGEN */}
        <Sectie bg="zand">
          <SectieKop center><Accent tekst="Veelgestelde [[vragen]]" /></SectieKop>
          <div
            className="mt-10 max-w-[820px] mx-auto rounded-2xl overflow-hidden"
            style={{ backgroundColor: KLEUR.wit, border: `1px solid ${KLEUR.rand}` }}
          >
            {faqs.map((f, i, arr) => (
              <FaqRow key={f.q} item={f} last={i === arr.length - 1} />
            ))}
          </div>
        </Sectie>
      </main>
      <Footer
        cta={
          <section className="w-full py-12 md:py-[72px]">
            <div className="mx-auto max-w-[760px] px-6 text-center">
              <h2
                className="font-display"
                style={{
                  color: KLEUR.wit,
                  fontWeight: 700,
                  fontSize: "clamp(26px, 3.2vw, 36px)",
                  lineHeight: 1.2,
                  letterSpacing: "-0.02em",
                  margin: 0,
                }}
              >
                <Accent tekst={finalCtaKop} />
              </h2>
              <p
                className="mt-4 text-base md:text-lg leading-relaxed"
                style={{ color: KLEUR.wit, opacity: 0.85 }}
              >
                {finalCtaTekst}
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5">
                <a
                  href={finalCtaHref}
                  className="inline-flex items-center justify-center rounded-full font-semibold transition-transform hover:scale-[1.02]"
                  style={{
                    backgroundColor: KLEUR.goud,
                    color: KLEUR.navy,
                    padding: "14px 28px",
                    fontSize: 15,
                  }}
                >
                  {finalCtaLabel}
                </a>
                <OfBelOnsCta color="#FFFFFF" align="center" />
              </div>
            </div>
          </section>
        }
      />
    </div>
  );
};

/* ---------- helpers ---------- */

/**
 * Bepaalt de toon (gunstigheid) van een pill op basis van dimensie + waarde.
 *
 * Een hogere investering of een langere terugverdientijd is geen fout, maar een
 * eigenschap die van de woning afhangt. Ze krijgen daarom nooit de rode toon:
 * een rood stempel bij "Investering: Hoog" leest als een afrader, terwijl
 * dezelfde maatregel bij een andere woning juist de verstandigste stap is.
 * src/test/maatregelPagina.test.tsx bewaakt dat.
 */
const pillTone = (dim: string, value: string): PillTone => {
  const v = value.toLowerCase();
  if (dim === "Investering" || dim === "Terugverdientijd") {
    if (v === "laag" || v === "kort") return "good";
    return "neutral";
  }
  // Comfortwinst / Besparing / Onafhankelijkheid / Gebruiksgemak
  if (v.startsWith("hoog")) return "good";
  return "neutral";
};

type PillTone = "good" | "neutral";

const PILL_TONES: Record<PillTone, { bg: string; fg: string; border: string }> = {
  good:    { bg: "#ECFDF5", fg: "#15803D", border: "#A7F3D0" },
  neutral: { bg: "#FEF6E0", fg: "#92701A", border: "#F0D78A" },
};

const Pill = ({ pill }: { pill: KostenPill }) => {
  const tone = pillTone(pill.dim, pill.value);
  const c = PILL_TONES[tone];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
      style={{ backgroundColor: c.bg, color: c.fg, border: `1px solid ${c.border}` }}
    >
      <span style={{ opacity: 0.75, fontWeight: 500 }}>{pill.dim}</span>
      <span style={{ fontWeight: 700 }}>{pill.value}</span>
    </span>
  );
};

const PillTiles = ({ pills }: { pills: KostenPill[] }) => (
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
    {pills.map((p, i) => {
      const tone = pillTone(p.dim, p.value);
      const c = PILL_TONES[tone];
      return (
        <div
          key={i}
          className="rounded-xl px-4 py-4 flex flex-col items-center text-center"
          style={{ backgroundColor: c.bg, border: `1px solid ${c.border}` }}
        >
          <span
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: c.fg, opacity: 0.8 }}
          >
            {p.dim}
          </span>
          <span className="mt-1 text-lg font-bold" style={{ color: c.fg }}>
            {p.value}
          </span>
        </div>
      );
    })}
  </div>
);

const FaqRow = ({ item, last }: { item: MaatregelFaq; last: boolean }) => (
  <details
    className="group"
    style={{ borderBottom: last ? "none" : `1px solid hsl(var(--primary) / 0.08)` }}
  >
    <summary
      className="flex items-center gap-4 cursor-pointer list-none"
      style={{ padding: "20px 24px" }}
    >
      <span
        className="flex-1 text-base font-medium leading-snug"
        style={{ color: KLEUR.navy }}
      >
        {item.q}
      </span>
      <ChevronDown
        size={18}
        color={KLEUR.goud}
        className="transition-transform group-open:rotate-180 shrink-0"
        aria-hidden="true"
      />
    </summary>
    <p
      className="text-base leading-relaxed"
      style={{
        margin: 0,
        padding: "0 24px 22px 24px",
        color: "hsl(var(--primary) / 0.7)",
      }}
    >
      {item.a}
    </p>
  </details>
);
