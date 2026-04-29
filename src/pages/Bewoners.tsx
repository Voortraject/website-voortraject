import { HelpCircle, Check, ChevronRight } from "lucide-react";
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

const questions = [
  "Waar begin ik?",
  "Wat is slim om eerst te doen?",
  "Welke subsidies zijn relevant?",
  "Wat past bij mijn woning?",
  "Hoe kom ik van plan naar uitvoering?",
  "Wat als ik huurder ben?",
  "Kan ik uiteindelijk volledig van het gas af?",
];

const services = [
  {
    title: "Onafhankelijk meekijken",
    body: "We luisteren eerst en kijken zonder commercieel belang naar jouw situatie. Geen voorgekauwd antwoord, maar advies dat past bij jouw woning.",
  },
  {
    title: "Overzicht in maatregelen",
    body: "Isolatie, ventilatie, zonnepanelen, warmtepomp: we helpen je zien welke maatregelen logisch zijn voor jouw woning, in welke volgorde en wat de gevolgen zijn voor je energierekening.",
  },
  {
    title: "Uitleg over regelingen en subsidies",
    body: "We zetten op een rij welke landelijke en gemeentelijke regelingen voor jou relevant zijn — inclusief aanvullende subsidies en combinaties die je makkelijk mist.",
  },
  {
    title: "Hulp bij keuzes, zonder wachtrij",
    body: "Geen wachttijden van weken of maanden. We schakelen snel zodat je niet stilstaat.",
  },
  {
    title: "Begeleiding naar een betrouwbare uitvoerder",
    body: "Als de keuze helder is, koppelen we je aan een uitvoerder waarvan we weten dat ze goed werk leveren — zodat jij niet hoeft te gokken op een naam van internet.",
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
    body: "Subsidies en aanvullende regelingen koppelen we aan de juiste stappen — zodat je niets misloopt.",
  },
  {
    title: "Richting uitvoering",
    body: "Met een helder plan in de hand koppelen we je aan een uitvoerder en begeleiden we je tot het werk start.",
  },
];

const gemeenteCards = [
  "Aanvullende gemeentelijke subsidies",
  "Combinaties met andere regelingen",
  "Onderhoud koppelen aan verduurzaming",
  "Aansluiting bij Nij Begun en vergelijkbare trajecten",
];

