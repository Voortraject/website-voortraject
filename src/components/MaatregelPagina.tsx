import { Fragment, useRef, type ReactNode } from "react";
import { ArrowRight, ChevronDown, Check, Clock, Wrench } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Seo } from "@/components/Seo";
import { CtaButton } from "@/components/CtaButton";
import { SubsidiecheckCta } from "@/components/sections/SubsidiecheckCta";
import { MAATREGELEN, type MaatregelSlug, type RouteStap } from "@/data/maatregelen";
import { useStaffel } from "@/lib/beweging";
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
import { SlotCta } from "@/components/maatregel/SlotCta";
import { maatregelJsonLd } from "@/components/maatregel/jsonLd";
import { Accent, IconCirkel, Kaart, KaartTekst, KaartTitel, Sectie, SectieKop } from "@/components/maatregel/primitieven";
import { toonReeks, type SectieBg, type SectieSoort } from "@/components/maatregel/stijl";

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
 * `na` bepaalt waar hij landt. Sinds de huisstijl van oktober 2026 kiest het
 * template de lichte tint zelf (toonReeks in maatregel/stijl.ts), zodat er bij
 * elke combinatie van secties nooit twee gelijke naast elkaar komen; van `bg`
 * telt alleen nog "navy" (een donkere sectie). src/test/maatregelPagina.test.tsx
 * bewaakt het ritme.
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


/** Eén sectie in de reeks van de pagina; de tint wordt daarna voor de hele reeks gekozen. */
interface Blok {
  key: string;
  soort: SectieSoort;
  id?: string;
  inhoud: ReactNode;
}

