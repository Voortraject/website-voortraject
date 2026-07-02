import { useState } from "react";
import { Check, Inbox, FileText, Bell, X, PhoneCall, MessageCircle, FileCheck, ShieldCheck, FolderOpen, AlertCircle, ChevronDown } from "lucide-react";
import { AnimatedGradientBorder, BorderRotate } from "@/components/ui/animated-gradient-border";

const withoutItems = [
  "Bewoners bellen en appen dezelfde vragen, keer op keer",
  "Elk nieuw dossier kost uren aan uitleg en terugzoeken",
  "Offertes liggen te wachten terwijl de bouwplanning doorloopt",
  "Mails, appjes en notities verspreid over vijf plekken, niets compleet",
  "Na uitvoering blijven facturen, stukken en openstaande acties hangen",
  "Groeien betekent meer kantoorwerk erbij, niet minder",
];

const withItems = [
  "Wij vangen bewonersvragen en uitleg aan de voorkant op.",
  "Wij helpen plannen, maatregelen en keuzes helder doorlopen.",
  "Wij bereiden offertes en dossiers overzichtelijk voor.",
  "Wij houden opvolging en akkoordmomenten scherp in beeld.",
  "Wij helpen ook na uitvoering overzicht houden op wat nog openstaat (het natraject).",
  "Jullie houden de volledige focus op planning, uitvoering en groei.",
];
import { Header } from "@/components/Header";
import { Seo } from "@/components/Seo";
import { Why } from "@/components/sections/Why";
import { Footer } from "@/components/Footer";
import { OfBelOnsCta } from "@/components/OfBelOnsCta";
import heroUitvoerders from "@/assets/uitvoerders-hero.jpg";
import type { LucideIcon } from "lucide-react";

type Bullet = { label: string; text: string };
type Package = {
  number: string;
  title: string;
  hook: string;
  time: string;
  timeReason: string;
  bullets: Bullet[];
  audience: string;
  cta: string;
  featured?: boolean;
  icon: LucideIcon;
};

const packages: Package[] = [
  {
    number: "01",
    title: "Bewonersstart",
    hook: "Elke aanvraag die afkoelt is omzet die je niet eens gezien hebt.",
    time: "Bespaart minimaal 3 uur per dossier",
    timeReason: "Snelheid omhoog. Geen leads die nog wegglippen.",
    bullets: [
      { label: "SNELHEID", text: "Aanvragen binnen 24 uur opgepakt" },
      { label: "DUIDELIJKHEID", text: "Bewoner meteen geïnformeerd" },
      { label: "KWALITEIT", text: "Alleen warme leads op jullie tafel" },
      { label: "WARM", text: "Bewoner warm gehouden tot het volgende contactmoment" },
    ],
    audience: "Voor uitvoerders die meer aanvragen binnenkrijgen dan ze direct kunnen oppakken, en die merken dat warme leads afhaken bij gebrek aan snelle opvolging. Geschikt als jullie het eerste contact en de routebepaling buiten de deur willen zetten voordat een afspraak in de agenda komt.",
    cta: "Bespreek dit pakket",
    icon: MessageCircle,
  },
  {
    number: "02",
    title: "Dossierafhandeling",
    hook: "Hoeveel dossiers blijven hangen op ontbrekende stukken of fouten?",
    time: "Bespaart minimaal 6 uur per dossier",
    timeReason: "Foutmarge omlaag. Dossiers die in één keer door de check komen.",
    bullets: [
      { label: "GEMAK", text: "Uitvoerbaar dossier zonder formulier-gedoe" },
      { label: "ZEKERHEID", text: "Subsidieaanvraag in één keer door de check" },
      { label: "RUST", text: "Geen bewonervragen meer aan jullie kantoor" },
      { label: "AANLEVERING", text: "Bewoner die zijn eigen stukken aanlevert" },
    ],
    audience: "Voor uitvoerders die hun mensen liever zien bouwen dan formulieren invullen, en die te veel tijd verliezen aan ontbrekende stukken of subsidieaanvragen die afketsen. Geschikt als jullie het hele dossiertraject van plan tot indiening uit handen willen geven.",
    cta: "Bespreek dit pakket",
    icon: FileCheck,
  },
  {
    number: "03",
    title: "Totaal Ontzorging",
    hook: "Het traject loopt zonder dat je erbij hoeft.",
    time: "Bespaart minimaal 10 uur per dossier",
    timeReason: "Snelheid omhoog, foutmarge omlaag. Over het hele traject.",
    bullets: [
      { label: "VOLLEDIG", text: "Volledig traject uit handen" },
      { label: "REGIE", text: "Eén regisseur, één aanspreekpunt" },
      { label: "GROEI", text: "Vervolgwerk uit dezelfde klant" },
      { label: "CONTINUÏTEIT", text: "Begeleiding ook na uitvoering, tot en met review" },
    ],
    audience: "Voor uitvoerders die willen groeien zonder hun kantoor uit te breiden, en die zich volledig willen focussen op het bouwwerk zelf. Geschikt als jullie alle bewonercontact, dossierwerk en nazorg buiten de deur willen zetten en één partij willen die regie houdt.",
    cta: "Bespreek dit pakket",
    featured: true,
    icon: ShieldCheck,
  },
];

