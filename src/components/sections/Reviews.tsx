import { useEffect, useLayoutEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";
import { Sterren } from "@/components/Sterren";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { GoogleG } from "@/components/GoogleG";
import { useGoogleReviews } from "@/hooks/useGoogleReviews";
import { useStaffel } from "@/lib/beweging";
import {
  fallbackKaarten,
  GOOGLE_REVIEWS_URL,
  initiaalVan,
  kleurVoor,
  naarKaarten,
  type Kaart,
} from "@/lib/reviews";
import "@/styles/home-onder.css";

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
        className="w-[42px] h-[42px] rounded-full object-cover shrink-0"
      />
    );
  }

  return (
    <span
      className="inline-flex w-[42px] h-[42px] shrink-0 items-center justify-center rounded-full text-white text-[17px] font-bold"
      // De Google-kleur van de letter-avatar is data (per naam), geen huisstijl.
      style={{ backgroundColor: kleur ?? kleurVoor(naam) }}
      aria-hidden="true"
    >
      {initiaalVan(naam)}
    </span>
  );
};

// Ingeklapte tekst reserveert een vaste hoogte (4 regels, compact 3) → alle
// kaarten even hoog. "Lees meer" verschijnt alleen als de tekst daadwerkelijk
// wordt afgekapt. `compact` is voor de smalle kolom naast het contactformulier:
// zelfde kaart, iets minder hoog.
//
// Witte kaart zonder rand met een diepe schaduw (ho-review): op het donkere vlak
// is dat genoeg om hem los te zetten.
export const ReviewKaart = ({
  naam,
  foto,
  kleur,
  rating,
  tekst,
  compact = false,
}: Kaart & { compact?: boolean }) => {
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
    <article className={compact ? "ho-review relative flex h-full flex-col p-5" : "ho-review relative flex h-full flex-col p-[22px]"}>
      {/* Google-logo in de hoek van de tegel */}
      <span className="absolute top-5 right-5">
        <GoogleG />
      </span>

      {/* Kop: profielfoto + naam */}
      <div className="flex items-center gap-3 min-w-0 pr-8">
        <Avatar naam={naam} foto={foto} kleur={kleur} />
        <span className="text-[15px] font-extrabold text-primary truncate">{naam}</span>
      </div>

      <div className="mt-3">
        <Sterren waarde={rating} />
      </div>

      {/* Bewust géén cn() met een losse text-[..]-klasse erachter: tailwind-merge
          ziet `text-[15px]` en `leading-[1.65]` als één groep (de
          `text-[size]/[leading]`-syntax) en gooit de regelafstand dan weg. Zonder
          die leading past er een halve vijfde regel onder de clamp. Daarom
          staan beide varianten hier voluit. */}
      <blockquote
        className={
          compact
            ? "mt-3 text-[14px] leading-[1.65] text-foreground"
            : "mt-3 text-[15px] leading-[1.65] text-foreground"
        }
      >
        <p
          ref={tekstRef}
          className={cn(
            compact ? "min-h-[4.4rem]" : "min-h-[6.25rem]",
            !open && (compact ? "line-clamp-3" : "line-clamp-4"),
          )}
        >
          {tekst}
        </p>
        {/* Vaste regel zodat kaarten zonder knop even hoog blijven. */}
        <div className="mt-1.5 min-h-[1.5rem]">
          {(afkapbaar || open) && (
            <button
              type="button"
              onClick={() => setOpen(!open)}
              aria-expanded={open}
              className="cursor-pointer rounded-sm text-[14px] font-extrabold text-primary underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              {open ? "Lees minder" : "Lees meer"}
            </button>
          )}
        </div>
      </blockquote>
    </article>
  );
};

/**
 * De score bovenaan, als glazen pil op het donkere vlak. Klikbaar naar Google.
 * Compact (naast het contactformulier) mag hij op een smalle telefoon over twee
 * regels lopen; daarom daar een radius van 18px in plaats van een volle pil, die
 * er bij twee regels als een ei uit zou zien. Op één regel is het verschil niet
 * te zien.
 */
