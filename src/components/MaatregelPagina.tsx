import { ArrowRight, ChevronDown, Check, Info, Minus, ShieldCheck, X } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { BorderRotate } from "@/components/ui/animated-gradient-border";
import type { LucideIcon } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Seo } from "@/components/Seo";
import { OfBelOnsCta } from "@/components/OfBelOnsCta";

export type RouteStep = "beperk" | "opwekken" | "slim";

export type KostenDimension =
  | "Investering"
  | "Terugverdientijd"
  | "Comfortwinst"
  | "Besparing"
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

export interface KeurmerkenBlock {
  kop?: string;
  intro: string;
  items: string[];
  voetregel?: string;
}

export interface ProcesStap {
  title: string;
  body: string;
}


export interface MaatregelPaginaProps {
  slug: string;
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

  // Is dit iets voor jou
  voorWieKop?: string;
  pastBij: string[];
  minderUrgent: string[];

  // (Behouden voor compatibiliteit — niet meer apart gerenderd)
  watValtEronderKop?: string;
  watValtEronder?: string[];
  wanneerKop?: string;
  routeStep?: RouteStep;
  routeTekst?: string;

  // Kosten en opbrengst (waarde-kaartjes)
  kostenItems: CollapsibleItem[];
  kostenFooter?: string;
  /** "opties" = grid van kaarten; "single" = één blok over volle breedte. */
  kostenMode?: "opties" | "single";
  /** Pills voor de "single"-modus. */
  kostenSinglePills?: KostenPill[];
  /** Maand en jaar van de indicatie, bv. "juni 2026". */
  prijsPeil?: string;

  // (Behouden voor compatibiliteit)
  zachteCtaTekst?: string;
  zachteCtaLabel?: string;
  zachteCtaHref?: string;
  aandachtspunten?: string[];

  // Zo pakken wij het op
  procesKop?: string;
  procesStappen?: ProcesStap[];
  certificeringen?: string[];
  

  // Optionele, behouden subsidie-info (compatibiliteit)
  keurmerken?: KeurmerkenBlock;
  subsidiesPosition?: "side" | "below";
  subsidiesIntro?: string;
  subsidiesItems?: string[];
  subsidiesLinkHref?: string;
  subsidiesLinkLabel?: string;
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

  // FAQ
  faqs: MaatregelFaq[];

  // Afsluitende CTA-band
  finalCtaKop: string;
  finalCtaTekst: string;
  finalCtaLabel?: string;
  finalCtaHref?: string;
}

const NAVY = "#152C4E";
const GOLD = "#E8B547";
const SAND = "#FBFAF7";
const WARM = "#F6EFE0";
const WHITE = "#FFFFFF";

/** Splits a string with [[accent]] markers into JSX with gold spans. */
const renderAccented = (text: string) => {
  const parts = text.split(/(\[\[[^\]]+\]\])/g);
  return parts.map((part, i) => {
    const m = part.match(/^\[\[([^\]]+)\]\]$/);
    if (m) {
      return (
        <span key={i} style={{ color: GOLD }}>
          {m[1]}
        </span>
      );
    }
    return <span key={i}>{part}</span>;
  });
};

const DEFAULT_PROCES: ProcesStap[] = [
  {
    title: "Intakegesprek",
    body: "We luisteren naar je situatie, je woning en wat je wilt bereiken.",
  },
  {
    title: "Onafhankelijk advies",
    body: "Een eerlijke afweging, zonder verkoopbelang of voorkeursleverancier.",
  },
  {
    title: "Koppeling met uitvoerder",
    body: "Wij brengen je in contact met een gecertificeerde, betrouwbare partij.",
  },
];


/** Maakt een korte badge-label uit een lange keurmerk-zin. */
const toBadge = (s: string) => {
  const first = s.split(/[,:.]/)[0].trim();
  return first.length > 28 ? first.slice(0, 27) + "…" : first;
};

