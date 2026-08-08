// De persoonlijke eerste stap op het resultaat: één uitspraak over de
// woningvoorraad, gevolgd door een vraag.
//
// De regel die alles stuurt: NOOIT een uitspraak over dít huis. We weten het
// bouwjaar (BAG), maar niet wat er sindsdien is gedaan. "Jouw muren zijn niet
// geïsoleerd" kan dus gewoon onwaar zijn, en één zulke misser kost meer
// vertrouwen dan de hele tekst oplevert. Wat we wél mogen zeggen gaat over
// woningen uit die bouwperiode, en dat is precies wat bouwjaar betekent: welke
// isolatie er bij de bouw in ging.
//
// Daarom ook geen enkele maatregel bij naam. Een eerdere opzet hing aan de
// spouwmuur en een tweede aan het dak; allebei kozen ze één verhaal terwijl we
// niet weten welke maatregel voor deze woning speelt. "Wat er bij de bouw in
// ging" dekt muren, dak, vloer en glas tegelijk.
//
// Bronnen, letterlijk nageslagen bij Milieu Centraal (opgehaald 2026-08-09,
// pagina's laatst gewijzigd 8 juli 2026). Ook de grenzen zijn van hen, niet
// zelf gekozen:
//
//   spouwmuurisolatie: "Grote kans dat het bij de bouw buitenmuren met een
//   spouw heeft gekregen, maar nog zonder isolatie" (1920-1975) · "In deze
//   periode werden buitenmuren bijna altijd geïsoleerd, meestal in de spouw.
//   Maar de isolatiewaarde van deze huizen kan beter" (1975-1991) · "Dan heeft
//   het al goede gevelisolatie (Rc van 2,5 of hoger)" (na 1991)
//
//   dakisolatie: "Bij de bouw is geen isolatie aangebracht" (voor 1975) ·
//   "waarschijnlijk een matige isolatielaag van 3 tot 5 centimeter"
//   (1975-1992) · "redelijke tot goede isolatie meegekregen (8 tot 10
//   centimeter of meer)" (1992 of later)
//
// De twee bronnen leggen hun grens net anders (1991 vs 1992). We houden 1992
// aan, de conservatieve kant: een woning uit 1991 valt dan in de "dunne
// laag"-groep, en dat is bij twijfel de uitspraak die niemand tekortdoet.

import type { Bewonertype } from "@/lib/subsidies";

export type EersteStapTekst = {
  /** De uitspraak over de woningvoorraad. Eén of twee zinnen. */
  zinnen: string[];
  /** De slotvraag; die brengt de bezoeker naar het vraagblok. */
  vraag: string;
  /** Wat er alvast in het vraagveld komt te staan als hij erop klikt. */
  voorstel: string;
};

// Ondergrens voor een bouwjaar dat we serieus nemen. De BAG gebruikt 1005 en
// vergelijkbare plaatshouders voor panden waarvan het bouwjaar niet bekend is;
// die zou je anders als middeleeuwse woning presenteren.
const VROEGST_GELOOFWAARDIG = 1500;

/**
 * De tekst voor dit bouwjaar, of `null` als we niets te zeggen hebben.
 *
 * `null` is een volwaardige uitkomst en geen storing: zonder betrouwbaar
 * bouwjaar tonen we helemaal geen blok. Liever niets dan iets.
 */
export function eersteStapTekst(bouwjaar: number | undefined, bewonertype: Bewonertype): EersteStapTekst | null {
  if (!bouwjaar || !Number.isFinite(bouwjaar) || bouwjaar < VROEGST_GELOOFWAARDIG) return null;
  // Een bouwjaar in de toekomst (nieuwbouw in aanbouw) zegt niets over wat er
  // sindsdien is gedaan, want er is nog geen "sindsdien".
  if (bouwjaar > new Date().getFullYear()) return null;

  const opening = `Jouw huis is uit ${bouwjaar}.`;
  // Huurders kunnen zelf weinig aan de schil doen, maar Voortraject kan altijd
  // meekijken wat er in hun situatie mogelijk is. De uitspraak over de voorraad
  // blijft dus staan; alleen de vraag verschuift van "waar staat je huis" naar
  // "wat kan er in jouw situatie".
  const isHuurder = bewonertype === "huurder";

  if (bouwjaar >= 1992) {
    return {
      zinnen: [
        opening,
        "Woningen uit die tijd kregen bij de bouw al redelijke isolatie mee.",
        "De winst zit dan meestal niet in de schil maar in verwarming en opwek.",
      ],
      vraag: isHuurder
        ? "Zullen we uitzoeken wat er in jouw situatie mogelijk is?"
        : "Zullen we uitzoeken wat voor jouw huis interessant is?",
      voorstel: isHuurder
        ? `Ik huur een woning uit ${bouwjaar}. Kunnen jullie uitzoeken wat er in mijn situatie mogelijk is?`
        : `Mijn woning is uit ${bouwjaar}. Kunnen jullie meedenken over wat voor mijn huis interessant is?`,
    };
  }

  const kern =
    bouwjaar >= 1975
      ? "Woningen uit die jaren kregen bij de bouw een dunne laag isolatie, naar de maatstaven van nu bescheiden."
      : "Woningen uit die tijd kregen bij de bouw geen isolatie mee.";

  return {
    zinnen: [opening, kern, "Wat er daarna is gedaan verschilt per woning."],
    vraag: isHuurder
      ? "Zullen we uitzoeken wat er in jouw situatie mogelijk is?"
      : "Zullen we uitzoeken waar jouw huis nu staat?",
    voorstel: isHuurder
      ? `Ik huur een woning uit ${bouwjaar}. Kunnen jullie uitzoeken wat er in mijn situatie mogelijk is?`
      : `Mijn woning is uit ${bouwjaar}. Kunnen jullie uitzoeken wat er al aan isolatie is gedaan en wat er nog kan?`,
  };
}
