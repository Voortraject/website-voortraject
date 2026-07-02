import { Phone } from "lucide-react";

import heroHouses from "@/assets/hero-houses.webp";

export const Hero = () => {
  return (
    <section className="bg-background pt-10 pb-[56px] md:pt-16 md:pb-[80px]" aria-labelledby="hero-title">
      <div className="container-content">
        <div className="flex flex-col lg:flex-row lg:items-center gap-8 lg:gap-[5%]">
          <div className="lg:basis-[48%] lg:shrink-0 min-w-0 text-left">
            <div className="animate-fade-up">
              <h1
                id="hero-title"
                className="h1-hero text-foreground text-left leading-[1.1]"
                style={{
                  fontSize: "clamp(2rem, 4.5vw, 3.75rem)",
                  wordBreak: "keep-all",
                  hyphens: "none",
                  overflowWrap: "normal",
                  maxWidth: "none",
                }}
              >
                Gratis advies over{" "}
                <span className="text-accent">verduurzamen en subsidies</span>
              </h1>

              <p className="mt-6 md:mt-8 mb-6 md:mb-8 text-[16px] md:text-[19px] leading-[1.6] max-w-xl text-primary/80">
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

          <div className="lg:basis-[47%] lg:shrink-0 min-w-0 lg:ml-auto">
            <img
              src={heroHouses}
              alt="Nederlandse rijtjeshuizen met zonnepanelen op het dak"
              fetchPriority="high"
              decoding="async"
              className="w-full rounded-2xl object-cover h-[240px] sm:h-[320px] md:h-[400px] lg:h-[480px]"
              style={{ boxShadow: "0 4px 20px hsl(var(--primary) / 0.08)", objectPosition: "right center" }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};
