import fotoIsolatie from "@/assets/helpen-isolatie.webp";
import fotoInstallaties from "@/assets/maatregel-zonnepanelen.webp";
import fotoSubsidies from "@/assets/helpen-subsidies.webp";

const isolatieLinks = [{ href: "/verduurzamen/isolatie", label: "Isolatie & ventilatie" }];

const installatieLinks = [
  { href: "/verduurzamen/warmtepomp", label: "Warmtepomp" },
  { href: "/verduurzamen/zonnepanelen", label: "Zonnepanelen" },
  { href: "/verduurzamen/thuisbatterij", label: "Thuisbatterij & opslag" },
  { href: "/verduurzamen/airco", label: "Airco" },
  { href: "/verduurzamen/laadpaal", label: "Laadpaal" },
];

const subsidieLinks = [
  { href: "/subsidies/nij-begun", label: "Nij Begun" },
  { href: "/subsidies/landelijk", label: "Landelijke subsidies" },
  { href: "/subsidies/regionaal", label: "Regionale subsidies" },
  { href: "/subsidies/stapelen", label: "Subsidies stapelen" },
];

const TegelFoto = ({
  src,
  alt,
  objectPosition,
}: {
  src: string;
  alt: string;
  objectPosition?: string;
}) => (
  <div className="relative rounded-2xl overflow-hidden">
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      className="w-full h-56 md:h-64 object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
      style={objectPosition ? { objectPosition } : undefined}
    />
  </div>
);

const TegelLinks = ({ links }: { links: { href: string; label: string }[] }) => (
  <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
    {links.map(({ href, label }) => (
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
);

export const WaarWeBijHelpen = () => (
  <section className="section-pad-home" style={{ backgroundColor: "#F5F3ED" }} aria-labelledby="helpen-title">
    <div className="container-home">
      <h2 id="helpen-title" className="h2-section">
        Waar we bij <span className="text-accent">helpen</span>
      </h2>

      <div className="mt-8 md:mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-7 items-start">
        {/* 1. Isolatie */}
        <article className="group">
          <TegelFoto
            src={fotoIsolatie}
            alt="Adviseur van Voortraject meet de gevel op voor isolatie"
          />
          <h3 className="mt-4 font-display font-semibold text-primary text-[20px] md:text-[22px] leading-[1.25]">
            Advies over isolatie
          </h3>
          <p className="mt-1.5 text-[15px] leading-[1.6] text-muted-foreground">
            Van spouwmuur tot dak en glas: de basis van elke slimme verduurzaming.
          </p>
          <TegelLinks links={isolatieLinks} />
        </article>

        {/* 2. Duurzame installaties */}
        <article className="group">
          <TegelFoto
            src={fotoInstallaties}
            alt="Adviseur van Voortraject bekijkt zonnepanelen op een dak"
          />
          <h3 className="mt-4 font-display font-semibold text-primary text-[20px] md:text-[22px] leading-[1.25]">
            Advies over duurzame installaties
          </h3>
          <p className="mt-1.5 text-[15px] leading-[1.6] text-muted-foreground">
            Warmtepomp, zonnepanelen, thuisbatterij, airco of laadpaal: wat past bij jouw
            woning?
          </p>
          <TegelLinks links={installatieLinks} />
        </article>

        {/* 3. Subsidies */}
        <article className="group">
          <TegelFoto
            src={fotoSubsidies}
            alt="Adviseur van Voortraject bespreekt de subsidiemogelijkheden met een bewoner aan tafel"
            objectPosition="center 58%"
          />
          <h3 className="mt-4 font-display font-semibold text-primary text-[20px] md:text-[22px] leading-[1.25]">
            Advies en hulp bij subsidies
          </h3>
          <p className="mt-1.5 text-[15px] leading-[1.6] text-muted-foreground">
            Landelijk, provinciaal en gemeentelijk: wij weten wat er voor jouw adres geldt.
          </p>
          <TegelLinks links={subsidieLinks} />
        </article>
      </div>
    </div>
  </section>
);
