import { useState } from "react";
import { ChevronRight, Star } from "lucide-react";

import { GoogleG } from "@/components/GoogleG";
import { useGoogleReviews } from "@/hooks/useGoogleReviews";
import fotoJulian from "@/assets/review-julian.webp";
import fotoTibbe from "@/assets/review-tibbe.webp";

type Kaart = {
  id: string;
  naam: string;
  foto?: string;
  kleur?: string; // vaste avatarkleur; anders afgeleid van de naam
  rating: number;
  tekst: string;
};

// Fallback: getoond zolang de Google-sync nog niet actief is (of bij een fout /
// < 2 gesynchroniseerde reviews). Letterlijke citaten — teksten niet aanpassen.
// Eefje heeft geen foto → Google-stijl letter-avatar in haar echte roze (#D81B60).
const fallbackKaarten: Kaart[] = [
  {
    id: "julian",
    naam: "Julian Kok",
    foto: fotoJulian,
    rating: 5,
    tekst:
      "Ik had geen idee hoe ik moest beginnen met het verduurzamen van mijn huis. Voortraject heeft me daarmee geholpen. Ze regelden de subsidieaanvraag en zorgden dat alles goed op papier stond. Zelf hoefde ik weinig te doen. Dak en spouwmuren zijn nu geïsoleerd en het huis is een stuk warmer. Fijn dat er een partij is die je hier gewoon bij helpt.",
  },
  {
    id: "tibbe",
    naam: "Tibbe Froma",
    foto: fotoTibbe,
    rating: 5,
    tekst:
      "Goed geholpen door Michael. Hij heeft alles voor mij geregeld en komen ze binnenkort nieuwe kozijnen plaatsen.",
  },
  {
    id: "eefje",
    naam: "Eefje Knol",
    kleur: "#D81B60",
    rating: 5,
    tekst: "Zeer tevreden. Ik kreeg deskundig advies en fijn dat ze alle subsidies regelde!",
  },
];

// Google-stijl avatarkleuren; deterministisch gekozen op basis van de naam,
// zodat dezelfde persoon altijd dezelfde kleur krijgt.
const AVATAR_KLEUREN = ["#546E7A", "#00897B", "#D81B60", "#3949AB", "#00838F", "#6D4C41"];
const kleurVoor = (naam: string) =>
  AVATAR_KLEUREN[[...naam].reduce((som, c) => som + c.charCodeAt(0), 0) % AVATAR_KLEUREN.length];
const initiaalVan = (naam: string) => naam.trim().charAt(0).toUpperCase() || "?";

// Tekst langer dan dit → inklapbaar met "Lees meer".
const LANG_DREMPEL = 170;

const Sterren = ({ aantal = 5, size = 16 }: { aantal?: number; size?: number }) => (
  <span className="inline-flex items-center gap-1" aria-label={`${aantal} van 5 sterren`}>
    {Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={size}
        className={i < aantal ? "text-accent fill-accent" : "text-accent/30"}
        aria-hidden="true"
      />
    ))}
  </span>
);

// Profielfoto met vangnet: breekt de (Google-)foto-URL, dan valt 'ie terug op
// de Google-stijl letter-avatar.
const Avatar = ({ naam, foto, kleur }: { naam: string; foto?: string; kleur?: string }) => {
  const [fout, setFout] = useState(false);

  if (foto && !fout) {
    return (
      <img
        src={foto}
        alt={`Profielfoto van ${naam}`}
        loading="lazy"
        decoding="async"
        onError={() => setFout(true)}
        referrerPolicy="no-referrer"
        className="w-10 h-10 rounded-full object-cover shrink-0"
      />
    );
  }

  return (
    <span
      className="inline-flex w-10 h-10 shrink-0 items-center justify-center rounded-full text-white text-[17px] font-medium"
      style={{ backgroundColor: kleur ?? kleurVoor(naam) }}
      aria-hidden="true"
    >
      {initiaalVan(naam)}
    </span>
  );
};

