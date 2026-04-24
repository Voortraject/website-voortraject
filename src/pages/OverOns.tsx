import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import christian from "@/assets/team-christian.png";
import michael from "@/assets/team-michael.png";
import tim from "@/assets/team-tim.png";
import wouter from "@/assets/team-wouter.png";

const team = [
  { name: "Christian", role: "Mede-oprichter & Bewonersbegeleiding en commercie", img: christian },
  { name: "Michael", role: "Mede-oprichter & Verduurzamingsspecialist", img: michael },
  { name: "Tim", role: "", img: tim },
  { name: "Wouter", role: "", img: wouter },
];

const accent = { color: "hsl(var(--accent))" };

const OverOns = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="py-24 md:py-32 bg-white">
          <div className="container-content text-center">
            <h1 className="font-display font-semibold text-primary tracking-tight"
              style={{ fontSize: "clamp(40px, 6vw, 64px)", lineHeight: 1.1, letterSpacing: "-0.02em" }}>
              Over <span style={accent}>ons</span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-muted-foreground">
              De mensen achter Voortraject.
            </p>
          </div>
        </section>

        {/* Oprichtingsverhaal */}
        <section className="section-pad" style={{ backgroundColor: "#F5F2EC" }}>
          <div className="container-content">
            <h2 className="h2-section text-center mb-8">
              Hoe Voortraject is <span style={accent}>ontstaan</span>
            </h2>
            <p className="mx-auto text-center text-[17px] md:text-lg leading-relaxed text-foreground/80"
              style={{ maxWidth: "75%" }}>
              Voortraject is ontstaan uit de frustratie dat verduurzamingsbedrijven te veel tijd kwijt zijn aan alles behalve het bouwen zelf. Wij zagen uitvoerders 's avonds offertes schrijven, subsidievragen telkens opnieuw beantwoorden en dossiers bij elkaar harken uit losse mails. Dat kon beter. Daarom namen wij het voortraject ter hand, zodat uitvoerders kunnen focussen op waar ze goed in zijn.
            </p>
          </div>
        </section>

        {/* Team */}
        <section className="section-pad bg-white">
          <div className="container-content">
            <h2 className="h2-section text-center mb-12">
              Ons <span style={accent}>team</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {team.map((p) => (
                <article
                  key={p.name}
                  className="bg-white rounded-2xl overflow-hidden transition-all duration-200 ease-out hover:-translate-y-1 flex flex-col"
                  style={{
                    border: "1px solid #E5E2DB",
                    boxShadow: "0 4px 24px rgba(21,44,78,0.06)",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 10px 32px rgba(21,44,78,0.12)")}
                  onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "0 4px 24px rgba(21,44,78,0.06)")}
                >
                  <div className="aspect-square w-full overflow-hidden" style={{ backgroundColor: "#FAFAFA" }}>
                    <img src={p.img} alt={p.name} loading="lazy" className="w-full h-full object-cover" />
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="font-display font-semibold text-primary text-[18px] tracking-[-0.01em]">
                      {p.name}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground min-h-[2.5rem]">
                      {p.role || "\u00A0"}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Missie/visie */}
        <section className="section-pad" style={{ backgroundColor: "#F5F2EC" }}>
          <div className="container-content">
            <h2 className="h2-section text-center mb-8">
              Waar wij voor <span style={accent}>staan</span>
            </h2>
            <div className="mx-auto text-center space-y-5 text-[17px] md:text-lg leading-relaxed text-foreground/80"
              style={{ maxWidth: "75%" }}>
              <p>
                Nederland heeft meer verduurzamingsbedrijven nodig die kunnen opschalen. Niet omdat ze harder werken, maar omdat het voortraject werkt.
              </p>
              <p>
                Wij zorgen dat bewoners begrepen worden, dat uitvoerders kunnen bouwen, en dat de transitie niet stokt op administratie.
              </p>
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
              className="font-sans font-semibold transition-colors text-center"
              style={{
                backgroundColor: "#E8B547",
                color: "#2B2B2B",
                padding: "14px 32px",
                borderRadius: 8,
                fontSize: 15,
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
