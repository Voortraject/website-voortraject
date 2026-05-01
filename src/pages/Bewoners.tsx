import { useState } from "react";
import { Check, ChevronDown, HelpCircle, Compass, LayoutList, BookOpen, Zap, Handshake, MessagesSquare, Clock, ShieldQuestion, AlertCircle } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import heroBewoners from "@/assets/bewoners-hero.jpg";

const recognitions = [
  {
    icon: MessagesSquare,
    title: "Iedereen vertelt iets anders",
    body: "De ene partij raadt isolatie aan, de andere een warmtepomp en de derde zegt dat je beter kunt wachten. Wat klopt er nu?",
  },
  {
    icon: Clock,
    title: "Wachttijden bij bestaande loketten",
    body: "Een afspraak via een gemeentelijk loket of energiecoöperatie laat soms maanden op zich wachten. Ondertussen sta jij stil.",
  },
  {
    icon: ShieldQuestion,
    title: "Onduidelijk wie betrouwbaar is",
    body: "Welke uitvoerder doet goed werk en welke niet? Op internet vind je tegenstrijdige reviews en het voelt als gokken.",
  },
  {
    icon: AlertCircle,
    title: "Bang om iets te missen",
    body: "Subsidies, regelingen en aanvullende kansen: het is veel om bij te houden, en niemand wil achteraf horen dat hij geld heeft laten liggen.",
  },
];

const gemeenteCardsData = [
  {
    title: "Aanvullende gemeentelijke subsidies",
    body: "Veel gemeenten hebben aanvullende regelingen bovenop de landelijke subsidies. We kijken welke voor jouw adres relevant zijn.",
  },
  {
    title: "Combinaties met andere regelingen",
    body: "Sommige regelingen kunnen samen worden gebruikt. We brengen in kaart welke combinaties voor jouw situatie kunnen werken.",
  },
  {
    title: "Onderhoud en verduurzaming koppelen",
    body: "Klein of groot onderhoud loopt soms slim samen met verduurzaming. We kijken of dat voor jouw woning kansen biedt.",
  },
  {
    title: "Aansluiting bij Nij Begun",
    body: "Voor adressen in het aardbevingsgebied checken we of een verduurzamingstraject kan aansluiten bij Nij Begun.",
  },
];

const questionsRow1 = [
  "Kan ik volledig van het gas af?",
  "Wat is slim om eerst te doen?",
  "Welke subsidies zijn relevant?",
];
const questionsRow2 = [
  "Wat past bij mijn woning?",
  "Hoe kom ik tot uitvoering?",
  "Wat als ik huurder ben?",
  "Waar begin ik?",
];
const allQuestions = [...questionsRow1, ...questionsRow2];

const services = [
  {
    icon: Compass,
    title: "Onafhankelijk advies",
    body: "Geen producten te verkopen, geen vaste partner. Alleen advies dat slim is voor jouw woning.",
  },
  {
    icon: LayoutList,
    title: "Overzicht in maatregelen",
    body: "Welke maatregelen voor jouw woning logisch zijn, en in welke volgorde ze het meeste opleveren.",
  },
  {
    icon: BookOpen,
    title: "Uitleg over regelingen",
    body: "Landelijke en gemeentelijke regelingen op een rij, inclusief aanvullende kansen die je makkelijk over het hoofd ziet.",
  },
  {
    icon: Zap,
    title: "Geen wachtrij",
    body: "Geen wachttijden van weken of maanden. We schakelen snel, zodat je niet stilstaat.",
  },
  {
    icon: Handshake,
    title: "Naar een betrouwbare uitvoerder",
    body: "Als de keuze helder is, koppelen we je aan een uitvoerder waarvan we weten dat ze goed werk leveren.",
  },
];

