import { ArrowLeft, ArrowRight, Check, ChevronDown, Plus } from "lucide-react";
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

export interface MaatregelPaginaProps {
  slug: string;
  icon: LucideIcon;
  badge?: string;

  seoTitle: string;
  seoDescription: string;

  // Sectie 1
  heroTitle: string;
  heroSub: string;
  heroIntro: string;
  heroCtaLabel?: string;
  heroCtaHref?: string;

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
const SAND = "#FBFAF7";
const GOLD = "#E8B547";
const SOFT = "#F0E4D0";
const CREAM = "#FDF6E3";
const BORDER = "#E5E2DB";
const MUTED = "#6B6B6B";
const TEXT = "#2B2B2B";

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
  voorWieKop = "Is dit iets voor jou?",
  pastBij,
  minderUrgent,
  watValtEronderKop = "Wat valt eronder?",
  watValtEronder,
  routeStep,
  routeTekst,
  kostenItems,
  kostenFooter,
  zachteCtaTekst = "Benieuwd wat voor jouw woning de meeste winst oplevert?",
  zachteCtaLabel = "Plan een gesprek",
  zachteCtaHref = "/contact",
  aandachtspunten,
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
          className="pb-[48px] md:pb-[80px]"
          style={{ backgroundColor: SAND, paddingTop: "clamp(40px, 6vw, 72px)" }}
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

