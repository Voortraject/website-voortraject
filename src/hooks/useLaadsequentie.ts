import { useEffect, useMemo, useState } from "react";

// De zichtbare zoekstap van de subsidiecheck: landelijk, dan provinciaal, dan
// gemeentelijk. Buell & Norton (Harvard, 2011) laten zien dat zichtbaar werk de
// gewaardeerde waarde van een uitkomst verhoogt, zelfs als het wachten daardoor
// langer duurt. De stappen zijn bovendien waar: de bron zoekt echt op die drie
// niveaus.
//
// De sequentie draait vóór de gegevensvraag (de poort), niet erna. Achter de
// vraag bouwt zichtbaar werk geen waarde meer op; het laat iemand wachten die
// al betaald heeft, op een antwoord dat dan al in de cache staat.

// Duur per zoekstap. Bewust ruim (~1,13s x 3 ≈ 3,4s totaal); de laatste stap
// wacht bovendien op de echte fetch, dus bij een tragere bron duurt het vanzelf
// iets langer.
const STAP_MS = 1133;

/**
 * Fase 0..3 van de zoeksequentie. 3 = klaar. Bij prefers-reduced-motion begint
 * hij meteen op 3, dan is er geen sequentie.
 *
 * @param klaar de echte fetch is binnen (of gefaald); pas dan mag de laatste
 *   stap doortikken.
 * @param overslaan sla de sequentie helemaal over (bv. na een bronfout, of als
 *   hij al eerder in de flow gedraaid heeft).
 */
export const useLaadsequentie = (klaar: boolean, overslaan = false) => {
  const reduced = useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );
  const [fase, setFase] = useState(reduced ? 3 : 0);

  useEffect(() => {
    if (reduced || overslaan) return;
    if (fase >= 3) return;
    // De laatste stap wacht op de echte fetch; de eerste twee tikken door.
    if (fase === 2 && !klaar) return;
    const t = setTimeout(() => setFase((f) => f + 1), STAP_MS);
    return () => clearTimeout(t);
  }, [fase, klaar, reduced, overslaan]);

  return overslaan ? 3 : fase;
};
