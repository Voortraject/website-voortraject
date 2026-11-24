// KOPIE van src/test/vasteOpmaakControles.ts uit de CRM-repo (crm-voortraject, origin/main d0f0ca62, 24-11-2026).
// Dezelfde regels als de bewaking in het CRM (bewaking_achtergrond sectie j) en als mailVasteOpmaak.test.ts daar.
// Gebruikt door src/test/subsidiecheckMailVasteOpmaak.test.ts. Verandert het origineel, dan hier mee.
//
// De controles van de vaste mailopmaak (docs/mail/vaste-opmaak.md), gedeeld door src/test/mailVasteOpmaak.test.ts (de
// edge-sjablonen), src/test/n8nVasteOpmaak.test.ts (de n8n-mails) en de droge run van
// tasks/mail-opmaak/n8n-vaste-opmaak.mjs. Geen vitest-import: het script draait dit met gewone Node.

/**
 * Elke vastgezette achtergrond (linear-gradient in een openingstag) moet direct en uitsluitend een <img> bevatten
 * (eventueel in een link). Geeft de tags terug die dat niet doen. Naar alleenAchterAfbeeldingVast in de Offertetool
 * (src/test/mailVast.ts), strenger: ook na de afbeelding mag niets anders staan dan de sluittag. Dezelfde regel als de
 * bewaking (bewaking_achtergrond sectie j, migratie 20261124135900).
 */
export function gradientNietAlleenAchterAfbeelding(html: string): string[] {
  const fout: string[] = [];
  const re = /<[a-z][a-z0-9]*[^>]*linear-gradient[^>]*>(\s*<a\s[^>]*>)?\s*(<img[^>]*>(\s*<\/a>)?\s*<\/)?/gi;
  for (const m of html.matchAll(re)) if (!m[2]) fout.push(m[0].slice(0, 160));
  return fout;
}

/** Zonder de Outlook-geest (<!--[if mso]>...<![endif]-->): die tabel van 600 hoort daar zonder width:100%. */
export const zonderMso = (html: string) => html.replace(/<!--\[if mso\]>[\s\S]*?<!\[endif\]-->/g, "");

/** Tabellen met width="600" zonder inline width:100% (dat verkleinde de mail op de iPhone tot ongeveer 60%). */
export function vaste600(html: string): string[] {
  return [...zonderMso(html).matchAll(/<table\b[^>]*\bwidth="600"[^>]*>/gi)]
    .map((m) => m[0])
    .filter((t) => !/style="(?:[^"]*;)?\s*width:\s*100%/i.test(t));
}

export const TOEGESTAAN = new Set([13, 14, 15, 16, 18, 20, 22, 26]);

/** Lettergroottes buiten de vaste set; 20 alleen in de alt-terugval van het logo, 26 alleen in het codevak. */
export function verkeerdeMaten(html: string): string[] {
  const fout: string[] = [];
  for (const m of html.matchAll(/<[^>]*font-size:\s*(\d+(?:\.\d+)?)(px|pt|em|rem)?[^>]*>/gi)) {
    const maat = Number(m[1]);
    const tag = m[0];
    if (m[2] !== "px" || !TOEGESTAAN.has(maat)) fout.push(`${m[1]}${m[2] ?? ""}: ${tag.slice(0, 100)}`);
    else if (maat === 20 && !/^<img\b[^>]*voortraject-logo-mail\.png/i.test(tag)) fout.push(`20px buiten het logo: ${tag.slice(0, 100)}`);
    else if (maat === 26 && !/user-select:all/.test(tag)) fout.push(`26px buiten het codevak: ${tag.slice(0, 100)}`);
  }
  return fout;
}

/** De persoonlijke handtekening (handtekeningHtml) blijft zoals hij is: uit de HTML voor de maat- en kolomcontroles. */
export const zonderPersoonlijk = (html: string, persoonlijk?: string) => (persoonlijk ? html.split(persoonlijk).join("") : html);

export const METAS = [
  '<meta name="viewport" content="width=device-width, initial-scale=1">',
  '<meta name="x-apple-disable-message-reformatting">',
  '<meta name="color-scheme" content="light">',
  '<meta name="supported-color-schemes" content="light">',
];
export const MSO_LETTER = "<!--[if mso]><style>table,td,p,a,h1,h2{font-family:Arial,Helvetica,sans-serif !important;}</style><![endif]-->";
export const BODY = '<body style="margin:0;padding:0;background-color:#FBFAF7;-webkit-text-size-adjust:100%;">';
export const LOGOBALK =
  '<tr><td align="center" bgcolor="#152C4E" style="background-color:#152C4E;background-image:linear-gradient(#152C4E,#152C4E);padding:20px 24px;"><img ';
