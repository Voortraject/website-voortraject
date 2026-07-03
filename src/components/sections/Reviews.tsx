import { useState } from "react";
import { ChevronRight, Star } from "lucide-react";

import fotoJulian from "@/assets/review-julian.webp";
import fotoTibbe from "@/assets/review-tibbe.webp";

// Letterlijke citaten — teksten niet aanpassen.
// foto: pad naar profielfoto; zonder foto valt de kaart terug op een
// Google-stijl letter-avatar in avatarKleur (Eefjes echte Google-avatar is de roze E).
const reviews: Array<{
  naam: string;
  initiaal: string;
  avatarKleur: string;
  foto?: string;
  quote: string;
  vervolg?: string;
}> = [
  {
    naam: "Julian Kok",
    initiaal: "J",
    avatarKleur: "#546E7A",
    foto: fotoJulian,
    quote:
      "Ik had geen idee hoe ik moest beginnen met het verduurzamen van mijn huis. Voortraject heeft me daarmee geholpen.",
    vervolg:
      " Ze regelden de subsidieaanvraag en zorgden dat alles goed op papier stond. Zelf hoefde ik weinig te doen. Dak en spouwmuren zijn nu geïsoleerd en het huis is een stuk warmer. Fijn dat er een partij is die je hier gewoon bij helpt.",
  },
  {
    naam: "Tibbe Froma",
    initiaal: "T",
    avatarKleur: "#00897B",
    foto: fotoTibbe,
    quote:
      "Goed geholpen door Michael. Hij heeft alles voor mij geregeld en komen ze binnenkort nieuwe kozijnen plaatsen.",
  },
  {
    naam: "Eefje Knol",
    initiaal: "E",
    avatarKleur: "#D81B60",
    quote: "Zeer tevreden. Ik kreeg deskundig advies en fijn dat ze alle subsidies regelde!",
  },
];

const Sterren = ({ size = 16 }: { size?: number }) => (
  <span className="inline-flex items-center gap-1" aria-label="5 van 5 sterren">
    {Array.from({ length: 5 }, (_, i) => (
      <Star key={i} size={size} className="text-accent fill-accent" aria-hidden="true" />
    ))}
  </span>
);

// Officieel Google "G"-logo in vier kleuren.
const GoogleG = ({ size = 22 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true" className="shrink-0">
    <path
      fill="#4285F4"
      d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"
    />
    <path
      fill="#34A853"
      d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z"
    />
    <path
      fill="#FBBC05"
      d="M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34C2.85 17.09 2 20.45 2 24s.85 6.91 2.34 9.88l7.35-5.7z"
    />
    <path
      fill="#EA4335"
      d="M24 9.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 3.18 29.93 1 24 1 15.4 1 7.96 5.93 4.34 13.12l7.35 5.7C13.42 13.62 18.27 9.75 24 9.75z"
    />
  </svg>
);

const Avatar = ({ naam, initiaal, kleur, foto }: { naam: string; initiaal: string; kleur: string; foto?: string }) =>
  foto ? (
    <img
      src={foto}
      alt={`Profielfoto van ${naam}`}
      loading="lazy"
      decoding="async"
      className="w-10 h-10 rounded-full object-cover shrink-0"
    />
  ) : (
    <span
      className="inline-flex w-10 h-10 shrink-0 items-center justify-center rounded-full text-white text-[17px] font-medium"
      style={{ backgroundColor: kleur }}
      aria-hidden="true"
    >
      {initiaal}
    </span>
  );

export const Reviews = () => {
  const [uitgeklapt, setUitgeklapt] = useState(false);

  return (
    <section className="section-pad-home bg-primary" aria-labelledby="reviews-title">
      <div className="container-home">
        <div className="text-center">
          <h2 id="reviews-title" className="h2-section !text-white">
            Wat bewoners <span className="text-accent">zeggen</span>
          </h2>
          <p className="mt-4 inline-flex items-center gap-2.5 text-[16px] font-medium text-white/85">
            <Sterren />
            <span>5,0 op Google</span>
          </p>
        </div>

        {/* items-start: het uitklappen van één kaart mag de andere niet oprekken.
            Mobiel: horizontaal swipebare rij i.p.v. gestapeld. */}
        <div className="mt-8 md:mt-10 flex md:grid md:grid-cols-3 gap-5 md:gap-6 items-start overflow-x-auto md:overflow-visible snap-x snap-mandatory no-scrollbar">
          {reviews.map(({ naam, initiaal, avatarKleur, foto, quote, vervolg }) => {
            const open = !vervolg || uitgeklapt;
            return (
              <article
                key={naam}
                className="w-[80%] sm:w-[46%] md:w-auto shrink-0 snap-start relative bg-card rounded-2xl border border-border p-6 flex flex-col"
                style={{ boxShadow: "0 4px 24px hsl(var(--primary) / 0.2)" }}
              >
                {/* Google-logo in de hoek van de tegel */}
                <span className="absolute top-4 right-4">
                  <GoogleG />
                </span>

                {/* Kop: profielfoto + naam */}
                <div className="flex items-center gap-3 min-w-0 pr-8">
                  <Avatar naam={naam} initiaal={initiaal} kleur={avatarKleur} foto={foto} />
                  <span className="text-[15px] font-semibold text-primary truncate">{naam}</span>
                </div>

                <div className="mt-4">
                  <Sterren />
                </div>

                <blockquote className="mt-3 text-[15px] leading-[1.65] text-foreground">
                  <p>
                    {quote}
                    {vervolg && uitgeklapt && vervolg}
                    {vervolg && (
                      <>
                        {" "}
                        <button
                          type="button"
                          onClick={() => setUitgeklapt(!uitgeklapt)}
                          aria-expanded={open}
                          className="text-muted-foreground font-medium hover:underline underline-offset-2"
                        >
                          {uitgeklapt ? "Lees minder" : "Lees meer"}
                        </button>
                      </>
                    )}
                  </p>
                </blockquote>
              </article>
            );
          })}
        </div>

        {/* Swipe-hint: alleen mobiel, onder de eerste kaart */}
        <div
          className="md:hidden mt-3.5 flex items-center gap-1.5 text-white/70 animate-swipe-hint motion-reduce:animate-none"
          aria-hidden="true"
        >
          <span className="text-[13px] font-medium">Veeg</span>
          <ChevronRight size={16} />
        </div>
      </div>
    </section>
  );
};