export const Reviews = () => {
  const { reviews, stats } = useGoogleReviews();
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());

  const toggle = (id: string) =>
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  // Live Google-reviews indien beschikbaar (>= 2 met tekst), anders de fallback.
  const live: Kaart[] | null = reviews
    ? reviews
        .map<Kaart>((r) => ({
          id: r.id,
          naam: r.author_name,
          foto: r.profile_photo_url ?? undefined,
          rating: r.rating,
          tekst: (r.text ?? "").trim(),
        }))
        .filter((k) => k.tekst.length > 0)
    : null;
  const kaarten = live && live.length >= 2 ? live : fallbackKaarten;

  const ratingTekst =
    stats?.rating != null
      ? stats.rating.toLocaleString("nl-NL", { minimumFractionDigits: 1, maximumFractionDigits: 1 })
      : "5,0";

  const reviewsUrl = import.meta.env.VITE_GOOGLE_REVIEWS_URL as string | undefined;

  return (
    <section className="section-pad-home bg-primary" aria-labelledby="reviews-title">
      <div className="container-home">
        <div className="text-center">
          <h2 id="reviews-title" className="h2-section !text-white">
            Wat bewoners <span className="text-accent">zeggen</span>
          </h2>
          <p className="mt-4 inline-flex items-center gap-2.5 text-[16px] font-medium text-white/85">
            <Sterren />
            <span>{ratingTekst} op Google</span>
          </p>
        </div>

        {/* items-start: het uitklappen van één kaart mag de andere niet oprekken.
            Mobiel: horizontaal swipebare rij i.p.v. gestapeld. */}
        <div className="mt-8 md:mt-10 flex md:grid md:grid-cols-3 gap-5 md:gap-6 items-start overflow-x-auto md:overflow-visible snap-x snap-mandatory no-scrollbar">
          {kaarten.map(({ id, naam, foto, kleur, rating, tekst }) => {
            const lang = tekst.length > LANG_DREMPEL;
            const open = !lang || openIds.has(id);
            return (
              <article
                key={id}
                className="w-[80%] sm:w-[46%] md:w-auto shrink-0 snap-start relative bg-card rounded-2xl border border-border p-6 flex flex-col"
                style={{ boxShadow: "0 4px 24px hsl(var(--primary) / 0.2)" }}
              >
                {/* Google-logo in de hoek van de tegel */}
                <span className="absolute top-4 right-4">
                  <GoogleG />
                </span>

                {/* Kop: profielfoto + naam */}
                <div className="flex items-center gap-3 min-w-0 pr-8">
                  <Avatar naam={naam} foto={foto} kleur={kleur} />
                  <span className="text-[15px] font-semibold text-primary truncate">{naam}</span>
                </div>

                <div className="mt-4">
                  <Sterren aantal={rating} />
                </div>

                <blockquote className="mt-3 text-[15px] leading-[1.65] text-foreground">
                  <p className={open ? undefined : "line-clamp-5"}>{tekst}</p>
                  {lang && (
                    <button
                      type="button"
                      onClick={() => toggle(id)}
                      aria-expanded={open}
                      className="mt-1 text-muted-foreground font-medium hover:underline underline-offset-2"
                    >
                      {open ? "Lees minder" : "Lees meer"}
                    </button>
                  )}
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

        {/* Doorklik naar het volledige Google-profiel (indien geconfigureerd) */}
        {reviewsUrl && (
          <div className="mt-8 md:mt-10 text-center">
            <a
              href={reviewsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 rounded-full border border-white/20 bg-white/10 px-5 py-2.5 text-[15px] font-medium text-white transition-colors hover:bg-white/15"
            >
              <GoogleG size={18} />
              Alle reviews op Google
              <ChevronRight size={16} />
            </a>
          </div>
        )}
      </div>
    </section>
  );
};
