import { useEffect, useMemo, useRef, useState } from "react";

// De zichtbare zoekstap van de subsidiecheck: landelijk, dan provinciaal, dan
// gemeentelijk. Buell & Norton (Harvard, 2011) laten zien dat zichtbaar werk de
// gewaardeerde waarde van een uitkomst verhoogt, zelfs als het wachten daardoor
// langer duurt. De stappen zijn bovendien waar: de bron zoekt echt op die drie
// niveaus.
//
// De sequentie draait vóór de gegevensvraag (de poort), niet erna. Achter de
// vraag bouwt zichtbaar werk geen waarde meer op; het laat iemand wachten die
// al betaald heeft, op een antwoord dat dan al in de cache staat.

// Duur per zoekstap: 1s x 3 = 3s totaal. De laatste stap wacht bovendien op de
// echte fetch, dus bij een tragere bron duurt het vanzelf iets langer.
export const STAP_MS = 1000;

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

// Waar het blaadje op het wachtscherm heen vult, en hoe snel. De vulling volgt
// de echte stappen: 1/3 en 2/3 na de eerste twee zoekstappen, en pas 100% als
// de bron echt geantwoord heeft. Zolang dat niet zo is kruipt hij langzaam naar
// 92%, maar komt daar in de praktijk niet: een balk die vol staat terwijl er nog
// niets binnen is, of op 99% blijft hangen, kost juist vertrouwen.
export const WACHT_PLAFOND = 0.92;

export const doelVulling = (fase: number, klaar: boolean): { doel: number; duurMs: number } => {
  if (klaar && fase >= 2) return { doel: 1, duurMs: STAP_MS * 0.8 };
  if (fase === 0) return { doel: 1 / 3, duurMs: STAP_MS };
  if (fase === 1) return { doel: 2 / 3, duurMs: STAP_MS };
  return { doel: WACHT_PLAFOND, duurMs: STAP_MS * 8 };
};

/**
 * Laat een getal in `duurMs` (ease-out) naar `doel` lopen, vanaf waar het nu
 * staat. Eén waarde voor zowel het blaadje als het percentage, zodat die twee
 * nooit uit de pas lopen. Bij prefers-reduced-motion springt hij meteen.
 */
export const useVloeiend = (doel: number, duurMs: number) => {
  const reduced = useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );
  const [waarde, setWaarde] = useState(0);
  const huidig = useRef(0);

  useEffect(() => {
    if (reduced) {
      huidig.current = doel;
      setWaarde(doel);
      return;
    }
    const van = huidig.current;
    const start = performance.now();
    let frame = 0;
    const stap = (nu: number) => {
      const t = Math.min(1, (nu - start) / duurMs);
      const v = van + (doel - van) * (1 - Math.pow(1 - t, 3));
      huidig.current = v;
      setWaarde(v);
      if (t < 1) frame = requestAnimationFrame(stap);
    };
    frame = requestAnimationFrame(stap);
    return () => cancelAnimationFrame(frame);
  }, [doel, duurMs, reduced]);

  return waarde;
};
