import { useRef, type ReactNode } from "react";

import { useStaffel } from "@/lib/beweging";
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

type Link = { href: string; label: string };

// Eén witte kaart per onderwerp: foto bovenin, dan titel, uitleg en de links als
// chips. Op de telefoon zijn de chips kleiner, zodat ze per kaart in hooguit twee
// regels passen, ook op 360 px.
const Kaart = ({
  src,
  alt,
  objectPosition,
  titel,
  links,
  children,
}: {
  src: string;
  alt: string;
  objectPosition?: string;
  titel: string;
  links: Link[];
  children: ReactNode;
}) => (
  <article className="group hs-tegel hs-klik flex flex-col overflow-hidden" data-veer>
    <div className="overflow-hidden">
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        className="h-[136px] w-full object-cover transition-transform duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none md:h-[220px] [@media(hover:hover)]:group-hover:scale-[1.03]"
        style={objectPosition ? { objectPosition } : undefined}
      />
    </div>
    <div className="px-5 pb-5 pt-[18px] max-[380px]:px-4">
      <h3 className="hs-h3">{titel}</h3>
      <p className="hs-tekst mt-1.5 text-[15px] leading-[1.6]">{children}</p>
      <ul className="mt-3.5 flex flex-wrap gap-2 max-md:mt-3 max-md:gap-1.5 max-[380px]:gap-[5px]">
        {links.map(({ href, label }) => (
          <li key={href}>
            <a
              href={href}
              className="hs-chip focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary max-md:min-h-[30px] max-md:px-2.5 max-md:text-[12.5px] max-[380px]:px-2 max-[380px]:text-[11.5px]"
            >
              {label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  </article>
);

export const WaarWeBijHelpen = () => {
  const sectie = useRef<HTMLElement>(null);
  useStaffel(sectie);

  return (
    <section ref={sectie} className="section-pad-home hs-band" aria-labelledby="helpen-title">
      <div className="container-home">
        <h2 id="helpen-title" className="hs-h2" data-veer>
          Waar we bij <span className="hs-accent">helpen</span>
        </h2>

        <div className="mt-6 grid grid-cols-1 items-stretch gap-4 md:mt-10 md:grid-cols-3 md:gap-6">
          {/* 1. Isolatie */}
          <Kaart
            src={fotoIsolatie}
            alt="Adviseur van Voortraject meet de gevel op voor isolatie"
            titel="Advies over isolatie"
            links={isolatieLinks}
          >
            Van spouwmuur tot dak en glas: de basis van elke slimme verduurzaming.
          </Kaart>

          {/* 2. Duurzame installaties */}
          <Kaart
            src={fotoInstallaties}
            alt="Adviseur van Voortraject bekijkt zonnepanelen op een dak"
            titel="Advies over duurzame installaties"
            links={installatieLinks}
          >
            Warmtepomp, zonnepanelen, thuisbatterij, airco of laadpaal: wat past bij jouw
            woning?
          </Kaart>

          {/* 3. Subsidies */}
          <Kaart
            src={fotoSubsidies}
            alt="Adviseur van Voortraject bespreekt de subsidiemogelijkheden met een bewoner aan tafel"
            objectPosition="center 58%"
            titel="Advies en hulp bij subsidies"
            links={subsidieLinks}
          >
            Landelijk, provinciaal en gemeentelijk: wij weten wat er voor jouw adres geldt.
          </Kaart>
        </div>
      </div>
    </section>
  );
};
