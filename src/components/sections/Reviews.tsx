import { useLayoutEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
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

// Ingeklapte tekst reserveert deze hoogte (5 regels) → alle kaarten even hoog.
// "Lees meer" verschijnt alleen als de tekst daadwerkelijk wordt afgekapt.
const REVIEW_KAART =
  "relative bg-card rounded-2xl border border-border p-6 flex flex-col h-full";

const ReviewKaart = ({ naam, foto, kleur, rating, tekst }: Kaart) => {
  const tekstRef = useRef<HTMLParagraphElement>(null);
  const [open, setOpen] = useState(false);
  const [afkapbaar, setAfkapbaar] = useState(false);

  // Meet in ingeklapte staat of de tekst wordt afgekapt (robuuster dan tellen
  // op tekenaantal). Hermeet bij resize, want de kaartbreedte bepaalt het.
  useLayoutEffect(() => {
    if (open) return;
    const meet = () => {
      const el = tekstRef.current;
      if (el) setAfkapbaar(el.scrollHeight > el.clientHeight + 1);
    };
    meet();
    window.addEventListener("resize", meet);
    return () => window.removeEventListener("resize", meet);
  }, [tekst, open]);

  return (
    <article className={REVIEW_KAART} style={{ boxShadow: "0 4px 24px hsl(var(--primary) / 0.2)" }}>
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
        <p ref={tekstRef} className={cn("min-h-[7.75rem]", !open && "line-clamp-5")}>
          {tekst}
        </p>
        {/* Vaste regel zodat kaarten zonder knop even hoog blijven. */}
        <div className="mt-1 min-h-[1.5rem]">
          {(afkapbaar || open) && (
            <button
              type="button"
              onClick={() => setOpen(!open)}
              aria-expanded={open}
              className="text-muted-foreground font-medium hover:underline underline-offset-2"
            >
              {open ? "Lees minder" : "Lees meer"}
            </button>
          )}
        </div>
      </blockquote>
    </article>
  );
};

// Zijpijl: wit met schaduw, zodat 'ie leesbaar blijft zowel op de navy
// achtergrond als waar 'ie over een witte kaart valt.
const NavKnop = ({
  richting,
  onClick,
  className,
}: {
  richting: "vorige" | "volgende";
  onClick: () => void;
  className?: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={richting === "vorige" ? "Vorige reviews" : "Volgende reviews"}
    className={cn(
      "inline-flex h-10 w-10 items-center justify-center rounded-full bg-card text-primary shadow-lg ring-1 ring-primary/10 transition-colors hover:bg-secondary",
      className,
    )}
  >
    {richting === "vorige" ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
  </button>
);

export const Reviews = () => {
  const { reviews, stats } = useGoogleReviews();
  const [api, setApi] = useState<CarouselApi>();

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

        {/* Oneindige, swipebare carrousel: mobiel 1 kaart, tablet 2, desktop 3.
            items-start zodat het uitklappen van één kaart de andere niet oprekt.
            Pijlen flankeren de kaarten (half in de container-marge → geen overflow).
            Navigatie werkt naast swipen; met loop is doorklikken oneindig. */}
        <div className="relative mt-8 md:mt-10">
          <Carousel setApi={setApi} opts={{ loop: true, align: "start" }}>
            <CarouselContent className="-ml-5 md:-ml-6 items-start">
              {kaarten.map((k) => (
                <CarouselItem
                  key={k.id}
                  className="pl-5 md:pl-6 basis-[85%] sm:basis-1/2 lg:basis-1/3"
                >
                  <ReviewKaart {...k} />
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>

          <NavKnop
            richting="vorige"
            onClick={() => api?.scrollPrev()}
            className="absolute left-0 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2"
          />
          <NavKnop
            richting="volgende"
            onClick={() => api?.scrollNext()}
            className="absolute right-0 top-1/2 z-10 translate-x-1/2 -translate-y-1/2"
          />
        </div>

        {/* Doorklik naar het volledige Google-profiel (indien geconfigureerd) */}
        {reviewsUrl && (
          <div className="mt-8 text-center">
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
