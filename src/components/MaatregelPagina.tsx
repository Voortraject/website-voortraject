import { ArrowLeft, ArrowRight, Check, ChevronDown, Plus, ShieldCheck, Minus } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Seo } from "@/components/Seo";

export type RouteStep = "beperk" | "opwekken" | "slim";

export interface CollapsibleItem {
  title: string;
  body: string;
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

export interface MaatregelPaginaProps {
  slug: string;
  icon: LucideIcon;
  badge?: string;

  seoTitle: string;
  seoDescription: string;

  // Sectie 1
  /** Wrap accent words in [[...]] to render them in gold. */
  heroTitle: string;
  heroSub: string;
  heroIntro: string;
  heroCtaLabel?: string;
  heroCtaHref?: string;
  heroImageSrc?: string;
  heroImageAlt?: string;

  // Sectie 2
  voorWieKop?: string;
  pastBij: string[];
  minderUrgent: string[];
  watValtEronderKop?: string;
  watValtEronder: string[];

  // Sectie 3
  routeStep: RouteStep;
  routeTekst: string;

  // Sectie 4
  kostenItems: CollapsibleItem[];
  kostenFooter: string;
  zachteCtaTekst?: string;
  zachteCtaLabel?: string;
  zachteCtaHref?: string;

  // Sectie 5
  aandachtspunten: string[];
  keurmerken?: KeurmerkenBlock;
  subsidiesIntro: string;
  subsidiesItems: string[];
  subsidiesLinkHref?: string;
  subsidiesLinkLabel?: string;
  faqs: MaatregelFaq[];

  // Sectie 6
  finalCtaKop: string;
  finalCtaTekst: string;
  finalCtaLabel?: string;
  finalCtaHref?: string;
}

const NAVY = "#152C4E";
const INK = "#111111";
const SAND = "#FBFAF7";
const WARM = "#F6EFE2";
const GOLD = "#E8B547";
const SOFT = "#F0E4D0";
const CREAM = "#FDF6E3";
const BORDER = "#E5E2DB";
const MUTED = "#6B6B6B";
const TEXT = "#2B2B2B";

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

export const MaatregelPagina = ({
  slug,
  icon: Icon,
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
  voorWieKop = "Is dit [[iets voor jou]]?",
  pastBij,
  minderUrgent,
  watValtEronderKop = "Wat valt [[eronder]]?",
  watValtEronder,
  routeStep,
  routeTekst,
  kostenItems,
  kostenFooter,
  zachteCtaTekst = "Benieuwd wat voor jouw woning de meeste winst oplevert?",
  zachteCtaLabel = "Plan een gesprek",
  zachteCtaHref = "/contact",
  aandachtspunten,
  keurmerken,
  subsidiesIntro,
  subsidiesItems,
  subsidiesLinkHref = "/subsidies",
  subsidiesLinkLabel = "Bekijk hoe je subsidies stapelt",
  faqs,
  finalCtaKop,
  finalCtaTekst,
  finalCtaLabel = "Plan een gratis gesprek",
  finalCtaHref = "/contact",
}: MaatregelPaginaProps) => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Seo title={seoTitle} description={seoDescription} path={`/verduurzamen/${slug}`} />
      <Header />
      <main className="flex-1">
        {/* SECTIE 1 — HERO */}
        <section
          className="pb-[64px] md:pb-[112px]"
          style={{ backgroundColor: SAND, paddingTop: "clamp(40px, 6vw, 80px)" }}
          aria-labelledby="m-title"
        >
          <div className="container-content">
            <a
              href="/verduurzamen"
              className="inline-flex items-center gap-2 text-sm transition-opacity hover:opacity-100"
              style={{ color: NAVY, opacity: 0.7 }}
            >
              <ArrowLeft size={16} /> Terug naar overzicht
            </a>