const routeSteps = [
  {
    title: "Inzicht in je woning",
    body: "We kijken eerst naar isolatie, ventilatie en de huidige staat van je woning. Wat is er al gedaan, wat is de basis, en welke maatregelen liggen voor de hand? Zonder dit fundament weet je niet waar je aan begint.",
  },
  {
    title: "Weten wat nu slim is",
    body: "Niet alles hoeft tegelijk. Soms is een nieuwe ketel nu nog logisch, soms juist niet. We bepalen wat op dit moment het meeste oplevert voor jouw situatie, en wat beter kan wachten.",
  },
  {
    title: "Een logische volgorde",
    body: "Sommige maatregelen werken alleen als andere eerst gedaan zijn. Een warmtepomp in een slecht geïsoleerde woning levert weinig op. We zetten een volgorde uit die past bij jouw woning en budget.",
  },
  {
    title: "Alle regelingen op een rij",
    body: "Landelijke subsidies, gemeentelijke aanvullingen, combinaties met onderhoud, koppelingen aan trajecten zoals Nij Begun. We zetten op een rij wat voor jou relevant is, zodat je niets misloopt.",
  },
  {
    title: "Naar de juiste uitvoerder",
    body: "Als de keuze helder is, koppelen we je aan een uitvoerder waarvan we weten dat ze goed werk leveren voor een eerlijke prijs. Geen gokken op een naam van internet.",
  },
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
          style={{ backgroundColor: "#FFFFFF" }}
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
                  advies,<br />zonder wachtrijen
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
              {recognitions.map((r) => {
                const Icon = r.icon;
                return (
                  <article key={r.title} style={cardBase}>
                    <div className="flex flex-row items-center gap-3">
                      <Icon size={20} color="#E8B547" style={{ flexShrink: 0 }} aria-hidden="true" />
                      <h3
                        className="font-display font-semibold"
                        style={{ fontSize: 19, color: "#152C4E", letterSpacing: "-0.01em", lineHeight: 1.3, margin: 0 }}
                      >
                        {r.title}
                      </h3>
                    </div>
                    <p className="mt-3" style={{ fontSize: 16, color: "#6B6B6B", lineHeight: 1.6, margin: "12px 0 0" }}>
                      {r.body}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* 3. VRAGENBLOK */}
        <section className="py-[64px] md:py-[96px]" style={{ backgroundColor: "#FFFFFF" }}>
          <div className="container-content">
            {/* Kop */}
            <div className="text-center max-w-[760px] mx-auto">
              <h2 className="h2-section" style={{ color: "#152C4E" }}>
                De <span style={{ color: "hsl(var(--accent))" }}>vragen</span> waar wij mee beginnen
              </h2>
              <p
                className="mt-6 text-[18px] mx-auto"
                style={{ color: "#6B6B6B", lineHeight: 1.6, maxWidth: "90ch" }}
              >
                De meeste bewoners lopen vast op dezelfde punten: te veel keuzes, onduidelijke regelingen, wachttijden of advies dat elkaar tegenspreekt. Met deze vragen beginnen wij meestal.
              </p>
            </div>

            {/* Desktop: pill + svg + grid */}
            <div className="hidden md:block">
              <div
                className="mx-auto"
                style={{
                  marginTop: 32,
                  width: 160,
                  height: 52,
                  borderRadius: 26,
                  backgroundColor: "#E8B547",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#152C4E",
                  fontSize: 19,
                  fontWeight: 500,
                }}
              >
                Voortraject
              </div>

              <div className="w-full" style={{ aspectRatio: "15 / 1" }}>
                <svg
                  viewBox="0 0 1200 80"
                  xmlns="http://www.w3.org/2000/svg"
                  preserveAspectRatio="xMidYMid meet"
                  className="w-full h-full"
                  aria-hidden="true"
                >
                  <line x1="600" y1="38" x2="600" y2="20" stroke="#E8B547" strokeWidth="1.5" opacity="0.75" />
                  <polygon points="594,20 606,20 600,12" fill="#E8B547" opacity="0.85" />
                  <path
                    d="M 60,80 Q 60,55 80,55 L 585,55 Q 600,55 600,38 Q 600,55 615,55 L 1120,55 Q 1140,55 1140,80"
                    fill="none"
                    stroke="#E8B547"
                    strokeWidth="1.5"
                    opacity="0.75"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              <div className="w-full" style={{ marginTop: 24 }}>
                <div className="grid grid-cols-3 w-full" style={{ gap: 18 }}>
                  {questionsRow1.map((q) => (
                    <article
                      key={q}
                      style={{
                        backgroundColor: "#FFFFFF",
                        border: "1px solid #E5E2DB",
                        borderRadius: 16,
                        padding: "12px 16px",
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                      }}
                    >
                      <HelpCircle size={18} style={{ color: "#E8B547", opacity: 0.8, flexShrink: 0 }} />
                      <span style={{ color: "#152C4E", fontSize: 14, lineHeight: 1.4 }}>{q}</span>
                    </article>
                  ))}
                </div>
                <div className="grid grid-cols-4 w-full" style={{ gap: 14, marginTop: 14 }}>
                  {questionsRow2.map((q) => (
                    <article
                      key={q}
                      style={{
                        backgroundColor: "#FFFFFF",
                        border: "1px solid #E5E2DB",
                        borderRadius: 16,
                        padding: "12px 16px",
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                      }}
                    >
                      <HelpCircle size={18} style={{ color: "#E8B547", opacity: 0.8, flexShrink: 0 }} />
                      <span style={{ color: "#152C4E", fontSize: 14, lineHeight: 1.4 }}>{q}</span>
                    </article>
                  ))}
                </div>
              </div>
            </div>

            {/* Mobile fallback */}
            <div className="md:hidden flex flex-col items-center" style={{ marginTop: 32 }}>
              <div
                style={{
                  width: 160,
                  height: 52,
                  borderRadius: 26,
                  backgroundColor: "#E8B547",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#152C4E",
                  fontSize: 19,
                  fontWeight: 500,
                }}
              >
                Voortraject
              </div>
              <span
                aria-hidden="true"
                style={{
                  display: "block",
                  width: 1,
                  height: 28,
                  backgroundColor: "#E8B547",
                  opacity: 0.7,
                  marginTop: 8,
                  marginBottom: 8,
                }}
              />
              <div className="grid grid-cols-1 w-full" style={{ gap: 12 }}>
                {allQuestions.map((q) => (
                  <article
                    key={q}
                    style={{
                      backgroundColor: "#FFFFFF",
                      border: "1px solid #E5E2DB",
                      borderRadius: 16,
                      padding: "12px 16px",
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    <HelpCircle size={18} style={{ color: "#E8B547", opacity: 0.8, flexShrink: 0 }} />
                    <span style={{ color: "#152C4E", fontSize: 14, lineHeight: 1.4 }}>{q}</span>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 4. WAT WIJ VOOR JE DOEN */}
        <section className="py-[64px] md:py-[96px]" style={{ backgroundColor: "#F5F2EC" }}>
          <div className="container-content">
            <div className="relative max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-y-8 lg:gap-x-16 items-center">
              {/* Verticale scheidingslijn (desktop) */}
              <div
                aria-hidden="true"
                className="hidden lg:block absolute"
                style={{ top: 0, bottom: 0, left: "50%", width: 2, backgroundColor: "#E5E2DB", transform: "translateX(-1px)" }}
              />

              {/* Linker kolom */}
              <div
                className="flex flex-col"
                style={{ justifyContent: "center", gap: 24 }}
              >
                <h2 className="h2-section" style={{ color: "#152C4E" }}>
                  Wat <span style={{ color: "hsl(var(--accent))" }}>wij</span> voor je doen
                </h2>
                <p
                  className="max-w-md"
                  style={{ color: "#152C4E", opacity: 0.75, fontSize: 16, lineHeight: 1.6, margin: 0 }}
                >
                  Geen verkooppraatje, geen standaardverhaal. We kijken eerst naar jouw woning, situatie en doel. Daarna pas komt het advies.
                </p>
                <p
                  style={{
                    color: "#152C4E",
                    fontSize: 22,
                    fontWeight: 500,
                    fontStyle: "italic",
                    lineHeight: 1.3,
                    margin: 0,
                  }}
                >
                  Van twijfel naar plan.
                </p>
              </div>

              {/* Rechter kolom */}
              <ul
                style={{ margin: 0, padding: 0, listStyle: "none" }}
              >
                {services.map((s, i) => {
                  const Icon = s.icon;
                  return (
                    <li
                      key={s.title}
                      className="flex flex-row gap-4 items-start"
                      style={{
                        padding: "20px 0",
                        borderBottom: i === services.length - 1 ? "none" : "1px solid #E5E2DB",
                      }}
                    >
                      <Icon size={24} color="#E8B547" style={{ flexShrink: 0, marginTop: 2 }} />
                      <div>
                        <h3
                          className="font-display"
                          style={{
                            color: "#152C4E",
                            fontSize: 17,
                            fontWeight: 600,
                            marginBottom: 6,
                            margin: "0 0 6px",
                            lineHeight: 1.3,
                          }}
                        >
                          {s.title}
                        </h3>
                        <p
                          style={{
                            color: "#152C4E",
                            opacity: 0.75,
                            fontSize: 15,
                            lineHeight: 1.5,
                            margin: 0,
                          }}
                        >
                          {s.body}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </section>

        {/* 5. PRAKTISCHE ROUTE - ACCORDION */}
        <section className="py-[64px] md:py-[96px]" style={{ backgroundColor: "#FFFFFF" }}>
          <div className="container-content">
            <div className="text-center max-w-[820px] mx-auto">
              <h2 className="h2-section" style={{ color: "#152C4E" }}>
                Verduurzamen is een <span style={{ color: "hsl(var(--accent))" }}>route</span>,<br />geen losse stap
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
        <section className="py-[64px] md:py-[96px]" style={{ backgroundColor: "#F5F2EC" }}>
          <div className="container-content">
            <h2 className="h2-section text-center" style={{ color: "#152C4E" }}>
              Meer dan alleen<br /><span style={{ color: "hsl(var(--accent))" }}>landelijke</span> subsidies
            </h2>
            <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-4xl mx-auto items-stretch">
              {gemeenteCardsData.map((c) => (
                <div
                  key={c.title}
                  className="flex items-start gap-3 h-full"
                  style={{
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #E5E2DB",
                    borderRadius: 16,
                    padding: "20px 24px",
                  }}
                >
                  <Check
                    size={18}
                    color="#E8B547"
                    strokeWidth={2.5}
                    aria-hidden="true"
                    style={{ flexShrink: 0, marginTop: 4 }}
                  />
                  <div>
                    <h3
                      className="font-display font-semibold"
                      style={{ fontSize: 16, color: "#152C4E", lineHeight: 1.35, margin: 0 }}
                    >
                      {c.title}
                    </h3>
                    <p
                      style={{
                        marginTop: 8,
                        fontSize: 15,
                        color: "#6B6B6B",
                        lineHeight: 1.55,
                        margin: "8px 0 0",
                      }}
                    >
                      {c.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <p
              className="text-center mx-auto"
              style={{
                marginTop: 32,
                maxWidth: "48rem",
                fontSize: 16,
                lineHeight: 1.6,
                color: "rgba(21,44,78,0.75)",
              }}
            >
              Wij kijken specifiek naar wat in jouw gemeente speelt, welke combinaties slim zijn en wat dat voor jouw plan betekent.
            </p>
          </div>
        </section>

        {/* 7. WAAROM BEWONERS DIT PRETTIG VINDEN */}
        <section className="py-[64px] md:py-[96px]" style={{ backgroundColor: "#FFFFFF" }}>
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
