import { useState } from "react";
import { Home, Wind, Sun, Thermometer, Battery, ChevronDown, Shield, Zap, ArrowRight, ArrowDown } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const principles = [
  { num: "01", title: "Beperk", body: "Zorg dat je woning zo min mogelijk energie verspilt. Isolatie en ventilatie zijn de basis.", icon: Shield },
  { num: "02", title: "Wek op", body: "Wek een deel van je eigen energie op, zodat je minder afhankelijk bent van het net.", icon: Sun },
  { num: "03", title: "Gebruik slim", body: "Verwarm efficiënt en gebruik je opgewekte energie op het juiste moment.", icon: Zap },
];

const measures = [
  {
    num: "01",
    icon: Home,
    title: "Isoleren",
    bullets: ["Dakisolatie", "Vloerisolatie", "Spouwmuurisolatie", "HR++ of triple glas en goede kozijnen"],
    why: "Minder warmteverlies, meer comfort en lagere energiekosten. Een goed geïsoleerde woning heeft simpelweg minder energie nodig om warm te blijven. Dit is de belangrijkste eerste stap omdat elke volgende maatregel beter werkt in een geïsoleerde woning.",
  },
  {
    num: "02",
    icon: Wind,
    title: "Ventileren",
    bullets: ["Natuurlijke ventilatie", "Mechanische ventilatie", "Balansventilatie met warmteterugwinning (WTW)"],
    why: "Goed isoleren zonder goed ventileren geeft vocht- en gezondheidsproblemen. Een geïsoleerde woning is luchtdicht en heeft daardoor bewuste ventilatie nodig om schimmel, tocht en een slechte binnenlucht te voorkomen.",
  },
  {
    num: "03",
    icon: Sun,
    title: "Zelf energie opwekken",
    bullets: ["Zonnepanelen op dak of bijgebouw"],
    why: "Lagere energiekosten en betere benutting van eigen opwek. Zonnepanelen verlagen je energierekening direct en maken je minder afhankelijk van netstroom. Pas na de isolatiestap is opwekken echt efficiënt, want dan verbruikt je woning minder.",
  },
  {
    num: "04",
    icon: Thermometer,
    title: "Slim verwarmen",
    bullets: ["Hybride warmtepomp", "Volledig elektrische warmtepomp", "Lage-temperatuur verwarming als einddoel"],
    why: "Een goed geïsoleerde woning maakt de overstap naar gasloos verwarmen haalbaar. Warmtepompen werken het beste in woningen die weinig warmte verliezen. Ze vervangen de cv-ketel en halen warmte uit de lucht, bodem of water.",
  },
  {
    num: "05",
    icon: Battery,
    title: "Opslag en slim gebruik",
    bullets: ["Thuisbatterij of accu", "Slim energiemanagement", "Laadsystemen voor elektrisch rijden"],
    why: "Meer grip op je eigen opwek en verbruik. Met opslag kun je overdag opgewekte stroom 's avonds gebruiken. Dit wordt steeds relevanter nu de salderingsregeling verdwijnt en je zelf opgewekte stroom beter moet benutten.",
  },
];

const ctaButton = "inline-flex items-center justify-center font-sans font-semibold text-[15px] transition-colors";