            <div className="mt-6 flex items-start gap-4 md:gap-6">
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
                    fontSize: "clamp(32px, 4.6vw, 50px)",
                    color: NAVY,
                    letterSpacing: "-0.02em",
                    lineHeight: 1.1,
                  }}
                >
                  {heroTitle}
                </h1>
                <p
                  className="mt-4 max-w-2xl"
                  style={{ fontSize: 18, color: NAVY, opacity: 0.85, lineHeight: 1.55, fontWeight: 500 }}
                >
                  {heroSub}
                </p>
                <p
                  className="mt-4 max-w-2xl"
                  style={{ fontSize: 16, color: MUTED, lineHeight: 1.7 }}
                >
                  {heroIntro}
                </p>
                <a
                  href={heroCtaHref}
                  className="mt-7 inline-flex items-center justify-center rounded-full font-semibold transition-transform hover:scale-[1.02]"
                  style={{
                    backgroundColor: GOLD,
                    color: NAVY,
                    padding: "13px 24px",
                    fontSize: 15,
                  }}
                >
                  {heroCtaLabel}
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* SECTIE 2 — VOOR WIE + WAT VALT ERONDER */}
        <Section bg="#FFFFFF">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">
            <div>
              <SectionTitle>{voorWieKop}</SectionTitle>

              <SubKop>Past bij jou als</SubKop>
              <CheckList items={pastBij} variant="check" />

              <div className="mt-8">
                <SubKop muted>Minder urgent als</SubKop>
                <CheckList items={minderUrgent} variant="dash" />
              </div>
            </div>

            <div>
              <SectionTitle>{watValtEronderKop}</SectionTitle>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }} className="flex flex-col gap-3">
                {watValtEronder.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3"
                    style={{
                      fontSize: 16,
                      color: TEXT,
                      lineHeight: 1.6,
                      padding: "14px 16px",
                      backgroundColor: SAND,
                      border: `1px solid ${BORDER}`,
                      borderRadius: 12,
                    }}
                  >
                    <span
                      className="mt-1 shrink-0 rounded-full flex items-center justify-center"
                      style={{ width: 20, height: 20, backgroundColor: SOFT }}
                    >
                      <Plus size={12} color={NAVY} strokeWidth={2.5} />
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Section>

        {/* SECTIE 3 — WANNEER IS HET SLIM */}
        <Section bg={SAND}>
          <SectionTitle>Wanneer is het slim?</SectionTitle>
          <RouteBar active={routeStep} />
          <p
            className="mt-8 max-w-3xl"
            style={{ fontSize: 16, color: TEXT, lineHeight: 1.75 }}
          >
            {routeTekst}
          </p>
        </Section>

        {/* SECTIE 4 — KOSTEN EN OPBRENGST */}
        <Section bg="#FFFFFF">
          <SectionTitle>Kosten en opbrengst</SectionTitle>
          <p
            className="max-w-3xl"
            style={{ fontSize: 15, color: MUTED, lineHeight: 1.7, marginTop: -8, marginBottom: 24 }}
          >
            We houden cijfers indicatief. Wat het uiteindelijk kost en oplevert hangt af van jouw woning.
          </p>

          <div className="flex flex-col gap-3 max-w-3xl">
            {kostenItems.map((item) => (
              <Collapsible key={item.title} title={item.title} body={item.body} />
            ))}
          </div>

          <p
            className="mt-8 max-w-3xl"
            style={{ fontSize: 15, color: MUTED, lineHeight: 1.7 }}
          >
            {kostenFooter}
          </p>

          <div
            className="mt-10 max-w-3xl flex flex-col sm:flex-row sm:items-center gap-4 rounded-2xl"
            style={{ backgroundColor: SAND, border: `1px solid ${BORDER}`, padding: "18px 22px" }}
          >
            <p style={{ fontSize: 15, color: NAVY, lineHeight: 1.5, margin: 0, flex: 1 }}>
              {zachteCtaTekst}
            </p>
            <a
              href={zachteCtaHref}
              className="inline-flex items-center gap-2 rounded-full font-semibold shrink-0"
              style={{
                backgroundColor: NAVY,
                color: "#FFFFFF",
                padding: "11px 20px",
                fontSize: 14,
              }}
            >
              {zachteCtaLabel} <ArrowRight size={14} />
            </a>
          </div>
        </Section>

        {/* SECTIE 5 — AANDACHTSPUNTEN, SUBSIDIES, FAQ */}
        <Section bg={SAND}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">
            <div>
              <SectionTitle>Waar je op moet letten</SectionTitle>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }} className="flex flex-col gap-4">
                {aandachtspunten.map((p) => (
                  <li
                    key={p}
                    className="flex items-start gap-3"
                    style={{ fontSize: 16, color: TEXT, lineHeight: 1.65 }}
                  >
                    <span
                      className="mt-[6px] shrink-0 rounded-full"
                      style={{ width: 8, height: 8, backgroundColor: GOLD }}
                    />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <SectionTitle>Subsidies</SectionTitle>
              <p style={{ fontSize: 16, color: TEXT, lineHeight: 1.7, marginBottom: 16 }}>
                {subsidiesIntro}
              </p>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }} className="flex flex-col gap-2">
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
                className="mt-5 inline-flex items-center gap-2 group"
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

          <div className="mt-16">
            <SectionTitle>Veelgestelde vragen</SectionTitle>
            <div
              className="max-w-3xl"
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
          </div>
        </Section>

        {/* SECTIE 6 — FINAL CTA */}
        <section className="py-[64px] md:py-[96px]" style={{ backgroundColor: NAVY }}>
          <div className="container-content">
            <div className="max-w-2xl mx-auto text-center">
              <h2
                className="font-display"
                style={{
                  fontSize: "clamp(28px, 3.6vw, 40px)",
                  fontWeight: 700,
                  color: "#FFFFFF",
                  letterSpacing: "-0.02em",
                  lineHeight: 1.15,
                }}
              >
                {finalCtaKop}
              </h2>
              <p
                className="mt-5"
                style={{
                  fontSize: 17,
                  color: "#FFFFFF",
                  opacity: 0.85,
                  lineHeight: 1.7,
                }}
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
  <section className="py-[56px] md:py-[88px]" style={{ backgroundColor: bg }}>
    <div className="container-content">{children}</div>
  </section>
);

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h2
    className="font-display"
    style={{
      fontSize: "clamp(24px, 2.6vw, 32px)",
      fontWeight: 600,
      color: NAVY,
      letterSpacing: "-0.015em",
      lineHeight: 1.2,
      marginBottom: 24,
    }}
  >
    {children}
  </h2>
);

