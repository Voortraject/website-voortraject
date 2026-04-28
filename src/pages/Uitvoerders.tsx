import { Check } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import heroUitvoerders from "@/assets/uitvoerders-hero.jpg";

const packages = [
  {
    title: "De Start",
    sub: "De basis op orde, voor een soepele opstart per woning.",
    bullets: [
      "Intakegesprek met de bewoner",
      "Opmeten van de woning",
      "Inventarisatie bewonerswensen",
      "Dossieropbouw",
    ],
    featured: false,
    badge: null as string | null,
  },
  {
    title: "Het Plan",
    sub: "Voor uitvoerders die ook regelingen en advies willen overdragen.",
    bullets: [
      "Alles uit 'De Start'",
      "Uitleg lokale regelingen",
      "Subsidiecheck",
      "Energie-advies op maat",
    ],
    featured: false,
    badge: null,
  },
  {
    title: "Volledig Voortraject",
    sub: "Het complete voortraject uit handen, tot getekend akkoord.",
    bullets: [
      "Alles uit 'Het Plan'",
      "Offertevoorbereiding",
      "Volledige dossiercontrole",
      "Begeleiding tot akkoord",
    ],
    featured: true,
    badge: "Meest gekozen",
  },
  {
    title: "Maatwerk",
    sub: "Voor complexe projecten of specifieke herstelwerkzaamheden.",
    bullets: [
      "Op maat samengesteld traject",
      "Specifieke herstelwerkzaamheden",
      "Persoonlijk voorstel",
      "Neem contact op voor een aanbod",
    ],
    featured: false,
    badge: null,
  },
  {
    title: "Nazorg Traject",
    sub: "De unieke nazorg die de rest van de markt niet biedt.",
    bullets: [
      "Facturatie per uitvoering",
      "Vervolgplanning voor volgende woning-stappen",
      "Actieve begeleiding naar een 5-star review",
      "Eén aanspreekpunt blijft betrokken",
    ],
    featured: false,
    badge: "Nieuw",
    highlight: true,
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
                  style={{ color: "#6B6B6B", lineHeight: 1.6, maxWidth: 580, textAlign: "left" }}
                >
                  De meeste tijd lekt weg in bewonersvragen, offerte-opvolging en versnipperde dossiers. Wij nemen de kantoorlast over, zodat jullie focus op de bouwplaats blijft.
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
              Vijf pakketten, van losse intake tot volledige ontzorging en nazorg.
            </p>

            <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 items-stretch">
              {packages.map((p, i) => {
                const isHighlight = (p as any).highlight;
                const borderColor = p.featured
                  ? "#E8B547"
                  : isHighlight
                  ? "#152C4E"
                  : "#E5E2DB";
                const borderWidth = p.featured || isHighlight ? "2px" : "1px";
                const bgColor = isHighlight ? "#F4F7FB" : "#F5F2EC";

                // Layout: 3 boven, 2 gecentreerd onder
                const colSpan = "lg:col-span-2";
                const colStart = i === 3 ? "lg:col-start-2" : "";

                return (
                  <article
                    key={p.title}
                    className={`relative flex flex-col transition-all duration-200 ease-out ${colSpan} ${colStart}`}
                    style={{
                      backgroundColor: bgColor,
                      borderRadius: 16,
                      padding: 40,
                      border: `${borderWidth} solid ${borderColor}`,
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
                          backgroundColor: isHighlight ? "#152C4E" : "#E8B547",
                          color: isHighlight ? "#FFFFFF" : "#2B2B2B",
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
                              backgroundColor: isHighlight ? "#E3EBF5" : "#F0E4D0",
                              marginTop: 2,
                            }}
                          >
                            <Check
                              size={13}
                              color={isHighlight ? "#152C4E" : "#E8B547"}
                              strokeWidth={3}
                              aria-hidden="true"
                            />
                          </span>
                          <span style={{ fontSize: 15, color: "#2B2B2B", lineHeight: 1.6 }}>
                            {b}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <div style={{ marginTop: "auto", paddingTop: 28 }}>
                      <a
                        href="/contact"
                        className={`${ctaButton} w-full`}
                        style={{
                          backgroundColor: isHighlight ? "#152C4E" : "#E8B547",
                          color: isHighlight ? "#FFFFFF" : "#2B2B2B",
                          padding: "12px 20px",
                          borderRadius: 8,
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.backgroundColor = isHighlight ? "#0F2240" : "#D9A538")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor = isHighlight ? "#152C4E" : "#E8B547")
                        }
                      >
                        {p.title === "Maatwerk" ? "Aanvragen" : "Selecteer pakket"}
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
            <div className="max-w-[820px] mx-auto text-center">
              <h2 className="h2-section" style={{ color: "#152C4E" }}>
                Waarom dit <span style={{ color: "hsl(var(--accent))" }}>werkt</span>
              </h2>
              <p
                className="mt-8 text-[20px] md:text-[22px]"
                style={{ color: "#2B2B2B", lineHeight: 1.6, fontWeight: 500 }}
              >
                Geen losse mailtjes meer, geen versnipperde appjes. Eén aanspreekpunt voor het hele traject.
              </p>
              <p
                className="mt-6 text-[16px]"
                style={{ color: "#6B6B6B", lineHeight: 1.7 }}
              >
                Bewonerscontact, offerte-opvolging, dossiers en nazorg lopen via één lijn. Jullie houden overzicht zonder de kantoorlast erbij te nemen.
              </p>
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
                fontSize: "clamp(32px, 5vw, 44px)",
                color: "#FFFFFF",
                letterSpacing: "-0.02em",
                lineHeight: 1.2,
                maxWidth: 760,
                marginBottom: 40,
              }}
            >
              Wil je sneller schakelen zonder extra vast personeel?
            </h2>
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