export const MaatregelPagina = (props: MaatregelPaginaProps) => {
  const {
    slug,
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
  const mainRef = useRef<HTMLElement>(null);
  useStaffel(mainRef);

  // De reeks secties onder de hero, in volgorde. Bijna elke sectie is
  // optioneel, dus de tinten worden pas gekozen als vaststaat welke er zijn
  // (toonReeks): nooit twee gelijke naast elkaar, en de FAQ boven de footer
  // altijd op off-white. src/test/maatregelPagina.test.tsx bewaakt dat.
  const blokken: Blok[] = [];
  const eigen = (anker: EigenSectie["na"]) =>
    eigenSecties
      .filter((sectie) => sectie.na === anker)
      .forEach((sectie, i) =>
        blokken.push({
          key: `${anker}-${i}`,
          soort: sectie.bg === "navy" ? "donker" : "licht",
          id: sectie.id,
          inhoud: sectie.inhoud,
        }),
      );

  eigen("hero");

  if (watValtEronder && watValtEronder.length > 0) {
    blokken.push({
      key: "wat-valt-eronder",
      soort: "licht",
      inhoud: <WatValtEronder kop={watValtEronderKop} items={watValtEronder} />,
    });
  }

  blokken.push({
    key: "voor-wie",
    soort: "licht",
    inhoud: <PastDitBij kop={voorWieKop} intro={voorWieIntro} pastBij={pastBij} minderUrgent={minderUrgent} />,
  });

  if (extraInfo && extraInfo.items.length > 0) {
    blokken.push({
      key: "extra-info",
      soort: "licht",
      inhoud: (
        <InfoBlok kop={extraInfo.kop} intro={extraInfo.intro} items={extraInfo.items} voetregel={extraInfo.voetregel} />
      ),
    });
  }

  if (routeTekst) {
    blokken.push({
      key: "route",
      soort: "donker",
      inhoud: <RouteStrip actief={routeStep} tekst={routeTekst} kop={wanneerKop ? wanneerKop : undefined} />,
    });
  }

  eigen("route");

  blokken.push({
    key: "kosten",
    soort: "licht",
    inhoud: (
      <Kosten
        kop={kostenKop}
        mode={kostenMode}
        items={kostenItems}
        singlePills={kostenSinglePills}
        voetnoot={kostenFooter ?? STANDAARD_KOSTEN_VOETNOOT}
      />
    ),
  });

  eigen("kosten");

  // De subsidiecheck halverwege brengt zijn eigen kleur mee.
  blokken.push({ key: "subsidiecheck", soort: "vast", inhoud: <SubsidiecheckCta /> });

  if (subsidiesIntro) {
    blokken.push({
      key: "subsidies",
      soort: "licht",
      inhoud: (
        <SubsidieBlok
          intro={subsidiesIntro}
          items={subsidiesItems ?? []}
          linkHref={subsidiesLinkHref}
          linkLabel={subsidiesLinkLabel}
        />
      ),
    });
  }

  eigen("subsidies");

  if (aandachtspunten && aandachtspunten.length > 0) {
    blokken.push({
      key: "aandachtspunten",
      soort: "licht",
      inhoud: (
        <>
          <Aandachtspunten items={aandachtspunten} />
          {onderhoud && (
            <div className="mx-auto mt-5 max-w-[880px]">
              <LinkKaart
                Icon={Wrench}
                kop={onderhoud.kop}
                tekst={onderhoud.tekst}
                links={[{ label: onderhoud.linkLabel, href: onderhoud.linkHref }]}
              />
            </div>
          )}
        </>
      ),
    });
  }

  if (keurmerken) {
    blokken.push({ key: "keurmerken", soort: "licht", inhoud: <Keurmerken data={keurmerken} /> });
  }

  if (combineren) {
    blokken.push({
      key: "combineren",
      soort: "licht",
      inhoud: <LinkKaart kop={combineren.kop} tekst={combineren.tekst} links={combineren.links} />,
    });
  }

  blokken.push({
    key: "faq",
    soort: "licht",
    inhoud: (
      <>
        <SectieKop center>
          <Accent tekst="Veelgestelde [[vragen]]" />
        </SectieKop>
        <div className="mx-auto mt-7 grid max-w-[820px] gap-2.5 md:mt-10">
          {faqs.map((f) => (
            <FaqRij key={f.q} item={f} />
          ))}
        </div>
      </>
    ),
  });

  // De hero is de eerste lichte sectie van de reeks.
  const [heroBg, ...tinten] = toonReeks(["licht", ...blokken.map((b) => b.soort)]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Seo
        title={seoTitle}
        description={seoDescription}
        path={`/verduurzamen/${slug}`}
        jsonLd={maatregelJsonLd({ slug, label, faqs })}
      />
      <Header />
      <main className="flex-1" ref={mainRef}>
        {/* 1 — HERO */}
        <section data-bg={heroBg ?? "zand"} className="w-full bg-background pt-5 pb-12 md:pt-8 md:pb-20">
          <div className="mx-auto max-w-[1180px] px-6">
            <Kruimelpad label={label} />
            <div className="flex flex-col gap-8 md:flex-row md:items-center md:gap-12">
              <div className="min-w-0 md:flex-1">
                {badge && (
                  <span className="mb-4 inline-flex min-h-[30px] items-center rounded-full bg-[hsl(var(--rs-hoofd-midden))] px-3 text-[13.5px] font-bold text-primary">
                    {badge}
                  </span>
                )}
                <h1
                  className="m-0 text-[clamp(29px,8.2vw,34px)] font-bold leading-[1.08] tracking-[-0.03em] text-primary md:text-[clamp(38px,4.4vw,52px)] [text-wrap:balance]"
                  style={{ fontFamily: "'Inter Tight', 'Inter', sans-serif" }}
                >
                  <Accent tekst={heroTitle} />
                </h1>
                <p className="vd-lead mt-4 max-w-[560px] md:mt-5">
                  {heroSub}
                  {heroIntro ? ` ${heroIntro}` : ""}
                </p>
                <div className="mt-6 md:mt-8">
                  <CtaButton href={heroCtaHref} variant="accent" className="w-full sm:w-auto">
                    {heroCtaLabel}
                    <ArrowRight size={17} strokeWidth={2.2} className="hs-pijl" aria-hidden="true" />
                  </CtaButton>
                </div>
              </div>
              {heroImageSrc && (
                <div className="md:flex-1">
                  <img
                    src={heroImageSrc}
                    alt={heroImageAlt ?? ""}
                    className="hs-foto block aspect-[3/2] w-full object-cover md:aspect-[4/3]"
                    style={{ objectPosition: heroImagePosition }}
                    width={1200}
                    height={900}
                  />
                </div>
              )}
            </div>
          </div>
        </section>

        {blokken.map((blok, i) =>
          blok.soort === "vast" ? (
            <Fragment key={blok.key}>{blok.inhoud}</Fragment>
          ) : (
            <Sectie key={blok.key} bg={(tinten[i] ?? "zand") as SectieBg} id={blok.id}>
              {blok.inhoud}
            </Sectie>
          ),
        )}
      </main>
      <Footer cta={<SlotCta kop={finalCtaKop} tekst={finalCtaTekst} label={finalCtaLabel} href={finalCtaHref} />} />
    </div>
  );
};

/* ---------- secties ---------- */

/** "Past dit bij jouw woning?": twee tegels naast elkaar, wel en nu even niet. */
const PastDitBij = ({
  kop,
  intro,
  pastBij,
  minderUrgent,
}: {
  kop: string;
  intro: string;
  pastBij: string[];
  minderUrgent: string[];
}) => (
  <>
    <div className="text-center">
      <SectieKop center>
        <Accent tekst={kop} />
      </SectieKop>
      <p className="vd-lead mx-auto mt-3 max-w-[560px]">{intro}</p>
    </div>
    <div className="mt-7 grid grid-cols-1 items-stretch gap-4 md:mt-10 md:grid-cols-2 md:gap-5">
      <div className="hs-tegel hs-groen p-5 md:p-6" data-veer>
        <div className="flex items-center justify-between gap-3">
          <div className="hs-h3">Wel</div>
          <IconCirkel Icon={Check} kleur="groen" size={36} />
        </div>
        <ul className="mt-4 flex flex-col gap-3">
          {pastBij.map((t, i) => (
            <li key={i} className="flex items-start gap-3">
              <Check
                size={18}
                strokeWidth={2.6}
                className="mt-[3px] shrink-0 text-[hsl(var(--subsidie))]"
                aria-hidden="true"
              />
              <span className="text-[15.5px] font-medium leading-[1.5] text-foreground">{t}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="hs-tegel hs-zand p-5 md:p-6" data-veer>
        <div className="flex items-center justify-between gap-3">
          <div className="hs-h3">Nu even niet</div>
          <IconCirkel Icon={Clock} kleur="wit" size={36} />
        </div>
        <ul className="mt-4 flex flex-col gap-3">
          {minderUrgent.map((t, i) => (
            <li key={i} className="flex items-start gap-3">
              <Clock
                size={18}
                className="mt-[3px] shrink-0 text-[hsl(var(--rs-tekst-zacht))]"
                aria-hidden="true"
              />
              <span className="text-[15.5px] leading-[1.5] text-foreground">{t}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  </>
);

const Kosten = ({
  kop,
  mode,
  items,
  singlePills,
  voetnoot,
}: {
  kop: string;
  mode: "opties" | "single";
  items: CollapsibleItem[];
  singlePills?: KostenPill[];
  voetnoot: string;
}) => (
  <>
    <SectieKop center>
      <Accent tekst={kop} />
    </SectieKop>

    {mode === "single" ? (
      <div className="mt-7 md:mt-10">
        <Kaart>
          {items[0]?.body && <p className="vd-tekst mb-5 mt-0 text-[16px]">{items[0].body}</p>}
          <PillTiles pills={singlePills ?? items[0]?.pills ?? []} />
        </Kaart>
      </div>
    ) : (
      <div className="mt-7 flex flex-wrap justify-center gap-4 md:mt-10 md:gap-5">
        {items.map((item) => (
          <div key={item.title} className="flex min-w-[280px] flex-1 basis-[280px]">
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

    <p className="vd-tekst mx-auto mt-6 max-w-[760px] text-center text-[14px] md:mt-8">{voetnoot}</p>
  </>
);

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

// Groen zoals de subsidiekaarten van de tool, neutraal in zand met de donkere
// oker van de gemeentelijke regelingen. Tokens, geen randen.
const PILL_TONES: Record<PillTone, string> = {
  good: "bg-[hsl(var(--subsidie-van))] text-[hsl(var(--subsidie))]",
  neutral: "bg-[hsl(var(--rs-zand-van))] text-[hsl(var(--niveau-gemeente))]",
};

const Pill = ({ pill }: { pill: KostenPill }) => (
  <span
    className={`inline-flex min-h-[28px] items-center gap-1.5 rounded-full px-3 text-[13px] ${PILL_TONES[pillTone(pill.dim, pill.value)]}`}
  >
    <span className="font-medium opacity-90">{pill.dim}</span>
    <span className="font-extrabold">{pill.value}</span>
  </span>
);

const PillTiles = ({ pills }: { pills: KostenPill[] }) => (
  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
    {pills.map((p, i) => (
      <div
        key={i}
        className={`flex flex-col items-center rounded-2xl px-4 py-4 text-center ${PILL_TONES[pillTone(p.dim, p.value)]}`}
      >
        <span className="text-[13px] font-bold uppercase tracking-wider">{p.dim}</span>
        <span className="mt-1 text-lg font-extrabold">{p.value}</span>
      </div>
    ))}
  </div>
);

/** Eén vraag als losse tegel; de open vraag krijgt een zachte blauwe tint. */
const FaqRij = ({ item }: { item: MaatregelFaq }) => (
  <details className="vd-faq" data-veer>
    <summary className="flex min-h-[60px] cursor-pointer items-center gap-3.5 py-4 pl-5 pr-4">
      <span className="flex-1 text-[16.5px] font-bold leading-[1.3] text-primary">{item.q}</span>
      <span className="vd-faq-chev" aria-hidden="true">
        <ChevronDown size={18} strokeWidth={2.2} />
      </span>
    </summary>
    <p className="vd-tekst m-0 px-5 pb-[18px] text-[15.5px]">{item.a}</p>
  </details>
);