const SubKop = ({ children, muted = false }: { children: React.ReactNode; muted?: boolean }) => (
  <h3
    style={{
      fontSize: 14,
      fontWeight: 600,
      textTransform: "uppercase",
      letterSpacing: "0.08em",
      color: muted ? MUTED : NAVY,
      marginBottom: 14,
    }}
  >
    {children}
  </h3>
);

const CheckList = ({ items, variant }: { items: string[]; variant: "check" | "dash" }) => (
  <ul style={{ listStyle: "none", padding: 0, margin: 0 }} className="flex flex-col gap-3">
    {items.map((item) => (
      <li
        key={item}
        className="flex items-start gap-3"
        style={{ fontSize: 16, color: TEXT, lineHeight: 1.6 }}
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
            className="mt-[12px] shrink-0"
            style={{ width: 14, height: 2, backgroundColor: MUTED, opacity: 0.5, borderRadius: 2 }}
          />
        )}
        <span style={{ color: variant === "dash" ? MUTED : TEXT }}>{item}</span>
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
      className="flex flex-col sm:flex-row items-stretch gap-2 sm:gap-3 max-w-2xl"
      role="list"
      aria-label="Verduurzamingsroute"
    >
      {steps.map((s, i) => {
        const isActive = s.id === active;
        return (
          <div
            key={s.id}
            role="listitem"
            aria-current={isActive ? "step" : undefined}
            className="flex items-center gap-3 flex-1"
            style={{
              backgroundColor: isActive ? NAVY : "#FFFFFF",
              color: isActive ? "#FFFFFF" : NAVY,
              border: `1px solid ${isActive ? NAVY : BORDER}`,
              borderRadius: 999,
              padding: "12px 18px",
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            <span
              className="rounded-full flex items-center justify-center shrink-0"
              style={{
                width: 24,
                height: 24,
                backgroundColor: isActive ? GOLD : SOFT,
                color: NAVY,
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              {i + 1}
            </span>
            <span>{s.label}</span>
          </div>
        );
      })}
    </div>
  );
};

const Collapsible = ({ title, body }: { title: string; body: string }) => (
  <details
    className="group"
    style={{
      backgroundColor: "#FFFFFF",
      border: `1px solid ${BORDER}`,
      borderRadius: 12,
      overflow: "hidden",
    }}
  >
    <summary
      className="flex items-center gap-4 cursor-pointer list-none"
      style={{ padding: "16px 20px" }}
    >
      <span
        style={{
          flex: 1,
          fontSize: 16,
          fontWeight: 600,
          color: NAVY,
          lineHeight: 1.4,
        }}
      >
        {title}
      </span>
      <ChevronDown
        size={18}
        color={GOLD}
        className="transition-transform group-open:rotate-180 shrink-0"
        aria-hidden="true"
      />
    </summary>
    <div
      style={{
        padding: "0 20px 18px 20px",
        fontSize: 15,
        color: MUTED,
        lineHeight: 1.7,
      }}
    >
      {body}
    </div>
  </details>
);

const FaqRow = ({ item, last }: { item: MaatregelFaq; last: boolean }) => (
  <details
    className="group"
    style={{ borderBottom: last ? "none" : `1px solid ${BORDER}` }}
  >
    <summary
      className="flex items-center gap-4 cursor-pointer list-none"
      style={{ padding: "18px 22px" }}
    >
      <span
        style={{
          flex: 1,
          fontSize: 16,
          fontWeight: 500,
          color: NAVY,
          lineHeight: 1.4,
        }}
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
      style={{
        margin: 0,
        padding: "0 22px 20px 22px",
        fontSize: 15,
        color: MUTED,
        lineHeight: 1.7,
      }}
    >
      {item.a}
    </p>
  </details>
);