export const MaatregelPagina = (props: MaatregelPaginaProps) => {
  const {
    slug,
    icon: _Icon,
    seoTitle,
    seoDescription,
    heroTitle,
    heroSub,
    heroIntro,
    heroCtaLabel = "Plan een gratis gesprek",
    heroCtaHref = "/contact",
    heroImageSrc,
    heroImageAlt,
    voorWieKop = "Past dit bij [[jouw]] woning?",
    pastBij,
    minderUrgent,
    kostenItems,
    kostenFooter,
    kostenMode = "opties",
    kostenSinglePills,
    prijsPeil = "juni 2026",
    procesKop = "Zo pakken wij het voor je [[op]]",
    procesStappen = DEFAULT_PROCES,
    certificeringen,
    keurmerken,
    faqs,
    finalCtaKop,
    finalCtaTekst,
    finalCtaLabel = "Plan een gratis adviesgesprek",
    finalCtaHref = "/contact",
  } = props;

  const badges =
    certificeringen ??
    (keurmerken?.items ? keurmerken.items.map(toBadge) : []);

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: SAND }}>
      <Seo title={seoTitle} description={seoDescription} path={`/verduurzamen/${slug}`} />
      <Header />
      <main className="flex-1">
        {/* 1 — HERO */}
        <section className="w-full py-16 md:py-20" style={{ backgroundColor: SAND }}>
          <div className="mx-auto max-w-[1180px] px-6">
            <div className="flex flex-col md:flex-row md:items-center gap-10 md:gap-12">
              <div className="md:flex-1 min-w-0">
                <h1
                  className="font-display"
                  style={{
                    color: NAVY,
                    fontWeight: 700,
                    fontSize: "clamp(32px, 4.4vw, 48px)",
                    lineHeight: 1.1,
                    letterSpacing: "-0.02em",
                    margin: 0,
                  }}
                >
                  {renderAccented(heroTitle)}
                </h1>
                <p
                  className="mt-5 text-base md:text-lg leading-relaxed"
                  style={{ color: NAVY, opacity: 0.85, maxWidth: 560 }}
                >
                  {heroSub}
                  {heroIntro ? ` ${heroIntro}` : ""}
                </p>
                <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5">
                  <PrimaryButton href={heroCtaHref}>{heroCtaLabel}</PrimaryButton>
                  <OfBelOnsCta />
                </div>
              </div>
              {heroImageSrc && (
                <div
                  className="md:flex-1 overflow-hidden rounded-2xl"
                  style={{
                    border: `1px solid ${NAVY}1A`,
                    aspectRatio: "4 / 3",
                  }}
                >
                  <img
                    src={heroImageSrc}
                    alt={heroImageAlt ?? ""}
                    className="w-full h-full object-cover"
                    width={1200}
                    height={900}
                  />
                </div>
              )}
            </div>
          </div>
        </section>

        {/* 2 — PAST DIT BIJ JOUW WONING? */}
        <SectionBlock bg={WHITE}>
          <div className="text-center">
            <SectionTitle center>{renderAccented(voorWieKop)}</SectionTitle>
            <p
              className="mt-3 text-base leading-relaxed mx-auto"
              style={{ color: NAVY, opacity: 0.75, maxWidth: 560 }}
            >
              We zijn er eerlijk over wanneer dit wel en niet bij jouw woning past.
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
              <div className="p-6 h-full" style={{ backgroundColor: WHITE, borderRadius: 10 }}>
                <div
                  className="mb-6 text-sm font-bold uppercase tracking-wider"
                  style={{ color: GOLD }}
                >
                  Wel
                </div>
                <ul className="flex flex-col gap-4">
                  {pastBij.map((t, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check
                        size={18}
                        className="mt-1 shrink-0"
                        style={{ color: GOLD }}
                        aria-hidden="true"
                      />
                      <span style={{ fontSize: 16, lineHeight: 1.5, color: "#2B2B2B", fontWeight: 500 }}>
                        {t}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </BorderRotate>

            {/* NIET (rechts) */}
            <div
              className="rounded-2xl p-6 shadow-sm border border-red-100 h-full"
              style={{ backgroundColor: "#FEF7F7" }}
            >
              <div
                className="mb-6 text-sm font-bold uppercase tracking-wider"
                style={{ color: "#C0392B" }}
              >
                Niet
              </div>
              <ul className="flex flex-col gap-4">
                {minderUrgent.map((t, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <X
                      size={18}
                      className="mt-1 shrink-0"
                      style={{ color: "#C0392B" }}
                      aria-hidden="true"
                    />
                    <span style={{ fontSize: 16, lineHeight: 1.5, color: "#2B2B2B", fontWeight: 400 }}>
                      {t}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </SectionBlock>

        {/* 3 — WAT HET KOST EN OPLEVERT */}
        <SectionBlock bg={WARM}>
          <SectionTitle center>{renderAccented("Wat je investering [[oplevert]]")}</SectionTitle>

          {kostenMode === "single" ? (
            <div className="mt-10">
              <Card>
                {kostenItems[0]?.body && (
                  <p
                    className="text-base leading-relaxed"
                    style={{ color: NAVY, opacity: 0.78, margin: 0, marginBottom: 20 }}
                  >
                    {kostenItems[0].body}
                  </p>
                )}
                <PillTiles pills={kostenSinglePills ?? kostenItems[0]?.pills ?? []} />
              </Card>
            </div>
          ) : (
            <div className="mt-10 flex flex-wrap justify-center gap-5">
              {kostenItems.map((item) => (
                <div key={item.title} className="flex flex-1 basis-[280px] min-w-[280px]">
                  <Card>
                    <h3
                      className="text-lg font-medium"
                      style={{ color: NAVY, margin: 0, lineHeight: 1.35 }}
                    >
                      {item.title}
                    </h3>
                    <p
                      className="mt-3 text-base leading-relaxed"
                      style={{ color: NAVY, opacity: 0.78, margin: "12px 0 0 0" }}
                    >
                      {item.body}
                    </p>
                    {item.pills && item.pills.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {item.pills.map((p, i) => (
                          <Pill key={i} pill={p} />
                        ))}
                      </div>
                    )}
                  </Card>
                </div>
              ))}
            </div>
          )}

          <p
            className="mt-8 text-sm max-w-[760px] mx-auto text-center"
            style={{ color: NAVY, opacity: 0.6 }}
          >
            Deze inschatting klopt in veel gevallen, maar verschilt per woning. Bouwjaar, woningtype, huidige isolatie en de combinatie van maatregelen die je kiest, bepalen wat het bij jou oplevert.
          </p>
        </SectionBlock>

        {/* 4 — ZO PAKKEN WIJ HET VOOR JE OP */}
        <SectionBlock bg={WHITE}>
          <SectionTitle center>{renderAccented(procesKop)}</SectionTitle>

          <TooltipProvider delayDuration={150}>
            <ol
              className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-16 relative"
              style={{ listStyle: "none", padding: 0, margin: 0, marginTop: 64 }}
            >
              {procesStappen.map((stap, i) => {
                const isKoppeling = /koppeling/i.test(stap.title);
                return (
                  <li key={stap.title} className="relative">
                    <Card>
                      <div className="flex items-center gap-3">
                        <span
                          className="flex items-center justify-center rounded-full font-semibold shrink-0"
                          style={{
                            width: 36,
                            height: 36,
                            backgroundColor: NAVY,
                            color: WHITE,
                            fontSize: 15,
                          }}
                        >
                          {i + 1}
                        </span>
                        <h3
                          className="text-lg font-medium flex items-center gap-2"
                          style={{ color: NAVY, margin: 0 }}
                        >
                          {stap.title}
                          {isKoppeling && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  type="button"
                                  aria-label="Bekijk certificeringen"
                                  className="inline-flex items-center justify-center rounded-full"
                                  style={{ color: GOLD }}
                                >
                                  <Info size={16} aria-hidden="true" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent side="top" className="max-w-[280px]">
                                <p className="text-xs leading-relaxed">
                                  Wij werken alleen met erkende, gecertificeerde vakbedrijven. Hun keurmerken en erkenningen staan voor kwaliteit, vakmanschap en veiligheid, zodat jouw project in vertrouwde handen is.
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </h3>
                      </div>
                      <p
                        className="mt-3 text-base leading-relaxed"
                        style={{ color: NAVY, opacity: 0.78, margin: "12px 0 0 0" }}
                      >
                        {stap.body}
                      </p>
                    </Card>
                    {i < procesStappen.length - 1 && (
                      <div
                        aria-hidden="true"
                        className="hidden md:flex absolute top-1/2 -translate-y-1/2 items-center justify-center"
                        style={{ right: -56, width: 48, height: 48 }}
                      >
                        <ArrowRight size={36} color={GOLD} strokeWidth={2.5} />
                      </div>
                    )}
                  </li>
                );
              })}
            </ol>
          </TooltipProvider>
        </SectionBlock>

        {/* 5 — VEELGESTELDE VRAGEN */}
        <SectionBlock bg={WARM}>
          <SectionTitle center>{renderAccented("Veelgestelde [[vragen]]")}</SectionTitle>
          <div
            className="mt-10 max-w-[820px] mx-auto rounded-2xl overflow-hidden"
            style={{ backgroundColor: WHITE, border: `1px solid ${NAVY}1A` }}
          >
            {faqs.slice(0, 5).map((f, i, arr) => (
              <FaqRow key={f.q} item={f} last={i === arr.length - 1} />
            ))}
          </div>
        </SectionBlock>

        <section className="w-full py-16 md:py-20" style={{ backgroundColor: NAVY }}>
          <div className="mx-auto max-w-[760px] px-6 text-center">
            <h2
              className="font-display"
              style={{
                color: WHITE,
                fontWeight: 700,
                fontSize: "clamp(26px, 3.2vw, 36px)",
                lineHeight: 1.2,
                letterSpacing: "-0.02em",
                margin: 0,
              }}
            >
              {renderAccented(finalCtaKop)}
            </h2>
            <p
              className="mt-4 text-base md:text-lg leading-relaxed"
              style={{ color: WHITE, opacity: 0.85 }}
            >
              {finalCtaTekst}
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5">
              <a
                href={finalCtaHref}
                className="inline-flex items-center justify-center rounded-full font-semibold transition-transform hover:scale-[1.02]"
                style={{
                  backgroundColor: GOLD,
                  color: NAVY,
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
      </main>
      <Footer />
    </div>
  );
};

/* ---------- helpers ---------- */

const SectionBlock = ({
  bg,
  children,
}: {
  bg: string;
  children: React.ReactNode;
}) => (
  <section className="w-full py-16 md:py-20" style={{ backgroundColor: bg }}>
    <div className="mx-auto max-w-[1180px] px-6">{children}</div>
  </section>
);

const SectionTitle = ({ children, center }: { children: React.ReactNode; center?: boolean }) => (
  <h2
    className={`font-display text-3xl md:text-4xl font-semibold ${center ? "text-center" : "text-left"}`}
    style={{
      color: NAVY,
      letterSpacing: "-0.02em",
      lineHeight: 1.15,
      margin: 0,
    }}
  >
    {children}
  </h2>
);

const Card = ({ children, bg, border }: { children: React.ReactNode; bg?: string; border?: string }) => (
  <div
    className="rounded-2xl p-6 h-full"
    style={{
      backgroundColor: bg ?? WHITE,
      border: border ?? `1px solid ${NAVY}1A`,
    }}
  >
    {children}
  </div>
);

/** Bepaalt de toon (gunstigheid) van een pill op basis van dimensie + waarde. */
const pillTone = (dim: string, value: string): "good" | "neutral" | "bad" => {
  const v = value.toLowerCase();
  if (dim === "Investering") {
    if (v === "laag") return "good";
    if (v === "midden" || v === "middel" || v === "gemiddeld") return "neutral";
    return "bad";
  }
  if (dim === "Terugverdientijd") {
    if (v === "kort") return "good";
    if (v === "middel" || v === "midden" || v === "gemiddeld") return "neutral";
    return "bad";
  }
  // Comfortwinst / Besparing / Onafhankelijkheid / Gebruiksgemak
  if (v.startsWith("hoog")) return "good";
  if (v === "gemiddeld" || v === "middel" || v === "midden") return "neutral";
  return "bad";
};

const PILL_TONES: Record<"good" | "neutral" | "bad", { bg: string; fg: string; border: string }> = {
  good:    { bg: "#ECFDF5", fg: "#15803D", border: "#A7F3D0" },
  neutral: { bg: "#FEF6E0", fg: "#92701A", border: "#F0D78A" },
  bad:     { bg: "#FEF2F2", fg: "#B91C1C", border: "#FECACA" },
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


const CardLabel = ({
  children,
  muted = false,
}: {
  children: React.ReactNode;
  muted?: boolean;
}) => (
  <h3
    className="text-xs font-semibold uppercase tracking-wider mb-4"
    style={{ color: muted ? `${NAVY}99` : NAVY, margin: 0, marginBottom: 16 }}
  >
    {children}
  </h3>
);

const BulletList = ({
  items,
  variant,
}: {
  items: string[];
  variant: "check" | "cross";
}) => (
  <ul style={{ listStyle: "none", padding: 0, margin: 0 }} className="flex flex-col gap-3">
    {items.map((item) => (
      <li
        key={item}
        className="flex items-start gap-3 text-base leading-relaxed"
        style={{ color: variant === "cross" ? `${NAVY}B3` : NAVY }}
      >
        <span
          className="mt-[3px] shrink-0 rounded-full flex items-center justify-center"
          style={{
            width: 20,
            height: 20,
            backgroundColor: variant === "check" ? "#dcfce7" : "#fee2e2",
          }}
        >
          {variant === "check" ? (
            <Check size={12} color="#16a34a" strokeWidth={3} />
          ) : (
            <X size={12} color="#dc2626" strokeWidth={3} />
          )}
        </span>
        <span>{item}</span>
      </li>
    ))}
  </ul>
);

const PrimaryButton = ({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) => (
  <a
    href={href}
    className="inline-flex items-center justify-center rounded-full font-semibold transition-transform hover:scale-[1.02]"
    style={{
      backgroundColor: NAVY,
      color: WHITE,
      padding: "14px 28px",
      fontSize: 15,
    }}
  >
    {children}
    <ArrowRight size={16} className="ml-2" />
  </a>
);

const FaqRow = ({ item, last }: { item: MaatregelFaq; last: boolean }) => (
  <details
    className="group"
    style={{ borderBottom: last ? "none" : `1px solid ${NAVY}14` }}
  >
    <summary
      className="flex items-center gap-4 cursor-pointer list-none"
      style={{ padding: "20px 24px" }}
    >
      <span
        className="flex-1 text-base font-medium leading-snug"
        style={{ color: NAVY }}
      >
        {item.q}
      </span>
      <ChevronDown
        size={18}
        color={GOLD}
        className="transition-transform group-open:rotate-180 shrink-0"
        aria-hidden="true"
      />
    </summary>
    <p
      className="text-base leading-relaxed"
      style={{
        margin: 0,
        padding: "0 24px 22px 24px",
        color: `${NAVY}B3`,
      }}
    >
      {item.a}
    </p>
  </details>
);
