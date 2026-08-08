import { GoogleG } from "@/components/GoogleG";
import { Sterren } from "@/components/Sterren";
import { useGoogleReviews } from "@/hooks/useGoogleReviews";
import { GOOGLE_REVIEWS_URL } from "@/lib/reviews";

interface BewijsregelProps {
  /** Extra opmaak (marges) van de aanroeper. */
  className?: string;
  /**
   * Klikbaar naar ons Google-profiel. Standaard aan, maar bewust uit te zetten
   * op een beslismoment: een link met `target="_blank"` vlak bij een
   * verzendknop is een uitgang precies waar we er geen willen. Baymard ziet dat
   * mechanisme bij het kortingscodeveld in checkouts, waar deelnemers de site
   * verlaten en vaak niet terugkomen. Het bewijs zelf mag blijven staan, de
   * uitweg niet.
   */
  alsLink?: boolean;
}

// Eén rustige regel met onze échte Google-beoordeling, bedoeld voor de twee
// momenten waarop we iets vragen: de gegevens-poort en het vraagblok op het
// resultaat. Sociale bewijskracht werkt het sterkst op het moment van twijfel
// (Cialdini), en dat is precies daar.
//
// De cijfers komen live uit de gesynchroniseerde Google-data (`sync-google-reviews`),
// dus ze zijn altijd actueel en niemand hoeft ze bij te werken. Zijn ze er niet,
// dan toont dit component niets. Liever geen bewijs dan een verzonnen cijfer.
export const Bewijsregel = ({ className = "", alsLink = true }: BewijsregelProps) => {
  const { stats } = useGoogleReviews();
  if (stats?.rating == null) return null;

  const score = stats.rating.toLocaleString("nl-NL", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const aantal = stats.user_rating_count;
  const omschrijving = `${score} van 5 op Google${aantal != null ? `, ${aantal} reviews` : ""}`;

  const inhoud = (
    <>
      <Sterren waarde={stats.rating} size={14} />
      <span className="font-semibold text-foreground">{score}</span>
      {/* Zelfde Google-logo als in de hero, zodat de bron herkenbaar is zonder
          het woord "Google" erbij. */}
      <GoogleG size={15} />
      {aantal != null && <span>{aantal} reviews</span>}
    </>
  );

  const basis = `inline-flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-muted-foreground ${className}`;

  if (!alsLink) {
    return (
      <span className={basis} aria-label={omschrijving} role="img">
        {inhoud}
      </span>
    );
  }

  return (
    <a
      href={GOOGLE_REVIEWS_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Bekijk onze beoordelingen op Google (${omschrijving})`}
      className={`${basis} rounded-sm transition-opacity hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`}
    >
      {inhoud}
    </a>
  );
};
