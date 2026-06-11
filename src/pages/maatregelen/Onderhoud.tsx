import { ArrowLeft, Check, ArrowRight } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Seo } from "@/components/Seo";
import onderhoudImage from "@/assets/maatregel-onderhoud.jpg";

const NAVY = "#152C4E";
const INK = "#111111";
const SAND = "#FBFAF7";
const WARM = "#F6EFE2";
const GOLD = "#E8B547";
const SOFT = "#F0E4D0";
const BORDER = "#E5E2DB";
const MUTED = "#6B6B6B";
const TEXT = "#2B2B2B";

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

const Card = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      backgroundColor: "#FFFFFF",
      border: `1px solid ${BORDER}`,
      borderRadius: 16,
      padding: "24px 24px",
    }}
  >
    {children}
  </div>
);

const Onderhoud = () => (
  <div className="min-h-screen bg-background flex flex-col">
    <Seo
      title="Onderhoud | Voortraject"
      seoDescription="Goed onderhoud houdt je verduurzamingsinstallaties efficient, veilig en duurzaam. Wat kun je zelf doen en wat laat je over aan een specialist?"
      path="/verduurzamen/onderhoud"
    />
    <Header />
    <main className="flex-1">
      {/* SECTIE 1 — HERO */}
      <section
        className="pb-[64px] md:pb-[112px]"
        style={{ backgroundColor: SAND, paddingTop: "clamp(40px, 6vw, 80px)" }}
        aria-labelledby="o-title"
      >
        <div className="container-content">
          <a
            href="/verduurzamen"
            className="inline-flex items-center gap-2 text-sm transition-opacity hover:opacity-100"
            style={{ color: NAVY, opacity: 0.7 }}
          >
            <ArrowLeft size={16} /> Terug naar overzicht
          </a>

          <div className="mt-8 grid grid-cols-1 gap-10 md:gap-14 items-center lg:grid-cols-[1.1fr_1fr]">
            <div>
              <h1
                id="o-title"
                className="font-display"
                style={{
                  fontWeight: 700,
                  fontSize: "clamp(36px, 5vw, 56px)",
                  color: INK,
                  letterSpacing: "-0.02em",
                  lineHeight: 1.05,
                }}
              >
                {renderAccented("Onderhoud, zodat je installaties [[blijven]] presteren")}
              </h1>
              <p
                className="mt-5 max-w-2xl"
                style={{ fontSize: 19, color: INK, opacity: 0.85, lineHeight: 1.55, fontWeight: 500 }}
              >
                Goed onderhoud houdt je woning zuinig, veilig en comfortabel.
              </p>
              <p className="mt-4 max-w-2xl" style={{ fontSize: 16, color: MUTED, lineHeight: 1.7 }}>
                Verduurzamen stopt niet na de installatie. Een warmtepomp, airco, zonnepanelen of thuisbatterij blijven het beste werken met regelmatig onderhoud. Het houdt je systemen efficient, verlengt de levensduur en voorkomt onverwachte storingen.
              </p>
            </div>

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
                src={onderhoudImage}
                alt="Monteur controleert een installatie in een woning"
                width={1024}
                height={768}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* SECTIE 2 — Waarom onderhoud belangrijk is */}
      <Section bg="#FFFFFF">
        <SectionHeader
          title="Waarom onderhoud [[belangrijk]] is"
          sub="Regelmatig onderhoud levert meer op dan je denkt. Dit zijn de belangrijkste voordelen."
        />
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {[
            {
              title: "Lagere energiekosten",
              body: "Een goed onderhouden systeem werkt efficienter en verbruikt minder energie.",
            },
            {
              title: "Langere levensduur",
              body: "Je installaties gaan langer mee als ze regelmatig worden gecontroleerd en schoongehouden.",
            },
            {
              title: "Minder storingen",
              body: "Problemen worden op tijd opgemerkt, voordat ze tot een dure reparatie leiden.",
            },
            {
              title: "Behoud van garantie en veiligheid",
              body: "Voorgeschreven onderhoud blijft op orde, wat belangrijk is voor garantie en verzekering.",
            },
          ].map((card) => (
            <Card key={card.title}>
              <h3
                style={{
                  fontSize: 17,
                  fontWeight: 600,
                  color: NAVY,
                  lineHeight: 1.35,
                  margin: 0,
                }}
              >
                {card.title}
              </h3>
              <p style={{ fontSize: 15, color: MUTED, lineHeight: 1.7, marginTop: 10, marginBottom: 0 }}>
                {card.body}
              </p>
            </Card>
          ))}
        </div>
      </Section>

      {/* SECTIE 3 — Onderhoud per installatie */}
      <Section bg={WARM}>
        <SectionHeader title="Onderhoud per [[installatie]]" />
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
          {[
            {
              title: "Warmtepomp",
              body: "Periodieke controle van het systeem en het koudemiddel houdt de warmtepomp efficient. Dit hoort door een gecertificeerde monteur te gebeuren.",
            },
            {
              title: "Airco",
              body: "Filters schoonmaken of vervangen kun je vaak zelf. Periodieke controle van het systeem en het koudemiddel doe je het beste door een specialist.",
            },
            {
              title: "Zonnepanelen",
              body: "Panelen zijn grotendeels onderhoudsarm. Een periodieke controle van de opbrengst en de omvormer zorgt dat je problemen op tijd merkt.",
            },
            {
              title: "Thuisbatterij",
              body: "Een thuisbatterij is onderhoudsarm en wordt continu gemonitord. Software-updates en periodieke controles houden hem veilig en op prestatie.",
            },
          ].map((item) => (
            <Card key={item.title}>
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
              <p style={{ fontSize: 15, color: MUTED, lineHeight: 1.7, marginTop: 10, marginBottom: 0 }}>
                {item.body}
              </p>
            </Card>
          ))}
        </div>
      </Section>

      {/* SECTIE 4 — Zelf doen vs uitbesteden */}
      <Section bg="#FFFFFF">
        <SectionHeader title="Wat je zelf kunt doen en wat je beter [[uitbesteedt]]" />
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          <div
            style={{
              backgroundColor: SAND,
              border: `1px solid ${BORDER}`,
              borderRadius: 18,
              padding: "28px 28px",
            }}
          >
            <h3
              style={{
                fontSize: 13,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: NAVY,
                marginBottom: 18,
                marginTop: 0,
              }}
            >
              Zelf doen
            </h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }} className="flex flex-col gap-3">
              {[
                "Filters van een airco schoonmaken of vervangen",
                "Binnenunits stofvrij houden",
                "De opbrengst van je zonnepanelen in de gaten houden",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3"
                  style={{ fontSize: 16, color: TEXT, lineHeight: 1.6 }}
                >
                  <span
                    className="mt-[2px] shrink-0 rounded-full flex items-center justify-center"
                    style={{ width: 22, height: 22, backgroundColor: SOFT }}
                  >
                    <Check size={13} color={NAVY} strokeWidth={3} />
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div
            style={{
              backgroundColor: "#FFFFFF",
              border: `1px solid ${BORDER}`,
              borderRadius: 18,
              padding: "28px 28px",
            }}
          >
            <h3
              style={{
                fontSize: 13,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: MUTED,
                marginBottom: 18,
                marginTop: 0,
              }}
            >
              Beter uitbesteden
            </h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }} className="flex flex-col gap-3">
              {[
                "Alles met koudemiddelen, dit vraagt certificering",
                "Elektrische aansluitingen en de meterkast",
                "Periodieke veiligheids- en prestatiecontroles",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3"
                  style={{ fontSize: 16, color: MUTED, lineHeight: 1.6 }}
                >
                  <span
                    className="mt-[2px] shrink-0 rounded-full flex items-center justify-center"
                    style={{ width: 22, height: 22, backgroundColor: "#EFEAE0" }}
                  >
                    <Check size={13} color={MUTED} strokeWidth={3} />
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* SECTIE 5 — Hoe wij helpen + CTA */}
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
              {renderAccented("Hoe wij [[helpen]]")}
            </h2>
            <p
              className="mt-5"
              style={{ fontSize: 17, color: "#FFFFFF", opacity: 0.85, lineHeight: 1.7 }}
            >
              Wij houden overzicht op het onderhoud van je installaties en koppelen je aan vakkundige, gecertificeerde uitvoerders. Zo hoef je zelf niet bij te houden wanneer wat aan de beurt is, en blijft je woning zuinig en veilig. Wij verkopen geen onderhoudscontracten, ons advies is onafhankelijk.
            </p>
            <a
              href="/contact"
              className="mt-8 inline-flex items-center justify-center rounded-full font-semibold transition-transform hover:scale-[1.02]"
              style={{
                backgroundColor: GOLD,
                color: NAVY,
                padding: "14px 28px",
                fontSize: 15,
              }}
            >
              Plan een gratis gesprek
            </a>
          </div>
        </div>
      </section>
    </main>
    <Footer />
  </div>
);

export default Onderhoud;
