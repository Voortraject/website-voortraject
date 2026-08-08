// De beloftes die we bij de subsidiecheck tonen, op één plek.
//
// Waarom een eigen bestand: deze regel staat op twee plekken (de CTA op de
// homepage en stap 1 van de check zelf) en die liepen uit elkaar. Belangrijker
// nog: het zijn feitelijke uitspraken op een publieke site, dus ze moeten alle
// drie waar zijn en waar blijven. Eén bron maakt dat controleerbaar.
//
// Wat hier eerder stond en waarom het weg is:
//  - "Geen account nodig" — formeel waar (er is geen inlog), maar de bezoeker
//    leest het als "ze vragen niets van mij", terwijl de stap erna om naam,
//    e-mail en telefoon vraagt. Een belofte die het volgende scherm tegenspreekt
//    kost precies daar vertrouwen waar we het nodig hebben.
//  - "Klaar in 1 minuut" — drie velden, dan vier velden, een keuzevraag en een
//    zoekstap van enkele seconden. Dat haalt niemand in zestig seconden.
//
// Voeg hier niets toe wat je niet kunt aanwijzen in de flow.
export const SUBSIDIECHECK_BELOFTES = ["Gratis", "Vrijblijvend", "Klaar in 2 minuten"] as const;
