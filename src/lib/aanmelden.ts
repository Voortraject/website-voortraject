// De ingang naar de subsidiedienst: zelf aanmelden in het bewonersportaal
// (mijn.voortraject.nl, een eigen app in de CRM-repo, mijn/schermen/aanmelden).
//
// Het portaal leest ?regeling= (nij-begun, vvg, isde; meer met komma's) en slaat
// dan het beginscherm over. Onbekende waarden negeert het. Het kent ook
// ?postcode=, ?huisnummer= en ?toevoeging=, maar die geven we vanaf de site
// bewust niet mee: het adres van de subsidiecheck blijft uit elke URL (zie
// docs/tracking.md, regel 1 en het stuk over de subsidiecheck).
//
// Klikken op deze links meet GTM met een trigger op Click URL, net als tel: en
// mailto: (docs/tracking.md, "Wat bewust in GTM zit en niet in de code").
export const AANMELDEN_URL = "https://mijn.voortraject.nl/aanmelden";

export type AanmeldRegeling = "nij-begun" | "vvg" | "isde";

export const aanmeldUrl = (regeling?: AanmeldRegeling) =>
  regeling ? `${AANMELDEN_URL}?regeling=${regeling}` : AANMELDEN_URL;