            <div
              className={`mt-8 grid grid-cols-1 gap-10 md:gap-14 items-center ${
                heroImageSrc ? "lg:grid-cols-[1.1fr_1fr]" : ""
              }`}
            >
              <div className="flex items-start gap-4 md:gap-6">
                <div
                  className="flex items-center justify-center rounded-full shrink-0"
                  style={{ width: 64, height: 64, backgroundColor: SOFT }}
                >
                  <Icon size={28} color={NAVY} strokeWidth={2.25} aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  {badge && (
                    <span
                      className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold"
                      style={{
                        backgroundColor: CREAM,
                        color: GOLD,
                        border: "1px solid rgba(232,181,71,0.4)",
                      }}
                    >
                      {badge}
                    </span>
                  )}
                  <h1
                    id="m-title"
                    className="font-display mt-3"
                    style={{
                      fontWeight: 700,
                      fontSize: "clamp(36px, 5vw, 56px)",
                      color: INK,
                      letterSpacing: "-0.02em",
                      lineHeight: 1.05,
                    }}
                  >
                    {renderAccented(heroTitle)}
                  </h1>
                  <p
                    className="mt-5 max-w-2xl"
                    style={{ fontSize: 19, color: INK, opacity: 0.85, lineHeight: 1.55, fontWeight: 500 }}
                  >
                    {heroSub}
                  </p>
                  <p className="mt-4 max-w-2xl" style={{ fontSize: 16, color: MUTED, lineHeight: 1.7 }}>
                    {heroIntro}
                  </p>
                  <a
                    href={heroCtaHref}
                    className="mt-8 inline-flex items-center justify-center rounded-full font-semibold transition-transform hover:scale-[1.02]"
                    style={{
                      backgroundColor: GOLD,
                      color: NAVY,
                      padding: "14px 26px",
                      fontSize: 15,
                    }}
                  >
                    {heroCtaLabel}
                  </a>
                </div>
              </div>