export const KAART =
  `<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background-color:#FFFFFF;border-radius:12px;overflow:hidden;`;
export const INHOUDCEL = '<tr><td style="padding:32px 24px;font-size:16px;line-height:26px;color:#152C4E;">';
export const KNOP_CEL = '<td bgcolor="#152C4E" style="background-color:#152C4E;border-radius:8px;"><a ';
/** Na de inhoudcel sluit de kaart: geen rij meer eronder (geen grijze voet). */
export const KAART_SLUIT = /^<tr><td [^>]*>\n[\s\S]*\n<\/td><\/tr>\n<\/table>\n<!--\[if mso\]><\/td><\/tr><\/table><!\[endif\]-->/;

/**
 * De stappenbalk van de opdrachtmails (n8n Statusupdates opdrachten en BoldSign - 2): vier vakjes met haakjes erboven.
 * Geen bouwsteen van de spec maar een eigen tekening: de hoekjes zijn cellen met een spatie van 1px en tussen de vakjes
 * staan cellen van 8 breed. Die vallen buiten de maat- en kolomcontrole; de woorden erin moeten wel 13px of groter zijn
 * en het grijs #5C6B80 (`stappenbalkMeldingen`).
 */
export const STAPPENBALK =
  /<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;"><tbody><tr><td valign="bottom"[\s\S]*?Traject afgerond<\/td><\/tr><\/tbody><\/table>/g;

