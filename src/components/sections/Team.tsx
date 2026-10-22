import { useRef } from "react";
import { ArrowRight } from "lucide-react";

import teamPolos from "@/assets/subsidies-uitzoeken.webp";
import { useStaffel } from "@/lib/beweging";

export const Team = () => {
  const sectie = useRef<HTMLElement>(null);
  useStaffel(sectie);

  return (
    <section ref={sectie} className="hs-band-licht-naar-zand py-[52px] md:py-[88px]" aria-labelledby="team-title">
      <div className="container-home">
        <div className="grid grid-cols-1 items-center gap-7 lg:grid-cols-2 lg:gap-14">
          <img
            src={teamPolos}
            alt="Twee teamleden van Voortraject werken samen achter hun laptops"
            loading="lazy"
            decoding="async"
            className="hs-foto h-56 w-full object-cover sm:h-80 lg:h-[420px]"
            data-veer
          />

          <div data-veer>
            <h2 id="team-title" className="hs-h2">
              Een adviesteam uit het <span className="hs-accent">Noorden</span>
            </h2>
            <p className="hs-tekst mt-4 text-[16.5px] leading-[1.6] md:text-[18px]">
              Voortraject is een nuchter adviesteam uit Noord-Nederland. Je spreekt bij ons geen
              callcenter maar gewoon Michael, Wouter, Tim of Christian, vaste gezichten die jouw
              situatie kennen van het eerste gesprek tot de oplevering. We werken in Groningen,
              Drenthe en Friesland.
            </p>
            <a href="/over-ons" className="hs-pijl-link mt-[18px] text-[16px]">
              Over ons
              <ArrowRight size={17} strokeWidth={2.2} className="hs-pijl" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