const reasons = [
  "Onafhankelijk advies, zonder commercieel belang",
  "Geen verkooppraatje, geen pushy sales",
  "Snel schakelen, geen wachtrijen van maanden",
  "Duidelijkheid in gewone taal, geen vakjargon",
  "Aandacht voor jouw woning, situatie en lokale kansen",
  "Begeleiding naar een uitvoerder die we kennen en vertrouwen",
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
                  verduurzamingsadvies zonder wachtrijen
                </h1>
                <p
                  className="mt-8 text-[16px] md:text-[18px]"
                  style={{ color: "#6B6B6B", lineHeight: 1.6, maxWidth: 580 }}
                >
                  Tegenstrijdige adviezen, lange wachttijden bij bestaande loketten en onduidelijkheid over wat nu echt slim is. Wij kijken onafhankelijk met je mee, brengen rust in de keuzes en begeleiden je richting een passende uitvoerder — zonder verkooppraatje en zonder onnodige vertraging.
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
            <p
              className="mt-12 text-center font-display font-semibold"
              style={{ fontSize: 20, color: "#152C4E", letterSpacing: "-0.01em" }}
            >
              Wij brengen rust in deze chaos.
            </p>
          </div>
        </section>

        {/* 3. VRAGENBLOK */}
        <section className="py-[64px] md:py-[96px]" style={{ backgroundColor: "#FBFAF7" }}>
          <div className="container-content">
            <h2 className="h2-section" style={{ color: "#152C4E" }}>
              De <span style={{ color: "hsl(var(--accent))" }}>vragen</span> waar wij mee beginnen
            </h2>
            <p
              className="mt-6 text-[18px]"
              style={{ color: "#6B6B6B", lineHeight: 1.6, maxWidth: 760 }}
            >
              De meeste bewoners lopen vast op dezelfde punten: te veel keuzes, onduidelijke regelingen, wachttijden of advies dat elkaar tegenspreekt. Met deze vragen beginnen wij meestal.
            </p>
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
              {questions.map((q, i) => {
                const isLast = i === questions.length - 1;
                return (
                  <article
                    key={q}
                    className={`bg-white transition-all duration-200 ease-out hover:-translate-y-0.5 ${isLast ? "md:col-span-3" : ""}`}
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
                    <div
                      className={`flex items-center md:p-1 ${isLast ? "justify-center" : ""}`}
                      style={{ gap: 20 }}
                    >
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
                );
              })}
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

        {/* 5. PRAKTISCHE ROUTE */}
        <section className="py-[64px] md:py-[96px]" style={{ backgroundColor: "#FBFAF7" }}>
          <div className="container-content">
            <div className="text-center max-w-[820px] mx-auto">
              <h2 className="h2-section" style={{ color: "#152C4E" }}>
                Verduurzamen is geen <span style={{ color: "hsl(var(--accent))" }}>losse</span> stap, maar een route
              </h2>
              <p className="mt-6 text-[18px]" style={{ color: "#6B6B6B", lineHeight: 1.6 }}>
                De meeste bewoners denken in losse maatregelen: even een warmtepomp, of even zonnepanelen. Maar slim verduurzamen werkt het beste als je in de juiste volgorde denkt — anders betaal je dubbel of mis je kansen.
              </p>
            </div>

            <div className="mt-16 grid grid-cols-1 md:grid-cols-5 gap-6 md:gap-3 items-start">
              {routeSteps.map((s, i) => (
                <div key={s.title} className="flex md:block items-start gap-5">
                  <div className="md:flex md:items-start">
                    <div className="flex-1" style={{ ...cardBase, padding: 20, height: "100%" }}>
                      <span
                        className="font-display"
                        style={{
                          fontSize: 36,
                          fontWeight: 300,
                          color: "#E8B547",
                          letterSpacing: "-0.02em",
                          lineHeight: 1,
                          display: "block",
                          marginBottom: 12,
                        }}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <h3
                        className="font-display font-semibold"
                        style={{ fontSize: 17, color: "#152C4E", letterSpacing: "-0.01em", lineHeight: 1.3, margin: 0 }}
                      >
                        {s.title}
                      </h3>
                      <p className="mt-2" style={{ fontSize: 14, color: "#6B6B6B", lineHeight: 1.55, margin: "8px 0 0" }}>
                        {s.body}
                      </p>
                    </div>
                    {i < routeSteps.length - 1 && (
                      <ChevronRight
                        className="hidden md:block shrink-0"
                        size={20}
                        color="#E8B547"
                        style={{ marginTop: 36, marginLeft: -2, marginRight: -2 }}
                        aria-hidden="true"
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>

            <p
              className="mt-12 text-center"
              style={{ fontSize: 16, lineHeight: 1.6, color: "rgba(21,44,78,0.7)", maxWidth: 720, margin: "48px auto 0" }}
            >
              Wil je uiteindelijk volledig van het gas af? Dat vraagt vaak meer dan één maatregel. Wij helpen je het plan uitzetten.
            </p>
          </div>
        </section>

        {/* 6. AANVULLENDE MOGELIJKHEDEN PER GEMEENTE */}
        <section className="py-[64px] md:py-[96px]" style={{ backgroundColor: "#FFFFFF" }}>
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
                      backgroundColor: "#FBFAF7",
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
                Waarom bewoners hier <span style={{ color: "hsl(var(--accent))" }}>rust</span> van krijgen
              </h2>
              <p className="mt-6 text-[18px]" style={{ color: "#6B6B6B", lineHeight: 1.6 }}>
                Wat bewoners ons het vaakst teruggeven over onze aanpak.
              </p>
            </div>
            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {reasons.map((r) => (
                <div
                  key={r}
                  className="flex items-start gap-3"
                  style={{ ...cardBase, padding: 20 }}
                >
                  <span
                    className="flex items-center justify-center rounded-full shrink-0"
                    style={{ width: 28, height: 28, backgroundColor: "#F0E4D0", marginTop: 2 }}
                  >
                    <Check size={16} color="#152C4E" strokeWidth={2.5} aria-hidden="true" />
                  </span>
                  <p style={{ fontSize: 15, color: "#152C4E", lineHeight: 1.5, margin: 0 }}>{r}</p>
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
              Snel duidelijkheid voor <span style={{ color: "#E8B547" }}>jouw</span> woning
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
