import { HelpCircle } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import heroBewoners from "@/assets/bewoners-hero.jpg";

const questions = [
  "Waar begin ik?",
  "Wat is slim om eerst te doen?",
  "Welke subsidies zijn relevant?",
  "Wat past bij mijn woning?",
  "Hoe kom ik van plan naar uitvoering?",
  "Wat als ik huurder ben?",
];

const services = [
  {
    title: "Duidelijk advies",
    body: "We leggen in begrijpelijke taal uit wat er mogelijk is voor jouw woning.",
  },
  {
    title: "Overzicht in maatregelen",
    body: "Isolatie, ventilatie, zonnepanelen of warmtepomp. We helpen je zien welke maatregelen logisch zijn en in welke volgorde.",
  },
  {
    title: "Uitleg over regelingen en subsidies",
    body: "We zetten op een rij welke landelijke en gemeentelijke regelingen voor jou relevant zijn.",
  },
  {
    title: "Hulp bij keuzes",
    body: "Meerdere opties naast elkaar, zonder dat je het zelf hoeft uit te zoeken.",
  },
  {
    title: "Begeleiding naar een betrouwbare uitvoerder",
    body: "Als de keuze helder is, koppelen we je aan een uitvoerder waar we goed mee samenwerken.",
  },
];

const ctaButton =
  "inline-flex items-center justify-center font-sans font-semibold text-[15px] transition-colors";

const Bewoners = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1">
        {/* HERO */}
        <section
          className="pt-8 md:pt-12 pb-[56px] md:pb-[80px]"
          style={{ backgroundColor: "#FBFAF7" }}
          aria-labelledby="bew-hero-title"
        >
          <div className="container-content">
            <div className="grid grid-cols-1 lg:grid-cols-[58fr_42fr] gap-10 lg:gap-12 items-center">
              <div>
                <h1
                  id="bew-hero-title"
                  className="h1-hero text-5xl"
                  style={{ color: "#2B2B2B", wordBreak: "keep-all", overflowWrap: "normal" }}
                >
                  <span style={{ color: "hsl(var(--accent))" }}>Helder</span>{" "}
                  verduurzamingsadvies voor isolatie en installaties
                </h1>
                <p
                  className="mt-8 text-[16px] md:text-[18px]"
                  style={{ color: "#6B6B6B", lineHeight: 1.6, maxWidth: 560 }}
                >
                  Wij helpen bewoners met overzicht, duidelijke keuzes en begeleiding richting een passende uitvoering.
                </p>
                <div className="mt-10">
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
                    Plan een vrijblijvend gesprek
                  </a>
                </div>
              </div>
              <div>
                <img
                  src={heroBewoners}
                  alt="Karakteristieke Nederlandse woning met rode dakpannen"
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

        {/* TYPISCHE VRAGEN */}
        <section className="py-[64px] md:py-[96px]" style={{ backgroundColor: "#F5F2EC" }}>
          <div className="container-content">
            <h2 className="h2-section" style={{ color: "#152C4E" }}>
              De <span style={{ color: "hsl(var(--accent))" }}>vragen</span> waar wij mee beginnen
            </h2>
            <p
              className="mt-6 text-[18px]"
              style={{ color: "#6B6B6B", lineHeight: 1.6, maxWidth: 720 }}
            >
              Verduurzamen roept veel op. Deze vragen herkennen we van bijna elke bewoner.
            </p>
            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-4">
              {questions.map((q) => (
                <article
                  key={q}
                  className="bg-white transition-all duration-200 ease-out hover:-translate-y-0.5"
                  style={{
                    borderRadius: 16,
                    padding: 20,
                    border: "1px solid #E5E2DB",
                    boxShadow: "0 4px 24px rgba(21,44,78,0.04)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = "0 8px 32px rgba(21,44,78,0.10)";
                    e.currentTarget.style.borderColor = "#E8B547";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = "0 4px 24px rgba(21,44,78,0.04)";
                    e.currentTarget.style.borderColor = "#E5E2DB";
                  }}
                >
                  <div className="flex items-center md:p-1" style={{ gap: 20 }}>
                    <div
                      className="flex items-center justify-center rounded-full shrink-0"
                      style={{ width: 48, height: 48, backgroundColor: "#F0E4D0" }}
                    >
                      <HelpCircle size={22} color="#152C4E" strokeWidth={2.25} aria-hidden="true" />
                    </div>
                    <h3
                      className="font-display font-semibold"
                      style={{
                        fontSize: 20,
                        color: "#152C4E",
                        letterSpacing: "-0.01em",
                        lineHeight: 1.3,
                        margin: 0,
                      }}
                    >
                      {q}
                    </h3>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* WAT WIJ VOOR JE DOEN */}
        <section className="py-[64px] md:py-[96px]" style={{ backgroundColor: "#FBFAF7" }}>
          <div className="container-content">
            <h2 className="h2-section" style={{ color: "#152C4E" }}>
              Wat <span style={{ color: "hsl(var(--accent))" }}>wij</span> voor je doen
            </h2>
            <p
              className="mt-6 text-[18px]"
              style={{ color: "#6B6B6B", lineHeight: 1.6, maxWidth: 720 }}
            >
              Geen verkooppraatje, geen vooropgezet plan. We kijken eerst naar jouw woning en jouw situatie.
            </p>
            <ul className="mt-16">
              {services.map((s, i) => (
                <li
                  key={s.title}
                  className="flex items-start gap-6"
                  style={{
                    paddingTop: 32,
                    paddingBottom: 32,
                    borderBottom: i === services.length - 1 ? "none" : "1px solid #E5E2DB",
                  }}
                >
                  <span
                    className="font-display"
                    style={{
                      fontSize: 40,
                      fontWeight: 300,
                      color: "#E8B547",
                      width: 80,
                      flexShrink: 0,
                      lineHeight: 1,
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3
                      className="font-display font-semibold"
                      style={{ fontSize: 20, color: "#152C4E", letterSpacing: "-0.01em", lineHeight: 1.3 }}
                    >
                      {s.title}
                    </h3>
                    <p
                      className="mt-2"
                      style={{ fontSize: 15, color: "#6B6B6B", lineHeight: 1.6, maxWidth: 640 }}
                    >
                      {s.body}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
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
              Benieuwd wat er voor jouw woning mogelijk is?
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
              Plan een vrijblijvend gesprek
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Bewoners;
