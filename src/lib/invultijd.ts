/**
 * Minimale tijd tussen het verschijnen van een formulier en het verzenden ervan.
 * Een mens is nooit zo snel; een bot die een formulier invult vaak wel.
 *
 * Gedeeld door alle formulieren op de site. De edge function `subsidiecheck-mail`
 * heeft dezelfde grens (MIN_INVULTIJD_MS in beveiliging.ts) en negeert een
 * snellere inzending stil, dus de browser houdt een mens hier al tegen met een
 * melding. src/test/subsidiecheckMailBeveiliging.test.ts bewaakt dat ze gelijk zijn.
 */
export const MIN_INVULTIJD_MS = 3000;
