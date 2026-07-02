import { Phone } from "lucide-react";

import heroKeukentafel from "@/assets/hero-keukentafel.webp";

export const Hero = () => {
  return (
    <section className="bg-background py-10 md:py-16" aria-labelledby="hero-title">
      <div className="container-content">
        <div className="flex flex-col lg:flex-row lg:items-center gap-8 lg:gap-[4%]">
          <div className="lg:basis-[52%] lg:shrink-0 min-w-0 text-left">
            <div className="animate-fade-up">
              <h1
                id="hero-title"
                className="h1-hero text-foreground text-left leading-[1.08]"
                style={{ fontSize: "clamp(1.7rem, 3.8vw, 3.25rem)" }}
              >
                <span className="block">Gratis advies over</span>
                <span className="block text-accent">verduurzamen en subsidies</span>
              </h1>

              <p className="mt-5 md:mt-7 mb-6 md:mb-8 text-[16px] md:text-[19px] leading-[1.6] max-w-2xl text-primary/80">
                Wil je isoleren, een warmtepomp, zonnepanelen of airco? Wij zoeken gratis
                voor je uit welke maatregelen slim zijn én welke subsidies je kunt krijgen.
                Onafhankelijk, zonder verkooppraatje en zonder wachtlijst.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-5">
                <a
                  href="/contact"
                  className="inline-flex items-center justify-center rounded-full px-7 py-3.5 text-[15px] font-semibold bg-accent text-primary transition-all duration-150 hover:scale-[1.02] hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                >
                  Plan een gratis gesprek
                </a>
                <a
                  href="tel:+31502112689"
                  className="inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-[15px] font-medium border border-primary text-primary bg-transparent transition-all duration-150 hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                >
                  <Phone size={16} strokeWidth={2} aria-hidden="true" />
                  <span>Of bel direct: 050 211 2689</span>
                </a>
              </div>

              <p className="mt-6 text-[14px] text-primary/65">
                Vrijblijvend · Binnen 24 uur reactie · Je hoeft niets voor te bereiden
              </p>
            </div>
          </div>

          <div className="lg:basis-[44%] lg:shrink-0 min-w-0 lg:ml-auto">
            <img
              src={heroKeukentafel}
              alt="Adviseur van Voortraject bekijkt samen met een bewoner de mogelijkheden voor haar woning aan de keukentafel"
              fetchPriority="high"
              decoding="async"
              className="w-full rounded-2xl object-cover h-[260px] sm:h-[340px] md:h-[420px] lg:h-[540px]"
              style={{ boxShadow: "0 4px 20px hsl(var(--primary) / 0.08)", objectPosition: "center" }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};
