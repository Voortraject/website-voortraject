import { ArrowRight } from "lucide-react";

import teamPolos from "@/assets/subsidies-uitzoeken.webp";

export const Team = () => (
  <section className="section-pad-home" style={{ backgroundColor: "#FFFFFF" }} aria-labelledby="team-title">
    <div className="container-home">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
        <div>
          <img
            src={teamPolos}
            alt="Twee teamleden van Voortraject werken samen achter hun laptops"
            loading="lazy"
            decoding="async"
            className="w-full h-64 sm:h-80 lg:h-[400px] rounded-2xl object-cover"
            style={{ boxShadow: "0 4px 20px hsl(var(--primary) / 0.08)" }}
          />
        </div>

        <div>
          <h2 id="team-title" className="h2-section">
            Een adviesteam uit het <span className="text-accent">Noorden</span>
          </h2>
          <p className="mt-5 text-[18px] md:text-[20px] leading-[1.65] text-muted-foreground">
            Voortraject is een nuchter adviesteam uit Noord-Nederland. Je spreekt bij ons geen
            callcenter maar gewoon Michael, Wouter, Tim of Christian, en diegene blijft jouw
            aanspreekpunt van het eerste gesprek tot de oplevering. We werken in Groningen,
            Drenthe en Friesland.
          </p>
          <a
            href="/over-ons"
            className="mt-7 inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-[15px] font-semibold border border-primary text-primary transition-colors duration-150 hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          >
            Over ons
            <ArrowRight size={16} aria-hidden="true" />
          </a>
        </div>
      </div>
    </div>
  </section>
);
