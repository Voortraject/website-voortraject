// KOPIE van de vaste mailopmaak uit de CRM-repo (crm-voortraject, supabase/functions/_gedeeld/mail/opmaak.ts, stand van
// origin/main d0f0ca62, 24-11-2026). Goedgekeurd door de eigenaar op 24-11-2026: één set maten voor elke automatische
// mail van Voortraject. De spec, met elke waarde en de reden erachter: docs/mail/vaste-opmaak.md in die repo.
//
// Een kopie omdat deze edge function niets uit de CRM-repo kan importeren (net als het portaal daar een eigen kopie
// houdt). Verandert opmaak.ts in het CRM, dan hier mee. Wat hier anders is: de drie imports uit huisstijl.ts en
// handtekening.ts (LOGO_IMG, escapeHtml, KANTOOR_TELEFOON) staan letterlijk hieronder, en alleen de bouwstenen die de
// overzichtsmail gebruikt zijn meegenomen. src/test/subsidiecheckMailVasteOpmaak.test.ts toetst de mail met dezelfde
// controles als het CRM (src/test/vasteOpmaakControles.ts, ook een kopie).
//
// HARDE REGEL DONKERE MODUS: een vastgezette achtergrond (background-image:linear-gradient(#X,#X)) staat ALLEEN in een
// cel die direct en uitsluitend een <img> bevat (de logobalk). Nooit achter tekst: niet achter de knop of het
// gegevensblok. De Gmail-app op de iPhone keert tekstkleur altijd om en laat een vastgezette achtergrond staan; niet
// vastgezet keert hij vlak en tekst samen om en blijft alles leesbaar (bewezen 24-11-2026). De bewaking in het CRM
// (bewaking_achtergrond sectie j) meldt elke verstuurde mail die dat toch doet.

// ---- Uit huisstijl.ts en handtekening.ts (CRM) -------------------------------------------------------------------------

const LOGO_URL = "https://voortraject.nl/mail/voortraject-logo-mail.png?v=1";

const LOGO_IMG =
  `<img src="${LOGO_URL}" alt="voortraject" width="158" height="44" style="height:44px;width:158px;display:inline-block;` +
  `border:0;outline:none;text-decoration:none;color:#FFFFFF;font-size:20px;font-weight:700;font-family:Arial,Helvetica,sans-serif;">`;

const e = (s: unknown): string =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export const KANTOOR_TELEFOON = "050 211 26 89";

// ---- Kleuren en letter -------------------------------------------------------------------------------------------------

/** Inktblauw: tekst, logobalk en knop. */
export const INKT = "#152C4E";
/** Grijs voor labels en kleine tekst. */
export const GRIJS = "#5C6B80";
/** De achtergrond rond de kaart. */
export const ACHTERGROND = "#FBFAF7";
/** De rand van het gegevensblok. */
export const OKER = "#D9A441";
/** Het vlak van het gegevensblok (niet vastgezet). */
const VLAK = "#F6F5F1";

/** De letterstapel van de kaart; Outlook krijgt Arial via de mso-stijl in de kop. */
export const LETTER = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

// ---- Document ----------------------------------------------------------------------------------------------------------

/**
 * De hele mail: kop met de vaste metas, de voorbeeldregel, de buitentabel, de Outlook-geest, de kaart van 600 (met inline
 * width:100%, anders verkleint de iPhone de mail), de logobalk van 84 px en de inhoudcel. Geen grijze voet onder de kaart.
 * `inhoud` is HTML van de aanroeper; `titel` (de <title>) en `voorbeeldregel` worden geëscapet. Een lege voorbeeldregel
 * valt weg.
 */
export function mailDocument(m: { inhoud: string; voorbeeldregel?: string | null; titel?: string | null }): string {
  const voorbeeld = String(m.voorbeeldregel ?? "").trim();
  const titel = String(m.titel ?? "").trim();
  return `<!doctype html>
<html lang="nl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
${titel ? `<title>${e(titel)}</title>\n` : ""}<!--[if mso]><style>table,td,p,a,h1,h2{font-family:Arial,Helvetica,sans-serif !important;}</style><![endif]-->
</head>
<body style="margin:0;padding:0;background-color:${ACHTERGROND};-webkit-text-size-adjust:100%;">
${voorbeeld ? `<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${e(voorbeeld)}</div>\n` : ""}<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${ACHTERGROND}" style="background-color:${ACHTERGROND};">
<tr><td align="center" style="padding:24px 8px;">
<!--[if mso]><table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0"><tr><td><![endif]-->
<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background-color:#FFFFFF;border-radius:12px;overflow:hidden;font-family:${LETTER};">
<tr><td align="center" bgcolor="${INKT}" style="background-color:${INKT};background-image:linear-gradient(${INKT},${INKT});padding:20px 24px;">${LOGO_IMG}</td></tr>
<tr><td style="padding:32px 24px;font-size:16px;line-height:26px;color:${INKT};">
${m.inhoud}
</td></tr>
</table>
<!--[if mso]></td></tr></table><![endif]-->
</td></tr>
</table>
</body>
</html>`;
}

