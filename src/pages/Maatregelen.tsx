import { useState } from "react";
import { Home, Wind, Sun, Thermometer, Battery, ChevronDown, Shield, Zap, ArrowRight, ArrowDown } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const principles = [
  { num: "01", title: "Beperk", body: "Isolatie en ventilatie verlagen je energieverbruik direct. Dit is de basis: zonder deze stap renderen alle latere maatregelen minder goed.", icon: Shield },
  { num: "02", title: "Wek op", body: "Zonnepanelen werken het beste in een al goed geïsoleerde woning. Dan verbruik je minder dan je opwekt, in plaats van andersom.", icon: Sun },
  { num: "03", title: "Gebruik slim", body: "Een warmtepomp of batterij rendeert pas goed als de eerdere stappen zijn gezet. In de juiste volgorde haal je het meeste uit elke investering.", icon: Zap },
];

const badgeStyles: Record<string, string> = {
  green: "bg-green-50 text-green-700 border border-green-200",
  blue: "bg-blue-50 text-blue-700 border border-blue-200",
  oker: "bg-[#FDF6E3] text-[#A07C1E] border border-[#E8B547]/40",
  gray: "bg-gray-50 text-gray-600 border border-gray-200",
};

const measures = [
  {
    num: "01",
    icon: Home,
    title: "Isoleren",
    badge: { variant: "green", label: "Vaak eerste stap" },
    bullets: ["Dakisolatie", "Vloerisolatie", "Spouwmuurisolatie", "HR++ of triple glas en goede kozijnen"],
    why: "Minder warmteverlies, meer comfort en lagere energiekosten. Een goed geïsoleerde woning heeft simpelweg minder energie nodig om warm te blijven. Dit is de belangrijkste eerste stap omdat elke volgende maatregel beter werkt in een geïsoleerde woning.",
    when: "Bijna altijd als eerste. Isolatie verlaagt je energieverbruik direct en maakt elke volgende maatregel effectiever en goedkoper. Of je nu een warmtepomp wil of zonnepanelen: begin hier.",
    watch: "Dakisolatie heeft doorgaans de kortste terugverdientijd. Spouwmuurisolatie is relatief goedkoop en effectief. Controleer eerst of er al isolatie aanwezig is voor je opnieuw investeert. Laat ook de staat van je kozijnen meenemen in het advies.",
  },
  {
    num: "02",
    icon: Wind,
    title: "Ventileren",
    badge: { variant: "green", label: "Altijd samen met isoleren" },
    bullets: ["Natuurlijke ventilatie", "Mechanische ventilatie", "Balansventilatie met warmteterugwinning (WTW)"],
    why: "Goed isoleren zonder goed ventileren geeft vocht- en gezondheidsproblemen. Een geïsoleerde woning is luchtdicht en heeft daardoor bewuste ventilatie nodig om schimmel, tocht en een slechte binnenlucht te voorkomen.",
    when: "Direct bij of vlak na het isoleren. Een goed geïsoleerde woning is luchtdicht en heeft bewuste ventilatie nodig. Zonder goede ventilatie krijg je vochtproblemen en een ongezond binnenklimaat.",
    watch: "Balansventilatie met warmteterugwinning (WTW) is de meest energiezuinige optie, maar ook de duurste. Zorg dat het systeem correct wordt ingeregeld na installatie, anders heeft het weinig effect. Een goedkoop systeem dat slecht is ingesteld werkt averechts.",
  },
  {
    num: "03",
    icon: Sun,
    title: "Zelf energie opwekken",
    badge: { variant: "blue", label: "Vaak vervolgstap" },
    bullets: ["Zonnepanelen op dak of bijgebouw"],
    why: "Lagere energiekosten en betere benutting van eigen opwek. Zonnepanelen verlagen je energierekening direct en maken je minder afhankelijk van netstroom. Pas na de isolatiestap is opwekken echt efficiënt, want dan verbruikt je woning minder.",
    when: "Pas nadat je hebt geïsoleerd. In een slecht geïsoleerde woning verbruik je meer dan je opwekt. Dan betaal je voor panelen die je energieprobleem niet oplossen. Na isolatie is de businesscase voor zonnepanelen vrijwel altijd sterk.",
    watch: "De terugverdientijd hangt sterk af van dakrichting, hellingshoek en schaduw van bomen of schoorstenen. Laat dit goed uitrekenen voor je tekent. Controleer ook je netaansluiting: bij grotere installaties is soms een verzwaring nodig.",
  },
  {
    num: "04",
    icon: Thermometer,
    title: "Slim verwarmen",
    badge: { variant: "oker", label: "Alleen in passende situatie" },
    bullets: ["Hybride warmtepomp", "Volledig elektrische warmtepomp", "Lage-temperatuur verwarming als einddoel"],
    why: "Een goed geïsoleerde woning maakt de overstap naar gasloos verwarmen haalbaar. Warmtepompen werken het beste in woningen die weinig warmte verliezen. Ze vervangen de cv-ketel en halen warmte uit de lucht, bodem of water.",
    when: "Alleen als je woning al goed geïsoleerd is. Een warmtepomp in een slecht geïsoleerde woning werkt inefficiënt en kan zelfs leiden tot hogere energiekosten. Een hybride warmtepomp is vaak een slimmere tussenstap: die combineert een warmtepomp met je bestaande cv-ketel.",
    watch: "Volledige elektrische warmtepompen werken het beste met lage-temperatuurverwarming: vloerverwarming of grote radiatoren. Heb je kleine radiatoren, dan is een hybride pomp meestal de betere keuze. Laat je woning altijd doorrekenen voor je een beslissing neemt.",
  },
  {
    num: "05",
    icon: Battery,
    title: "Opslag en slim gebruik",
    badge: { variant: "gray", label: "Meestal latere stap" },
    bullets: ["Thuisbatterij of accu", "Slim energiemanagement", "Laadsystemen voor elektrisch rijden"],
    why: "Meer grip op je eigen opwek en verbruik. Met opslag kun je overdag opgewekte stroom 's avonds gebruiken. Dit wordt steeds relevanter nu de salderingsregeling verdwijnt en je zelf opgewekte stroom beter moet benutten.",
    when: "Pas als je al zonnepanelen hebt en meer wilt halen uit wat je opwekt. Zonder zonnepanelen is een thuisbatterij zelden zinvol. Een laadpaal voor elektrisch rijden is vaak wel direct interessant, ook zonder batterij.",
    watch: "De businesscase voor een thuisbatterij is voor de meeste huishoudens op dit moment nog beperkt. Terugverdientijden zijn lang. Slim energiemanagement, zoals je wasmachine of vaatwasser automatisch laten draaien als de zon schijnt, levert vaak meer op dan een batterij.",
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
                    <div className="flex flex-wrap items-center gap-3 md:gap-5">
                      <div
                        className="flex items-center justify-center rounded-full shrink-0"
                        style={{ width: 48, height: 48, backgroundColor: "#F0E4D0" }}
                      >
                        <Icon size={22} color="#152C4E" strokeWidth={2.25} aria-hidden="true" />
                      </div>
                      <div
                        className="font-display text-[28px] md:text-[40px]"
                        style={{
                          fontWeight: 300,
                          color: "#E8B547",
                          lineHeight: 1,
                          letterSpacing: "-0.02em",
                        }}
                      >
                        {m.num}
                      </div>
                      <h3
                        className="font-display text-[20px] md:text-[28px]"
                        style={{
                          fontWeight: 600,
                          color: "#152C4E",
                          letterSpacing: "-0.01em",
                          lineHeight: 1.2,
                        }}
                      >
                        {m.title}
                      </h3>
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${badgeStyles[m.badge.variant]}`}
                      >
                        {m.badge.label}
                      </span>
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
                      {[
                        { key: "why", label: "Waarom dit?", text: m.why },
                        { key: "when", label: "Wanneer slim?", text: m.when },
                        { key: "watch", label: "Waar op letten?", text: m.watch },
                      ].map((sec, idx) => {
                        const k = `${m.num}-${sec.key}`;
                        const sOpen = !!open[k];
                        return (
                          <div key={k} style={{ borderTop: idx === 0 ? "none" : "1px solid #E5E2DB" }}>
                            <button
                              onClick={() => setOpen((s) => ({ ...s, [k]: !s[k] }))}
                              aria-expanded={sOpen}
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
                              <span className="font-sans" style={{ fontWeight: 600, fontSize: 14 }}>
                                {sec.label}
                              </span>
                              <ChevronDown
                                size={16}
                                style={{
                                  transition: "transform 200ms",
                                  transform: sOpen ? "rotate(180deg)" : "rotate(0)",
                                }}
                              />
                            </button>
                            <div
                              style={{
                                display: "grid",
                                gridTemplateRows: sOpen ? "1fr" : "0fr",
                                transition: "grid-template-rows 200ms ease",
                              }}
                            >
                              <div style={{ overflow: "hidden" }}>
                                <p
                                  style={{
                                    fontSize: 15,
                                    color: "#6B6B6B",
                                    lineHeight: 1.7,
                                    paddingTop: 4,
                                    paddingBottom: 16,
                                  }}
                                >
                                  {sec.text}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
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
              Niet zeker welke maatregel als eerste logisch is voor jouw woning?
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
              Wij kijken samen naar je situatie en geven je een eerlijk advies over wat nu slim is, wat je kunt uitstellen en wat het oplevert. Gratis en zonder verplichtingen.
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
