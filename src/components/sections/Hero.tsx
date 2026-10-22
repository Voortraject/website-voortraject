import { Check, Search } from "lucide-react";

import { CtaButton } from "@/components/CtaButton";
import { GoogleG } from "@/components/GoogleG";
import { Sterren } from "@/components/Sterren";
import { useGoogleReviews } from "@/hooks/useGoogleReviews";
import { GOOGLE_REVIEWS_URL } from "@/lib/reviews";
import heroAdviesgesprek from "@/assets/hero-adviesgesprek.webp";
import "@/styles/home-boven.css";

const claims = [
  "Lokaal adviesteam",
  "Kennis van alle subsidieregelingen",
  "Begeleiding tot de uitvoering klaar is",
];

/** Id van de wikkel om de oker hoofdknop; de header toont zijn eigen knop pas als deze uit beeld is. */
export const HERO_KNOP_ID = "hero-knop";

// De hero veert bewust niet in: dit is het eerste scherm, en alles wat hier
// wacht op een animatie vertraagt wat de bezoeker als "geladen" ervaart.
export const Hero = () => {
  const { stats } = useGoogleReviews();
  const ratingTekst =
    stats?.rating != null
      ? stats.rating.toLocaleString("nl-NL", { minimumFractionDigits: 1, maximumFractionDigits: 1 })
      : "5,0";

  return (
    <section
      className="relative -mt-20 overflow-hidden rounded-b-[2rem] bg-primary md:rounded-b-[3rem]"
      aria-labelledby="hero-title"
    >
      <img
        src={heroAdviesgesprek}
        alt="Adviseur van Voortraject bekijkt samen met een bewoner de mogelijkheden voor zijn woning aan de eettafel"
        fetchPriority="high"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover"
        style={{ objectPosition: "center 28%" }}
      />
      {/* Inktblauw verloop over de foto: op de telefoon donker onderaan (daar
          staat de tekst), op desktop donker aan de linkerkant. */}
      <div className="home-hero-waas absolute inset-0" aria-hidden="true" />

      {/* pb houdt rekening met de logotegel, die over de onderrand schuift. Op de
          telefoon ruimer (116 px): zonder de glasknop zakt de inhoud anders te
          ver, en zo staat "subsidies" op de kin van de rechterpersoon. */}
      <div className="relative container-content flex min-h-[640px] items-end pt-32 pb-[116px] md:min-h-[720px] md:items-center md:pt-[12.5rem] md:pb-[104px] lg:min-h-[84vh]">
        <div className="w-full min-w-0 max-w-5xl">
          <h1 id="hero-title" className="home-hero-kop text-primary-foreground">
            <span>Gratis advies over</span>
            <span className="text-accent">verduurzamen en subsidies</span>
          </h1>

          <ul className="mt-[22px] grid gap-2.5 md:mt-[30px] md:flex md:flex-wrap md:gap-x-[26px] md:gap-y-2.5">
            {claims.map((claim) => (
              <li
                key={claim}
                className="flex items-center gap-2.5 text-[15.5px] font-semibold text-primary-foreground"
              >
                <span className="hs-rondje hs-rondje-glas h-6 w-6" aria-hidden="true">
                  <Check size={14} strokeWidth={3} />
                </span>
                {claim}
              </li>
            ))}
          </ul>

          <div className="mt-7 grid gap-3 sm:flex sm:items-center sm:gap-4">
            {/* Hoofd-CTA is de subsidiecheck: laagdrempeliger instap dan direct
                een gesprek plannen. De wikkel draagt het id waarop de header
                wacht (CtaButton heeft zelf geen id). */}
            <div id={HERO_KNOP_ID} className="grid sm:block">
              <CtaButton href="/subsidiecheck">
                <Search size={17} strokeWidth={2.2} aria-hidden="true" />
                <span>Check jouw subsidies</span>
              </CtaButton>
            </div>
            {/* Secundaire CTA naar het contactformulier; bellen kan nog via de
                header-pill en de WhatsApp-knop. Op de telefoon weg (oktober
                2026): één knop in de hero is rustiger, en het gesprek staat
                verderop nog bij "Van twijfel naar een compleet plan". */}
            <CtaButton href="/contact" variant="glas" className="max-md:hidden">
              Plan een gratis gesprek
            </CtaButton>
          </div>

          <a
            href={GOOGLE_REVIEWS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hs-glas-pil mt-5 inline-flex items-center gap-[9px] rounded-full py-[7px] pl-3 pr-3.5 text-[15px] font-bold text-primary-foreground transition-opacity hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground/70 focus-visible:ring-offset-2"
            aria-label={`Bekijk onze beoordelingen op Google (${ratingTekst} van 5)`}
          >
            <Sterren waarde={stats?.rating ?? 5} />
            <span aria-hidden="true">{ratingTekst}</span>
            <GoogleG size={18} />
          </a>
        </div>
      </div>
    </section>
  );
};
