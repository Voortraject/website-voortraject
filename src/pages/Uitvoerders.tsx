import { useState } from "react";
import { Check, Inbox, FileText, Bell, X, PhoneCall, MessageCircle, FolderOpen, AlertCircle, ChevronDown } from "lucide-react";

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
import { Why } from "@/components/sections/Why";
import { Footer } from "@/components/Footer";
import heroUitvoerders from "@/assets/uitvoerders-hero.jpg";

type Package = {
  number: string;
  title: string;
  subtitle: string;
  time: string;
  bullets: string[];
  outcome: string;
  cta: string;
  featured?: boolean;
};

const packages: Package[] = [
  {
    number: "01",
    title: "Bewonersstart",
    subtitle: "Elke aanvraag die afkoelt is omzet die je niet eens gezien hebt. Bewoners bellen de concurrent als ze drie dagen niets horen.",
    time: "Vanaf 3 uur per dossier",
    bullets: [
      "Aanvragen binnen 24 uur opgepakt",
      "Bewoner weet meteen waar hij aan toe is",
      "Alleen warme, geïnformeerde leads komen op jullie tafel",
    ],
    outcome: "Geen lead die afkoelt. Geen bewoner die wegloopt. Geen omzet die je niet eens gezien hebt.",
    cta: "Bespreek dit pakket",
  },
  {
    number: "02",
    title: "Dossierafhandeling",
    subtitle: "Hoeveel dossiers blijven nu hangen op een handtekening, een meterstand of een verkeerd ingevuld formulier? Hoeveel weken kost het echt van interesse tot uitvoering?",
    time: "Vanaf 6 uur per dossier",
    bullets: [
      "Een uitvoerbaar dossier op tafel zonder dat je ook maar één formulier hebt aangeraakt",
      "Schouw die klopt met wat in de uitvoering moet gebeuren",
      "Subsidieaanvragen die in één keer door de check komen",
      "Geen enkele bewoner die nog jullie kantoor belt met een vraag",
    ],
    outcome: "Sneller naar uitvoering. Minder dossiers die afketsen. Geen avonden meer kwijt aan papierwerk.",
    cta: "Bespreek dit pakket",
  },
  {
    number: "03",
    title: "Totaal Ontzorging",
    subtitle: "Het voortraject loopt zonder dat je erbij hoeft. Jullie bouwen, de bewoner is tevreden, het geld komt binnen, het volgende dossier staat al klaar.",
    time: "Vanaf 10 uur per dossier",
    bullets: [
      "Alles uit Bewonersstart",
      "Alles uit Dossierafhandeling",
      "Vervolgwerk uit dezelfde klant",
      "Eén aanspreekpunt voor jullie én voor de bewoner, ook na uitvoering",
    ],
    outcome: "Meer omzet uit dezelfde klant, een sterkere reputatie en geen kantoordrukte meer.",
    cta: "Plan een kennismaking",
    featured: true,
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

const ctaButton =
  "inline-flex items-center justify-center font-sans font-semibold text-[15px] transition-colors";

const Uitvoerders = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
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
                  op, zodat jullie kunnen bouwen
                </h1>
                <p
                  className="mt-8"
                  style={{ color: "#6B6B6B", fontSize: 18, fontWeight: 400, lineHeight: 1.6, maxWidth: 560, textAlign: "left" }}
                >
                  Wij nemen bewonerscontact, offerte-opvolging, akkoordtrajecten en nazorg uit handen, zodat jullie minder tijd verliezen aan kantoorwerk en meer focus houden op de uitvoering.
                </p>
                <div className="mt-10" style={{ textAlign: "left" }}>
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
                { icon: MessageCircle, title: "Plannen steeds opnieuw uitleggen", body: "Isolatieplannen en losse maatregelen vragen tijd om iedere keer toe te lichten aan een nieuwe bewoner." },
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
              <div
                style={{
                  backgroundColor: "#FFFFFF",
                  border: "2px solid #E8B547",
                  borderRadius: 16,
                  padding: 40,
                  boxShadow: "0 4px 24px rgba(21,44,78,0.06)",
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
          <div className="container-content">
            <h2 className="h2-section text-center mx-auto" style={{ color: "#152C4E" }}>
              <span style={{ color: "hsl(var(--accent))" }}>Kies</span> wat past bij jullie
            </h2>
            <p
              className="mt-6 text-[18px] text-center mx-auto"
              style={{ color: "#6B6B6B", lineHeight: 1.6, maxWidth: 720 }}
            >
              Drie pakketten, van losse bewonersstart tot volledige ontzorging.
            </p>

            <div
              className="mt-16 grid grid-cols-1 gap-5 lg:[grid-template-columns:1fr_1fr_1.15fr]"
            >
              {packages.map((p, i) => {
                const featured = !!p.featured;
                const numColor = featured ? "rgba(255,255,255,0.55)" : "#8B8680";
                const titleColor = featured ? "#FFFFFF" : "#152C4E";
                const subColor = featured ? "rgba(255,255,255,0.75)" : "#6B6B6B";
                const badgeBg = featured ? "rgba(232,181,71,0.18)" : "#FDF6E3";
                const badgeText = featured ? "#E8B547" : "#152C4E";
                const bulletColor = featured ? "rgba(255,255,255,0.9)" : "#2B2B2B";
                const outcomeBg = featured ? "rgba(255,255,255,0.06)" : "#F5F2EC";
                const outcomeLabel = featured ? "#E8B547" : "#8B8680";
                const outcomeText = featured ? "rgba(255,255,255,0.9)" : "#2B2B2B";
                const cardBg = featured ? "#152C4E" : "#FFFFFF";
                const cardBorder = featured ? "none" : "1px solid #E5E2DB";
                const cardShadow = featured
                  ? "0 12px 40px rgba(21,44,78,0.18)"
                  : "0 1px 2px rgba(21,44,78,0.04)";
                const cardShadowHover = featured
                  ? "0 18px 50px rgba(21,44,78,0.26)"
                  : "0 12px 32px rgba(21,44,78,0.10)";

                const ctaBg = featured ? "#E8B547" : "#FFFFFF";
                const ctaColor = featured ? "#2B2B2B" : "#152C4E";
                const ctaBorder = featured ? "none" : "1px solid #E5E2DB";
                const ctaHoverBg = featured ? "#D9A538" : "#152C4E";
                const ctaHoverColor = featured ? "#2B2B2B" : "#FFFFFF";

                return (
                  <article
                    key={p.number}
                    className="relative flex flex-col animate-fade-up opacity-0"
                    style={{
                      backgroundColor: cardBg,
                      border: cardBorder,
                      borderRadius: 14,
                      padding: "2rem 1.75rem 1.75rem",
                      boxShadow: cardShadow,
                      transition: "transform 0.2s ease, box-shadow 0.2s ease",
                      animationDelay: `${0.05 + i * 0.07}s`,
                      animationFillMode: "forwards",
                      animationDuration: "0.5s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = cardShadowHover;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = cardShadow;
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
                        fontSize: 11,
                        textTransform: "uppercase",
                        letterSpacing: "0.12em",
                        color: numColor,
                      }}
                    >
                      Pakket {p.number}
                    </div>

                    <h3
                      className="font-display"
                      style={{
                        marginTop: 12,
                        fontSize: "1.625rem",
                        fontWeight: 600,
                        letterSpacing: "-0.02em",
                        lineHeight: 1.1,
                        color: titleColor,
                      }}
                    >
                      {p.title}
                    </h3>

                    <p
                      style={{
                        marginTop: 12,
                        fontSize: "0.9rem",
                        color: subColor,
                        lineHeight: 1.5,
                        minHeight: "5.4em",
                      }}
                    >
                      {p.subtitle}
                    </p>

                    <div
                      className="inline-flex items-center self-start"
                      style={{
                        marginTop: 16,
                        gap: 8,
                        backgroundColor: badgeBg,
                        color: badgeText,
                        padding: "0.5rem 0.875rem",
                        borderRadius: 8,
                        fontSize: "0.8125rem",
                        fontWeight: 600,
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <circle cx="12" cy="12" r="9" />
                        <path d="M12 7v5l3 2" />
                      </svg>
                      {p.time}
                    </div>

                    <ul style={{ marginTop: 20, listStyle: "none", padding: 0 }}>
                      {p.bullets.map((b) => (
                        <li
                          key={b}
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 12,
                            margin: "0.5rem 0",
                            fontSize: "0.875rem",
                            lineHeight: 1.55,
                            color: bulletColor,
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
                              marginTop: "0.65em",
                            }}
                          />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>

                    <div
                      style={{
                        marginTop: 20,
                        padding: "1rem 1.125rem",
                        backgroundColor: outcomeBg,
                        borderRadius: 10,
                      }}
                    >
                      <div
                        className="font-display"
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          textTransform: "uppercase",
                          letterSpacing: "0.1em",
                          color: outcomeLabel,
                          marginBottom: 6,
                        }}
                      >
                        Wat het oplevert
                      </div>
                      <p style={{ fontSize: "0.8125rem", lineHeight: 1.5, color: outcomeText, margin: 0 }}>
                        {p.outcome}
                      </p>
                    </div>

                    <div style={{ marginTop: "auto", paddingTop: 20 }}>
                      <a
                        href="/contact"
                        className="group inline-flex items-center justify-between w-full"
                        style={{
                          padding: "0.75rem 1.125rem",
                          borderRadius: 8,
                          fontSize: "0.875rem",
                          fontWeight: 600,
                          backgroundColor: ctaBg,
                          color: ctaColor,
                          border: ctaBorder,
                          transition: "background-color 0.2s ease, color 0.2s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = ctaHoverBg;
                          e.currentTarget.style.color = ctaHoverColor;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = ctaBg;
                          e.currentTarget.style.color = ctaColor;
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
              })}
            </div>
          </div>
        </section>

        {/* SLUIT-CTA */}
        <section
          className="text-primary-foreground py-[56px] md:py-[80px]"
          style={{ backgroundColor: "#152C4E" }}
        >
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
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Uitvoerders;
