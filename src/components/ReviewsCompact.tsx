import { GoogleG } from "@/components/GoogleG";
import { Sterren } from "@/components/Sterren";
import { useGoogleReviews } from "@/hooks/useGoogleReviews";
import { fallbackKaarten, initiaalVan, kleurVoor, naarKaarten, type Kaart } from "@/lib/reviews";

/**
 * Compacte variant van de reviewsectie, bedoeld voor een smalle kolom naast een
 * formulier. Geen carrousel: twee vaste citaten, zodat er niets beweegt naast
 * invoervelden en de kaart op desktop meteen in beeld staat. Data en fallback
 * komen uit dezelfde bron als de grote sectie op de homepagina.
 */
export const ReviewsCompact = ({ aantalCitaten = 2 }: { aantalCitaten?: number }) => {
  const { reviews, stats } = useGoogleReviews();

  const live: Kaart[] | null = reviews ? naarKaarten(reviews) : null;
  const kaarten = (live && live.length >= 2 ? live : fallbackKaarten).slice(0, aantalCitaten);

  const ratingTekst =
    stats?.rating != null
      ? stats.rating.toLocaleString("nl-NL", { minimumFractionDigits: 1, maximumFractionDigits: 1 })
      : "5,0";
  const aantal = stats?.user_rating_count ?? null;
  const ratingLabel =
    aantal != null ? `${ratingTekst} op Google · ${aantal} reviews` : `${ratingTekst} op Google`;

  const reviewsUrl = import.meta.env.VITE_GOOGLE_REVIEWS_URL as string | undefined;

  const beoordeling = (
    <>
      <Sterren waarde={stats?.rating ?? 5} />
      <span>{ratingLabel}</span>
      <GoogleG size={16} />
    </>
  );

  return (
    <section className="rounded-xl border border-border bg-card p-5" aria-labelledby="reviews-kort">
      <h3 id="reviews-kort" className="font-display text-[17px] font-semibold text-primary">
        Wat bewoners zeggen
      </h3>

      {reviewsUrl ? (
        <a
          href={reviewsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex flex-wrap items-center gap-2 text-[14px] font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
        >
          {beoordeling}
        </a>
      ) : (
        <p className="mt-2 inline-flex flex-wrap items-center gap-2 text-[14px] font-medium text-muted-foreground">
          {beoordeling}
        </p>
      )}

      <ul className="mt-4 flex flex-col gap-4">
        {kaarten.map((k) => (
          <li key={k.id} className="border-t border-border pt-4 first:border-t-0 first:pt-0">
            <div className="flex items-center gap-3">
              {k.foto ? (
                <img
                  src={k.foto}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  referrerPolicy="no-referrer"
                  className="h-9 w-9 shrink-0 rounded-full object-cover"
                />
              ) : (
                <span
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[15px] font-medium text-white"
                  style={{ backgroundColor: k.kleur ?? kleurVoor(k.naam) }}
                  aria-hidden="true"
                >
                  {initiaalVan(k.naam)}
                </span>
              )}
              <div className="min-w-0">
                <p className="truncate text-[14px] font-semibold text-primary">{k.naam}</p>
                <Sterren waarde={k.rating} size={13} />
              </div>
            </div>
            <p className="mt-2 line-clamp-4 text-[14px] leading-relaxed text-foreground">
              {k.tekst}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default ReviewsCompact;