export const ScorePil = ({ compact = false }: { compact?: boolean }) => {
  const { stats } = useGoogleReviews();
  const ratingTekst =
    stats?.rating != null
      ? stats.rating.toLocaleString("nl-NL", { minimumFractionDigits: 1, maximumFractionDigits: 1 })
      : "5,0";
  const aantal = stats?.user_rating_count ?? null;
  const ratingLabel =
    aantal != null ? `${ratingTekst} op Google · ${aantal} reviews` : `${ratingTekst} op Google`;

  return (
    <a
      href={GOOGLE_REVIEWS_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={
        compact
          ? "hs-glas-pil inline-flex max-w-full flex-wrap items-center gap-x-2 gap-y-1 rounded-[18px] py-[6px] pl-3 pr-3.5 text-[13.5px] font-bold text-primary-foreground underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          : "hs-glas-pil inline-flex items-center gap-2.5 rounded-full py-[7px] pl-3 pr-3.5 text-[15px] font-bold text-primary-foreground underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      }
    >
      <Sterren waarde={stats?.rating ?? 5} size={compact ? 14 : 16} />
      <span>{ratingLabel}</span>
      {compact && <GoogleG size={16} />}
    </a>
  );
};

/**
 * Volgt de positie van de carrousel en geeft klikbare puntjes. Geen autoplay:
 * de bezoeker schuift zelf (huisstijl oktober 2026, geen bewegende carrousels).
 * Het puntje zelf is klein, het raakvlak eromheen 24x24.
 */
export const Puntjes = ({ api, className }: { api: CarouselApi | undefined; className?: string }) => {
  const [selected, setSelected] = useState(0);
  const [snaps, setSnaps] = useState<number[]>([]);

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

  if (snaps.length <= 1) return null;

  return (
    <div className={cn("flex items-center justify-center", className)}>
      {snaps.map((_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => api?.scrollTo(i)}
          aria-label={`Ga naar review ${i + 1}`}
          aria-current={i === selected}
          className="group inline-flex h-6 min-w-6 cursor-pointer items-center justify-center rounded-full px-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
        >
          <span
            aria-hidden="true"
            className={cn(
              "block h-2 rounded-full transition-[width,background-color] duration-300 motion-reduce:transition-none",
              i === selected ? "w-6 bg-primary-foreground" : "w-2 bg-primary-foreground/40 group-hover:bg-primary-foreground/60",
            )}
          />
        </button>
      ))}
    </div>
  );
};

export const Reviews = () => {
  const { reviews } = useGoogleReviews();
  const [api, setApi] = useState<CarouselApi>();
  const sectie = useRef<HTMLElement>(null);
  useStaffel(sectie);

  // Live Google-reviews indien beschikbaar (>= 2 met tekst), anders de fallback.
  const live: Kaart[] | null = reviews ? naarKaarten(reviews) : null;
  const kaarten = live && live.length >= 2 ? live : fallbackKaarten;

  return (
    <section
      ref={sectie}
      className="hs-donker hs-op-donker py-[52px] md:py-[88px]"
      aria-labelledby="reviews-title"
    >
      <div className="container-home">
        <div className="text-center">
          <h2 id="reviews-title" className="hs-h2 text-primary-foreground" data-veer>
            Wat bewoners <span className="hs-accent">zeggen</span>
          </h2>
          {/* Klikbaar naar het volledige Google-profiel; toont het gemiddelde
              én het aantal reviews. */}
          <div className="mt-4 flex justify-center" data-veer>
            <ScorePil />
          </div>
        </div>

        {/* Swipebare carrousel: telefoon 1 kaart, tablet 2, desktop 3, met een
            stukje van de buren in beeld. Loopt tot de schermrand (-mx) zodat het
            randje van de volgende kaart zichtbaar is; op desktop vervagen de
            randen zacht (ho-reviews-rand). items-start zodat het uitklappen van
            één kaart de andere niet oprekt. De verticale padding binnen de
            carrousel geeft de schaduw van de kaarten ruimte. */}
        <Carousel
          setApi={setApi}
          opts={{ loop: true, align: "center" }}
          className="ho-reviews-rand -mx-6 mt-5 md:-mx-12 md:mt-7"
        >
          <CarouselContent className="-ml-4 items-start pt-1.5 pb-8 cursor-grab active:cursor-grabbing md:-ml-6">
            {kaarten.map((k) => (
              <CarouselItem
                key={k.id}
                className="pl-4 md:pl-6 basis-[84%] sm:basis-[46%] lg:basis-[30%]"
              >
                <ReviewKaart {...k} />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        <Puntjes api={api} className="-mt-3 gap-1" />
      </div>
    </section>
  );
};
