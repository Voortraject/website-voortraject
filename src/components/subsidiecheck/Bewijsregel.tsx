import { Sterren } from "@/components/Sterren";
import { useGoogleReviews } from "@/hooks/useGoogleReviews";
import { GOOGLE_REVIEWS_URL } from "@/lib/reviews";

interface BewijsregelProps {
  /** Extra opmaak (marges) van de aanroeper. */
  className?: string;
}

// Eén rustige regel met onze échte Google-beoordeling, bedoeld voor de twee
// momenten waarop we iets vragen: de gegevens-poort en het vraagblok op het
// resultaat. Sociale bewijskracht werkt het sterkst op het moment van twijfel
// (Cialdini), en dat is precies daar.
//
// De cijfers komen live uit de gesynchroniseerde Google-data (`sync-google-reviews`),
// dus ze zijn altijd actueel en niemand hoeft ze bij te werken. Zijn ze er niet,
// dan toont dit component niets. Liever geen bewijs dan een verzonnen cijfer.
export const Bewijsregel = ({ className = "" }: BewijsregelProps) => {
  const { stats } = useGoogleReviews();
  if (stats?.rating == null) return null;

  const score = stats.rating.toLocaleString("nl-NL", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const aantal = stats.user_rating_count;

  return (
    <a
      href={GOOGLE_REVIEWS_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex flex-wrap items-center gap-x-2 gap-y-1 rounded-sm text-[13px] text-muted-foreground transition-opacity hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${className}`}
    >
      <Sterren waarde={stats.rating} size={14} />
      <span>
        <span className="font-semibold text-foreground">{score}</span> op Google
        {aantal != null ? ` · ${aantal} ${aantal === 1 ? "review" : "reviews"}` : ""}
      </span>
    </a>
  );
};
