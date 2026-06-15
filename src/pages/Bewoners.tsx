import { useState } from "react";
import { Check, CheckCircle, ChevronDown, HelpCircle, Compass, LayoutList, BookOpen, Zap, Handshake, MessageSquare, Clock, ShieldQuestion, CircleDollarSign } from "lucide-react";
import { Header } from "@/components/Header";
import { Seo } from "@/components/Seo";
import { Footer } from "@/components/Footer";
import { OfBelOnsCta } from "@/components/OfBelOnsCta";
import heroBewoners from "@/assets/bewoners-hero.jpg";

const recognitions = [
  {
    icon: MessageSquare,
    title: "Iedereen vertelt iets anders",
    body: "De ene partij raadt isolatie aan, de andere een warmtepomp, de derde zegt dat je beter kunt wachten. Je weet niet meer wie je kunt geloven.",
  },
  {
    icon: Clock,
    title: "Maanden wachten op een afspraak",
    body: "Gemeentelijke loketten en energiecoöperaties hebben wachtlijsten van weken tot maanden. Ondertussen staat alles stil.",
  },
  {
    icon: ShieldQuestion,
    title: "Onduidelijk wie je kunt vertrouwen",
    body: "Welke uitvoerder levert goede kwaliteit en welke niet? Reviews spreken elkaar tegen en het voelt als gokken.",
  },
  {
    icon: CircleDollarSign,
    title: "Bang om geld te laten liggen",
    body: "Er zijn meer regelingen dan je denkt, maar ze stapelen slim of helemaal niet. Niemand wil achteraf horen dat hij duizenden euro's heeft gemist.",
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

const questionAnswers: Record<string, string> = {
  "Kan ik volledig van het gas af?":
    "Dat hangt af van jouw woning en situatie. Voor de meeste woningen is het technisch mogelijk, maar het vraagt een logische volgorde: eerst isoleren, dan pas een warmtepomp overwegen. Wij helpen je bepalen of en wanneer dat voor jou realistisch is.",
  "Wat is slim om eerst te doen?":
    "Bijna altijd: isoleren. Een goed geïsoleerde woning verlaagt je energieverbruik direct en maakt andere maatregelen later effectiever en goedkoper. We kijken welke isolatiemaatregelen voor jouw woning het meeste opleveren.",
  "Welke subsidies zijn relevant?":
    "Dat verschilt per adres, inkomen en welke maatregelen je plant. Landelijke ISDE, Nij Begun (Groningen en Noord-Drenthe), gemeentelijke bijdragen en provinciale regelingen kunnen vaak worden gestapeld. We brengen voor jouw situatie in kaart wat er geldt.",
  "Wat past bij mijn woning?":
    "We kijken naar bouwjaar, constructie, verwarmingssysteem en energieverbruik. Op basis daarvan geven we concrete aanbevelingen die passen bij jouw woning en budget, geen standaardlijstje.",
  "Hoe kom ik tot uitvoering?":
    "Na het gesprek weet je wat logisch is, wat het kost en welke regelingen je kunt benutten. Als je wilt, koppelen we je aan een uitvoerder die we kennen en die goed werk levert in jouw regio.",
  "Wat als ik huurder ben?":
    "Als huurder zijn de mogelijkheden beperkter, maar niet nul. Afhankelijk van jouw huurcontract en verhuurder zijn er soms regelingen mogelijk. We kijken wat in jouw situatie van toepassing is en wat je kunt vragen aan jouw verhuurder.",
  "Waar begin ik?":
    "Met een gesprek van 15 minuten. We stellen je een paar gerichte vragen over je woning en situatie, en je vertrekt met een helder beeld van wat logisch is als eerste stap. Geen verplichtingen, geen kosten.",
};

const services = [
  {
    icon: Compass,
    title: "Onafhankelijk advies",
    body: "Geen producten te verkopen, geen vaste installateur. Alleen wat voor jouw woning logisch is.",
  },
  {
    icon: LayoutList,
    title: "Een logische volgorde",
    body: "Welke maatregelen eerst, welke later. Zodat je niet twee keer betaalt of kansen mist.",
  },
  {
    icon: BookOpen,
    title: "Alle regelingen op een rij",
    body: "Landelijk, gemeentelijk, provinciaal. Wij brengen in kaart wat voor jouw adres relevant is.",
  },
  {
    icon: Zap,
    title: "Geen wachtlijsten",
    body: "Geen maanden wachten op een afspraak die niets oplevert. Wij schakelen snel.",
  },
  {
    icon: Handshake,
    title: "Begeleiding naar de juiste uitvoerder",
    body: "Als de keuze helder is, koppelen we je aan een uitvoerder waarvan we weten dat hij goed werk levert.",
  },
];

const routeSteps = [
  {
    title: "Inzicht in je woning",
    body: "We beginnen met jouw specifieke situatie: bouwjaar, isolatiewaarden, verwarmingssysteem en energieverbruik. Geen standaardadvies, maar een beeld van wat jouw woning nu nodig heeft en waar de meeste winst zit.",
  },
  {
    title: "Weten wat nu slim is",
    body: "Niet elke maatregel is op elk moment de juiste keuze. We kijken wat voor jouw woning logisch is om nu aan te pakken, wat je beter kunt uitstellen en waarom. Zo voorkom je dat je investeert in iets wat je later duurder uitkomt.",
  },
  {
    title: "Een logische volgorde",
    body: "Sommige maatregelen werken alleen als andere eerst gedaan zijn. Een warmtepomp in een slecht geïsoleerde woning levert weinig op. We zetten een volgorde uit die past bij jouw woning en budget.",
  },
  {
    title: "Alle regelingen op een rij",
    body: "Landelijke subsidies, gemeentelijke bijdragen, provinciale regelingen en aanvullende financieringsmogelijkheden. We brengen in kaart wat voor jouw adres en situatie geldt, hoe je ze kunt stapelen en wat je daadwerkelijk kunt verwachten.",
  },
  {
    title: "Naar de juiste uitvoerder",
    body: "Als het plan helder is, koppelen we je aan een uitvoerder die we kennen en die goed werk levert. Geen aanbevelingen op basis van commissie, maar op basis van kwaliteit en passend werkgebied.",
  },
];

const reasons: { title: string; body: string }[] = [
  {
    title: "Geen verkooppraatje, nooit",
    body: "Wij verkopen geen warmtepompen, zonnepanelen of isolatiemateriaal. Ons advies heeft geen commercieel belang.",
  },
  {
    title: "Binnen dagen een gesprek, niet maanden",
    body: "Geen wachtlijst van twaalf weken. Je plant een moment dat jou uitkomt en wordt snel geholpen.",
  },
  {
    title: "Concreet, niet vaag",
    body: "Je vertrekt niet met \"het hangt ervan af.\" Je krijgt een helder beeld van wat logisch is, wat het kost en wat je terug kunt krijgen.",
  },
  {
    title: "Alles op één plek",
    body: "Maatregelen, subsidies, volgorde en uitvoerder. Je hoeft niet zelf vijf partijen te vergelijken.",
  },
  {
    title: "Jij hoeft geen subsidie-expert te zijn",
    body: "Wij kennen alle regelingen en houden de wijzigingen bij. Jij hoeft alleen te weten dat je wil verduurzamen.",
  },
  {
    title: "Begeleiding tot het af is",
    body: "Wij stoppen niet na het advies. We begeleiden je naar de juiste uitvoerder en houden overzicht tot het traject klaar is.",
  },
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
  const [activeQuestion, setActiveQuestion] = useState<string | null>(null);

  const renderQuestionPill = (q: string) => {
    const isActive = activeQuestion === q;
    return (
      <button
        key={q}
        type="button"
        onClick={() => setActiveQuestion(isActive ? null : q)}
        aria-expanded={isActive}
        className="text-center transition-colors"
        style={{
          backgroundColor: isActive ? "#E8B547" : "#FFFFFF",
          border: "1px solid #E5E2DB",
          borderRadius: 16,
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
          cursor: "pointer",
          width: "100%",
        }}
      >
        <HelpCircle
          size={18}
          style={{
            color: isActive ? "#152C4E" : "#E8B547",
            opacity: isActive ? 1 : 0.8,
            flexShrink: 0,
          }}
        />
        <span
          style={{
            color: "#152C4E",
            fontSize: 14,
            lineHeight: 1.4,
            fontWeight: isActive ? 600 : 400,
            textAlign: "center",
          }}
        >
          {q}
        </span>
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Seo
        title="Voor bewoners | Voortraject"
        description="Onafhankelijke begeleiding voor bewoners bij verduurzaming: één vast aanspreekpunt, duidelijke planning en hulp met subsidies."
        path="/bewoners"
      />
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
                  style={{ color: "#6B6B6B", lineHeight: 1.6, maxWidth: 540 }}
                >
                  Veel bewoners willen wel verduurzamen, maar lopen vast in tegenstrijdige adviezen, lange wachttijden en onduidelijkheid over wat slim is voor hun woning. Wij kijken onafhankelijk mee en helpen je sneller verder naar een duidelijke, uitvoerbare volgende stap.
                </p>
                <div className="mt-10 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5">
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
                  <article
                    key={r.title}
                    className="rounded-2xl p-6"
                    style={{
                      backgroundColor: "#FFFFFF",
                      border: "1px solid #E5E2DB",
                      boxShadow: "0 4px 24px rgba(21,44,78,0.04)",
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="flex items-center justify-center rounded-full"
                        style={{ width: 36, height: 36, backgroundColor: "#E8B547", flexShrink: 0 }}
                      >
                        <Icon size={16} color="#152C4E" aria-hidden="true" />
                      </div>
                      <h3
                        className="font-display"
                        style={{ fontSize: 17, fontWeight: 600, color: "#152C4E", letterSpacing: "-0.01em", lineHeight: 1.3, margin: 0 }}
                      >
                        {r.title}
                      </h3>
                    </div>
                    <p className="mt-2" style={{ fontSize: 15, color: "#4B4B4B", lineHeight: 1.6, margin: "8px 0 0" }}>
                      {r.body}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>


        {/* 3. WAT WIJ VOOR JE DOEN */}
        <section className="py-[64px] md:py-[96px]" style={{ backgroundColor: "#FFFFFF" }}>
          <div className="container-content">
            <div className="relative max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-y-8 md:gap-x-12 lg:gap-x-16 items-center">
              <div
                aria-hidden="true"
                className="hidden md:block absolute"
                style={{ top: 0, bottom: 0, left: "50%", width: 2, backgroundColor: "#E5E2DB", transform: "translateX(-1px)" }}
              />
              <div className="flex flex-col" style={{ justifyContent: "center", gap: 24 }}>
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
              <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
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
                            margin: "0 0 6px",
                            lineHeight: 1.3,
                          }}
                        >
                          {s.title}
                        </h3>
                        <p style={{ color: "#152C4E", opacity: 0.75, fontSize: 15, lineHeight: 1.5, margin: 0 }}>
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


        {/* 5. VRAGENBLOK */}
        <section className="py-[64px] md:py-[96px]" style={{ backgroundColor: "#F5F2EC" }}>
          <div className="container-content">
            <div className="text-center max-w-[760px] mx-auto">
              <h2 className="h2-section" style={{ color: "#152C4E" }}>
                Dit vragen bewoners ons het <span style={{ color: "hsl(var(--accent))" }}>vaakst</span>
              </h2>
              <p
                className="mt-6 text-[18px] mx-auto"
                style={{ color: "#6B6B6B", lineHeight: 1.6, maxWidth: "90ch", fontWeight: 400 }}
              >
                Klik op een vraag voor een direct antwoord.
              </p>
            </div>

            {/* Desktop */}
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
                  {questionsRow1.map((q) => renderQuestionPill(q))}
                </div>
                <div className="grid grid-cols-4 w-full" style={{ gap: 14, marginTop: 14 }}>
                  {questionsRow2.map((q) => renderQuestionPill(q))}
                </div>
              </div>
            </div>

            {/* Mobile */}
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
              <ChevronDown
                aria-hidden="true"
                size={24}
                style={{ color: "#E8B547", opacity: 0.75, marginTop: 12, marginBottom: 16 }}
              />
              <div className="grid grid-cols-1 w-full" style={{ gap: 12 }}>
                {allQuestions.map((q) => renderQuestionPill(q))}
              </div>
            </div>

            {/* Antwoordblok */}
            {activeQuestion && (
              <div
                key={activeQuestion}
                style={{
                  marginTop: 24,
                  backgroundColor: "#FDF9EE",
                  border: "1px solid rgba(232,181,71,0.3)",
                  borderRadius: 16,
                  padding: 24,
                  animation: "fadeIn 200ms ease-out",
                }}
              >
                <p style={{ fontSize: 16, color: "#2B2B2B", lineHeight: 1.6, margin: 0 }}>
                  {questionAnswers[activeQuestion]}
                </p>
              </div>
            )}
            <style>{`@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`}</style>
          </div>
        </section>

        {/* 6. PRAKTISCHE ROUTE - ACCORDION */}
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

            <div className="mt-16 mx-auto" style={{ maxWidth: 820, ...cardBase, padding: 0, overflow: "hidden" }}>
              {routeSteps.map((s, i) => {
                const isOpen = openStep === i;
                return (
                  <div
                    key={s.title}
                    style={{ borderBottom: i === routeSteps.length - 1 ? "none" : "1px solid #E5E2DB" }}
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
                        maxHeight: isOpen ? 400 : 0,
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

        {/* 7. AANVULLENDE MOGELIJKHEDEN PER GEMEENTE */}
        <section className="py-[64px] md:py-[96px]" style={{ backgroundColor: "#F5F2EC" }}>
          <div className="container-content">
            <div className="text-center max-w-[760px] mx-auto">
              <h2 className="h2-section" style={{ color: "#152C4E" }}>
                Wist je dat je subsidies kunt <span style={{ color: "hsl(var(--accent))" }}>stapelen</span>?
              </h2>
            </div>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto items-stretch">
              {/* Linker kolom */}
              <div
                className="rounded-2xl p-8 flex flex-col"
                style={{
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #E5E2DB",
                  boxShadow: "0 4px 24px rgba(21,44,78,0.04)",
                  minHeight: 340,
                }}
              >
                <div
                  className="text-sm font-bold tracking-wider uppercase mb-3"
                  style={{ color: "#E8B547" }}
                >
                  Zo werkt stapelen
                </div>
                <p style={{ color: "#6B6B6B", fontSize: 14, lineHeight: 1.55, marginBottom: 20, fontWeight: 400 }}>
                  De meeste regelingen mogen naast elkaar worden gebruikt. Dat betekent dat je voor dezelfde maatregel vanuit meerdere potjes vergoed kunt worden. Weinig bewoners weten dit.
                </p>
                <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 16 }}>
                  {[
                    "Nij Begun vergoedt isolatie voor eigenaar-bewoners in Groningen en Noord-Drenthe",
                    "ISDE is een landelijke regeling die hier gewoon bovenop komt",
                    "Veel gemeenten hebben daarnaast een eigen bijdrageregeling",
                    "Deze drie samen vergoeden soms het grootste deel van de investering",
                  ].map((t) => (
                    <li key={t} className="flex items-start gap-3">
                      <CheckCircle size={16} color="#E8B547" style={{ flexShrink: 0, marginTop: 2 }} aria-hidden="true" />
                      <span style={{ color: "#152C4E", fontSize: 15, fontWeight: 500, lineHeight: 1.5 }}>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Rechter kolom */}
              <div
                className="rounded-2xl p-8 flex flex-col"
                style={{
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #E5E2DB",
                  boxShadow: "0 4px 24px rgba(21,44,78,0.04)",
                  minHeight: 340,
                }}
              >
                <div
                  className="text-sm font-bold tracking-wider uppercase mb-3"
                  style={{ color: "#E8B547" }}
                >
                  Wat wij gratis voor jou regelen
                </div>
                <p style={{ color: "#6B6B6B", fontSize: 14, lineHeight: 1.55, marginBottom: 20, fontWeight: 400 }}>
                  Wij zoeken voor jouw adres volledig gratis uit welke regelingen gelden en hoe je ze slim combineert. Zo loop je geen euro mis.
                </p>
                <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 16 }}>
                  {[
                    "Welke landelijke regelingen voor jouw woning gelden",
                    "Of jij in aanmerking komt voor Nij Begun",
                    "Welke gemeentelijke en provinciale bijdragen er zijn",
                    "Hoe je regelingen slim combineert zonder ze mis te lopen",
                    "Wat de logische volgorde is om maximaal te benutten",
                  ].map((t) => (
                    <li key={t} className="flex items-start gap-3">
                      <CheckCircle size={16} color="#E8B547" style={{ flexShrink: 0, marginTop: 3 }} aria-hidden="true" />
                      <span style={{ color: "#2B2B2B", fontSize: 15, fontWeight: 400, lineHeight: 1.5 }}>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* 8. WAAROM BEWONERS VOOR ONS KIEZEN */}
        <section className="py-[64px] md:py-[96px]" style={{ backgroundColor: "#FFFFFF" }}>
          <div className="container-content">
            <div className="text-center max-w-[760px] mx-auto">
              <h2 className="h2-section" style={{ color: "#152C4E" }}>
                Waarom bewoners <span style={{ color: "hsl(var(--accent))" }}>voor ons kiezen</span>
              </h2>
            </div>
            <div className="card-grid mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {reasons.map((r) => (
                <div key={r.title} className="card" style={{ ...cardBase, padding: 28 }}>
                  <div className="flex items-start gap-3">
                    <span
                      className="flex items-center justify-center rounded-full shrink-0"
                      style={{ width: 28, height: 28, backgroundColor: "#F0E4D0", marginTop: 2 }}
                    >
                      <Check size={16} color="#152C4E" strokeWidth={2.5} aria-hidden="true" />
                    </span>
                    <div>
                      <h3
                        className="font-display font-semibold"
                        style={{ fontSize: 17, color: "#152C4E", lineHeight: 1.3, margin: 0 }}
                      >
                        {r.title}
                      </h3>
                      <p style={{ marginTop: 12, fontSize: 15, color: "#2B2B2B", lineHeight: 1.55, margin: "12px 0 0" }}>
                        {r.body}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 9. SLUIT-CTA */}
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
                Plan een vrijblijvend gesprek
              </a>
              <OfBelOnsCta color="#FFFFFF" align="center" />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Bewoners;
