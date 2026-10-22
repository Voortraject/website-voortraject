import { useState } from "react";

import { Puntjes, ReviewKaart, ScorePil } from "@/components/sections/Reviews";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { useGoogleReviews } from "@/hooks/useGoogleReviews";
import { fallbackKaarten, naarKaarten, type Kaart } from "@/lib/reviews";

/**
 * Compacte variant van de reviewsectie, bedoeld voor een smalle kolom naast een
 * formulier. Eén citaat tegelijk in een horizontale carrousel die de bezoeker
 * zelf verschuift (geen autoplay meer: naast een formulier leidt beweging af).
 * De kaart zelf is letterlijk dezelfde als op de homepagina, inclusief "Lees
 * meer", zodat er nooit een halve regel wordt afgekapt.
 */
export const ReviewsCompact = () => {
  const { reviews } = useGoogleReviews();
  const [api, setApi] = useState<CarouselApi>();

  const live: Kaart[] | null = reviews ? naarKaarten(reviews) : null;
  const kaarten = live && live.length >= 2 ? live : fallbackKaarten;

  return (
    <section
      className="hs-donker hs-op-donker flex h-full flex-col rounded-[24px] p-5"
      aria-labelledby="reviews-kort"
    >
      <h3
        id="reviews-kort"
        className="font-['Inter_Tight',_'Inter',_sans-serif] text-[18px] font-bold tracking-[-0.01em] text-primary-foreground"
      >
        Wat bewoners zeggen
      </h3>

      <div className="mt-2.5">
        <ScorePil compact />
      </div>

      {/* duration 45: embla schuift standaard op 25, dat oogt naast een
          formulier als een schok. Hoger = trager, dus een rustige glijbeweging.
          De verticale padding binnen de carrousel geeft de schaduw ruimte. */}
      <Carousel setApi={setApi} opts={{ loop: true, duration: 45 }} className="mt-2">
        {/* -ml-4 + pl-4 zet ruimte tússen de kaarten, net als op de homepagina;
            tijdens het schuiven zie je dus een gootje in plaats van twee
            kaarten die tegen elkaar aan plakken. */}
        <CarouselContent className="-ml-4 items-start pt-1.5 pb-6 cursor-grab active:cursor-grabbing">
          {kaarten.map((k) => (
            <CarouselItem key={k.id} className="pl-4 basis-full">
              <ReviewKaart {...k} compact />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {/* mt-auto duwt de puntjes naar de onderkant van het donkere vlak als de
          kolom meerekt met het formulier. */}
      <Puntjes api={api} className="mt-auto gap-1" />
    </section>
  );
};

export default ReviewsCompact;