const whyCards = [
  {
    icon: Inbox,
    title: "Automatische intake",
    body: "Geen verloren contactmomenten meer in mails of appjes.",
  },
  {
    icon: FileText,
    title: "Slimme offertevoorbereiding",
    body: "Sneller van plan naar akkoord zonder dat het blijft liggen.",
  },
  {
    icon: Bell,
    title: "Opvolging zonder gejaag",
    body: "Grip op openstaande acties en losse eindjes, ook na uitvoering.",
  },
];

const PackageCard = ({ p, index }: { p: Package; index: number }) => {
  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState(false);
  const featured = !!p.featured;
  const delays = [0.05, 0.12, 0.19];

  const cardBg = "#FFFFFF";
  const cardBorder = featured ? "none" : "1px solid #E5E2DB";
  const baseShadow = "0 1px 2px rgba(21,44,78,0.04)";
  const hoverShadow = "0 12px 32px rgba(21,44,78,0.10)";

  const baseTransform = "translateY(0)";
  const hoverTransform = "translateY(-2px)";

  const outcomeBg = featured ? "rgba(255,255,255,0.5)" : "#F5F2EC";
  const timeColor = featured ? "#152C4E" : "#8B8680";

  const ctaBg = featured ? "#E8B547" : "#FFFFFF";
  const ctaColor = featured ? "#2B2B2B" : "#152C4E";
  const ctaBorder = featured ? "1px solid #E8B547" : "1px solid #E5E2DB";
  const ctaHoverBg = featured ? "#D9A538" : "#152C4E";
  const ctaHoverColor = featured ? "#2B2B2B" : "#FFFFFF";

  const mono = "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace";
  const display = "'Inter Tight', 'Inter', sans-serif";

  return (
    <div
      className="flex flex-col animate-fade-up opacity-0"
      style={{
        animationDelay: `${delays[index] ?? 0.05}s`,
        animationFillMode: "forwards",
        animationDuration: "0.5s",
        marginTop: 0,
      }}
    >
      {/* Pakketnummer boven de kaart */}
      <div className="text-center" style={{ marginBottom: "1rem" }}>
        <div
          style={{
            fontFamily: mono,
            fontSize: 11,
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            color: "#8B8680",
          }}
        >
          PAKKET
        </div>
        <div
          style={{
            fontFamily: display,
            fontSize: "2.25rem",
            fontWeight: 500,
            letterSpacing: "-0.02em",
            color: "#152C4E",
            lineHeight: 1.1,
          }}
        >
          {p.number}
        </div>
      </div>

      {(() => {
        const cardEl = (
      <article
        className="flex flex-col flex-1"
        style={{
          position: "relative",
          backgroundColor: cardBg,
          border: cardBorder,
          borderRadius: 16,
          padding: "2.25rem 1.875rem",
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
          boxShadow: hover ? hoverShadow : baseShadow,
          transform: hover ? hoverTransform : baseTransform,
        }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        {featured && (
          <div
            style={{
              position: "absolute",
              top: -14,
              right: "1.5rem",
              backgroundColor: "#FFFFFF",
              border: "1px solid #E8B547",
              borderRadius: 999,
              boxShadow: "0 4px 12px rgba(21, 44, 78, 0.08)",
              padding: "0.5rem 1.125rem",
              fontFamily: display,
              fontSize: 11,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              color: "#152C4E",
            }}
          >
            ALLES IN ÉÉN
          </div>
        )}

        {/* Vaste content boven uitklap */}
        <div className="flex flex-col">
          {/* Titel met icoon */}
          <div className="flex items-center" style={{ gap: "0.75rem" }}>
            <p.icon
              size={26}
              strokeWidth={1.75}
              style={{ color: featured ? "#D9A538" : "#152C4E", flexShrink: 0 }}
              aria-hidden="true"
            />
            <h3
              style={{
                fontFamily: display,
                fontSize: "1.875rem",
                fontWeight: 600,
                letterSpacing: "-0.02em",
                lineHeight: 1.05,
                color: "#152C4E",
                margin: 0,
              }}
            >
              {p.title}
            </h3>
          </div>

          {/* Doorlopende lijn onder titel */}
          <span
            aria-hidden="true"
            style={{
              display: "block",
              width: "100%",
              height: 1,
              backgroundColor: featured ? "rgba(232, 181, 71, 0.35)" : "#E5E2DB",
              marginTop: "1rem",
              marginBottom: "1rem",
            }}
          />

          {/* Hookzin */}
          <p
            style={{
              fontSize: "1rem",
              lineHeight: 1.5,
              color: "#6B6B6B",
              margin: 0,
            }}
          >
            {p.hook}
          </p>

          {/* Wat het oplevert kopje */}
          <div
            className="flex items-center"
            style={{
              gap: "0.5rem",
              marginTop: "2rem",
              marginBottom: "0.4rem",
            }}
          >
            <Check
              size={18}
              style={{ color: "#E8B547", flexShrink: 0 }}
              aria-hidden="true"
            />
            <span
              style={{
                fontFamily: display,
                fontSize: "0.9375rem",
                fontWeight: 600,
                color: "#152C4E",
              }}
            >
              Wat het oplevert:
            </span>
          </div>

          {/* Kernpunten */}
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {p.bullets.map((b) => (
              <li
                key={b.label}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                  margin: "0.625rem 0",
                  fontSize: "0.9375rem",
                  lineHeight: 1.5,
                  color: "#2B2B2B",
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    display: "inline-block",
                    width: 6,
                    height: 1.5,
                    backgroundColor: "#E8B547",
                    flexShrink: 0,
                    marginTop: "0.7em",
                  }}
                />
                <span>{b.text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Uitklap toggle */}
        <div style={{ marginTop: "1rem", borderTop: "1px solid #E5E2DB" }}>
          <button
            type="button"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            className="w-full flex items-center justify-between"
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: "0.875rem 0",
              fontFamily: display,
              fontSize: "0.875rem",
              fontWeight: 500,
              color: "#152C4E",
            }}
          >
            <span>Meer over dit pakket</span>
            <ChevronDown
              size={16}
              style={{
                transition: "transform 0.3s ease",
                transform: open ? "rotate(90deg)" : "rotate(0deg)",
              }}
              aria-hidden="true"
            />
          </button>
          <div
            style={{
              maxHeight: open ? 800 : 0,
              overflow: "hidden",
              transition: "max-height 0.3s ease",
            }}
          >
            <div style={{ paddingBottom: "1rem" }}>
              {/* Voor wie is dit pakket? */}
              <div style={{ marginBottom: "1.5rem" }}>
                <div
                  style={{
                    fontFamily: display,
                    fontSize: "0.9375rem",
                    fontWeight: 600,
                    color: "#152C4E",
                    marginBottom: "0.5rem",
                  }}
                >
                  Voor wie is dit pakket?
                </div>
                <p
                  style={{
                    fontSize: "0.875rem",
                    lineHeight: 1.5,
                    color: "#6B6B6B",
                    margin: 0,
                  }}
                >
                  {p.audience}
                </p>
              </div>

              {/* Tijdsbesparing blok */}
              <div style={{ margin: "1.5rem 0 0" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Check size={18} style={{ color: "#E8B547", flexShrink: 0 }} aria-hidden="true" />
                  <span
                    style={{
                      fontFamily: display,
                      fontSize: "0.9375rem",
                      fontWeight: 600,
                      color: "#152C4E",
                    }}
                  >
                    {p.time}
                  </span>
                </div>
                <p
                  style={{
                    fontSize: "0.8125rem",
                    color: "#6B6B6B",
                    margin: "0.4rem 0 0 28px",
                    lineHeight: 1.5,
                  }}
                >
                  {p.timeReason}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div style={{ marginTop: "auto", paddingTop: "1.25rem" }}>
          <a
            href="/contact"
            className="group inline-flex items-center justify-between w-full"
            style={{
              padding: "0.95rem 1.25rem",
              borderRadius: 8,
              fontFamily: display,
              fontSize: "0.9rem",
              fontWeight: 600,
              backgroundColor: ctaBg,
              color: ctaColor,
              border: ctaBorder,
              transition: "background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = ctaHoverBg;
              e.currentTarget.style.color = ctaHoverColor;
              e.currentTarget.style.borderColor = ctaHoverBg;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = ctaBg;
              e.currentTarget.style.color = ctaColor;
              e.currentTarget.style.borderColor = featured ? "#E8B547" : "#E5E2DB";
            }}
          >
            <span>{p.cta}</span>
            <span
              aria-hidden="true"
              style={{ display: "inline-block", transition: "transform 0.2s ease" }}
              className="group-hover:translate-x-[3px]"
            >
              →
            </span>
          </a>
        </div>
      </article>
        );
        return featured ? (
          <AnimatedGradientBorder
            animationMode="auto-rotate"
            animationSpeed={4}
            gradientColors={{ primary: "#92701a", secondary: "#c9a227", accent: "#f5d176" }}
            backgroundColor="#ffffff"
            borderWidth={2}
            borderRadius={12}
            style={{ display: "flex", flex: 1 }}
          >
            {cardEl}
          </AnimatedGradientBorder>
        ) : cardEl;
      })()}
    </div>
  );
};

const ctaButton =
  "inline-flex items-center justify-center font-sans font-semibold text-[15px] transition-colors";

const Partners = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Seo
        title="Voor uitvoerders | Voortraject"
        description="Voortraject ontzorgt verduurzamingsbedrijven in het voortraject: wij vangen bewonersvragen op, bereiden dossiers voor en bewaken opvolging."
        path="/partners"
      />
      <Header />
      <main className="flex-1">
        {/* HERO */}
        <section
          className="pt-8 md:pt-12 pb-[56px] md:pb-[80px]"
          style={{ backgroundColor: "#FFFFFF" }}
          aria-labelledby="uitv-hero-title"
        >
          <div className="container-content">
            <div className="grid grid-cols-1 lg:grid-cols-[58fr_42fr] gap-10 lg:gap-12 items-center">
              <div style={{ textAlign: "left" }}>
                <h1
                  id="uitv-hero-title"
                  className="font-display font-semibold"
                  style={{
                    color: "#2B2B2B",
                    fontSize: "clamp(32px, 3.6vw, 48px)",
                    lineHeight: 1.15,
                    letterSpacing: "-0.02em",
                    maxWidth: 720,
                    textAlign: "left",
                  }}
                >
                  Wij vangen het{" "}
                  <span style={{ color: "hsl(var(--accent))" }}>voortraject</span>{" "}
                  op, zodat jij kunt bouwen
                </h1>
                <p
                  className="mt-8"
                  style={{ color: "#6B6B6B", fontSize: 18, fontWeight: 400, lineHeight: 1.6, maxWidth: 560, textAlign: "left" }}
                >
                  Wij nemen bewonerscontact, offerte-opvolging, akkoordtrajecten en nazorg uit handen, zodat jouw team zich volledig richt op planning en uitvoering.
                </p>
                <div className="mt-10 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5" style={{ textAlign: "left" }}>
                  <a
                    href="/contact"
                    className={`${ctaButton} w-full sm:w-auto`}
                    style={{
                      backgroundColor: "#E8B547",
                      color: "#2B2B2B",
                      padding: "14px 32px",
                      borderRadius: 8,
                      minHeight: 44,
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#D9A538")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#E8B547")}
                  >
                    Plan een kennismaking
                  </a>
                  
                </div>
              </div>
              <div>
                <img
                  src={heroUitvoerders}
                  alt="Uitvoerder en adviseur bespreken plannen bij zonnepanelen"
                  loading="lazy"
                  className="w-full object-cover"
                  style={{
                    height: "clamp(280px, 38vw, 480px)",
                    borderRadius: 16,
                    boxShadow: "0 4px 24px rgba(21,44,78,0.06)",
                    objectPosition: "center",
                  }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* INLEIDING PAKKETTEN (Vastlopen) */}
        <section className="py-[64px] md:py-[96px]" style={{ backgroundColor: "#F9F9F7" }}>
          <div className="container-content">
            <div className="mx-auto" style={{ maxWidth: 820 }}>
              <h2
                className="h2-section text-center"
                style={{ color: "#152C4E", marginBottom: 32 }}
              >
                Waar uitvoerders in dit soort trajecten op{" "}
                <span style={{ color: "hsl(var(--accent))" }}>vastlopen</span>
              </h2>
              <p
                className="text-center mx-auto"
                style={{
                  maxWidth: 768,
                  fontSize: 18,
                  lineHeight: 1.6,
                  color: "#152C4E",
                  marginBottom: 48,
                }}
              >
                De meeste tijd lekt niet weg op de bouwplaats, maar in alles eromheen. Vijf plekken waar uitvoerders structureel op vastlopen:
              </p>
            </div>

            {(() => {
              const painCards = [
                { icon: PhoneCall, title: "Bewonersvragen blijven binnenkomen", body: "Telefoontjes en appjes over planning, maatregelen en verwachtingen blijven naar jullie kant lopen." },
                { icon: MessageCircle, title: "Plannen steeds opnieuw uitleggen", body: "Verduurzamingsplannen en losse maatregelen vragen tijd om iedere keer toe te lichten aan een nieuwe bewoner." },
                { icon: FileText, title: "Offertes blijven liggen", body: "Tussen uitvoering door komen offertes vaak pas 's avonds aan de beurt, en blijven dan hangen." },
                { icon: FolderOpen, title: "Dossiers raken versnipperd", body: "Afspraken, mails en notities zitten verspreid over verschillende plekken. Iets compleet maken kost tijd." },
                { icon: AlertCircle, title: "Na uitvoering blijft er hangen", body: "Facturen, ontbrekende stukken en openstaande acties krijgen geen prioriteit als de bouw weer roept." },
              ];
              const renderCard = (c: typeof painCards[number]) => {
                const Icon = c.icon;
                return (
                  <article
                    key={c.title}
                    className="card flex flex-col"
                    style={{
                      backgroundColor: "#FFFFFF",
                      border: "1px solid #E5E2DB",
                      borderRadius: 16,
                      padding: 24,
                      gap: 12,
                    }}
                  >
                    <div className="flex flex-row items-center gap-3">
                      <Icon size={22} color="#E8B547" strokeWidth={2} className="shrink-0" aria-hidden="true" />
                      <h3 style={{ color: "#152C4E", fontSize: 16, fontWeight: 600, margin: 0, lineHeight: 1.3 }}>{c.title}</h3>
                    </div>
                    <p style={{ color: "#152C4E", opacity: 0.75, fontSize: 14, lineHeight: 1.5, margin: 0 }}>{c.body}</p>
                  </article>
                );
              };
              return (
                <div className="card-grid">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" style={{ gap: 16 }}>
                    {painCards.slice(0, 3).map(renderCard)}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 mx-auto" style={{ gap: 16, maxWidth: "42rem", marginTop: 16 }}>
                    {painCards.slice(3).map(renderCard)}
                  </div>
                </div>
              );
            })()}

            <p
              className="text-center mx-auto"
              style={{
                maxWidth: "42rem",
                marginTop: 32,
                color: "#152C4E",
                fontSize: 18,
                fontWeight: 500,
                fontStyle: "italic",
                lineHeight: 1.5,
              }}
            >
              Juist op deze plekken brengen wij overzicht en rust terug.
            </p>
          </div>
        </section>

        {/* WAT BLIJFT LIGGEN */}
        <Why />

        {/* VOORTRAJECT VERGELIJKING */}
        <section className="py-[64px] md:py-[96px]" style={{ backgroundColor: "#F9F9F7" }}>
          <div className="container-content">
            <h2 className="h2-section text-center mx-auto" style={{ color: "#152C4E", maxWidth: 900 }}>
              Voor en <span style={{ color: "hsl(var(--accent))" }}>na</span>
            </h2>

            <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-stretch">
              {/* Zonder */}
              <div
                style={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: 16,
                  padding: 40,
                  boxShadow: "0 4px 24px rgba(21,44,78,0.06)",
                }}
              >
                <h3
                  className="font-display font-semibold"
                  style={{ fontSize: 24, color: "#152C4E", letterSpacing: "-0.01em", lineHeight: 1.3, marginBottom: 16, paddingBottom: 16, borderBottom: "1px solid #E5E2DB" }}
                >
                  Zonder Voortraject
                </h3>
                <ul className="space-y-5">
                  {withoutItems.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span
                        className="flex items-center justify-center rounded-full flex-shrink-0"
                        style={{ width: 24, height: 24, backgroundColor: "#FBE5E5", marginTop: 2 }}
                      >
                        <X size={14} color="#C0392B" strokeWidth={3} aria-hidden="true" />
                      </span>
                      <span style={{ fontSize: 16, color: "#152C4E", lineHeight: 1.6 }}>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Met */}
              <BorderRotate
                animationMode="auto-rotate"
                animationSpeed={4}
                gradientColors={{ primary: '#92701a', secondary: '#c9a227', accent: '#f5d176' }}
                backgroundColor="#ffffff"
                borderWidth={2}
                borderRadius={12}
              >
                <div
                  style={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: 10,
                    padding: 40,
                  }}
                >
                  <h3
                    className="font-display font-semibold"
                    style={{ fontSize: 24, color: "#152C4E", letterSpacing: "-0.01em", lineHeight: 1.3, marginBottom: 16, paddingBottom: 16, borderBottom: "1px solid #F0E4D0" }}
                  >
                    Met Voortraject
                  </h3>
                  <ul className="space-y-5">
                    {withItems.map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <span
                          className="flex items-center justify-center rounded-full flex-shrink-0"
                          style={{ width: 24, height: 24, backgroundColor: "#F0E4D0", marginTop: 2 }}
                        >
                          <Check size={14} color="#E8B547" strokeWidth={3} aria-hidden="true" />
                        </span>
                        <span style={{ fontSize: 16, color: "#152C4E", lineHeight: 1.6 }}>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </BorderRotate>
            </div>

            <div className="mt-16 text-center flex flex-col items-stretch sm:items-center">
              <a
                href="/contact"
                className={`${ctaButton} w-full sm:w-auto`}
                style={{
                  backgroundColor: "#E8B547",
                  color: "#2B2B2B",
                  padding: "14px 32px",
                  borderRadius: 8,
                  minHeight: 44,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#D9A538")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#E8B547")}
              >
                Plan een kennismaking
              </a>
            </div>
          </div>
        </section>

        {/* WAAROM DIT WERKT */}
        <section className="py-[64px] md:py-[96px]" style={{ backgroundColor: "#FFFFFF" }}>
          <div className="container-content">
            <div className="text-center mx-auto" style={{ maxWidth: 820 }}>
              <h2 className="h2-section" style={{ color: "#152C4E", marginBottom: 16 }}>
                Menselijke begeleiding, <span style={{ color: "#E8B547" }}>ondersteund</span> door slimme systemen
              </h2>
              <p
                className="mx-auto"
                style={{ fontSize: 17, color: "#6B6B6B", lineHeight: 1.6, marginBottom: 48 }}
              >
                Eén lijn voor bewonerscontact, offertes en dossiers, ondersteund door slimme systemen die voorkomen dat er iets blijft liggen.
              </p>
            </div>
            <div className="card-grid grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
              {whyCards.map(({ icon: Icon, title, body }) => (
                <article
                  key={title}
                  className="card bg-white flex flex-col"
                  style={{
                    borderRadius: 16,
                    padding: 32,
                    border: "1px solid #E5E2DB",
                    boxShadow: "0 4px 24px rgba(21,44,78,0.04)",
                  }}
                >
                  <div className="flex flex-row items-center" style={{ gap: 12 }}>
                    <div
                      className="flex items-center justify-center rounded-full shrink-0"
                      style={{ width: 48, height: 48, backgroundColor: "#F0E4D0" }}
                    >
                      <Icon size={22} color="#152C4E" strokeWidth={2.25} aria-hidden="true" />
                    </div>
                    <h3
                      className="font-display"
                      style={{
                        fontSize: "1.05rem",
                        fontWeight: 600,
                        color: "#152C4E",
                        letterSpacing: "-0.01em",
                        lineHeight: 1.3,
                        margin: 0,
                      }}
                    >
                      {title}
                    </h3>
                  </div>
                  <p style={{ marginTop: 16, fontSize: 15, color: "#6B6B6B", lineHeight: 1.6 }}>
                    {body}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* PAKKETTEN */}
        <section id="pakketten" className="py-[64px] md:py-[96px]" style={{ backgroundColor: "#FBFAF7" }}>
          <div className="mx-auto w-full px-6 md:px-12" style={{ maxWidth: 1440 }}>
            <h2 className="h2-section text-center mx-auto" style={{ color: "#152C4E" }}>
              <span style={{ color: "hsl(var(--accent))" }}>Kies</span> wat past bij jullie
            </h2>
            <p
              className="mt-6 text-[18px] text-center mx-auto"
              style={{ color: "#6B6B6B", lineHeight: 1.6, maxWidth: 720 }}
            >
              Drie pakketten, van losse bewonersstart tot volledige ontzorging.
            </p>

            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
              {packages.map((p, i) => (
                <PackageCard key={p.number} p={p} index={i} />
              ))}
            </div>
          </div>
        </section>

      </main>
      <Footer
        cta={
          /* SLUIT-CTA */
          <section className="text-primary-foreground py-[56px] md:py-[80px]">
            <div className="container-content text-center flex flex-col items-center">
              <h2
                className="font-display"
                style={{
                  fontWeight: 600,
                  fontSize: "clamp(28px, 4.5vw, 44px)",
                  color: "#FFFFFF",
                  letterSpacing: "-0.02em",
                  lineHeight: 1.2,
                  maxWidth: 900,
                  marginBottom: 20,
                }}
              >
                Wil je sneller van aanvraag naar uitvoering, zonder extra kantoorlast?
              </h2>
              <p
                style={{
                  color: "rgba(255,255,255,0.85)",
                  fontSize: 17,
                  lineHeight: 1.6,
                  maxWidth: 760,
                  marginBottom: 32,
                }}
              >
                Wij nemen het voortraject uit handen. Jullie houden de focus op bouwen.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5">
                <a
                  href="/contact"
                  className={ctaButton}
                  style={{
                    backgroundColor: "#E8B547",
                    color: "#2B2B2B",
                    padding: "14px 32px",
                    borderRadius: 8,
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#D9A538")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#E8B547")}
                >
                  Plan een kennismaking
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

export default Partners;
