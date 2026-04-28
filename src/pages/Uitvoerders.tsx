import { Check, Inbox, FileText, Bell } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import heroUitvoerders from "@/assets/uitvoerders-hero.jpg";

type Package = {
  title: string;
  sub: string;
  bullets: string[];
  result: string;
  badge: string | null;
  featured?: boolean;
  highlight?: boolean;
};

const packages: Package[] = [
  {
    title: "Offerte & dossier",
    sub: "Voor uitvoerders die tijd verliezen op papierwerk en dossiervorming.",
    bullets: [
      "Offertevoorbereiding en opmaak",
      "Dossieropbouw en controle",
      "Overdracht van compleet dossier",
    ],
    result:
      "Minder handmatig uitzoekwerk, minder losse documenten, sneller van aanvraag naar bruikbaar dossier.",
    badge: null,
  },
  {
    title: "Akkoord & begeleiding",
    sub: "Voor uitvoerders die bewonersvragen en opvolging tot akkoord willen loslaten.",
    bullets: [
      "Alles uit Offerte & dossier",
      "Bewonersbegeleiding rond het akkoordtraject",
      "Uitleg van plannen en regelingen",
      "Opvolging tot getekend akkoord",
    ],
    result:
      "Minder tijd kwijt aan terugbellen, minder offertes die blijven liggen, meer grip op doorlooptijd.",
    badge: null,
  },
  {
    title: "Full ontzorging",
    sub: "Voor uitvoerders die het volledige voortraject buiten de deur willen zetten.",
    bullets: [
      "Alles uit Akkoord & begeleiding",
      "Intake en eerste bewonerscontact",
      "Volledige bewonerscommunicatie",
      "Overzicht op vervolgstappen",
    ],
    result:
      "Vrijwel geen druk meer aan de voorkant, meer focus op uitvoering, opschalen zonder extra kantoorlast.",
    badge: "Meest gekozen",
    featured: true,
  },
  {
    title: "AI-workflow ondersteuning",
    sub: "Voor uitvoerders die het voortraject intern willen houden, maar efficiënter willen werken.",
    bullets: [
      "Slimme intake en dossieropbouw",
      "Snelle offertevoorbereiding",
      "Opvolging van openstaande acties",
      "Grip op wat na uitvoering blijft hangen",
    ],
    result:
      "Minder dossiers die stilvallen, minder handmatig werk, meer overzicht zonder extra kantoorcapaciteit.",
    badge: null,
  },
  {
    title: "Nazorg Traject",
    sub: "Voor uitvoerders die grip willen houden op de afronding en klanttevredenheid.",
    bullets: [
      "Facturatie per uitvoering",
      "Vervolgplanning voor volgende woning-stappen",
      "Actieve begeleiding naar een 5-star review",
      "Eén aanspreekpunt blijft betrokken",
    ],
    result:
      "Snellere cashflow, meer vervolgopdrachten, een perfecte reputatie zonder extra werk.",
    badge: "Uniek",
    highlight: true,
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
    body: "Grip op openstaande acties en losse eindjes, ook na de uitvoering.",
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
          style={{ backgroundColor: "#FBFAF7" }}
          aria-labelledby="uitv-hero-title"
        >
          <div className="container-content">
            <div className="grid grid-cols-1 lg:grid-cols-[58fr_42fr] gap-10 lg:gap-12 items-center">
              <div style={{ textAlign: "left" }}>
                <h1
                  id="uitv-hero-title"
                  className="h1-hero"
                  style={{ color: "#2B2B2B", wordBreak: "keep-all", overflowWrap: "normal", textAlign: "left" }}
                >
                  Wij vangen het{" "}
                  <span style={{ color: "hsl(var(--accent))" }}>voortraject</span>{" "}
                  op, zodat jullie kunnen bouwen
                </h1>
                <p
                  className="mt-8 text-[16px] md:text-[18px]"
                  style={{ color: "#6B6B6B", lineHeight: 1.6, maxWidth: 620, textAlign: "left" }}
                >
                  Waar veel tijd op lekt, zit vaak niet op de bouwplaats, maar in alles eromheen: bewonersvragen, planuitleg, offerte-opbouw, opvolging en dossiers die strak moeten blijven lopen. Wij pakken juist dat stuk op, zodat jullie minder kantoorlast hebben en meer focus op uitvoering houden.
                </p>
                <div className="mt-10" style={{ textAlign: "left" }}>
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

        {/* PAKKETTEN */}
        <section id="pakketten" className="py-[64px] md:py-[96px]" style={{ backgroundColor: "#FFFFFF" }}>
          <div className="container-content">
            <h2 className="h2-section text-center mx-auto" style={{ color: "#152C4E" }}>
              <span style={{ color: "hsl(var(--accent))" }}>Kies</span> wat past bij jullie
            </h2>
            <p
              className="mt-6 text-[18px] text-center mx-auto"
              style={{ color: "#6B6B6B", lineHeight: 1.6, maxWidth: 720 }}
            >
              Vijf pakketten, van losse offerte- en dossieropbouw tot volledige ontzorging en unieke nazorg.
            </p>

            <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 items-stretch">
              {packages.map((p, i) => {
                const accent = p.featured ? "#E8B547" : p.highlight ? "#152C4E" : "#E5E2DB";
                const borderWidth = p.featured || p.highlight ? "2px" : "1px";
                const colStart = i === 3 ? "lg:col-start-2" : "";

                return (
                  <article
                    key={p.title}
                    className={`relative flex flex-col transition-all duration-200 ease-out lg:col-span-2 ${colStart}`}
                    style={{
                      backgroundColor: "#F5F2EC",
                      borderRadius: 16,
                      padding: 36,
                      border: `${borderWidth} solid ${accent}`,
                      boxShadow: "0 4px 24px rgba(21,44,78,0.04)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = "0 8px 32px rgba(21,44,78,0.08)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = "0 4px 24px rgba(21,44,78,0.04)";
                    }}
                  >
                    {p.badge && (
                      <span
                        className="absolute font-sans font-semibold"
                        style={{
                          top: 20,
                          right: 20,
                          backgroundColor: p.highlight ? "#152C4E" : "#E8B547",
                          color: p.highlight ? "#FFFFFF" : "#2B2B2B",
                          padding: "6px 12px",
                          borderRadius: 999,
                          fontSize: 12,
                        }}
                      >
                        {p.badge}
                      </span>
                    )}
                    <h3
                      className="font-display font-semibold"
                      style={{
                        fontSize: 22,
                        color: "#152C4E",
                        letterSpacing: "-0.02em",
                        lineHeight: 1.2,
                        paddingRight: p.badge ? 90 : 0,
                      }}
                    >
                      {p.title}
                    </h3>
                    <p
                      className="mt-3 italic"
                      style={{ fontSize: 14, color: "#6B6B6B", lineHeight: 1.5 }}
                    >
                      {p.sub}
                    </p>
                    <hr style={{ margin: "24px 0", border: "none", borderTop: "1px solid #E5E2DB" }} />
                    <ul className="space-y-3">
                      {p.bullets.map((b) => (
                        <li key={b} className="flex items-start gap-3">
                          <span
                            className="flex items-center justify-center rounded-full flex-shrink-0"
                            style={{
                              width: 22,
                              height: 22,
                              backgroundColor: "#F0E4D0",
                              marginTop: 2,
                            }}
                          >
                            <Check size={13} color="#E8B547" strokeWidth={3} aria-hidden="true" />
                          </span>
                          <span style={{ fontSize: 15, color: "#2B2B2B", lineHeight: 1.6 }}>
                            {b}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <div
                      style={{
                        marginTop: 24,
                        padding: 16,
                        backgroundColor: "#FFFFFF",
                        borderRadius: 10,
                        border: "1px solid #ECE7DD",
                      }}
                    >
                      <p
                        className="font-sans font-semibold"
                        style={{ fontSize: 12, color: "#152C4E", letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 6 }}
                      >
                        Wat het oplevert
                      </p>
                      <p style={{ fontSize: 14, color: "#2B2B2B", lineHeight: 1.55 }}>
                        {p.result}
                      </p>
                    </div>

                    <div style={{ marginTop: "auto", paddingTop: 24 }}>
                      <a
                        href="/contact"
                        className={`${ctaButton} w-full`}
                        style={{
                          backgroundColor: "#E8B547",
                          color: "#2B2B2B",
                          padding: "12px 20px",
                          borderRadius: 8,
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#D9A538")}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#E8B547")}
                      >
                        Selecteer pakket
                      </a>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* WAAROM DIT WERKT */}
        <section className="py-[64px] md:py-[96px]" style={{ backgroundColor: "#F5F2EC" }}>
          <div className="container-content">
            <div className="text-center mx-auto" style={{ maxWidth: 820 }}>
              <h2 className="h2-section" style={{ color: "#152C4E", marginBottom: 16 }}>
                Waarom dit <span style={{ color: "#E8B547" }}>werkt</span>
              </h2>
              <p
                className="mx-auto"
                style={{ fontSize: 17, color: "#6B6B6B", lineHeight: 1.6, marginBottom: 48 }}
              >
                Eén lijn voor bewonerscontact, offertes en dossiers, ondersteund door slimme systemen die voorkomen dat er iets blijft liggen.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
              {whyCards.map(({ icon: Icon, title, body }) => (
                <article
                  key={title}
                  className="bg-white flex flex-col"
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
              Zoek je extra capaciteit zonder extra kantoorlast?
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
              Wij helpen uitvoerders sneller schakelen in bewonerscontact, offerte-opbouw, opvolging en dossiervorming.
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
