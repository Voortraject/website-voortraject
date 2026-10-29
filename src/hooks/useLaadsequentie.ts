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

// Hoe het blaadje op het wachtscherm vol loopt. Eén doorlopende curve, geen
// trappetjes meer bij 1/3 en 2/3: elke stilstand leest als "hapert het?".
//
// De vorm komt uit Harrison, Amento, Kuznetsov & Bell, "Rethinking the progress
// bar" (UIST 2007). Bij gelijke duur voelden alleen balken die naar het eind toe
// versnellen sneller dan een rechte lijn; balken die vertragen of stilvallen
// vlak voor het einde voelden het traagst. Dat is de piek-eindregel (Kahneman,
// Fredrickson): het einde weegt het zwaarst in hoe het wachten wordt onthouden.
// Een ease-out (snel naar 80%, langzaam de rest) doet dus precies het
// verkeerde, ook al is hij gangbaar.
//
// Daarom:
//  - vanaf 0 met een rustige maar zichtbare snelheid, die gelijkmatig oploopt
//    tot drie keer zo snel aan het eind (PLAN_MS, net vóór fase 3);
//  - is de bron er niet op tijd, dan gaat het blad vanaf 80% kruipen richting
//    92%, zonder ooit stil te staan, maar ook nooit vol: een volle balk terwijl
//    er nog niets binnen is kost vertrouwen;
//  - zodra de bron antwoordt, een korte versnellende sprint naar 100%.
// Een vroeg antwoord laat de curve niet vooruitspringen: de zoekstappen
// blijven zichtbaar (zie useLaadsequentie).
export const PLAN_MS = STAP_MS * 2.8;
export const WACHT_PLAFOND = 0.92;
const KRUIP_VANAF = 0.8;
export const SPRINT_MS = 600;

// Versnellend van 0 naar 1: snelheid loopt op van 0,5 naar 1,5.
const versnel = (s: number) => 0.5 * s + 0.5 * s * s;
const binnen = (x: number) => Math.min(1, Math.max(0, x));

// Moment (ms) waarop het plan 80% haalt; vanaf daar kruipt hij als de bron er nog niet is.
const KRUIP_MS = PLAN_MS * (-0.5 + Math.sqrt(0.25 + 2 * KRUIP_VANAF));
// Snelheid van het plan op dat moment, zodat het kruipen zonder knik aansluit.
const KRUIP_SNELHEID = (0.5 + KRUIP_MS / PLAN_MS) / PLAN_MS;

const onderweg = (ms: number) => {
  if (ms <= KRUIP_MS) return versnel(binnen(ms / PLAN_MS));
  // Harmonisch naar het plafond: begint met de snelheid van het plan en
  // vertraagt geleidelijk, zonder het plafond ooit te halen.
  const ruimte = WACHT_PLAFOND - KRUIP_VANAF;
  const k = KRUIP_SNELHEID / ruimte;
  return WACHT_PLAFOND - ruimte / (1 + k * (ms - KRUIP_MS));
};

/**
 * De vulling (0..1) na `ms` sinds het wachtscherm verscheen.
 *
 * @param klaarOp moment (ms) waarop de bron antwoordde, of null zolang niet.
 */
export const vullingOp = (ms: number, klaarOp: number | null): number => {
  if (klaarOp === null) return onderweg(ms);
  // Op tijd: het plan loopt gewoon door en eindigt versnellend op 100%.
  if (klaarOp <= KRUIP_MS) return versnel(binnen(ms / PLAN_MS));
  // Te laat: vanaf waar hij kroop een korte sprint naar 100%.
  const van = onderweg(klaarOp);
  return van + (1 - van) * versnel(binnen((ms - klaarOp) / SPRINT_MS));
};

/**
 * Laat het blaadje vollopen volgens `vullingOp`. Eén waarde voor het blaadje én
 * het percentage, zodat die nooit uit de pas lopen. Bij prefers-reduced-motion
 * geen animatie: het plafond zolang er gewacht wordt, vol zodra de bron er is.
 */
export const useZoekVulling = (klaar: boolean) => {
  const reduced = useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );
  const [waarde, setWaarde] = useState(0);
  const klaarRef = useRef(klaar);
  klaarRef.current = klaar;

  useEffect(() => {
    if (reduced) return;
    const start = performance.now();
    let klaarOp: number | null = null;
    let frame = 0;
    const stap = (nu: number) => {
      const ms = nu - start;
      if (klaarOp === null && klaarRef.current) klaarOp = ms;
      const v = vullingOp(ms, klaarOp);
      setWaarde(v);
      if (v < 1) frame = requestAnimationFrame(stap);
    };
    frame = requestAnimationFrame(stap);
    return () => cancelAnimationFrame(frame);
  }, [reduced]);

  if (reduced) return klaar ? 1 : WACHT_PLAFOND;
  return waarde;
};
