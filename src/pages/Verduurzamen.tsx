import { Home, Sun, Thermometer, Battery, Snowflake, Plug, ArrowRight, ArrowDown, Shield, Zap } from "lucide-react";
import routeHeroImage from "@/assets/route-hero.jpg";
import { Header } from "@/components/Header";
import { Seo } from "@/components/Seo";
import { Footer } from "@/components/Footer";

const principles = [
  {
    num: "01",
    title: "Beperk",
    body: "Isolatie en ventilatie verlagen je energieverbruik direct. Dit is de basis: zonder deze stap renderen latere maatregelen minder goed.",
    icon: Shield,
  },
  {
    num: "02",
    title: "Wek op",
    body: "Zonnepanelen werken het beste in een al goed geïsoleerde woning. Je verbruikt minder dan je opwekt, in plaats van andersom.",
    icon: Sun,
  },
  {
    num: "03",
    title: "Gebruik slim",
    body: "Warmtepomp, batterij of laadpaal renderen pas goed als de eerdere stappen zijn gezet. In de juiste volgorde haal je het meeste uit elke investering.",
    icon: Zap,
  },
];

const maatregelen = [
  {
    slug: "isolatie",
    title: "Isolatie & ventilatie",
    intro: "De basis: minder warmteverlies, een gezonder binnenklimaat en lagere energiekosten.",
    icon: Home,
    badge: "Vaak eerste stap",
  },
  {
    slug: "zonnepanelen",
    title: "Zonnepanelen",
    intro: "Zelf stroom opwekken. Het meest rendabel in een al goed geïsoleerde woning.",
    icon: Sun,
    badge: "Vaak vervolgstap",
  },
  {
    slug: "warmtepomp",
    title: "Warmtepomp",
    intro: "Gasloos verwarmen. Werkt het best na isolatie en in combinatie met lage-temperatuurafgifte.",
    icon: Thermometer,
    badge: "Alleen in passende situatie",
  },
  {
    slug: "thuisbatterij",
    title: "Thuisbatterij & opslag",
    intro: "Eigen opgewekte stroom later gebruiken. Steeds relevanter nu salderen wordt afgebouwd.",
    icon: Battery,
    badge: "Meestal latere stap",
  },
  {
    slug: "airco",
    title: "Airco",
    intro: "Koelen in de zomer en bijverwarmen in de tussenseizoenen, met een lucht-lucht warmtepomp.",
    icon: Snowflake,
  },
  {
    slug: "laadpaal",
    title: "Laadpaal",
    intro: "Thuis laden van een elektrische auto, het liefst gekoppeld aan je eigen zon en verbruik.",
    icon: Plug,
  },
];

