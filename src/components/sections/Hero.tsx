import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

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
                  fontSize: "clamp(2rem, 6vw, 5rem)",
                  wordBreak: "keep-all",
                  hyphens: "none",
                  overflowWrap: "normal",
                  maxWidth: "none",
                }}
              >
                <span style={{ color: "#1a1a1a", fontWeight: 700 }}>Verduurzamen.</span>
                <br />
                <span style={{ color: "hsl(var(--accent))", fontWeight: 700 }}>Zonder zorgen.</span>
              </h1>

              <p
                className="mt-6 md:mt-8 mb-6 md:mb-8 text-[16px] md:text-[19px] leading-[1.6] max-w-xl"
                style={{ color: "hsl(var(--primary) / 0.8)" }}
              >
                Eén vast aanspreekpunt dat je hele verduurzamingstraject regelt en het overzicht bewaakt.
                Snel, persoonlijk en met de kennis om al je vragen meteen te beantwoorden.
              </p>


              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-5">
                <a
                  href="/bewoners"
                  className="inline-flex items-center justify-center rounded-full px-7 py-3.5 text-[15px] font-semibold transition-all duration-150 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                  style={{
                    backgroundColor: "hsl(var(--accent))",
                    color: "hsl(var(--primary))",
                  }}
                >
                  Ik ben een bewoner
                </a>
                <a
                  href="/uitvoerders"
                  className="inline-flex items-center justify-center rounded-full px-7 py-3.5 text-[15px] font-medium border transition-all duration-150 hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                  style={{
                    borderColor: "hsl(var(--primary))",
                    color: "hsl(var(--primary))",
                    backgroundColor: "transparent",
                  }}
                >
                  Ik ben een uitvoerder
                </a>
                
              </div>

              <div
                className="mt-6 flex flex-wrap items-center gap-y-2 text-[14px]"
                style={{ color: "hsl(var(--primary) / 0.65)" }}
              >
                <span className="inline-flex items-center">
                  Gecertificeerde uitvoerders
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        aria-label="Meer informatie over certificeringen"
                        className="ml-1.5 inline-flex items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1"
                        style={{ color: "hsl(var(--accent))" }}
                      >
                        <Info size={14} />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent
                      side="top"
                      className="max-w-[300px] p-4 text-[13px] leading-[1.5] shadow-md"
                      style={{
                        backgroundColor: "#FFFFFF",
                        border: "1px solid rgba(229, 201, 103, 0.4)",
                        color: "hsl(var(--primary))",
                        borderRadius: "0.5rem",
                      }}
                    >
                      Onze uitvoerders zijn SKG-IKOB, Insula en VENIN-gecertificeerd. Keurmerken voor kwaliteit, vakmanschap en veiligheid.
                    </TooltipContent>
                  </Tooltip>
                </span>
                <span className="mx-2 md:mx-3" aria-hidden="true">•</span>
                <span>Lokaal adviesteam</span>
                <span className="mx-2 md:mx-3" aria-hidden="true">•</span>
                <span>Ervaren in subsidies</span>
              </div>
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
