import { Star } from "lucide-react";

import { CIJFER_GOOGLE, CIJFER_ISOLATIE, CIJFER_VERDUURZAMING } from "@/config/cijfers";
import { useGoogleReviews } from "@/hooks/useGoogleReviews";

/**
 * "Voortraject in cijfers": een smalle band met drie getallen.
 *
 * Staat op de homepage tussen "Waarom bewoners voor ons kiezen" en de
 * reviews, en op /over-ons vlak voor de slot-CTA. Dat is het moment waarop
 * de bezoeker de belofte heeft gelezen en zich afvraagt of hier een
 * serieuze partij achter zit: eerst de argumenten, dan de cijfers, dan de
 * stemmen van bewoners.
 *
 * De getallen zelf staan in src/config/cijfers.ts, met bron en
 * verificatiedatum erbij. Hier staat alleen hoe ze eruitzien.
 */

type CijferProps = {
  getal: string;
  achtervoegsel?: string;
  ster?: boolean;
  onderschrift: string;
};

const Cijfer = ({ getal, achtervoegsel, ster, onderschrift }: CijferProps) => (
  <div className="text-center">
    <p
      className="font-display font-bold text-primary leading-none tracking-[-0.03em]"
      style={{ fontSize: "clamp(2rem, 6vw, 3.5rem)" }}
    >
      {getal}
      {achtervoegsel && (
        <span className="text-accent" aria-hidden="true">
          {achtervoegsel}
        </span>
      )}
      {ster && (
        <Star
          size="0.7em"
          className="ml-1.5 inline-block align-baseline text-accent fill-accent"
          aria-hidden="true"
        />
      )}
    </p>
    <p className="mx-auto mt-3 max-w-[22rem] text-[14px] md:text-[15px] leading-[1.5] text-muted-foreground">
      {onderschrift}
    </p>
  </div>
);

export const Cijfers = () => {
  const { stats } = useGoogleReviews();

  // Live uit google_place_stats; lukt die query niet, dan de waarde uit de
  // config. Zo staat er nooit een leeg vak en veroudert het cijfer niet.
  const rating = stats?.rating ?? CIJFER_GOOGLE.terugval;
  const ratingTekst = rating.toLocaleString("nl-NL", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

  return (
    // Bewust compacter dan .section-pad-home: dit is een band tussen twee
    // secties, geen sectie op zichzelf. De witte grond zet hem af tegen het zand
    // erboven en het navy eronder, zoals de rest van de pagina het ook doet; de
    // site gebruikt nergens randen om secties te scheiden.
    <section
      className="py-[44px] md:py-[64px]"
      style={{ backgroundColor: "#FFFFFF" }}
      aria-labelledby="cijfers-title"
    >
      <div className="container-home">
        <h2 id="cijfers-title" className="sr-only">
          Voortraject in cijfers
        </h2>

        {/* Mobiel netjes onder elkaar: de onderschriften zijn te lang voor een
            halve telefoonbreedte. Vanaf sm staan ze alle drie naast elkaar. */}
        <div className="grid grid-cols-1 gap-y-9 sm:grid-cols-3 sm:gap-x-8 md:gap-x-10">
          <Cijfer {...CIJFER_ISOLATIE} />
          <Cijfer {...CIJFER_VERDUURZAMING} />
          <Cijfer getal={ratingTekst} ster onderschrift={CIJFER_GOOGLE.onderschrift} />
        </div>
      </div>
    </section>
  );
};

export default Cijfers;
