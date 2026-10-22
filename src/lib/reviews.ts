import fotoJulian from "@/assets/review-julian.webp";
import fotoTibbe from "@/assets/review-tibbe.webp";

/**
 * Link naar ons Google-reviewprofiel. Staat hier hard, zodat de beoordeling
 * overal klikbaar is; ontbrak `VITE_GOOGLE_REVIEWS_URL` in een omgeving, dan
 * viel de link stilletjes terug op platte tekst. De env-variabele blijft werken
 * als override (bijvoorbeeld voor een testprofiel).
 */
export const GOOGLE_REVIEWS_URL =
  (import.meta.env.VITE_GOOGLE_REVIEWS_URL as string | undefined) ||
  "https://g.page/r/CQSAny7-yOM_EB0/review";

// Gedeeld tussen de reviewsectie op de homepagina en de compacte kaart naast
// het contactformulier. Staat los van beide componenten zodat ze dezelfde
// fallback en dezelfde avatarkleuren gebruiken.

export type Kaart = {
  id: string;
  naam: string;
  foto?: string;
  kleur?: string; // vaste avatarkleur; anders afgeleid van de naam
  rating: number;
  tekst: string;
};

// Fallback: getoond zolang de Google-sync nog niet actief is (of bij een fout /
// < 2 gesynchroniseerde reviews). Letterlijke citaten — teksten niet aanpassen.
// Eefje heeft geen foto → Google-stijl letter-avatar in haar echte roze (#D81B60).
export const fallbackKaarten: Kaart[] = [
  {
    id: "julian",
    naam: "Julian Kok",
    foto: fotoJulian,
    rating: 5,
    tekst:
      "Ik had geen idee hoe ik moest beginnen met het verduurzamen van mijn huis. Voortraject heeft me daarmee geholpen. Ze regelden de subsidieaanvraag en zorgden dat alles goed op papier stond. Zelf hoefde ik weinig te doen. Dak en spouwmuren zijn nu geïsoleerd en het huis is een stuk warmer. Fijn dat er een partij is die je hier gewoon bij helpt.",
  },
  {
    id: "tibbe",
    naam: "Tibbe Froma",
    foto: fotoTibbe,
    rating: 5,
    tekst:
      "Goed geholpen door Michael. Hij heeft alles voor mij geregeld en komen ze binnenkort nieuwe kozijnen plaatsen.",
  },
  {
    id: "eefje",
    naam: "Eefje Knol",
    kleur: "#D81B60",
    rating: 5,
    tekst: "Zeer tevreden. Ik kreeg deskundig advies en fijn dat ze alle subsidies regelde!",
  },
];

// Google-stijl avatarkleuren; deterministisch gekozen op basis van de naam,
// zodat dezelfde persoon altijd dezelfde kleur krijgt.
const AVATAR_KLEUREN = ["#546E7A", "#00897B", "#D81B60", "#3949AB", "#00838F", "#6D4C41"];
export const kleurVoor = (naam: string) =>
  AVATAR_KLEUREN[[...naam].reduce((som, c) => som + c.charCodeAt(0), 0) % AVATAR_KLEUREN.length];
export const initiaalVan = (naam: string) => naam.trim().charAt(0).toUpperCase() || "?";

// Welke reviews de site toont: minstens 4 sterren en minstens 10 woorden, zodat
// er nooit een kale "Top!" in de carrousel staat. Van wat overblijft de nieuwste.
export const MIN_STERREN = 4;
export const MIN_WOORDEN = 10;
export const MAX_KAARTEN = 6;

/** Telt woorden; losse leestekens en emoji tellen niet mee. */
export const aantalWoorden = (tekst: string) =>
  tekst.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;

/**
 * Live Google-reviews naar kaarten. Verwacht ze nieuwste eerst (zo levert de
 * query ze aan) en houdt die volgorde vast. Valt af: onder de sterren- of
 * woordengrens, en een tweede review van dezelfde naam (Google staat er één per
 * account toe; een dubbele is een restant van de sync).
 */
export const naarKaarten = (
  reviews: { id: string; author_name: string; profile_photo_url: string | null; rating: number; text: string | null }[],
): Kaart[] => {
  const gezien = new Set<string>();
  return reviews
    .map<Kaart>((r) => ({
      id: r.id,
      naam: r.author_name,
      foto: r.profile_photo_url ?? undefined,
      rating: r.rating,
      tekst: (r.text ?? "").trim(),
    }))
    .filter((k) => {
      if (k.rating < MIN_STERREN || aantalWoorden(k.tekst) < MIN_WOORDEN) return false;
      const sleutel = k.naam.trim().toLowerCase();
      if (gezien.has(sleutel)) return false;
      gezien.add(sleutel);
      return true;
    })
    .slice(0, MAX_KAARTEN);
};
