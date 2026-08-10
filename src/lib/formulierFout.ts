// Foutmeldingen voor de lead-formulieren, met één geval apart: de volumerem.
//
// Op de publieke insert in het CRM zit een rem (5 inzendingen per uur per
// IP-adres, 30 per uur over alle bezoekers samen). Wordt die geraakt, dan geeft
// Postgres een fout met SQLSTATE `PT429` en antwoordt PostgREST met HTTP 429.
//
// Zonder dit bestand liep die fout in dezelfde `catch` als elke andere storing en
// zag de bezoeker "Er ging iets mis. Probeer het later nog eens." Dat is
// misleidend: het klinkt als een storing van een minuut, terwijl de bezoeker een
// uur moet wachten. En het is precies het moment waarop je een échte lead
// kwijtraakt, dus hoort er een telefoonnummer bij.

/** Zoals het nummer elders op de site staat (Footer, contactpagina). */
export const TELEFOON_WEERGAVE = "050 211 2689";

/** SQLSTATE dat de CRM-trigger gooit; PostgREST vertaalt dat naar HTTP 429. */
const RATE_LIMIT_CODE = "PT429";

export const RATE_LIMIT_MELDING =
  `We ontvangen op dit moment veel aanvragen. Probeer het over een uur nog eens, ` +
  `of bel ons op ${TELEFOON_WEERGAVE}.`;

/**
 * Fout van de edge function `subsidiecheck-mail`, met de HTTP-status erbij. De
 * status is nodig om 429 (rem) van 500 (storing) te kunnen onderscheiden; een
 * kale `Error` met de status in de tekst zou daarvoor geparst moeten worden.
 */
export class MailFunctieFout extends Error {
  readonly status: number;

  constructor(status: number, wat = "subsidiecheck-mail") {
    super(`${wat} gaf status ${status}`);
    this.name = "MailFunctieFout";
    this.status = status;
  }
}

/**
 * True als deze fout de volumerem is en niet een storing. Dekt beide routes:
 * de directe insert vanuit de browser (PostgrestError met `code`) en de edge
 * function (HTTP 429).
 */
export function isRateLimitFout(err: unknown): boolean {
  if (err instanceof MailFunctieFout) return err.status === 429;
  if (typeof err !== "object" || err === null) return false;
  const code = (err as { code?: unknown }).code;
  return code === RATE_LIMIT_CODE;
}

/**
 * De melding die bij deze fout hoort: de rem-tekst als het de rem is, anders de
 * gewone storingstekst van het formulier zelf (die per formulier verschilt,
 * omdat het ene naar de mail verwijst en het andere naar WhatsApp).
 */
export function formulierFoutMelding(err: unknown, standaard: string): string {
  return isRateLimitFout(err) ? RATE_LIMIT_MELDING : standaard;
}