// ---- Tekst -------------------------------------------------------------------------------------------------------------

/** Titel (h1), 22/28 vet. Tekst, wordt geëscapet. */
export const titel = (t: string): string =>
  `<h1 style="margin:0 0 16px;font-size:22px;line-height:28px;font-weight:700;color:${INKT};">${e(t)}</h1>`;

/** Tussenkop (h2), 18/26 vet. Tekst, wordt geëscapet. */
export const tussenkop = (t: string): string =>
  `<h2 style="margin:24px 0 8px;font-size:18px;line-height:26px;font-weight:700;color:${INKT};">${e(t)}</h2>`;

/** Gewone tekst: 16/26 (erft van de inhoudcel), 16 eronder. `html` is HTML van de aanroeper. */
export const alinea = (html: string, marge = "0 0 16px"): string => `<p style="margin:${marge};">${html}</p>`;

/** Kleine tekst: 13/20 grijs, nooit kleiner. `html` is HTML van de aanroeper. */
export const kleineTekst = (html: string, marge = "0 0 16px"): string =>
  `<p style="margin:${marge};font-size:13px;line-height:20px;color:${GRIJS};">${html}</p>`;

/** Een regel kleine tekst onder de handtekening (waarom je deze mail krijgt, afmelden): binnen de kaart, geen grijze voet. */
export const voetnoot = (html: string): string => kleineTekst(html, "24px 0 0");

/** Een link in de tekst; lange URL's breken overal af (`break-all`). Link en tekst worden geëscapet. */
export const tekstLink = (url: string, tekst: string, opties: { lang?: boolean } = {}): string =>
  `<a href="${e(url)}" style="color:${INKT};text-decoration:underline;${opties.lang ? "word-break:break-all;" : ""}">${e(tekst)}</a>`;

// ---- Blokken -----------------------------------------------------------------------------------------------------------

/** De kop van een gegevensblok: 13/20, 600, hoofdletters, grijs. */
const blokKop = (kop: string) =>
  `<p style="margin:0 0 8px;font-size:13px;line-height:20px;letter-spacing:0.06em;text-transform:uppercase;color:${GRIJS};font-weight:600;">${e(kop)}</p>`;

/**
 * Het vlak van het gegevensblok (okerstreep links, licht vlak, achtergrond NIET vastgezet), met een vrije inhoud. Voor
 * label-waardeparen: `gegevensblok` (in het CRM; de overzichtsmail gebruikt het niet).
 */
export const blok = (inhoud: string, kop?: string | null): string =>
  `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;border-left:3px solid ${OKER};background-color:${VLAK};">\n` +
  `<tr><td style="padding:16px;">\n${kop ? blokKop(kop) + "\n" : ""}${inhoud}\n</td></tr></table>`;

/**
 * De knop: inktblauw met witte tekst, 48 px hoog, achtergrond NIET vastgezet (Gmail keert vlak en tekst dan samen om).
 * Link en tekst worden geëscapet.
 */
export const knop = (link: string, tekst: string): string =>
  `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;"><tr>` +
  `<td bgcolor="${INKT}" style="background-color:${INKT};border-radius:8px;">` +
  `<a href="${e(link)}" style="display:inline-block;padding:14px 28px;font-size:16px;line-height:20px;font-weight:600;color:#FFFFFF;text-decoration:none;font-family:${LETTER};">${e(tekst)}</a>` +
  `</td></tr></table>`;

// ---- Afsluiting --------------------------------------------------------------------------------------------------------

const telLink = (nummer: string) => "tel:" + nummer.replace(/\s/g, "").replace(/^0/, "+31");

/**
 * De afsluiting van een mail van het team, de LICHTE versie (besluit eigenaar 24-11-2026): de groet, "Team Voortraject"
 * en een regel met telefoon en e-mail. Geen blok, geen streep, geen logo, geen slogan, geen witregel, geen website (dan
 * past de regel niet meer op 390 px). Inclusief de groet: zet er geen groet voor.
 */
export const afsluitingTeam = (): string =>
  `<p style="margin:0;">Met vriendelijke groet,</p>\n` +
  `<p style="margin:0 0 4px;font-weight:700;">Team Voortraject</p>\n` +
  `<p style="margin:0;font-size:13px;line-height:20px;color:${GRIJS};">` +
  `<a href="${telLink(KANTOOR_TELEFOON)}" style="color:${GRIJS};text-decoration:none;">${KANTOOR_TELEFOON}</a> &middot; ` +
  `<a href="mailto:info@voortraject.nl" style="color:${GRIJS};text-decoration:none;">info@voortraject.nl</a></p>`;

/** De lichte teamafsluiting als platte tekst, met de groet. */
export const afsluitingTeamTekst = (): string =>
  `Met vriendelijke groet,\nTeam Voortraject\n${KANTOOR_TELEFOON} · info@voortraject.nl`;
