import { ArrowRight, Euro, Home, Zap } from "lucide-react";

const installatieLinks = [
  { href: "/verduurzamen/warmtepomp", label: "Warmtepomp" },
  { href: "/verduurzamen/zonnepanelen", label: "Zonnepanelen" },
  { href: "/verduurzamen/thuisbatterij", label: "Thuisbatterij & opslag" },
  { href: "/verduurzamen/airco", label: "Airco" },
  { href: "/verduurzamen/laadpaal", label: "Laadpaal" },
];

const kaartClass =
  "bg-card rounded-2xl border border-border p-6 md:p-7 flex flex-col h-full transition-all duration-200 ease-out hover:-translate-y-0.5";
const kaartShadow = { boxShadow: "0 4px 24px hsl(var(--primary) / 0.06)" };

const IconCirkel = ({ icon: Icon }: { icon: typeof Home }) => (
  <span className="inline-flex shrink-0 w-11 h-11 items-center justify-center rounded-full bg-accent">
    <Icon size={20} className="text-primary" aria-hidden="true" />
  </span>
);

export const WaarWeBijHelpen = () => (
  <section className="section-pad" style={{ backgroundColor: "#F5F3ED" }} aria-labelledby="helpen-title">
    <div className="container-home">
      <h2 id="helpen-title" className="h2-section">
        Waar we bij <span className="text-accent">helpen</span>
      </h2>

      <div className="mt-10 md:mt-14 grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 items-stretch">
        {/* 1. Isolatie — hele tegel klikbaar */}
        <a href="/verduurzamen/isolatie" className={`${kaartClass} group`} style={kaartShadow}>
          <IconCirkel icon={Home} />
          <h3 className="mt-4 font-display font-semibold text-primary text-[18px] leading-[1.25]">
            Isolatie
          </h3>
          <p className="mt-2.5 text-[15px] leading-[1.6] text-muted-foreground">
            Van spouwmuur tot dak en glas: de basis van elke slimme verduurzaming.
          </p>
          <span className="mt-auto pt-5 inline-flex items-center gap-1.5 text-[15px] font-semibold text-primary group-hover:text-accent-hover transition-colors">
            Bekijk
            <ArrowRight size={16} aria-hidden="true" />
          </span>
        </a>

        {/* 2. Duurzame installaties — geen overzichtspagina, dus losse tekstlinks */}
        <article className={kaartClass} style={kaartShadow}>
          <IconCirkel icon={Zap} />
          <h3 className="mt-4 font-display font-semibold text-primary text-[18px] leading-[1.25]">
            Duurzame installaties
          </h3>
          <p className="mt-2.5 text-[15px] leading-[1.6] text-muted-foreground">
            Warmtepomp, zonnepanelen, thuisbatterij, airco of laadpaal: wat past bij jouw
            woning?
          </p>
          <ul className="mt-auto pt-5 flex flex-wrap gap-x-4 gap-y-1.5">
            {installatieLinks.map(({ href, label }) => (
              <li key={href}>
                <a
                  href={href}
                  className="text-[14px] font-medium text-primary underline underline-offset-4 decoration-border hover:decoration-accent hover:text-accent-hover transition-colors"
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </article>

        {/* 3. Subsidies — hele tegel klikbaar */}
        <a href="/subsidies/stapelen" className={`${kaartClass} group`} style={kaartShadow}>
          <IconCirkel icon={Euro} />
          <h3 className="mt-4 font-display font-semibold text-primary text-[18px] leading-[1.25]">
            Subsidies
          </h3>
          <p className="mt-2.5 text-[15px] leading-[1.6] text-muted-foreground">
            Landelijk, provinciaal en gemeentelijk: wij weten wat er voor jouw adres geldt.
          </p>
          <span className="mt-auto pt-5 inline-flex items-center gap-1.5 text-[15px] font-semibold text-primary group-hover:text-accent-hover transition-colors">
            Bekijk
            <ArrowRight size={16} aria-hidden="true" />
          </span>
        </a>
      </div>
    </div>
  </section>
);