const Maatregelen = () => {
  const [open, setOpen] = useState<Record<string, boolean>>({});

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1">
        {/* HERO */}
        <section
          className="pb-[56px] md:pb-[80px]"
          style={{ backgroundColor: "#FBFAF7", paddingTop: "clamp(48px, 8vw, 80px)" }}
          aria-labelledby="m-hero-title"
        >
          <div className="container-content">
            <div className="mx-auto text-center" style={{ maxWidth: 900 }}>
              <h1
                id="m-hero-title"
                className="font-display"
                style={{
                  fontWeight: 700,
                  fontSize: "clamp(32px, 4.6vw, 52px)",
                  color: "#2B2B2B",
                  letterSpacing: "-0.03em",
                  lineHeight: 1.1,
                }}
              >
                De <span style={{ color: "#E8B547" }}>logische</span> route naar een toekomstbestendige woning
              </h1>
              <p
                className="mx-auto"
                style={{
                  marginTop: 32,
                  fontSize: "clamp(16px, 2vw, 18px)",
                  color: "#6B6B6B",
                  lineHeight: 1.6,
                  maxWidth: 720,
                }}
              >
                Van aardgas af en naar een comfortabel, energiezuinig huis. Dat doe je in stappen: eerst beperken wat je verbruikt, daarna slimmer opwekken en verwarmen.
              </p>
            </div>
          </div>
        </section>

        {/* PRINCIPE */}
        <section className="py-[64px] md:py-[96px]" style={{ backgroundColor: "#F5F2EC" }}>
          <div className="container-content">
            <div className="mx-auto text-center" style={{ maxWidth: 900 }}>
              <h2
                className="font-display"
                style={{
                  fontWeight: 600,
                  fontSize: "clamp(28px, 4vw, 40px)",
                  letterSpacing: "-0.02em",
                  color: "#152C4E",
                  lineHeight: 1.2,
                }}
              >
                Eerst beperken, dan opwekken, dan slim gebruiken
              </h2>
              <p
                className="mx-auto"
                style={{ marginTop: 24, fontSize: 18, color: "#6B6B6B", lineHeight: 1.6, maxWidth: 720 }}
              >
                Een logische volgorde zorgt ervoor dat elke stap die je zet ook echt rendement oplevert.
              </p>
            </div>
            <div
              className="flex flex-col md:flex-row md:items-stretch gap-0"
              style={{ marginTop: 80 }}
            >
              {principles.map((p, idx) => {
                const Icon = p.icon;
                return (
                  <div key={p.num} className="contents md:contents">
                    <div
                      className="bg-white text-center flex flex-col items-center flex-1"
                      style={{
                        borderRadius: 16,
                        padding: "48px 32px",
                        border: "1px solid #E5E2DB",
                      }}
                    >
                      <div
                        className="flex items-center justify-center rounded-full"
                        style={{ width: 64, height: 64, backgroundColor: "#F0E4D0" }}
                      >
                        <Icon size={28} color="#152C4E" strokeWidth={2.25} aria-hidden="true" />
                      </div>
                      <h3
                        className="font-display"
                        style={{
                          fontWeight: 600,
                          fontSize: 24,
                          color: "#152C4E",
                          letterSpacing: "-0.01em",
                          marginTop: 24,
                          marginBottom: 16,
                        }}
                      >
                        {p.title}
                      </h3>
                      <p style={{ fontSize: 15, color: "#6B6B6B", lineHeight: 1.6 }}>{p.body}</p>
                    </div>
                    {idx < principles.length - 1 && (
                      <div
                        className="flex items-center justify-center self-center"
                        style={{ padding: "24px 16px" }}
                        aria-hidden="true"
                      >
                        <ArrowRight size={28} color="#E8B547" strokeWidth={2.5} className="hidden md:block" />
                        <ArrowDown size={28} color="#E8B547" strokeWidth={2.5} className="md:hidden" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* VIJF MAATREGELEN */}
        <section className="py-[64px] md:py-[96px]" style={{ backgroundColor: "#FBFAF7" }}>
          <div className="container-content">
            <h2 className="h2-section" style={{ color: "#152C4E" }}>
              De vijf <span style={{ color: "#E8B547" }}>maatregelen</span> die ertoe doen
            </h2>
            <p
              style={{ fontFamily: "Inter, sans-serif", marginTop: 24, fontSize: "1rem", fontWeight: 400, color: "#6B6B6B", lineHeight: 1.7, maxWidth: 720 }}
            >
              Niet elke maatregel is voor elke woning even logisch. Hieronder wat er bij elke stap hoort.
            </p>
            <p
              style={{ fontFamily: "Inter, sans-serif", marginTop: 24, fontSize: "1rem", fontWeight: 400, color: "#6B6B6B", lineHeight: 1.7, maxWidth: 720 }}
            >
              Veel bewoners beginnen bij de meest zichtbare stap: zonnepanelen of een warmtepomp. Toch werkt elke maatregel beter als de stappen daarvoor al gezet zijn. Door de stappen in de juiste volgorde te doen, haal je het meeste uit elke investering.
            </p>
            <div className="mx-auto" style={{ marginTop: 64, maxWidth: 900 }}>
              {measures.map((m) => {
                const Icon = m.icon;
                const isOpen = !!open[m.num];
                return (
                  <article
                    key={m.num}
                    className="bg-white p-6 md:p-10"
                    style={{
                      borderRadius: 16,
                      border: "1px solid #E5E2DB",
                      boxShadow: "0 4px 24px rgba(21,44,78,0.04)",
                      marginBottom: 24,
                    }}
                  >
                    <div className="flex items-center" style={{ gap: 20 }}>
                      <div
                        className="flex items-center justify-center rounded-full shrink-0"
                        style={{ width: 48, height: 48, backgroundColor: "#F0E4D0" }}
                      >
                        <Icon size={22} color="#152C4E" strokeWidth={2.25} aria-hidden="true" />
                      </div>
                      <div
                        className="font-display"
                        style={{
                          fontSize: 40,
                          fontWeight: 300,
                          color: "#E8B547",
                          lineHeight: 1,
                          letterSpacing: "-0.02em",
                        }}
                      >
                        {m.num}
                      </div>
                      <h3
                        className="font-display"
                        style={{
                          fontWeight: 600,
                          fontSize: 28,
                          color: "#152C4E",
                          letterSpacing: "-0.01em",
                          lineHeight: 1.2,
                        }}
                      >
                        {m.title}
                      </h3>
                    </div>

                    <div
                      style={{
                        marginTop: 24,
                        fontSize: 13,
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                        fontWeight: 600,
                        color: "#8B8680",
                      }}
                    >
                      Wat valt eronder
                    </div>
                    <ul style={{ marginTop: 12, listStyle: "disc", paddingLeft: 20 }}>
                      {m.bullets.map((b) => (
                        <li
                          key={b}
                          style={{ fontSize: 15, color: "#2B2B2B", lineHeight: 1.8 }}
                        >
                          {b}
                        </li>
                      ))}
                    </ul>

                    <div style={{ marginTop: 32, borderTop: "1px solid #E5E2DB" }}>
                      <button
                        onClick={() => setOpen((s) => ({ ...s, [m.num]: !s[m.num] }))}
                        aria-expanded={isOpen}
                        className="group w-full flex items-center justify-between transition-colors"
                        style={{
                          padding: "16px 0",
                          cursor: "pointer",
                          color: "#152C4E",
                          background: "transparent",
                          border: "none",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "#E8B547")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "#152C4E")}
                      >
                        <span
                          className="font-sans"
                          style={{ fontWeight: 600, fontSize: 14 }}
                        >
                          Waarom dit?
                        </span>
                        <ChevronDown
                          size={16}
                          style={{
                            transition: "transform 200ms",
                            transform: isOpen ? "rotate(180deg)" : "rotate(0)",
                          }}
                        />
                      </button>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateRows: isOpen ? "1fr" : "0fr",
                          transition: "grid-template-rows 200ms ease",
                        }}
                      >
                        <div style={{ overflow: "hidden" }}>
                          <p
                            style={{
                              fontSize: 15,
                              color: "#6B6B6B",
                              lineHeight: 1.7,
                              paddingTop: 16,
                              paddingBottom: 8,
                            }}
                          >
                            {m.why}
                          </p>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
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
                maxWidth: 720,
              }}
            >
              Wil je weten wat voor jouw woning logisch is?
            </h2>
            <p
              style={{
                marginTop: 20,
                fontSize: 17,
                color: "#FFFFFF",
                opacity: 0.8,
                lineHeight: 1.6,
                maxWidth: 560,
              }}
            >
              We kijken samen naar je situatie en leggen uit wat past bij je woning.
            </p>
            <a
              href="/contact"
              className={`${ctaButton} w-full sm:w-auto`}
              style={{
                backgroundColor: "#E8B547",
                color: "#2B2B2B",
                padding: "14px 32px",
                borderRadius: 8,
                marginTop: 40,
                minHeight: 44,
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

export default Maatregelen;
