import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Seo } from "@/components/Seo";
import michael from "@/assets/team-michael.png";
import tim from "@/assets/team-tim.png";
import wouter from "@/assets/team-wouter.png";
import christian from "@/assets/team-christian.png";
import { UserCheck, ShieldCheck, Zap, FolderCheck } from "lucide-react";

const team = [
  {
    name: "Michael",
    specialty: "Verduurzamingsspecialist",
    img: michael,
    quote:
      "Ik kijk altijd eerst naar de woning zelf, want de techniek moet passen bij de situatie, niet andersom.",
  },
  {
    name: "Tim",
    specialty: "Bewonersbegeleider",
    img: tim,
    quote:
      "Ik zorg dat bewoners altijd weten waar ze aan toe zijn en wat er als volgende gebeurt.",
  },
  {
    name: "Wouter",
    specialty: "Bewonersbegeleider",
    img: wouter,
    quote:
      "Voor mij is een goed traject \u00E9\u00E9n waarbij de bewoner nooit hoeft te vragen hoe het staat.",
  },
  {
    name: "Christian",
    specialty: "Verduurzamingsspecialist",
    img: christian,
    quote:
      "Een woning goed verduurzamen begint bij de juiste voorbereiding. Ik zorg dat er niets over het hoofd wordt gezien voor de uitvoering.",

  },
];

const accent = { color: "hsl(var(--accent))" };

const howWeWork = [
  {
    icon: UserCheck,
    title: "\u00C9\u00E9n vaste begeleider",
    desc: "Je werkt altijd met dezelfde persoon. Die kent jouw dossier, jouw woning en jouw situatie.",
  },
  {
    icon: ShieldCheck,
    title: "Onafhankelijk advies",
    desc: "Wij verkopen niets. Geen installaties, geen materiaal. Alleen advies dat in jouw belang is.",
  },
  {
    icon: Zap,
    title: "Snel en zonder wachtrijen",
    desc: "Geen maanden wachten op een afspraak. Wij schakelen snel en houden de voortgang scherp in de gaten.",
  },
  {
    icon: FolderCheck,
    title: "Alles netjes vastgelegd",
    desc: "Afspraken, dossiers en vervolgstappen worden bijgehouden zodat niets verloren gaat.",
  },
];




