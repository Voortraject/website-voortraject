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

// Duur per zoekstap, samen 3,6 s: landelijk 0,8 s, provinciaal 1 s,
// gemeentelijk 1,8 s. Bewust oplopend: hoe dichter bij huis, hoe langer in beeld.
// "Gemeente Tynaarlo ✓" is de regel die over déze bezoeker gaat, en hij staat er
// ook nog als het blaadje na 3 s (PLAN_MS) vol is, zodat het afronden gezien
// wordt in plaats van weggeknipt. Langer dan ~0,6 s vol voelde als een pauze. De laatste stap wacht bovendien op de echte
// fetch, dus bij een tragere bron duurt het vanzelf langer.
//
// Waarom ~4 s: onder ~1 s merkt niemand werk (Nielsen, response-time limits),
// boven ~10 s haakt de aandacht af. Daartussen werkt zichtbaar werk in ons
// voordeel (Buell & Norton). Er is geen onderzoek dat een exact optimum geeft;
// 3,6 s is genoeg om drie stappen te kunnen lezen en kort genoeg voor iemand die
// via een advertentie op een telefoon binnenkomt.
export const STAP_DUUR_MS = [800, 1000, 1800] as const;

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
    const t = setTimeout(() => setFase((f) => f + 1), STAP_DUUR_MS[fase]);
    return () => clearTimeout(t);
  }, [fase, klaar, reduced, overslaan]);

  return overslaan ? 3 : fase;
};

// Hoe het blaadje op het wachtscherm vol loopt. Eén doorlopende curve, geen
// trappetjes meer bij 1/3 en 2/3: elke stilstand leest als "hapert het?".
//
// Vorm: ease-out. Snel naar 80% (na 55% van de tijd), dan vertragend naar 100%
// op 3 s (PLAN_MS). Gekozen door de opdrachtgever na het naast elkaar zien van
// beide varianten op 2026-10-29.
//
// Let op, het onderzoek wijst de andere kant op: in Harrison, Amento, Kuznetsov
// & Bell, "Rethinking the progress bar" (UIST 2007) voelden bij gelijke duur
// alleen balken die naar het eind versnellen sneller dan een rechte lijn, en
// vertragen vlak voor het einde het traagst (piek-eindregel). Een versnellende
// variant (snelheid 0,25 -> 1,75) is geprobeerd en voelde hier, samen met de
// laadregels, minder prettig. Wie dit wil heroverwegen: meet het in Clarity.
//
// Verder:
//  - is de bron er niet op tijd, dan gaat het blad vanaf 80% kruipen richting
//    92%, zonder ooit stil te staan, maar ook nooit vol: een volle balk terwijl
//    er nog niets binnen is kost vertrouwen;
//  - zodra de bron antwoordt, een korte versnellende sprint naar 100%.
// Een vroeg antwoord laat de curve niet vooruitspringen: de zoekstappen
// blijven zichtbaar (zie useLaadsequentie).
export const PLAN_MS = 3000;
export const WACHT_PLAFOND = 0.92;
const KRUIP_VANAF = 0.8;
export const SPRINT_MS = 450;

// Versnellend van 0 naar 1, voor de sprint na een laat antwoord: snelheid loopt
// op van START naar 2 - START.
const START = 0.25;
const versnel = (s: number) => START * s + (1 - START) * s * s;
const binnen = (x: number) => Math.min(1, Math.max(0, x));

// Ease-out van 0 naar 1: snel naar 80% (na 55% van de tijd), dan vertragend.
const plan = (u: number) => 1 - (1 - u) * (1 - u);
const planInvers = (p: number) => 1 - Math.sqrt(1 - p);
const planSnelheid = (u: number) => 2 * (1 - u);

// Moment (ms) waarop het plan 80% haalt; vanaf daar kruipt hij als de bron er nog niet is.
const KRUIP_MS = PLAN_MS * planInvers(KRUIP_VANAF);
// Snelheid van het plan op dat moment, zodat het kruipen zonder knik aansluit.
const KRUIP_SNELHEID = planSnelheid(KRUIP_MS / PLAN_MS) / PLAN_MS;

const onderweg = (ms: number) => {
  if (ms <= KRUIP_MS) return plan(binnen(ms / PLAN_MS));
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
  // Op tijd: het plan loopt gewoon door tot 100%.
  if (klaarOp <= KRUIP_MS) return plan(binnen(ms / PLAN_MS));
  // Te laat: vanaf waar hij kroop een korte sprint naar 100%.
  const van = onderweg(klaarOp);
  return van + (1 - van) * versnel(binnen((ms - klaarOp) / SPRINT_MS));
};

/**
 * Welke bron er als laatste klaar is, als tekst voor de laadregel.
 *
 * De regels volgen de tijd (de fase), niet de vulling: het blad versnelt naar
 * het eind, dus drempels op de vulling lieten de laatste twee regels vlak na
 * elkaar knipperen. Nu staat elke regel een vaste tijd (STAP_DUUR_MS). "Landelijke
 * regelingen" staat er meteen, zodat er vanaf de eerste seconde iets te lezen
 * is. De gemeente staat pas als afgerond als de bron ook echt geantwoord heeft.
 */
export const laatsteBron = (fase: number, klaar: boolean, provincie?: string, gemeente?: string): string => {
  if (fase >= 2 && klaar) return gemeente ? `Gemeente ${gemeente}` : "Gemeentelijke regelingen";
  if (fase >= 1) return provincie ? `Provincie ${provincie}` : "Provinciale regelingen";
  return "Landelijke regelingen";
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
