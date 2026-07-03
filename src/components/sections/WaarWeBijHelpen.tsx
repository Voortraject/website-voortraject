import { ArrowUpRight } from "lucide-react";

import fotoIsolatie from "@/assets/maatregel-isolatie.webp";
import fotoInstallaties from "@/assets/maatregel-zonnepanelen.webp";
import fotoSubsidies from "@/assets/contact-adviseur.webp";

const installatieLinks = [
  { href: "/verduurzamen/warmtepomp", label: "Warmtepomp" },
  { href: "/verduurzamen/zonnepanelen", label: "Zonnepanelen" },
  { href: "/verduurzamen/thuisbatterij", label: "Thuisbatterij & opslag" },
  { href: "/verduurzamen/airco", label: "Airco" },
  { href: "/verduurzamen/laadpaal", label: "Laadpaal" },
];

const TegelFoto = ({
  src,
  alt,
  metPijl,
  objectPosition,
}: {
  src: string;
  alt: string;
  metPijl?: boolean;
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
    {metPijl && (
      <span className="absolute bottom-3 right-3 inline-flex w-11 h-11 items-center justify-center rounded-full bg-accent transition-all duration-200 group-hover:bg-accent-hover group-hover:scale-105">
        <ArrowUpRight size={20} className="text-primary" aria-hidden="true" />
      </span>
    )}
  </div>
);

export const WaarWeBijHelpen = () => (
  <section className="section-pad-home" style={{ backgroundColor: "#F5F3ED" }} aria-labelledby="helpen-title">
    <div className="container-home">
      <h2 id="helpen-title" className="h2-section">
        Waar we bij <span className="text-accent">helpen</span>
      </h2>

      <div className="mt-8 md:mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-7 items-start">
        {/* 1. Isolatie — hele tegel klikbaar */}
        <a href="/verduurzamen/isolatie" className="group block">
          <TegelFoto
            src={fotoIsolatie}
            alt="Adviseur van Voortraject inspecteert de kruipruimte voor isolatie"
            metPijl
          />
          <h3 className="mt-4 font-display font-semibold text-primary text-[20px] md:text-[22px] leading-[1.25]">
            Isolatie
          </h3>
          <p className="mt-1.5 text-[15px] leading-[1.6] text-muted-foreground">
            Van spouwmuur tot dak en glas: de basis van elke slimme verduurzaming.
          </p>
        </a>

        {/* 2. Duurzame installaties — geen overzichtspagina, dus losse tekstlinks */}
        <article className="group">
          <TegelFoto
            src={fotoInstallaties}
            alt="Adviseur van Voortraject bekijkt zonnepanelen op een dak"
          />
          <h3 className="mt-4 font-display font-semibold text-primary text-[20px] md:text-[22px] leading-[1.25]">
            Duurzame installaties
          </h3>
          <p className="mt-1.5 text-[15px] leading-[1.6] text-muted-foreground">
            Warmtepomp, zonnepanelen, thuisbatterij, airco of laadpaal: wat past bij jouw
            woning?
          </p>
          <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
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
        <a href="/subsidies/stapelen" className="group block">
          <TegelFoto
            src={fotoSubsidies}
            alt="Adviseur van Voortraject zoekt achter de laptop uit welke subsidies gelden"
            metPijl
            objectPosition="center 30%"
          />
          <h3 className="mt-4 font-display font-semibold text-primary text-[20px] md:text-[22px] leading-[1.25]">
            Subsidies
          </h3>
          <p className="mt-1.5 text-[15px] leading-[1.6] text-muted-foreground">
            Landelijk, provinciaal en gemeentelijk: wij weten wat er voor jouw adres geldt.
          </p>
        </a>
      </div>
    </div>
  </section>
);