const OverOns = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Seo
        title="Over ons | Voortraject"
        description="Maak kennis met het team van Voortraject. Een klein, vast team dat het hele verduurzamingstraject voor uitvoerders en bewoners overziet."
        path="/over-ons"
      />
      <Header />
      <main className="flex-1">
        {/* Origin story */}
        <section className="py-12 md:py-16" style={{ backgroundColor: "#F5F2EC" }}>
          <div className="container-content">
            <h2 className="h2-section text-center mb-6">
              Hoe Voortraject is <span style={accent}>ontstaan</span>
            </h2>
            <div
              className="mx-auto text-center max-w-3xl"
              style={{ color: "#4B4B4B", fontSize: 17, lineHeight: 1.6, fontWeight: 400 }}
            >
              <p className="mb-4">
                Verduurzamingsbedrijven verloren te veel tijd aan alles behalve bouwen. Bewoners wachtten maanden op duidelijkheid en werden van het kastje naar de muur gestuurd.
              </p>
              <p className="mb-4">
                Wij zagen dat het anders kon. Niet met een loket of een app, maar met mensen die het voortraject serieus nemen: van eerste vraag tot getekend akkoord en verder. Geen verkooppraatje, geen standaardadvies. Gewoon iemand die meekijkt, regelt en opvolgt.
              </p>
              <p>Dat is Voortraject.</p>
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="py-12 md:py-16 bg-white">
          <div className="container-content">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {team.map((p) => (
                <article
                  key={p.name}
                  className="bg-white rounded-2xl overflow-hidden transition-all duration-200 ease-out hover:-translate-y-1 flex flex-col"
                  style={{
                    border: "1px solid #E5E2DB",
                    boxShadow: "0 4px 24px rgba(21,44,78,0.06)",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 12px 36px rgba(21,44,78,0.14)")}
                  onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "0 4px 24px rgba(21,44,78,0.06)")}
                >
                  <div className="w-full overflow-hidden h-[280px] md:h-[320px]" style={{ backgroundColor: "#FAFAFA" }}>
                    <img
                      src={p.img}
                      alt={p.name}
                      loading="lazy"
                      className="w-full h-full object-cover"
                      style={{ objectPosition: "top center" }}
                    />
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="font-display font-bold text-primary text-[20px] tracking-[-0.01em] leading-tight">
                      {p.name}
                    </h3>
                    <p className="text-muted-foreground text-[14px] leading-tight" style={{ marginTop: 4 }}>
                      {p.specialty}
                    </p>
                    <div className="border-t mt-3 mb-3" style={{ borderColor: "#E5E2DB" }} />
                    <p
                      style={{
                        fontStyle: "italic",
                        color: "#6B6B6B",
                        fontSize: 14,
                        lineHeight: 1.5,
                        fontWeight: 400,
                      }}
                    >
                      {p.quote}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Hoe wij werken */}
        <section className="py-12 md:py-[72px]" style={{ backgroundColor: "#F5F2EC" }}>
          <div className="container-content">
            <div className="text-center mb-12">
              <h2
                style={{
                  fontFamily: "'Inter Tight', sans-serif",
                  fontWeight: 700,
                  color: "#152C4E",
                  fontSize: "clamp(28px, 4vw, 40px)",
                  letterSpacing: "-0.02em",
                  lineHeight: 1.2,
                }}
              >
                Hoe wij <span style={accent}>werken</span>
              </h2>
              <p
                className="mx-auto mt-4"
                style={{ color: "#6B6B6B", fontSize: 16, lineHeight: 1.6, maxWidth: 540, fontWeight: 400 }}
              >
                Geen groot kantoor, geen anonieme helpdesk. Wij werken met een klein, vast team dat het hele traject overziet.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl mx-auto">
              {howWeWork.map(({ icon: Icon, title, desc }) => (
                <div
                  key={title}
                  className="rounded-2xl p-7 shadow-sm"
                  style={{ backgroundColor: "#FFFFFF", border: "1px solid #E5E2DB" }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: "#E8B547" }}
                    >
                      <Icon size={20} color="#152C4E" />
                    </div>
                    <h3
                      style={{
                        fontFamily: "'Inter Tight', sans-serif",
                        fontWeight: 600,
                        color: "#152C4E",
                        fontSize: 16,
                        lineHeight: 1.3,
                      }}
                    >
                      {title}
                    </h3>
                  </div>
                  <p style={{ color: "#6B6B6B", fontSize: 14, lineHeight: 1.6, marginTop: 8, fontWeight: 400 }}>
                    {desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>



      </main>
      <Footer
        cta={
          /* CTA */
          <section className="py-[60px] text-primary-foreground">
            <div className="container-content text-center flex flex-col items-center">
              <h2
                className="font-display"
                style={{
                  fontWeight: 600,
                  fontSize: "clamp(28px, 4.5vw, 40px)",
                  color: "#FFFFFF",
                  letterSpacing: "-0.02em",
                  lineHeight: 1.2,
                  marginBottom: 16,
                }}
              >
                Wil je weten wie je aan de lijn krijgt?
              </h2>
              <p
                style={{
                  color: "#FFFFFF",
                  opacity: 0.8,
                  fontSize: 17,
                  lineHeight: 1.6,
                  maxWidth: 640,
                  marginBottom: 32,
                }}
              >
                Plan een vrijblijvende kennismaking. We vertellen je precies wie wat doet en hoe een traject eruitziet.
              </p>
              <a
                href="/contact"
                className="font-sans font-semibold transition-colors text-center w-full sm:w-auto inline-flex items-center justify-center"
                style={{
                  backgroundColor: "#E8B547",
                  color: "#2B2B2B",
                  padding: "14px 32px",
                  borderRadius: 8,
                  fontSize: 15,
                  minHeight: 44,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#D9A538")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#E8B547")}
              >
                Plan een kennismaking
              </a>
            </div>
          </section>
        }
      />
    </div>
  );
};

export default OverOns;
