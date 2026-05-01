import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import michael from "@/assets/team-michael.png";
import tim from "@/assets/team-tim.png";
import wouter from "@/assets/team-wouter.png";

const team = [
  { name: "Michael", role: "Partner", specialty: "Verduurzamingsspecialist", img: michael },
  { name: "Tim", role: "Partner", specialty: "Bewonersbegeleider", img: tim },
  { name: "Wouter", role: "Partner", specialty: "Relatiemanager", img: wouter },
];

const accent = { color: "hsl(var(--accent))" };

const OverOns = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Oprichtingsverhaal */}
        <section className="py-20 md:py-24" style={{ backgroundColor: "#F5F2EC" }}>
          <div className="container-content">
            <h2 className="h2-section text-center mb-8">
              Hoe Voortraject is <span style={accent}>ontstaan</span>
            </h2>
            <p
              className="mx-auto text-center text-[16px] md:text-lg leading-relaxed text-foreground/80 max-w-[90%] md:max-w-[80%] lg:max-w-[70%]"
            >
              Voortraject is ontstaan uit de frustratie dat verduurzamingsbedrijven te veel tijd kwijt zijn aan alles behalve het bouwen zelf. Wij zagen uitvoerders vastlopen op papierwerk, subsidievragen en dossiervoering. Daarom namen wij het voortraject ter hand.
            </p>
          </div>
        </section>

        {/* Team */}
        <section className="section-pad bg-white">
          <div className="container-content">
            <h2 className="h2-section text-center mb-12">
              Ons <span style={accent}>team</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
                  <div className="w-full overflow-hidden lg:aspect-square h-[240px] md:h-[280px] lg:h-auto" style={{ backgroundColor: "#FAFAFA" }}>
                    <img
                      src={p.img}
                      alt={p.name}
                      width={1254}
                      height={1254}
                      loading="lazy"
                      className="w-full h-full object-cover"
                      style={{ objectPosition: p.name === "Wouter" ? "center 20%" : "center center" }}
                    />
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="font-display font-bold text-primary text-[20px] tracking-[-0.01em] leading-tight">
                      {p.name}
                    </h3>
                    <p
                      className="text-primary text-[15px] leading-tight"
                      style={{ fontWeight: 500, marginTop: 6 }}
                    >
                      {p.role || "\u00A0"}
                    </p>
                    <p
                      className="text-muted-foreground text-[14px] leading-tight"
                      style={{ marginTop: 4 }}
                    >
                      {p.specialty || "\u00A0"}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-[60px]" style={{ backgroundColor: "#152C4E" }}>
          <div className="container-content text-center flex flex-col items-center">
            <h2
              className="font-display"
              style={{
                fontWeight: 600,
                fontSize: "clamp(28px, 4.5vw, 40px)",
                color: "#FFFFFF",
                letterSpacing: "-0.02em",
                lineHeight: 1.2,
                marginBottom: 32,
              }}
            >
              Benieuwd wat we voor jullie kunnen betekenen?
            </h2>
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
      </main>
      <Footer />
    </div>
  );
};

export default OverOns;
