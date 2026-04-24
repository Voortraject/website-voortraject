import { Check, Minus, type LucideIcon } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import heroUitvoerders from "@/assets/uitvoerders-hero.jpg";

const withoutItems = [
  "Bewonersvragen over subsidies en regelingen blijven bij jullie liggen",
  "Offertes worden 's avonds of tussen bouwprojecten door opgesteld",
  "Opvolging van offertes schiet erbij in, akkoorden blijven uit",
  "Dossiers zijn verspreid over mails, notities en losse documenten",
  "Groeien betekent kantoorpersoneel aannemen",
  "Administratieve rompslomp houdt jullie weg van de uitvoering",
];

const withItems = [
  "Wij nemen het bewonerscontact over, van eerste vraag tot akkoord",
  "Offertes worden door ons opgesteld, gecontroleerd en nagebeld",
  "Elk traject wordt opgevolgd tot getekend akkoord",
  "Een compleet dossier per traject, klaar voor overdracht aan uitvoering",
  "Meer projecten aannemen zonder extra intern personeel",
  "Jullie focus ligt waar die hoort: op de uitvoering",
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

        {/* PROBLEMEN */}
        <section className="py-[64px] md:py-[96px]" style={{ backgroundColor: "#F5F2EC" }}>
          <div className="container-content">
            <h2 className="h2-section" style={{ color: "#152C4E" }}>
              Herkenbare <span style={{ color: "hsl(var(--accent))" }}>problemen</span> voor uitvoerders
            </h2>
            <p
              className="mt-6 text-[18px]"
              style={{ color: "#6B6B6B", lineHeight: 1.6, maxWidth: 720 }}
            >
              Veel uitvoerders herkennen deze pijnpunten. Wij halen ze weg.
            </p>
            <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6">
              {problems.map(({ icon: Icon, title, body }) => (
                <article
                  key={title}
                  className="bg-white transition-all duration-200 ease-out hover:-translate-y-0.5"
                  style={{
                    borderRadius: 16,
                    padding: 40,
                    border: "1px solid #E5E2DB",
                    boxShadow: "0 4px 24px rgba(21,44,78,0.04)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = "0 8px 32px rgba(21,44,78,0.10)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = "0 4px 24px rgba(21,44,78,0.04)";
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 12,
                      marginBottom: 16,
                    }}
                  >
                    <div
                      className="flex items-center justify-center rounded-full"
                      style={{ width: 56, height: 56, backgroundColor: "#F0E4D0", flexShrink: 0 }}
                    >
                      <Icon size={24} color="#152C4E" strokeWidth={2.25} aria-hidden="true" />
                    </div>
                    <h3
                      className="font-display"
                      style={{ fontSize: "1.05rem", fontWeight: 600, color: "#152C4E", margin: 0, lineHeight: 1.3 }}
                    >
                      {title}
                    </h3>
                  </div>
                  <p style={{ fontSize: 15, color: "#6B6B6B", lineHeight: 1.6 }}>
                    {body}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* WAT WIJ DOEN */}
        <section className="py-[64px] md:py-[96px]" style={{ backgroundColor: "#FBFAF7" }}>
          <div className="container-content">
            <h2 className="h2-section" style={{ color: "#152C4E" }}>
              Wat <span style={{ color: "hsl(var(--accent))" }}>wij</span> voor jullie doen
            </h2>
            <p
              className="mt-6 text-[18px]"
              style={{ color: "#6B6B6B", lineHeight: 1.6, maxWidth: 720 }}
            >
              Jullie bepalen zelf waar wij instappen. Wij nemen over wat jullie bezighoudt,
              zodat jullie kunnen bouwen.
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

        {/* PAKKETTEN */}
        <section className="py-[64px] md:py-[96px]" style={{ backgroundColor: "#F5F2EC" }}>
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
                  className="relative bg-white flex flex-col transition-all duration-200 ease-out"
                  style={{
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
