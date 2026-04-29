import { useState } from "react";
import { Check, ChevronDown, HelpCircle } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import heroBewoners from "@/assets/bewoners-hero.jpg";

const recognitions = [
  {
    title: "Iedereen vertelt iets anders",
    body: "De ene partij raadt isolatie aan, de andere een warmtepomp en de derde zegt dat je beter kunt wachten. Wat klopt er nu?",
  },
  {
    title: "Wachttijden bij bestaande loketten",
    body: "Een afspraak via een gemeentelijk loket of energiecoöperatie laat soms maanden op zich wachten. Ondertussen sta jij stil.",
  },
  {
    title: "Onduidelijk wie betrouwbaar is",
    body: "Welke uitvoerder doet goed werk en welke niet? Op internet vind je tegenstrijdige reviews en het voelt als gokken.",
  },
  {
    title: "Bang om iets te missen",
    body: "Subsidies, regelingen en aanvullende kansen: het is veel om bij te houden, en niemand wil achteraf horen dat hij geld heeft laten liggen.",
  },
];

// Hub-and-spoke vragen
const hubQuestions = [
  { text: "Waar begin ik?", top: "15%", left: "50%" },
  { text: "Wat is slim om eerst te doen?", top: "29%", left: "68%" },
  { text: "Welke subsidies zijn relevant?", top: "56%", left: "73%" },
  { text: "Hoe kom ik van plan naar uitvoering?", top: "81%", left: "60%" },
  { text: "Wat past bij mijn woning?", top: "81%", left: "40%" },
  { text: "Wat als ik huurder ben?", top: "56%", left: "27%" },
  { text: "Kan ik volledig van het gas af?", top: "29%", left: "32%" },
];

const services = [
  {
    title: "Onafhankelijk meekijken",
    body: "We luisteren eerst en kijken zonder commercieel belang naar jouw situatie. Geen voorgekauwd antwoord. Advies dat past bij jouw woning.",
  },
  {
    title: "Overzicht in maatregelen",
    body: "Isolatie, ventilatie, zonnepanelen, warmtepomp: we helpen je zien welke maatregelen logisch zijn voor jouw woning, in welke volgorde en wat de gevolgen zijn voor je energierekening.",
  },
  {
    title: "Uitleg over regelingen en subsidies",
    body: "We zetten op een rij welke landelijke en gemeentelijke regelingen voor jou relevant zijn, inclusief aanvullende subsidies en combinaties die je makkelijk mist.",
  },
  {
    title: "Hulp bij keuzes, zonder wachtrij",
    body: "Geen wachttijden van weken of maanden. We schakelen snel zodat je niet stilstaat.",
  },
  {
    title: "Begeleiding naar een betrouwbare uitvoerder",
    body: "Als de keuze helder is, koppelen we je aan een uitvoerder waarvan we weten dat ze goed werk leveren. Zo hoef jij niet te gokken op een naam van internet.",
  },
];

const routeSteps = [
  {
    title: "Basis van je woning",
    body: "We kijken eerst naar isolatie, ventilatie en de huidige staat van je woning. Dat bepaalt wat zinvol is.",
  },
  {
    title: "Wat is nu logisch",
    body: "Niet alles tegelijk. We bepalen welke maatregel op dit moment het meeste oplevert voor jouw situatie.",
  },
  {
    title: "De juiste volgorde",
    body: "Sommige stappen werken alleen als andere eerst gedaan zijn. We zetten een volgorde uit die past.",
  },
  {
    title: "Regelingen meenemen",
    body: "Subsidies en aanvullende regelingen koppelen we aan de juiste stappen, zodat je niets misloopt.",
  },
  {
    title: "Richting uitvoering",
    body: "Met een helder plan in de hand koppelen we je aan een uitvoerder en begeleiden we je tot het werk start.",
  },
];

const gemeenteCards = [
  "Aanvullende gemeentelijke subsidies",
  "Combinaties met andere regelingen",
  "Onderhoud en verduurzaming koppelen",
  "Aansluiting bij Nij Begun",
];

const reasons = [
  "Onafhankelijk, geen commercieel belang",
  "Geen verkooppraatje",
  "Geen wachtrijen van maanden",
  "Duidelijkheid in gewone taal",
  "Aandacht voor jouw situatie",
  "Begeleiding naar betrouwbare uitvoerder",
];

const ctaButton =
  "inline-flex items-center justify-center font-sans font-semibold text-[15px] transition-colors";

