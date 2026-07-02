import { Check, Phone } from "lucide-react";

import heroAdviesgesprek from "@/assets/hero-adviesgesprek.webp";

const claims = [
  "Lokaal adviesteam",
  "Kennis van alle subsidieregelingen",
  "Begeleiding tot de uitvoering klaar is",
];

export const Hero = () => {
  return (
    <section className="relative overflow-hidden" aria-labelledby="hero-title">
      <img
        src={heroAdviesgesprek}
        alt="Adviseur van Voortraject bekijkt samen met een bewoner de mogelijkheden voor zijn woning aan de eettafel"
        fetchPriority="high"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover"
        style={{ objectPosition: "center 62%" }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, rgba(0, 0, 0, 0.55) 0%, rgba(0, 0, 0, 0.3) 55%, rgba(0, 0, 0, 0.18) 100%)",
        }}
        aria-hidden="true"
      />

      <div className="relative container-content flex items-center min-h-[520px] md:min-h-[620px] lg:min-h-[70vh] py-16 md:py-24">
        <div className="animate-fade-up max-w-4xl">
          <h1
            id="hero-title"
            className="h1-hero text-white leading-[1.06]"
            style={{ fontSize: "clamp(1.75rem, 5vw, 4.25rem)" }}
          >
            <span className="block">Gratis advies over</span>
            <span className="block text-accent">verduurzamen en subsidies</span>
          </h1>

          <ul className="mt-7 md:mt-8 flex flex-wrap items-center gap-x-7 gap-y-2.5">
            {claims.map((claim) => (
              <li
                key={claim}
                className="inline-flex items-center gap-2 text-[15px] md:text-[16px] font-medium text-white"
              >
                <Check size={18} strokeWidth={2.5} className="shrink-0 text-accent" aria-hidden="true" />
                {claim}
              </li>
            ))}
          </ul>

          <div className="mt-8 md:mt-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
            <a
              href="/contact"
              className="inline-flex items-center justify-center rounded-full px-7 py-3.5 text-[15px] font-semibold bg-accent text-primary transition-all duration-150 hover:scale-[1.02] hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            >
              Plan een gratis gesprek
            </a>
            <a
              href="tel:+31502112689"
              className="inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-[15px] font-medium border border-white/80 text-white transition-all duration-150 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            >
              <Phone size={16} strokeWidth={2} aria-hidden="true" />
              <span>Of bel direct: 050 211 2689</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
