import { Check, X } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import heroUitvoerders from "@/assets/uitvoerders-hero.jpg";

const withoutItems = [
  "Subsidievragen blijven bij jullie",
  "'s Avonds offertes schrijven",
  "Offertes blijven liggen",
  "Dossiers verspreid over mails en notities",
  "Groeien vraagt extra kantoorpersoneel",
  "Administratie weg van de bouwplaats",
];

const withItems = [
  "Wij doen het bewonerscontact",
  "Wij stellen offertes op",
  "Opvolging tot getekend akkoord",
  "Eén compleet dossier per traject",
  "Groeien zonder extra personeel",
  "Focus terug op uitvoering",
];

const packages = [
  {
    title: "Offerte & dossier",
    sub: "Voor uitvoerders die alleen het papierwerk willen uitbesteden.",
    bullets: [
      "Offertevoorbereiding en opmaak",
      "Dossieropbouw en controle",
      "Overdracht van compleet dossier",
    ],
    featured: false,
  },
  {
    title: "Akkoord & begeleiding",
    sub: "Voor uitvoerders die het klanttraject rondom het akkoord willen overdragen.",
    bullets: [
      "Alles uit Offerte & dossier",
      "Bewonersbegeleiding bij het akkoordtraject",
      "Uitleg van regelingen en subsidies",
      "Opvolging tot getekend akkoord",
    ],
    featured: false,
  },
  {
    title: "Full ontzorging",
    sub: "Voor uitvoerders die het volledige voortraject willen uitbesteden.",
    bullets: [
      "Alles uit Akkoord & begeleiding",
      "Intake en eerste bewonerscontact",
      "Volledige bewonerscommunicatie tot overdracht",
      "Optionele nazorg en vervolgmaatregelen",
    ],
    featured: true,
  },
  {
    title: "AI-workflow ondersteuning",
    sub: "Voor uitvoerders die het voortraject zelf blijven doen, maar efficiënter willen werken.",
    bullets: [
      "Toegang tot onze AI-gestuurde workflow",
      "Automatische intake, dossieropbouw en communicatie",
      "Ondersteuning bij implementatie",
      "Onze tools, jullie team",
    ],
    featured: false,
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
                  Wij nemen het{" "}
                  <span style={{ color: "hsl(var(--accent))" }}>voortraject</span>{" "}
                  uit handen
                </h1>
                <p
                  className="mt-8 text-[16px] md:text-[18px]"
                  style={{ color: "#6B6B6B", lineHeight: 1.6, maxWidth: 560, textAlign: "left" }}
                >
                  Van bewonerscontact en regelinguitleg tot offertevoorbereiding en akkoord.
                  Jullie focus blijft op de uitvoering.
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
                      margin: 0,
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

        {/* VOORTRAJECT VERGELIJKING */}
        <section className="py-[64px] md:py-[96px]" style={{ backgroundColor: "#F5F2EC" }}>
          <div className="container-content">
            <h2
              className="font-display text-center mx-auto"
              style={{
                color: "#152C4E",
                maxWidth: 900,
                fontWeight: 700,
                fontSize: "clamp(44px, 6.5vw, 64px)",
                letterSpacing: "-0.02em",
                lineHeight: 1.1,
                marginTop: 16,
                marginBottom: 24,
              }}
            >
              Voor en <span style={{ color: "hsl(var(--accent))" }}>na</span>
            </h2>

            <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-stretch">
              {/* Zonder */}
              <div
                className="transition-all duration-300 ease-out hover:-translate-y-[3px]"
                style={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: 16,
                  padding: 48,
                  boxShadow: "0 4px 24px rgba(21,44,78,0.06)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = "0 12px 36px rgba(21,44,78,0.10)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "0 4px 24px rgba(21,44,78,0.06)";
                }}
              >
                <h3
                  className="font-display font-semibold"
                  style={{ fontSize: 24, color: "#152C4E", letterSpacing: "-0.01em", lineHeight: 1.3 }}
                >
                  Zonder Voortraject
                </h3>
                <hr style={{ marginTop: 16, marginBottom: 28, border: "none", borderTop: "1px solid #E5E2DB" }} />
                <ul className="space-y-5">
                  {withoutItems.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span
                        className="flex items-center justify-center rounded-full flex-shrink-0"
                        style={{ width: 24, height: 24, backgroundColor: "#F2E1DF", marginTop: 2 }}
                      >
                        <X size={14} color="#B85450" strokeWidth={3} aria-hidden="true" />
                      </span>
                      <span style={{ fontSize: 16, color: "#2B2B2B", lineHeight: 1.6 }}>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Met */}
              <div
                className="transition-all duration-300 ease-out hover:-translate-y-[3px]"
                style={{
                  backgroundColor: "#FFFFFF",
                  border: "2px solid #E8B547",
                  borderRadius: 16,
                  padding: 48,
                  boxShadow: "0 4px 24px rgba(21,44,78,0.06)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = "0 12px 36px rgba(21,44,78,0.10)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "0 4px 24px rgba(21,44,78,0.06)";
                }}
              >
                <h3
                  className="font-display font-semibold"
                  style={{ fontSize: 24, color: "#152C4E", letterSpacing: "-0.01em", lineHeight: 1.3 }}
                >
                  Met Voortraject
                </h3>
                <hr style={{ marginTop: 16, marginBottom: 28, border: "none", borderTop: "1px solid #E5E2DB" }} />
                <ul className="space-y-5">
                  {withItems.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span
                        className="flex items-center justify-center rounded-full flex-shrink-0"
                        style={{ width: 24, height: 24, backgroundColor: "#F0E4D0", marginTop: 2 }}
                      >
                        <Check size={14} color="#E8B547" strokeWidth={3} aria-hidden="true" />
                      </span>
                      <span style={{ fontSize: 16, color: "#2B2B2B", lineHeight: 1.6 }}>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-16 text-center flex flex-col items-center">
              <a
                href="/contact?tab=uitvoerders"
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
        </section>

        {/* PAKKETTEN */}
        <section className="py-[64px] md:py-[96px]" style={{ backgroundColor: "#FFFFFF" }}>
          <div className="container-content">
            <h2 className="h2-section" style={{ color: "#152C4E" }}>
              <span style={{ color: "hsl(var(--accent))" }}>Kies</span> wat past bij jullie
            </h2>
            <p
              className="mt-6 text-[18px]"
              style={{ color: "#6B6B6B", lineHeight: 1.6, maxWidth: 720 }}
            >
              Vier pakketten, van los papierwerk tot volledige ontzorging.
            </p>
            <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
              {packages.map((p) => (
                <article
                  key={p.title}
                  className="relative flex flex-col transition-all duration-200 ease-out"
                  style={{
                    backgroundColor: "#F5F2EC",
                    borderRadius: 16,
                    padding: 40,
                    border: p.featured ? "2px solid #E8B547" : "1px solid #E5E2DB",
                    boxShadow: "0 4px 24px rgba(21,44,78,0.04)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#E8B547";
                    if (!p.featured) e.currentTarget.style.borderWidth = "1px";
                    e.currentTarget.style.boxShadow = "0 8px 32px rgba(21,44,78,0.08)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = p.featured ? "#E8B547" : "#E5E2DB";
                    e.currentTarget.style.boxShadow = "0 4px 24px rgba(21,44,78,0.04)";
                  }}
                >
                  {p.featured && (
                    <span
                      className="absolute font-sans font-semibold"
                      style={{
                        top: 20,
                        right: 20,
                        backgroundColor: "#E8B547",
                        color: "#2B2B2B",
                        padding: "6px 12px",
                        borderRadius: 999,
                        fontSize: 12,
                      }}
                    >
                      Meest gekozen
                    </span>
                  )}
                  <h3
                    className="font-display font-semibold"
                    style={{ fontSize: 24, color: "#152C4E", letterSpacing: "-0.02em", lineHeight: 1.2 }}
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
                  <ul className="space-y-1">
                    {p.bullets.map((b) => (
                      <li
                        key={b}
                        style={{ fontSize: 15, color: "#2B2B2B", lineHeight: 1.8 }}
                      >
                        • {b}
                      </li>
                    ))}
                  </ul>
                  <div style={{ marginTop: "auto", paddingTop: 24 }}>
                    <a
                      href="/contact"
                      className="font-sans"
                      style={{ fontSize: 14, color: "#E8B547", fontWeight: 600, textDecoration: "none" }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "#D9A538")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "#E8B547")}
                    >
                      Vraag meer informatie →
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* SLUIT-CTA */}
        <section
          className="text-primary-foreground py-[56px] md:py-[80px]"
          style={{
            backgroundColor: "#152C4E",
          }}
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
                maxWidth: 720,
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