              {heroImageSrc && (
                <div
                  className="w-full overflow-hidden"
                  style={{
                    borderRadius: 20,
                    border: `1px solid ${BORDER}`,
                    aspectRatio: "4 / 3",
                    backgroundColor: "#EFEAE0",
                  }}
                >
                  <img
                    src={heroImageSrc}
                    alt={heroImageAlt ?? ""}
                    width={1024}
                    height={768}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>
        </section>

        {/* SECTIE 2 — Is dit iets voor jou */}
        <Section bg="#FFFFFF">
          <SectionHeader title={voorWieKop} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mt-10">
            <Panel tone="light">
              <SubKop>Past bij jou als</SubKop>
              <CheckList items={pastBij} variant="check" />
            </Panel>
            <Panel tone="muted">
              <SubKop muted>Minder logisch als</SubKop>
              <CheckList items={minderUrgent} variant="dash" />
            </Panel>
          </div>
        </Section>

        {/* SECTIE 3 — Wat valt eronder (kaarten) */}
        <Section bg={WARM}>
          <SectionHeader title={watValtEronderKop} />
          <ul
            style={{ listStyle: "none", padding: 0, margin: 0 }}
            className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5"
          >
            {watValtEronder.map((item) => (
              <li
                key={item}
                style={{
                  fontSize: 16,
                  color: TEXT,
                  lineHeight: 1.6,
                  padding: "22px 22px",
                  backgroundColor: "#FFFFFF",
                  border: `1px solid ${BORDER}`,
                  borderRadius: 16,
                }}
              >
                <span
                  className="mb-3 inline-flex items-center justify-center rounded-full"
                  style={{ width: 36, height: 36, backgroundColor: SOFT }}
                >
                  <Plus size={16} color={NAVY} strokeWidth={2.5} />
                </span>
                <p style={{ margin: 0 }}>{item}</p>
              </li>
            ))}
          </ul>
        </Section>

        {/* SECTIE 4 — Wanneer is het slim (route) */}
        <Section bg="#FFFFFF">
          <SectionHeader title="Wanneer is het [[slim]]?" />
          <div className="mt-10">
            <RouteBar active={routeStep} />
          </div>
          <p
            className="mt-10 max-w-3xl"
            style={{ fontSize: 17, color: TEXT, lineHeight: 1.75 }}
          >
            {routeTekst}
          </p>
        </Section>

        {/* SECTIE 5 — Kosten en opbrengst (kaarten) */}
        <Section bg={WARM}>
          <SectionHeader
            title="Kosten en [[opbrengst]]"
            sub="We houden cijfers indicatief. Wat het uiteindelijk kost en oplevert hangt af van jouw woning."
          />

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {kostenItems.map((item) => (
              <div
                key={item.title}
                style={{
                  backgroundColor: "#FFFFFF",
                  border: `1px solid ${BORDER}`,
                  borderRadius: 16,
                  padding: "22px 22px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                <h3
                  style={{
                    fontSize: 17,
                    fontWeight: 600,
                    color: NAVY,
                    lineHeight: 1.35,
                    margin: 0,
                  }}
                >
                  {item.title}
                </h3>
                <p style={{ fontSize: 15, color: MUTED, lineHeight: 1.7, margin: 0 }}>
                  {item.body}
                </p>
              </div>
            ))}
          </div>

          <p className="mt-10 max-w-3xl" style={{ fontSize: 15, color: MUTED, lineHeight: 1.7 }}>
            {kostenFooter}
          </p>

          <div
            className="mt-10 max-w-3xl flex flex-col sm:flex-row sm:items-center gap-4 rounded-2xl"
            style={{ backgroundColor: "#FFFFFF", border: `1px solid ${BORDER}`, padding: "20px 24px" }}
          >
            <p style={{ fontSize: 15, color: NAVY, lineHeight: 1.5, margin: 0, flex: 1 }}>
              {zachteCtaTekst}
            </p>
            <a
              href={zachteCtaHref}
              className="inline-flex items-center gap-2 rounded-full font-semibold shrink-0"
              style={{ backgroundColor: NAVY, color: "#FFFFFF", padding: "11px 20px", fontSize: 14 }}
            >
              {zachteCtaLabel} <ArrowRight size={14} />
            </a>
          </div>
        </Section>

        {/* SECTIE 6 — Aandachtspunten + Subsidies */}
        <Section bg="#FFFFFF">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            <div>
              <SectionHeader title="Waar je op moet [[letten]]" />
              <ul
                style={{ listStyle: "none", padding: 0, margin: 0 }}
                className="mt-8 flex flex-col gap-4"
              >
                {aandachtspunten.map((p) => (
                  <li
                    key={p}
                    className="flex items-start gap-3"
                    style={{ fontSize: 16, color: TEXT, lineHeight: 1.65 }}
                  >
                    <span
                      className="mt-[8px] shrink-0 rounded-full"
                      style={{ width: 8, height: 8, backgroundColor: GOLD }}
                    />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <SectionHeader title="[[Subsidies]]" />
              <p
                style={{ fontSize: 16, color: TEXT, lineHeight: 1.7, marginTop: 24, marginBottom: 18 }}
              >
                {subsidiesIntro}
              </p>
              <ul
                style={{ listStyle: "none", padding: 0, margin: 0 }}
                className="flex flex-col gap-2"
              >
                {subsidiesItems.map((s) => (
                  <li
                    key={s}
                    className="flex items-start gap-3"
                    style={{ fontSize: 15, color: TEXT, lineHeight: 1.6 }}
                  >
                    <Check size={18} color={GOLD} className="mt-[2px] shrink-0" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
              <a
                href={subsidiesLinkHref}
                className="mt-6 inline-flex items-center gap-2 group"
                style={{
                  color: NAVY,
                  fontWeight: 500,
                  fontSize: 15,
                  borderBottom: `1px solid ${GOLD}`,
                  paddingBottom: 2,
                }}
              >
                {subsidiesLinkLabel}
                <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
              </a>
            </div>
          </div>
        </Section>

        {/* SECTIE 7 — Keurmerken (optioneel) */}
        {keurmerken && (
          <Section bg={WARM}>
            <SectionHeader
              title={keurmerken.kop ?? "Let op [[keurmerken]] en certificeringen"}
              sub={keurmerken.intro}
            />
            <ul
              style={{ listStyle: "none", padding: 0, margin: 0 }}
              className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5"
            >
              {keurmerken.items.map((k) => (
                <li
                  key={k}
                  className="flex items-start gap-3"
                  style={{
                    fontSize: 15,
                    color: TEXT,
                    lineHeight: 1.55,
                    padding: "18px 20px",
                    backgroundColor: "#FFFFFF",
                    border: `1px solid ${BORDER}`,
                    borderRadius: 14,
                  }}
                >
                  <ShieldCheck size={18} color={GOLD} className="mt-[2px] shrink-0" />
                  <span>{k}</span>
                </li>
              ))}
            </ul>
            {keurmerken.voetregel && (
              <p
                style={{ fontSize: 14, color: MUTED, lineHeight: 1.6, marginTop: 18, maxWidth: 720 }}
              >
                {keurmerken.voetregel}
              </p>
            )}
          </Section>
        )}

        {/* SECTIE 8 — FAQ (enige accordeon) */}
        <Section bg="#FFFFFF">
          <SectionHeader title="Veelgestelde [[vragen]]" />
          <div
            className="mt-10 max-w-3xl mx-auto"
            style={{
              backgroundColor: "#FFFFFF",
              border: `1px solid ${BORDER}`,
              borderRadius: 16,
              overflow: "hidden",
            }}
          >
            {faqs.map((f, i) => (
              <FaqRow key={f.q} item={f} last={i === faqs.length - 1} />
            ))}
          </div>
        </Section>

        {/* SECTIE 9 — Final CTA */}
        <section className="py-[72px] md:py-[112px]" style={{ backgroundColor: NAVY }}>
          <div className="container-content">
            <div className="max-w-2xl mx-auto text-center">
              <h2
                className="font-display"
                style={{
                  fontSize: "clamp(28px, 3.6vw, 42px)",
                  fontWeight: 700,
                  color: "#FFFFFF",
                  letterSpacing: "-0.02em",
                  lineHeight: 1.15,
                }}
              >
                {renderAccented(finalCtaKop)}
              </h2>
              <p
                className="mt-5"
                style={{ fontSize: 17, color: "#FFFFFF", opacity: 0.85, lineHeight: 1.7 }}
              >
                {finalCtaTekst}
              </p>
              <a
                href={finalCtaHref}
                className="mt-8 inline-flex items-center justify-center rounded-full font-semibold transition-transform hover:scale-[1.02]"
                style={{
                  backgroundColor: GOLD,
                  color: NAVY,
                  padding: "14px 28px",
                  fontSize: 15,
                }}
              >
                {finalCtaLabel}
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

/* ---------- helpers ---------- */

const Section = ({ bg, children }: { bg: string; children: React.ReactNode }) => (
  <section className="py-[72px] md:py-[120px]" style={{ backgroundColor: bg }}>
    <div className="container-content">{children}</div>
  </section>
);

const SectionHeader = ({ title, sub }: { title: string; sub?: string }) => (
  <div className="max-w-3xl">
    <h2
      className="font-display"
      style={{
        fontSize: "clamp(28px, 3.4vw, 40px)",
        fontWeight: 700,
        color: NAVY,
        letterSpacing: "-0.02em",
        lineHeight: 1.15,
        margin: 0,
      }}
    >
      {renderAccented(title)}
    </h2>
    {sub && (
      <p
        style={{
          fontSize: 16,
          color: MUTED,
          lineHeight: 1.7,
          marginTop: 14,
          marginBottom: 0,
        }}
      >
        {sub}
      </p>
    )}
  </div>
);

const SubKop = ({ children, muted = false }: { children: React.ReactNode; muted?: boolean }) => (
  <h3
    style={{
      fontSize: 13,
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: "0.1em",
      color: muted ? MUTED : NAVY,
      marginBottom: 18,
      marginTop: 0,
    }}
  >
    {children}
  </h3>
);

const Panel = ({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: "light" | "muted";
}) => (
  <div
    style={{
      backgroundColor: tone === "light" ? SAND : "#FFFFFF",
      border: `1px solid ${BORDER}`,
      borderRadius: 18,
      padding: "28px 28px",
    }}
  >
    {children}
  </div>
);

const CheckList = ({ items, variant }: { items: string[]; variant: "check" | "dash" }) => (
  <ul style={{ listStyle: "none", padding: 0, margin: 0 }} className="flex flex-col gap-3">
    {items.map((item) => (
      <li
        key={item}
        className="flex items-start gap-3"
        style={{ fontSize: 16, color: variant === "dash" ? MUTED : TEXT, lineHeight: 1.6 }}
      >
        {variant === "check" ? (
          <span
            className="mt-[2px] shrink-0 rounded-full flex items-center justify-center"
            style={{ width: 22, height: 22, backgroundColor: SOFT }}
          >
            <Check size={13} color={NAVY} strokeWidth={3} />
          </span>
        ) : (
          <span
            className="mt-[2px] shrink-0 rounded-full flex items-center justify-center"
            style={{ width: 22, height: 22, backgroundColor: "#EFEAE0" }}
          >
            <Minus size={13} color={MUTED} strokeWidth={3} />
          </span>
        )}
        <span>{item}</span>
      </li>
    ))}
  </ul>
);

const RouteBar = ({ active }: { active: RouteStep }) => {
  const steps: { id: RouteStep; label: string }[] = [
    { id: "beperk", label: "Beperk" },
    { id: "opwekken", label: "Wek op" },
    { id: "slim", label: "Gebruik slim" },
  ];
  return (
    <div
      className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-0"
      role="list"
      aria-label="Verduurzamingsroute"
    >
      {steps.map((s, i) => {
        const isActive = s.id === active;
        return (
          <div key={s.id} className="flex items-center flex-1 sm:flex-1">
            <div
              role="listitem"
              aria-current={isActive ? "step" : undefined}
              className="flex items-center gap-3 w-full"
              style={{
                backgroundColor: isActive ? NAVY : "#FFFFFF",
                color: isActive ? "#FFFFFF" : NAVY,
                border: `1px solid ${isActive ? NAVY : BORDER}`,
                borderRadius: 14,
                padding: "16px 20px",
                fontSize: 15,
                fontWeight: 600,
                boxShadow: isActive ? "0 6px 22px -10px rgba(21,44,78,0.35)" : "none",
              }}
            >
              <span
                className="rounded-full flex items-center justify-center shrink-0"
                style={{
                  width: 28,
                  height: 28,
                  backgroundColor: isActive ? GOLD : SOFT,
                  color: NAVY,
                  fontSize: 13,
                  fontWeight: 700,
                }}
              >
                {i + 1}
              </span>
              <span>{s.label}</span>
            </div>
            {i < steps.length - 1 && (
              <div
                aria-hidden="true"
                className="hidden sm:block"
                style={{
                  height: 2,
                  width: 28,
                  backgroundColor: BORDER,
                  flexShrink: 0,
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

const FaqRow = ({ item, last }: { item: MaatregelFaq; last: boolean }) => (
  <details className="group" style={{ borderBottom: last ? "none" : `1px solid ${BORDER}` }}>
    <summary
      className="flex items-center gap-4 cursor-pointer list-none"
      style={{ padding: "20px 24px" }}
    >
      <span style={{ flex: 1, fontSize: 16, fontWeight: 500, color: NAVY, lineHeight: 1.4 }}>
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
      style={{
        margin: 0,
        padding: "0 24px 22px 24px",
        fontSize: 15,
        color: MUTED,
        lineHeight: 1.7,
      }}
    >
      {item.a}
    </p>
  </details>
);
