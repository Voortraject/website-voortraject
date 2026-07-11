import { Check, Search } from "lucide-react";

import { CtaButton } from "@/components/CtaButton";
import { GoogleG } from "@/components/GoogleG";
import { Sterren } from "@/components/Sterren";
import { useGoogleReviews } from "@/hooks/useGoogleReviews";
import heroAdviesgesprek from "@/assets/hero-adviesgesprek.webp";

const claims = [
  "Lokaal adviesteam",
  "Kennis van alle subsidieregelingen",
  "Begeleiding tot de uitvoering klaar is",
];

export const Hero = () => {
  const { stats } = useGoogleReviews();
  const reviewsUrl = import.meta.env.VITE_GOOGLE_REVIEWS_URL as string | undefined;
  const ratingTekst =
    stats?.rating != null
      ? stats.rating.toLocaleString("nl-NL", { minimumFractionDigits: 1, maximumFractionDigits: 1 })
      : "5,0";
  const badgeInhoud = (
    <>
      <Sterren waarde={stats?.rating ?? 5} />
      <span aria-hidden="true">{ratingTekst}</span>
      <GoogleG size={18} />
    </>
  );

  return (
    <section
      className="relative overflow-hidden -mt-20"
      style={{ backgroundColor: "#FFFFFF" }}
      aria-labelledby="hero-title"
    >
      <img
        src={heroAdviesgesprek}
        alt="Adviseur van Voortraject bekijkt samen met een bewoner de mogelijkheden voor zijn woning aan de eettafel"
        fetchPriority="high"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover rounded-b-[2rem] md:rounded-b-[3rem]"
        style={{ objectPosition: "center 28%" }}
      />
      <div
        className="absolute inset-0 rounded-b-[2rem] md:rounded-b-[3rem]"
        style={{
          background:
            "linear-gradient(90deg, rgba(0, 0, 0, 0.55) 0%, rgba(0, 0, 0, 0.3) 55%, rgba(0, 0, 0, 0.18) 100%)",
        }}
        aria-hidden="true"
      />

      <div className="relative container-content flex items-center min-h-[600px] md:min-h-[700px] lg:min-h-[84vh] pt-32 pb-20 md:pt-[12.5rem] md:pb-20">
        <div className="animate-fade-up max-w-5xl">
          <h1
            id="hero-title"
            className="h1-hero text-white leading-[1.06]"
            style={{ fontSize: "clamp(2.25rem, 5vw, 4.5rem)" }}
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
            <CtaButton href="/contact">Plan een gratis gesprek</CtaButton>
            {/* Secundaire CTA naar de subsidiecheck; bellen kan nog via de
                header-pill en de WhatsApp-knop. */}
            <a
              href="/subsidiecheck"
              className="inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-[15px] font-medium border border-white/80 text-white transition-all duration-150 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            >
              <Search size={16} strokeWidth={2} aria-hidden="true" />
              <span>Check jouw subsidies</span>
            </a>
          </div>

          {reviewsUrl ? (
            <a
              href={reviewsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2.5 rounded-full text-[15px] font-medium text-white/90 transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2"
              aria-label={`Bekijk onze beoordelingen op Google (${ratingTekst} van 5)`}
            >
              {badgeInhoud}
            </a>
          ) : (
            <p
              className="mt-6 inline-flex items-center gap-2.5 text-[15px] font-medium text-white/90"
              aria-label={`Beoordeeld met ${ratingTekst} van 5 op Google`}
            >
              {badgeInhoud}
            </p>
          )}
        </div>
      </div>
    </section>
  );
};