export function stappenbalkMeldingen(html: string): string[] {
  const m: string[] = [];
  for (const b of html.match(STAPPENBALK) ?? []) {
    const zonderHoekjes = b.replace(/<td bgcolor="#FFFFFF" height="8" style="font-size:1px;line-height:1px;[^"]*">&nbsp;<\/td>/g, "");
    m.push(...verkeerdeMaten(zonderHoekjes).map((f) => `stappenbalk: ${f}`));
    if (/#6B7280|#9CA3AF/i.test(b)) m.push("stappenbalk: oude grijstint");
    if (/linear-gradient/.test(b)) m.push("stappenbalk: vastgezette achtergrond");
  }
  return m;
}

/** De lichte teamafsluiting, letterlijk (spec). */
export const AFSLUITING_TEAM =
  '<p style="margin:0;">Met vriendelijke groet,</p>\n' +
  '<p style="margin:0 0 4px;font-weight:700;">Team Voortraject</p>\n' +
  '<p style="margin:0;font-size:13px;line-height:20px;color:#5C6B80;"><a href="tel:+31502112689" style="color:#5C6B80;text-decoration:none;">050 211 26 89</a> &middot; <a href="mailto:info@voortraject.nl" style="color:#5C6B80;text-decoration:none;">info@voortraject.nl</a></p>';

/**
 * Alle regels van de vaste opmaak op een hele mail, als lijst meldingen (leeg = goed). Dezelfde regels als de
 * `it`-blokken in mailVasteOpmaak.test.ts. `persoonlijk` = de HTML van de persoonlijke handtekening als die erin hoort
 * (blijft ongewijzigd en valt buiten de maat- en kolomcontroles). `afsluiting`: "team" (de lichte teamafsluiting),
 * "persoonlijk" (groet + handtekening), of "vrij" (een eigen slotregel boven de handtekening, zoals "Tot straks!" of de
 * groet in de door de adviseur getypte offertetekst): dan alleen dat de handtekening er is en de teamafsluiting niet.
 * `vreemd` = stukken HTML die niet van de opmaak zijn (de door het CRM gemaakte offertetekst): ook buiten de maatcontrole.
 */
export function controleerVasteOpmaak(
  html: string,
  o: { persoonlijk?: string; afsluiting: "team" | "persoonlijk" | "vrij" | "geen"; vreemd?: string[] },
): string[] {
  const m: string[] = [];
  const eis = (ok: boolean, melding: string) => { if (!ok) m.push(melding); };
  let getoetst = zonderPersoonlijk(html, o.persoonlijk);
  // Langste eerst: een kort stuk (een <br>) kan anders een langer stuk breken voordat dat eruit is.
  for (const v of [...(o.vreemd ?? [])].filter(Boolean).sort((a, b) => b.length - a.length)) getoetst = getoetst.split(v).join("");
  m.push(...stappenbalkMeldingen(getoetst));
  getoetst = getoetst.replace(STAPPENBALK, "");

  eis(html.startsWith('<!doctype html>\n<html lang="nl">'), "begint niet met <!doctype html> en <html lang=\"nl\">");
  for (const meta of METAS) eis(html.includes(meta), `meta ontbreekt: ${meta}`);
  eis(html.includes(MSO_LETTER), "de mso-letterstijl ontbreekt");
  eis(html.includes(BODY), "de body-stijl wijkt af");
  eis(!html.includes("prefers-color-scheme"), "prefers-color-scheme in de mail");

  eis(html.includes(KAART), "de kaart van 600 met width:100% ontbreekt");
  const vast = vaste600(html);
  eis(vast.length === 0, `tabel van 600 zonder width:100%: ${vast.join(" | ")}`);
  eis(html.includes(LOGOBALK), "de logobalk wijkt af");
  eis(html.includes('width="158" height="44"'), "het logo is niet 158x44");
  eis(html.includes(INHOUDCEL), "de inhoudcel wijkt af");
  eis(html.includes('<!--[if mso]><table role="presentation" width="600"'), "de Outlook-geest ontbreekt");

  const grad = gradientNietAlleenAchterAfbeelding(html);
  eis(grad.length === 0, `vastgezette achtergrond achter iets anders dan een afbeelding: ${grad.join(" | ")}`);
  eis((html.match(/linear-gradient/g) ?? []).length === 1, "meer dan een linear-gradient (alleen de logobalk mag)");
  for (const k of html.matchAll(/<td bgcolor="#152C4E" style="background-color:#152C4E;border-radius:8px;"><a /g)) {
    eis(!html.slice(k.index, html.indexOf("</td>", k.index)).includes("gradient"), "gradient in de knop");
  }

  const maten = verkeerdeMaten(getoetst);
  eis(maten.length === 0, `lettergroottes buiten de set: ${maten.join(" | ")}`);

  eis(!/border-top:\s*1px solid/i.test(html), "een grijze voet (border-top)");
  eis(!/#9CA3AF|#6B7280|#687280/i.test(getoetst), "een oude grijstint (#9CA3AF/#6B7280/#687280)");
  const i = html.indexOf(INHOUDCEL);
  eis(i >= 0 && KAART_SLUIT.test(html.slice(i)), "na de inhoudcel staat nog een rij (voet)");
  eis(!getoetst.includes("voortraject-logo-blauw.png"), "het blauwe logo (oude teamhandtekening)");
  eis(!html.includes("#D9A441,#D9A441") && !html.includes("#E8B547,#E8B547"), "een vastgezette okerknop");
  eis(!html.includes("Gratis advies over verduurzamen en subsidies"), "de slogan van de oude teamhandtekening");

  eis(!/width="62"|width:62px/.test(getoetst), "een labelkolom van 62 buiten de persoonlijke handtekening");
  for (const t of getoetst.matchAll(/<td width="(\d+)"/g)) eis(["72", "104", "128"].includes(t[1]), `een labelkolom van ${t[1]}`);
  for (const t of getoetst.matchAll(/<td width="128" style="([^"]*)"/g)) eis(t[1].includes("padding:2px 12px 2px 0;"), "labelcel zonder 12 px rechts");

  const groeten = html.split("Met vriendelijke groet,").length - 1;
  if (o.afsluiting === "team") {
    eis(html.includes(AFSLUITING_TEAM), "de lichte teamafsluiting ontbreekt");
    eis(groeten === 1, `de groet staat er ${groeten} keer`);
    eis(!o.persoonlijk || !html.includes(o.persoonlijk), "teamafsluiting en persoonlijke handtekening samen");
  } else if (o.afsluiting === "persoonlijk") {
    eis(!!o.persoonlijk && html.includes(`<p style="margin:0 0 24px;">Met vriendelijke groet,</p>${o.persoonlijk}`), "groet() direct voor de persoonlijke handtekening ontbreekt");
    eis(groeten === 1, `de groet staat er ${groeten} keer`);
    eis(!html.includes(AFSLUITING_TEAM), "persoonlijke handtekening en teamafsluiting samen");
  } else if (o.afsluiting === "vrij") {
    eis(!!o.persoonlijk && html.includes(o.persoonlijk), "de persoonlijke handtekening ontbreekt");
    eis(!html.includes(AFSLUITING_TEAM), "persoonlijke handtekening en teamafsluiting samen");
  }
  return m;
}
