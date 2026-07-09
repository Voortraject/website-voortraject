import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Star } from "lucide-react";

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

// Ingeklapte tekst reserveert deze hoogte (4 regels) → alle kaarten even hoog.
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
        <p ref={tekstRef} className={cn("min-h-[6.25rem]", !open && "line-clamp-4")}>
          {tekst}
        </p>
        {/* Vaste regel zodat kaarten zonder knop even hoog blijven. */}
        <div className="mt-1 min-h-[1.5rem]">
          {(afkapbaar || open) && (
            <button
              type="button"
              onClick={() => setOpen(!open)}
              aria-expanded={open}
              className="cursor-pointer text-muted-foreground font-medium hover:underline underline-offset-2"
            >
              {open ? "Lees minder" : "Lees meer"}
            </button>
          )}
        </div>
      </blockquote>
    </article>
  );
};

export const Reviews = () => {
  const { reviews, stats } = useGoogleReviews();
  const [api, setApi] = useState<CarouselApi>();
  const [selected, setSelected] = useState(0);
  const [snaps, setSnaps] = useState<number[]>([]);
  const [gepauzeerd, setGepauzeerd] = useState(false);

  // Dots: volg de huidige positie en het aantal snaps.
  useEffect(() => {
    if (!api) return;
    const onSelect = () => setSelected(api.selectedScrollSnap());
    const onReInit = () => {
      setSnaps(api.scrollSnapList());
      onSelect();
    };
    onReInit();
    api.on("select", onSelect);
    api.on("reInit", onReInit);
    return () => {
      api.off("select", onSelect);
      api.off("reInit", onReInit);
    };
  }, [api]);

  // Zachte autoplay (6s): pauzeert bij hover/aanraken en respecteert
  // 'prefers-reduced-motion'.
  useEffect(() => {
    if (!api || gepauzeerd) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => api.scrollNext(), 6000);
    return () => window.clearInterval(id);
  }, [api, gepauzeerd]);

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
  const aantal = stats?.user_rating_count ?? null;
  const ratingLabel =
    aantal != null ? `${ratingTekst} op Google · ${aantal} reviews` : `${ratingTekst} op Google`;

  const reviewsUrl = import.meta.env.VITE_GOOGLE_REVIEWS_URL as string | undefined;

  return (
    <section className="section-pad-home bg-primary" aria-labelledby="reviews-title">
      <div className="container-home">
        <div className="text-center">
          <h2 id="reviews-title" className="h2-section !text-white">
            Wat bewoners <span className="text-accent">zeggen</span>
          </h2>
          {/* Klikbaar naar het volledige Google-profiel (indien geconfigureerd);
              toont het gemiddelde én het aantal reviews. */}
          {reviewsUrl ? (
            <a
              href={reviewsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2.5 text-[16px] font-medium text-white/85 transition-colors hover:text-white"
            >
              <Sterren />
              <span className="underline-offset-4 hover:underline">{ratingLabel}</span>
            </a>
          ) : (
            <p className="mt-4 inline-flex items-center gap-2.5 text-[16px] font-medium text-white/85">
              <Sterren />
              <span>{ratingLabel}</span>
            </p>
          )}
        </div>

        {/* Oneindige, swipebare carrousel: mobiel 1 kaart, tablet 2, desktop 3.
            items-start zodat het uitklappen van één kaart de andere niet oprekt.
            De sm:px-16 geeft de pijlen een eigen baan náást de kaarten (geen
            overlap, geen overflow). Op mobiel: pijlen verborgen, puur swipen —
            het stukje van de volgende kaart signaleert dat al. Met loop is
            doorklikken oneindig. */}
        <div
          className="relative mt-8 md:mt-10"
          onMouseEnter={() => setGepauzeerd(true)}
          onMouseLeave={() => setGepauzeerd(false)}
          onTouchStart={() => setGepauzeerd(true)}
        >
          <Carousel setApi={setApi} opts={{ loop: true, align: "center" }}>
            {/* align center + basis onder 1/3 → aan beide zijden gluurt een kaart
                mee (symmetrisch). cursor-grab biedt slepen aan. */}
            <CarouselContent className="-ml-5 md:-ml-6 items-start cursor-grab active:cursor-grabbing">
              {kaarten.map((k) => (
                <CarouselItem
                  key={k.id}
                  className="pl-5 md:pl-6 basis-[85%] sm:basis-[46%] lg:basis-[30%]"
                >
                  <ReviewKaart {...k} />
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>

          {/* Navy fade aan beide zijden: kaarten verschijnen/verdwijnen achter de
              gradient (van de content-rand naar binnen). pointer-events-none zodat
              swipen eronderdoor blijft werken; de pijlen staan er met z-20 boven. */}
          <div className="pointer-events-none absolute inset-y-0 -left-4 z-10 w-12 bg-gradient-to-r from-primary to-transparent sm:w-16 lg:w-20" />
          <div className="pointer-events-none absolute inset-y-0 -right-4 z-10 w-12 bg-gradient-to-l from-primary to-transparent sm:w-16 lg:w-20" />
        </div>

        {/* Puntjes-indicator: positie + aantal, klikbaar. */}
        {snaps.length > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            {snaps.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => api?.scrollTo(i)}
                aria-label={`Ga naar review ${i + 1}`}
                aria-current={i === selected}
                className={cn(
                  "h-2 cursor-pointer rounded-full transition-all",
                  i === selected ? "w-6 bg-white" : "w-2 bg-white/40 hover:bg-white/60",
                )}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
