// Grenzen op de adresvelden die de bezoeker de CRM-database in kan schrijven.
//
// Waarom dit bestaat: de website schrijft leads rechtstreeks in `leads_bewoners`
// en `leads_uitvoerders` met de publieke anon-key. Wat een bezoeker in een veld
// zet, komt dus ongefilterd in het CRM, in de bevestigingsmail en in de
// CSV-export. Op naam, e-mail, telefoon, postcode en de vrije tekst stond die
// grens al; op de adresvelden niet.
//
// Het gat dat dit dicht: de subsidiecheck leest `str` en `pl` (handmatig adres,
// voor wat PDOK niet kent) uit de URL en zet ze rechtstreeks door naar de
// kolommen `straat` en `stad`. Eén geprepareerde deel-link zette daar dus een
// willekeurige hoeveelheid tekst in. Op het contactformulier stond alleen een
// `maxLength` op het invoerveld, en dat is een suggestie: de insert gaat
// rechtstreeks naar Supabase en die aanroep is met de publieke anon-key na te
// bootsen.
//
// De grenzen zijn gelijk aan de `maxLength` die al op de invoervelden stond, dus
// geen enkele bezoeker die het formulier normaal invult merkt er iets van.
//
// LET OP: dezelfde grenzen staan nog een keer in de edge function
// `supabase/functions/subsidiecheck-mail/index.ts` (Deno kan niets uit src/
// importeren). `src/test/adresVelden.test.ts` bewaakt dat de twee gelijk blijven.

export const ADRES_MAX = {
  straat: 150,
  stad: 100,
  huisnummer: 5,
  toevoeging: 10,
} as const;

// Bewust géén allowlist van toegestane tekens. Nederlandse straatnamen bevatten
// cijfers, punten, apostrofs, koppeltekens en haakjes ("1e Emmastraat",
// "Burg. J. Grommersstraat", "'t Zandt"), en een te strenge regel kost dan een
// echte lead. We weren alleen de twee tekens waar het om gaat: `<` en `>`, de
// bouwstenen van een HTML-tag. Dat is dezelfde grens die het CRM op naam- en
// bedrijfsnaamvelden vraagt.
//
// Dit is nadrukkelijk géén vervanging van escapen. De mail escapet nog steeds
// alles (dat hoort bij het renderen); dit voorkomt dat de rommel überhaupt
// binnenkomt.
const TAGTEKENS = /[<>]/;

/** True als de waarde binnen de lengtegrens valt en geen `<` of `>` bevat. */
export function adresVeldGeldig(waarde: string, max: number): boolean {
  return waarde.length <= max && !TAGTEKENS.test(waarde);
}

/** Straatnaam: optioneel, maar als hij er is moet hij binnen de grens vallen. */
export const straatGeldig = (v: string) => adresVeldGeldig(v, ADRES_MAX.straat);

/** Woonplaats: idem. */
export const stadGeldig = (v: string) => adresVeldGeldig(v, ADRES_MAX.stad);

/**
 * Huisnummer: begint met een cijfer en blijft binnen de grens. Bewust niet
 * "alleen cijfers": "12-14" en "3 rood" bestaan echt.
 */
export function huisnummerGeldig(v: string): boolean {
  return /^[0-9]/.test(v) && adresVeldGeldig(v, ADRES_MAX.huisnummer);
}

/** Toevoeging: optioneel; leeg is geldig. */
export function toevoegingGeldig(v: string): boolean {
  return v === "" || adresVeldGeldig(v, ADRES_MAX.toevoeging);
}
