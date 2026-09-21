// Het team zoals het op /over-ons staat: naam, functie, foto en het
// persoonlijke mailadres bij elkaar op één plek. Wie een collega toevoegt of
// een functietitel wijzigt, doet dat hier, en zowel de kaarten als het
// Person-schema hieronder komen automatisch mee.

import michael from "@/assets/team-michael.webp";
import tim from "@/assets/team-tim.webp";
import wouter from "@/assets/team-wouter.webp";
import christian from "@/assets/team-christian.webp";
import { SITE_URL } from "@/lib/site";

export interface Teamlid {
  name: string;
  specialty: string;
  /** Persoonlijk mailadres; staat op de kaart alleen achter het mail-icoon. */
  email: string;
  img: string;
}

export const TEAM: Teamlid[] = [
  {
    name: "Michael",
    specialty: "Verduurzamingsspecialist",
    email: "michael@voortraject.nl",
    img: michael,
  },
  {
    name: "Tim",
    specialty: "Bewonersadviseur",
    email: "tim@voortraject.nl",
    img: tim,
  },
  {
    name: "Wouter",
    specialty: "Bewonersadviseur",
    email: "wouter@voortraject.nl",
    img: wouter,
  },
  {
    name: "Christian",
    specialty: "Subsidiespecialist",
    email: "christian@voortraject.nl",
    img: christian,
  },
];

// Person-schema voor de vier medewerkers, opgehangen aan de organisatie. Dit
// zegt tegen zoekmachines dat er echte, met naam genoemde mensen achter het
// advies zitten (E-E-A-T). Het `@id` is dezelfde anker-notatie die zoekmachines
// gebruiken om losse blokken aan dezelfde organisatie te knopen als het
// statische Organization-blok in index.html.
const ORGANISATIE_ID = `${SITE_URL}/#organization`;

export const teamJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": ORGANISATIE_ID,
  name: "Voortraject",
  url: SITE_URL,
  employee: TEAM.map((p) => ({
    "@type": "Person",
    name: p.name,
    jobTitle: p.specialty,
    email: p.email,
    image: `${SITE_URL}${p.img}`,
    worksFor: { "@id": ORGANISATIE_ID },
  })),
};
