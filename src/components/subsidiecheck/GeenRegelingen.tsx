import { useSearchParams } from "react-router-dom";
import { ArrowRight, Loader2 } from "lucide-react";

import { useSubsidieCheck } from "@/hooks/useSubsidieCheck";
import { ALLE_MAATREGELEN, MAATREGEL_LABELS, type SubsidieCheckInput } from "@/lib/subsidies";

interface GeenRegelingenProps {
  input: SubsidieCheckInput;
}

// Het lege resultaat. Dit is een echt bereikbaar scherm, geen theoretisch geval:
// wie in de interesses alléén "Thuisbatterij" aanvinkt krijgt voor elk adres nul
// regelingen terug, terwijl er op datzelfde adres met alle maatregelen twaalf
// zijn (geverifieerd tegen de bron voor 7811AB). Vroeger eindigde de bezoeker
// dan op een doodlopend scherm met alleen de mededeling dat er niets was.
//
// De uitweg staat of valt met het getal: "zoek breder" is een vraag om nog eens
// te proberen, "er zijn er 12 voor jouw adres" is een reden. Daarom halen we de
// verbrede uitkomst hier echt op. Dat kost alleen een extra aanvraag in dít
// scherm, want dit component mount uitsluitend bij nul resultaten; de hook mag
// daarom niet naar StapResultaat verhuizen.
export const GeenRegelingen = ({ input }: GeenRegelingenProps) => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Heeft de bezoeker zelf gefilterd? Subsidiecheck.tsx zet `maatregelen` op alle
  // acht zodra er niets gekozen is, dus een kortere lijst betekent: hij koos.
  const gefilterd = input.maatregelen.length < ALLE_MAATREGELEN.length;
  const verbreed = useSubsidieCheck(gefilterd ? { ...input, maatregelen: [...ALLE_MAATREGELEN] } : null);
  const aantalBreed = verbreed.data?.length ?? 0;

  const gekozenLabels = input.maatregelen.map((m) => MAATREGEL_LABELS[m]);
  const gekozenTekst =
    gekozenLabels.length === 1
      ? gekozenLabels[0]
      : `${gekozenLabels.slice(0, -1).join(", ")} en ${gekozenLabels[gekozenLabels.length - 1]}`;

  const toonAlles = () => {
    // Bewust (nog) geen eigen GTM-event voor het verbreden. De container-test
    // (src/test/gtmContainer.test.ts) eist voor elk gepusht event een trigger én
    // een tag in docs/gtm/, en die container wordt op dit moment elders herzien.
    // Zodra dat werk klaar is hoort hier `subsidiecheck_verbreed` bij, met
    // `aantal_regelingen` en het aantal maatregelen waarvandaan verbreed werd:
    // dat meet hoe vaak dit doodlopende eind wordt geraakt én gered.
    //
    // Geen m-parameter = alle maatregelen; de rest van de check-state (adres,
    // situatie) blijft staan, dus dit is één klik en geen nieuwe invulronde.
    const volgende = new URLSearchParams(searchParams);
    volgende.delete("m");
    setSearchParams(volgende);
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-6 text-center md:p-8">
      {gefilterd ? (
        <>
          <h3 className="font-display text-[18px] font-semibold text-primary">
            Voor {gekozenTekst} vonden we niets op dit adres
          </h3>
          {verbreed.isPending ? (
            <p
              className="mt-3 flex items-center justify-center gap-2 text-[15px] text-muted-foreground"
              aria-live="polite"
            >
              <Loader2 size={16} className="animate-spin" aria-hidden="true" />
              We kijken of er breder wél iets is…
            </p>
          ) : aantalBreed > 0 ? (
            <>
              <p className="mx-auto mt-2 max-w-md text-[15px] leading-relaxed text-foreground/80">
                Je zocht op één onderwerp. Kijken we naar alle maatregelen, dan zijn er wél{" "}
                <strong className="font-semibold text-foreground">{aantalBreed}</strong>{" "}
                {aantalBreed === 1 ? "regeling" : "regelingen"} voor jouw woning.
              </p>
              <button
                type="button"
                onClick={toonAlles}
                className="mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-accent px-7 py-3 text-[15px] font-semibold text-primary transition-colors hover:bg-accent-hover min-h-[48px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                Toon alle {aantalBreed} {aantalBreed === 1 ? "regeling" : "regelingen"}
                <ArrowRight size={16} strokeWidth={2} aria-hidden="true" />
              </button>
            </>
          ) : (
            // Ook breder niets: dan is "zoek breder" een loze knop.
            <p className="mx-auto mt-2 max-w-md text-[15px] leading-relaxed text-foreground/80">
              Ook voor de andere maatregelen vonden we niets op dit adres. Regelingen veranderen vaak en soms zit er
              meer in dan een eerste check laat zien. Wil je dat wij even meekijken? Dat kost je niets.
            </p>
          )}
        </>
      ) : (
        <>
          <h3 className="font-display text-[18px] font-semibold text-primary">
            Voor deze combinatie vonden we geen regelingen
          </h3>
          <p className="mx-auto mt-2 max-w-md text-[15px] leading-relaxed text-foreground/80">
            Regelingen veranderen vaak en soms zit er meer in dan een eerste check laat zien. Wil je dat wij even
            meekijken? Dat kost je niets.
          </p>
        </>
      )}
    </div>
  );
};
