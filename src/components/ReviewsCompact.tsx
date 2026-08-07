import { useEffect, useState } from "react";

import { GoogleG } from "@/components/GoogleG";
import { Sterren } from "@/components/Sterren";
import { ReviewKaart } from "@/components/sections/Reviews";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { useGoogleReviews } from "@/hooks/useGoogleReviews";
import { fallbackKaarten, GOOGLE_REVIEWS_URL, naarKaarten, type Kaart } from "@/lib/reviews";
import { cn } from "@/lib/utils";

/**
 * Compacte variant van de reviewsectie, bedoeld voor een smalle kolom naast een
 * formulier. Eén citaat tegelijk in een horizontale carrousel, sneller dan op de
 * homepagina (3s) omdat er maar één kaart in beeld staat. De kaart zelf is
 * letterlijk dezelfde als op de homepagina, inclusief "Lees meer", zodat er
 * nooit een halve regel wordt afgekapt.
 */
export const ReviewsCompact = () => {
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

  // Autoplay (3s): pauzeert bij hover/aanraken en respecteert
  // 'prefers-reduced-motion'.
  useEffect(() => {
    if (!api || gepauzeerd) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => api.scrollNext(), 3000);
    return () => window.clearInterval(id);
  }, [api, gepauzeerd]);

  const live: Kaart[] | null = reviews ? naarKaarten(reviews) : null;
  const kaarten = live && live.length >= 2 ? live : fallbackKaarten;

  const ratingTekst =
    stats?.rating != null
      ? stats.rating.toLocaleString("nl-NL", { minimumFractionDigits: 1, maximumFractionDigits: 1 })
      : "5,0";
  const aantal = stats?.user_rating_count ?? null;
  const ratingLabel =
    aantal != null ? `${ratingTekst} op Google · ${aantal} reviews` : `${ratingTekst} op Google`;

  return (
    <section className="flex h-full flex-col rounded-2xl bg-primary p-4" aria-labelledby="reviews-kort">
      <h3 id="reviews-kort" className="font-display text-[17px] font-semibold text-white">
        Wat bewoners zeggen
      </h3>

      <a
        href={GOOGLE_REVIEWS_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 inline-flex flex-wrap items-center gap-2 text-[14px] font-medium text-white/85 underline-offset-4 transition-colors hover:text-white hover:underline"
      >
        <Sterren waarde={stats?.rating ?? 5} />
        <span>{ratingLabel}</span>
        <GoogleG size={16} />
      </a>

      <div
        className="mt-3"
        onMouseEnter={() => setGepauzeerd(true)}
        onMouseLeave={() => setGepauzeerd(false)}
        onTouchStart={() => setGepauzeerd(true)}
      >
        <Carousel setApi={setApi} opts={{ loop: true }}>
          {/* -ml-4 + pl-4 zet ruimte tússen de kaarten, net als op de homepagina;
              tijdens het schuiven zie je dus een gootje in plaats van twee
              kaarten die tegen elkaar aan plakken. */}
          <CarouselContent className="-ml-4 items-start cursor-grab active:cursor-grabbing">
            {kaarten.map((k) => (
              <CarouselItem key={k.id} className="pl-4 basis-full">
                <ReviewKaart {...k} compact />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>

      {/* Puntjes-indicator: positie + aantal, klikbaar. mt-auto duwt ze naar de
          onderkant van het navy vlak als de kolom meerekt met het formulier. */}
      {snaps.length > 1 && (
        <div className="mt-auto flex items-center justify-center gap-2 pt-4">
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
    </section>
  );
};

export default ReviewsCompact;