const Verduurzamen = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Seo
        title="Verduurzamen — de route | Voortraject"
        description="Verduurzamen in de juiste volgorde: van isolatie en opwek tot warmtepomp, batterij, airco, laadpaal en onderhoud. Onafhankelijk overzicht per maatregel."
        path="/verduurzamen"
      />
      <Header />
      <main className="flex-1">
        {/* HERO */}
        <section
          className="pb-[56px] md:pb-[80px]"
          style={{ backgroundColor: "#FBFAF7", paddingTop: "clamp(48px, 8vw, 80px)" }}
          aria-labelledby="v-hero-title"
        >
          <div className="container-content">
            <div className="mx-auto text-center" style={{ maxWidth: 900 }}>
              <h1
                id="v-hero-title"
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
                Van isolatie tot opwek, verwarming en opslag. Wij begeleiden je stap voor stap door het
                hele verduurzamingstraject, eerst beperken wat je verbruikt, daarna slimmer opwekken en
                gebruiken.
              </p>
            </div>
            <div
              className="mt-10 mx-auto w-full overflow-hidden"
              style={{
                borderRadius: 20,
                border: "1px solid #E5E2DB",
                aspectRatio: "16 / 9",
                maxWidth: 1100,
                backgroundColor: "#EFEAE0",
              }}
            >
              <img
                src={routeHeroImage}
                alt="De verduurzamingsroute van isolatie tot opwek en slim gebruik"
                width={1100}
                height={619}
                className="w-full h-full object-cover"
              />
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
                Eerst <span style={{ color: "#E8B547" }}>beperken</span>, dan opwekken, dan slim gebruiken
              </h2>
              <p
                className="mx-auto"
                style={{ marginTop: 24, fontSize: 18, color: "#6B6B6B", lineHeight: 1.6, maxWidth: 720 }}
              >
                Een logische volgorde zorgt ervoor dat elke stap die je zet ook echt rendement oplevert.
              </p>
            </div>
            <div className="flex flex-col md:flex-row md:items-stretch gap-0" style={{ marginTop: 64 }}>
              {principles.map((p, idx) => {
                const Icon = p.icon;
                return (
                  <div key={p.num} className="contents md:contents">
                    <div
                      className="bg-white text-center flex flex-col items-center flex-1"
                      style={{
                        borderRadius: 16,
                        padding: "40px 28px",
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
                          fontSize: 22,
                          color: "#152C4E",
                          letterSpacing: "-0.01em",
                          marginTop: 24,
                          marginBottom: 12,
                        }}
                      >
                        {p.title}
                      </h3>
                      <p style={{ fontSize: 15, color: "#6B6B6B", lineHeight: 1.6 }}>{p.body}</p>
                    </div>
                    {idx < principles.length - 1 && (
                      <div
                        className="flex items-center justify-center self-center"
                        style={{ padding: "16px" }}
                        aria-hidden="true"
                      >
                        <ArrowRight size={26} color="#E8B547" strokeWidth={2.5} className="hidden md:block" />
                        <ArrowDown size={26} color="#E8B547" strokeWidth={2.5} className="md:hidden" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* MAATREGELEN GRID */}
        <section className="py-[64px] md:py-[96px]" style={{ backgroundColor: "#FBFAF7" }}>
          <div className="container-content">
            <div className="mx-auto text-center" style={{ maxWidth: 760 }}>
              <h2
                className="font-display"
                style={{
                  fontWeight: 700,
                  fontSize: "clamp(28px, 4vw, 40px)",
                  color: "#152C4E",
                  letterSpacing: "-0.02em",
                  lineHeight: 1.2,
                }}
              >
                De <span style={{ color: "#E8B547" }}>maatregelen</span> op een rij
              </h2>
              <p
                className="mx-auto"
                style={{ marginTop: 20, fontSize: 17, color: "#6B6B6B", lineHeight: 1.6 }}
              >
                Klik door voor wat er bij elke maatregel komt kijken, voor wie het slim is en welke
                subsidies erbij horen.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-12 max-w-6xl mx-auto">
              {maatregelen.map((m) => {
                const Icon = m.icon;
                return (
                  <a
                    key={m.slug}
                    href={`/verduurzamen/${m.slug}`}
                    className="group flex flex-col rounded-2xl transition-all duration-200 hover:-translate-y-1"
                    style={{
                      backgroundColor: "#FFFFFF",
                      border: "1px solid #E5E2DB",
                      padding: 24,
                      boxShadow: "0 4px 24px rgba(21,44,78,0.04)",
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="flex items-center justify-center rounded-full shrink-0"
                        style={{ width: 44, height: 44, backgroundColor: "#F0E4D0" }}
                      >
                        <Icon size={20} color="#152C4E" strokeWidth={2.25} aria-hidden="true" />
                      </div>
                      {m.badge && (
                        <span
                          className="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold"
                          style={{
                            backgroundColor: "#FDF6E3",
                            color: "#E8B547",
                            border: "1px solid rgba(232,181,71,0.4)",
                          }}
                        >
                          {m.badge}
                        </span>
                      )}
                    </div>
                    <h3
                      className="font-display mt-5"
                      style={{
                        fontWeight: 600,
                        fontSize: 20,
                        color: "#152C4E",
                        letterSpacing: "-0.01em",
                        lineHeight: 1.3,
                      }}
                    >
                      {m.title}
                    </h3>
                    <p style={{ fontSize: 14.5, color: "#6B6B6B", lineHeight: 1.6, marginTop: 8 }}>
                      {m.intro}
                    </p>
                    <span
                      className="mt-5 inline-flex items-center gap-1 text-sm font-semibold transition-colors"
                      style={{ color: "#152C4E" }}
                    >
                      Lees meer
                      <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                    </span>
                  </a>
                );
              })}
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
                marginBottom: 16,
              }}
            >
              Weten waar je het best kunt beginnen?
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
              Plan een vrijblijvend gesprek. We kijken samen welke maatregelen passen bij jouw woning,
              in welke volgorde en welke regelingen je kunt benutten.
            </p>
            <a
              href="/contact"
              className="inline-flex items-center justify-center rounded-full font-semibold transition-colors"
              style={{
                backgroundColor: "#E8B547",
                color: "#152C4E",
                padding: "14px 32px",
                fontSize: 15,
                minHeight: 44,
              }}
            >
              Plan een gesprek
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Verduurzamen;