const cardBase: React.CSSProperties = {
  borderRadius: 16,
  padding: 24,
  border: "1px solid #E5E2DB",
  backgroundColor: "#FFFFFF",
  boxShadow: "0 4px 24px rgba(21,44,78,0.04)",
};

const Bewoners = () => {
  const [openStep, setOpenStep] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1">
        {/* 1. HERO */}
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
                  <span style={{ color: "hsl(var(--accent))" }}>Onafhankelijk</span>{" "}
                  advies, zonder wachtrijen
                </h1>
                <p
                  className="mt-8 text-[16px] md:text-[18px]"
                  style={{ color: "#6B6B6B", lineHeight: 1.6, maxWidth: 580 }}
                >
                  Tegenstrijdige adviezen, lange wachttijden bij bestaande loketten en onduidelijkheid over wat nu echt slim is. Wij kijken onafhankelijk met je mee, brengen rust in de keuzes en begeleiden je richting een passende uitvoerder. Zonder verkooppraatje, zonder onnodige vertraging.
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
                    Plan een gratis gesprek
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

        {/* 2. HERKENNING */}
        <section className="py-[64px] md:py-[96px]" style={{ backgroundColor: "#F5F2EC" }}>
          <div className="container-content">
            <div className="text-center max-w-[760px] mx-auto">
              <h2 className="h2-section" style={{ color: "#152C4E" }}>
                Misschien <span style={{ color: "hsl(var(--accent))" }}>herken</span> je dit
              </h2>
              <p className="mt-6 text-[18px]" style={{ color: "#6B6B6B", lineHeight: 1.6 }}>
                Verduurzamen roept bij bijna iedere bewoner dezelfde twijfels op.
              </p>
            </div>
            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-5">
              {recognitions.map((r) => (
                <article key={r.title} style={cardBase}>
                  <h3
                    className="font-display font-semibold"
                    style={{ fontSize: 19, color: "#152C4E", letterSpacing: "-0.01em", lineHeight: 1.3, margin: 0 }}
                  >
                    {r.title}
                  </h3>
                  <p className="mt-3" style={{ fontSize: 16, color: "#6B6B6B", lineHeight: 1.6, margin: "12px 0 0" }}>
                    {r.body}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* 3. VRAGENBLOK - HUB AND SPOKE */}
        <section className="py-[64px] md:py-[96px]" style={{ backgroundColor: "#FBFAF7" }}>
          <div className="container-content">
            {/* Desktop hub-and-spoke */}
            <div
              className="hidden md:block relative mx-auto"
              style={{ maxWidth: 900, aspectRatio: "800 / 540" }}
            >
              <svg
                className="absolute inset-0 w-full h-full"
                viewBox="0 0 800 540"
                preserveAspectRatio="xMidYMid meet"
                aria-hidden="true"
              >
                <line x1="400" y1="270" x2="400" y2="80" stroke="#E8B547" strokeWidth="1" opacity="0.45" />
                <line x1="400" y1="270" x2="545" y2="158" stroke="#E8B547" strokeWidth="1" opacity="0.45" />
                <line x1="400" y1="270" x2="585" y2="305" stroke="#E8B547" strokeWidth="1" opacity="0.45" />
                <line x1="400" y1="270" x2="478" y2="440" stroke="#E8B547" strokeWidth="1" opacity="0.45" />
                <line x1="400" y1="270" x2="322" y2="440" stroke="#E8B547" strokeWidth="1" opacity="0.45" />
                <line x1="400" y1="270" x2="215" y2="305" stroke="#E8B547" strokeWidth="1" opacity="0.45" />
                <line x1="400" y1="270" x2="255" y2="158" stroke="#E8B547" strokeWidth="1" opacity="0.45" />
              </svg>

              {/* Center pill */}
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: 160,
                  height: 60,
                  borderRadius: 30,
                  backgroundColor: "#E8B547",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#152C4E",
                  fontSize: 22,
                  fontWeight: 500,
                }}
              >
                Voortraject
              </div>

              {/* Question labels */}
              {hubQuestions.map((q) => (
                <span
                  key={q.text}
                  style={{
                    position: "absolute",
                    top: q.top,
                    left: q.left,
                    transform: "translate(-50%, -50%)",
                    maxWidth: 200,
                    textAlign: "center",
                    color: "#152C4E",
                    fontSize: 15,
                    fontWeight: 400,
                  }}
                >
                  {q.text}
                </span>
              ))}
            </div>

            {/* Mobile stacked */}
            <div className="md:hidden flex flex-col items-center">
              <div
                style={{
                  width: 160,
                  height: 60,
                  borderRadius: 30,
                  backgroundColor: "#E8B547",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#152C4E",
                  fontSize: 22,
                  fontWeight: 500,
                }}
              >
                Voortraject
              </div>
              {hubQuestions.map((q, i) => (
                <div key={q.text} className="flex flex-col items-center">
                  <span
                    style={{
                      display: "block",
                      width: 1,
                      height: 24,
                      backgroundColor: "#E8B547",
                      opacity: 0.45,
                      marginTop: i === 0 ? 0 : 0,
                    }}
                  />
                  <p
                    style={{
                      color: "#152C4E",
                      fontSize: 16,
                      textAlign: "center",
                      margin: 0,
                      paddingTop: 12,
                    }}
                  >
                    {q.text}
                  </p>
                  {i < hubQuestions.length - 1 && (
                    <span
                      style={{
                        display: "block",
                        width: 1,
                        height: 24,
                        backgroundColor: "#E8B547",
                        opacity: 0.45,
                        marginTop: 12,
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. WAT WIJ VOOR JE DOEN */}
        <section className="py-[64px] md:py-[96px]" style={{ backgroundColor: "#F5F2EC" }}>
          <div className="container-content">
            <h2 className="h2-section" style={{ color: "#152C4E" }}>
              Wat <span style={{ color: "hsl(var(--accent))" }}>wij</span> voor je doen
            </h2>
            <p
              className="mt-6 text-[18px]"
              style={{ color: "#6B6B6B", lineHeight: 1.6, maxWidth: 760 }}
            >
              Geen verkooppraatje, geen vooropgezet plan. We kijken eerst naar jouw woning, jouw situatie en wat je écht wilt bereiken. Pas daarna komt het advies.
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
                      style={{ fontSize: 15, color: "#6B6B6B", lineHeight: 1.6, maxWidth: 720 }}
                    >
                      {s.body}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 5. PRAKTISCHE ROUTE - ACCORDION */}
        <section className="py-[64px] md:py-[96px]" style={{ backgroundColor: "#FBFAF7" }}>
          <div className="container-content">
            <div className="text-center max-w-[820px] mx-auto">
              <h2 className="h2-section" style={{ color: "#152C4E" }}>
                Verduurzamen is een <span style={{ color: "hsl(var(--accent))" }}>route</span>, geen losse stap
              </h2>
              <p className="mt-6 text-[18px]" style={{ color: "#6B6B6B", lineHeight: 1.6 }}>
                De meeste bewoners denken in losse maatregelen: even een warmtepomp, of even zonnepanelen. Maar slim verduurzamen werkt het beste als je in de juiste volgorde denkt. Anders betaal je dubbel of mis je kansen.
              </p>
            </div>

            <div
              className="mt-16 mx-auto"
              style={{ maxWidth: 820, ...cardBase, padding: 0, overflow: "hidden" }}
            >
              {routeSteps.map((s, i) => {
                const isOpen = openStep === i;
                return (
                  <div
                    key={s.title}
                    style={{
                      borderBottom: i === routeSteps.length - 1 ? "none" : "1px solid #E5E2DB",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenStep(isOpen ? null : i)}
                      aria-expanded={isOpen}
                      className="w-full flex items-center text-left"
                      style={{
                        padding: "20px 24px",
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        gap: 20,
                      }}
                    >
                      <span
                        className="font-display"
                        style={{
                          fontSize: 28,
                          fontWeight: 500,
                          color: "#E8B547",
                          letterSpacing: "-0.02em",
                          lineHeight: 1,
                          flexShrink: 0,
                          width: 56,
                        }}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <h3
                        className="font-display flex-1"
                        style={{
                          fontSize: 18,
                          fontWeight: 500,
                          color: "#152C4E",
                          letterSpacing: "-0.01em",
                          lineHeight: 1.3,
                          margin: 0,
                        }}
                      >
                        {s.title}
                      </h3>
                      <ChevronDown
                        size={20}
                        color="#E8B547"
                        style={{
                          opacity: 0.5,
                          transition: "transform 200ms ease",
                          transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                          flexShrink: 0,
                        }}
                        aria-hidden="true"
                      />
                    </button>
                    <div
                      style={{
                        maxHeight: isOpen ? 200 : 0,
                        overflow: "hidden",
                        transition: "max-height 300ms ease",
                      }}
                    >
                      <p
                        style={{
                          fontSize: 15,
                          color: "#6B6B6B",
                          lineHeight: 1.6,
                          margin: 0,
                          padding: "0 24px 20px 100px",
                        }}
                      >
                        {s.body}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <p
              className="text-center"
              style={{
                fontSize: 16,
                lineHeight: 1.6,
                color: "rgba(21,44,78,0.7)",
                maxWidth: 720,
                margin: "48px auto 0",
              }}
            >
              Wil je uiteindelijk volledig van het gas af? Dat vraagt vaak meer dan één maatregel. Wij helpen je het plan uitzetten.
            </p>
          </div>
        </section>

        {/* 6. AANVULLENDE MOGELIJKHEDEN PER GEMEENTE */}
        <section className="py-[64px] md:py-[96px]" style={{ backgroundColor: "#FBFAF7" }}>
          <div className="container-content">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div>
                <h2 className="h2-section" style={{ color: "#152C4E" }}>
                  Meer dan alleen <span style={{ color: "hsl(var(--accent))" }}>landelijke</span> subsidies
                </h2>
                <p className="mt-6 text-[17px]" style={{ color: "#6B6B6B", lineHeight: 1.7 }}>
                  Naast de landelijke regelingen zijn er per gemeente vaak aanvullende subsidies en kansen die makkelijk over het hoofd worden gezien. Soms in combinatie met klein of groot onderhoud, soms gekoppeld aan WOZ-waarden of lopende trajecten zoals Nij Begun.
                </p>
                <p className="mt-4 text-[17px]" style={{ color: "#6B6B6B", lineHeight: 1.7 }}>
                  Wij kijken specifiek naar wat in jouw gemeente speelt, welke combinaties slim zijn en wat dat voor jouw plan betekent.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {gemeenteCards.map((c) => (
                  <div
                    key={c}
                    className="flex items-center gap-3"
                    style={{
                      ...cardBase,
                      padding: 20,
                      backgroundColor: "#FFFFFF",
                      minHeight: 64,
                    }}
                  >
                    <Check size={18} color="#E8B547" strokeWidth={2.5} aria-hidden="true" />
                    <span
                      className="font-display font-semibold"
                      style={{ fontSize: 15, color: "#152C4E", lineHeight: 1.35 }}
                    >
                      {c}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 7. WAAROM BEWONERS DIT PRETTIG VINDEN */}
        <section className="py-[64px] md:py-[96px]" style={{ backgroundColor: "#F5F2EC" }}>
          <div className="container-content">
            <div className="text-center max-w-[760px] mx-auto">
              <h2 className="h2-section" style={{ color: "#152C4E" }}>
                Waarom bewoners dit <span style={{ color: "hsl(var(--accent))" }}>prettig</span> vinden
              </h2>
              <p className="mt-6 text-[18px]" style={{ color: "#6B6B6B", lineHeight: 1.6 }}>
                Wat bewoners ons het vaakst teruggeven over onze aanpak.
              </p>
            </div>
            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {reasons.map((r) => (
                <div
                  key={r}
                  className="flex items-center gap-3"
                  style={{ ...cardBase, padding: 20, minHeight: 56 }}
                >
                  <span
                    className="flex items-center justify-center rounded-full shrink-0"
                    style={{ width: 28, height: 28, backgroundColor: "#F0E4D0" }}
                  >
                    <Check size={16} color="#152C4E" strokeWidth={2.5} aria-hidden="true" />
                  </span>
                  <p
                    className="lg:whitespace-nowrap"
                    style={{ fontSize: 15, color: "#152C4E", lineHeight: 1.5, margin: 0 }}
                  >
                    {r}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 8. SLUIT-CTA */}
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
                maxWidth: 820,
                marginBottom: 20,
              }}
            >
              Snel duidelijkheid voor jouw woning
            </h2>
            <p
              style={{
                color: "#FFFFFF",
                opacity: 0.9,
                fontSize: 17,
                lineHeight: 1.6,
                maxWidth: 760,
                marginBottom: 36,
              }}
            >
              In een gratis gesprek brengen we samen in kaart wat er voor jouw woning mogelijk is, welke regelingen relevant zijn en welke vervolgstap nu logisch is. Geen verplichtingen, geen verkooppraatje.
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
