// De overzichtsmail aan de bezoeker, als puur bestand naast de function zodat
// vitest hem echt kan opbouwen (src/test/subsidiecheckMailBeveiliging.test.ts).
// Verhuisd uit index.ts in oktober 2026.
//
// Harde regel sinds de Spamhaus-listing van oktober 2026: in deze mail komt
// géén tekst uit de request. De regelingen komen uit onze eigen bron, de
// adresregel uit postcode en huisnummer (streng gevalideerd) of uit de BAG, en
// de aanhef uit een voornaam die alleen letters mag bevatten. Zie
// tasks/formulieren-misbruik-2026-10.md.
//
// De opmaak is sinds eind oktober 2026 "variant D", gekozen na vier varianten
// en drie testmails: een inktblauwe kop met de ene oker knop, tellers zoals het
// CRM-dashboard, regelingen als kaarten met een zacht verloop per soort, en
// onderaan een donker blok voor wie liever zelf contact opneemt. Rust boven
// volledigheid: geen randen, geen scheidslijnen, alleen de eerste zin van elke
// omschrijving.
//
// Drie soorten mailprogramma's, elk met een eigen valkuil:
// - Apple Mail, Outlook.com en de Outlook-apps lezen <style>. Daar staat de mail
//   altijd licht ("color-scheme: light only"); donkere kaarten vond de
//   opdrachtgever lelijk.
// - De Gmail-apps keren in dark mode zelf de kleuren om, maar laten
//   achtergrondverlopen staan. Een licht verloop met omgekeerde (lichte) tekst
//   is onleesbaar, dus krijgen de lichte kaarten hun verloop via een klasse die
//   in Gmail weer uitgaat (`u + .body`). De witte tekst op de donkere vlakken
//   gaat door de blend-truc (gm-scherm/gm-verschil), zodat Gmail iOS hem niet
//   zwart maakt.
// - Klassiek Outlook (Word) kent geen verloop, ronde hoeken, schaduw of rgba.
//   Elk vlak heeft daarom eerst een effen kleur, ook als bgcolor-attribuut,
//   knoppen zijn tabelcellen en het lettertype valt terug op Arial.

import { bouwEswFilterQuery, schoonOverzichtUrl, type MailRegeling } from "./beveiliging.ts";

type Regeling = MailRegeling;

// Huisstijl. E-mail kan geen CSS-variabelen of Tailwind, dus inline hex uit de
// gedocumenteerde palette (uitzondering op de token-regel).
const K = {
  ink: "#152C4E",
  inkLicht: "#1F3D68",
  oker: "#E8B547",
  okerLicht: "#F0C565",
  offwhite: "#FBFAF7",
  tekst: "#2B2B2B",
  zacht: "#4A5568",
};
const FONT = "'Manrope',Arial,Helvetica,sans-serif";

const TELEFOON_LINK = "tel:0502112689";
// Zelfde nummer als de knop op de site (src/lib/whatsapp.ts): zonder + en zonder 0.
const WHATSAPP_NUMMER = "31502112689";
const TEAM_MAIL = "info@voortraject.nl";

// Kleur per SOORT, het beslissende onderscheid: subsidie = groen (geld dat je
// niet terugbetaalt), lening = staalblauw (geld dat je leent). Bewust géén
// rood of oranje: dat leest als "slecht" tegenover groen, terwijl een lening
// ook prima kan zijn. Gelijk aan de tellers op het resultaatscherm.
const SOORT = {
  subsidie: { kleur: "#2E7D5B", licht: "#3D9470", vlak: "#EDF6F1", klasse: "vl-sub", teken: "&euro;", label: "Subsidie" },
  lening: { kleur: "#3A6EA5", licht: "#4F82B8", vlak: "#EDF3FA", klasse: "vl-len", teken: "%", label: "Lening" },
};
type Soort = (typeof SOORT)["subsidie"];
const soortVan = (r: Regeling): Soort => (r.type === "lening" ? SOORT.lening : SOORT.subsidie);

// Gelijk aan WAAROM_GROEPEN in src/lib/subsidies/types.ts: pas ze samen aan.
// Zegt waaróm de lijst in groepen staat, want dat is de enige boodschap die die
// koppen moeten overbrengen: verschillende potten, dus vaak te combineren.
const WAAROM_GROEPEN =
  "Deze regelingen komen van verschillende overheden. Daarom kun je ze vaak naast elkaar aanvragen.";

const NIVEAU_VOLGORDE = ["rijk", "provincie", "gemeente", "overig"] as const;
type Niveau = (typeof NIVEAU_VOLGORDE)[number];
// Gelijk aan NIVEAU_LABELS in src/lib/subsidies/types.ts: pas ze samen aan.
const NIVEAU_LABELS: Record<Niveau, string> = {
  rijk: "Van de Rijksoverheid",
  provincie: "Van de provincie",
  gemeente: "Van jouw gemeente",
  overig: "Van andere organisaties",
};
// Voor de voorbeeldregel in de inbox: "van Rijk, provincie en gemeente".
const NIVEAU_KORT: Record<Niveau, string> = {
  rijk: "Rijk",
  provincie: "provincie",
  gemeente: "gemeente",
  overig: "andere organisaties",
};

// Logo's en iconen staan op de site zelf (`public/mail/`, meegebouwd door
// Cloudflare Pages) en niet in een Supabase-bucket: die bucket stuurde
// Cache-Control: no-cache mee, en een hernoeming daar brak twee keer live mail.
// Wijzig je een plaatje, geef het dan een NIEUWE bestandsnaam: verstuurde mails
// blijven naar de oude wijzen. Daarom staan wa.png en tel.png er ook nog.
// LET OP: een nieuw plaatje bestaat pas als de site gedeployed is. Deploy de
// site dus vóór deze function, anders staat er even een gebroken plaatje (de
// alt-tekst vangt dat op).
const BEELD = {
  logoWit: "https://voortraject.nl/mail/voortraject-logo-wit.png",
  whatsapp: "https://voortraject.nl/mail/wa-groen.png",
  telefoon: "https://voortraject.nl/mail/tel-wit.png",
  google: "https://voortraject.nl/mail/google.png",
};

// De algemene mailhandtekening van Voortraject, onder de groet in plaats van de regel
// "Team Voortraject". KOPIE van handtekeningAlgemeenHtml() in src/lib/mailHandtekening.ts van
// de CRM-repo; daar staat hij ook in elke n8n-mail. Verandert hij daar, dan hier mee.
// Inline stijlen en vaste kleuren: mailclients strippen een <style>-blok en kennen geen tokens.
// Hij staat bewust zonder eigen vlak: crème op off-white verschilt maar een paar
// tinten, en per scherm (of met een nachtfilter) leest dan de ene keer het vlak
// als wit en de andere keer de achtergrond.
const HANDTEKENING_ALGEMEEN_HTML = "<table cellpadding=\"0\" cellspacing=\"0\" border=\"0\" style=\"border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;color:#152C4E;\"><tr><td width=\"170\" align=\"center\" style=\"width:170px;vertical-align:middle;padding:0 22px 0 0;\"><a href=\"https://voortraject.nl\" style=\"display:block;text-decoration:none;\"><img src=\"https://voortraject.nl/mail/voortraject-logo-blauw.png\" width=\"170\" height=\"45\" alt=\"Voortraject\" style=\"display:block;width:170px;height:45px;border:0;margin:0 auto;\"></a></td><td style=\"vertical-align:middle;padding:4px 0 4px 22px;border-left:2px solid #E8B547;\"><table cellpadding=\"0\" cellspacing=\"0\" border=\"0\" style=\"border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;\"><tr><td colspan=\"2\" style=\"font-size:17px;line-height:22px;font-weight:bold;color:#152C4E;padding:0;\">Team Voortraject</td></tr><tr><td colspan=\"2\" style=\"font-size:13px;line-height:18px;color:#5C6B80;padding:0 0 12px 0;\">Gratis advies over verduurzamen en subsidies</td></tr><tr><td width=\"62\" style=\"width:62px;font-size:12px;line-height:20px;color:#8A94A3;padding:0;\">Telefoon</td><td style=\"font-size:13px;line-height:20px;padding:0;\"><a href=\"tel:+31502112689\" style=\"color:#152C4E;text-decoration:none;\">050 211 26 89</a></td></tr><tr><td width=\"62\" style=\"width:62px;font-size:12px;line-height:20px;color:#8A94A3;padding:0;\">E-mail</td><td style=\"font-size:13px;line-height:20px;padding:0;\"><a href=\"mailto:info@voortraject.nl\" style=\"color:#152C4E;text-decoration:none;\">info@voortraject.nl</a></td></tr><tr><td width=\"62\" style=\"width:62px;font-size:12px;line-height:20px;color:#8A94A3;padding:0;\">Website</td><td style=\"font-size:13px;line-height:20px;padding:0;\"><a href=\"https://voortraject.nl\" style=\"color:#152C4E;text-decoration:none;\">voortraject.nl</a></td></tr></table></td></tr></table>";

// De check zonder adres, om door te sturen naar buren of familie. De utm-tags
// zijn dezelfde als op de site (zie src/components/subsidiecheck/delen.ts), zodat
// doorgestuurde bezoekers in GA4 onder Bron/Medium terugkomen in plaats van als
// direct verkeer.
const DEEL_URL = "https://voortraject.nl/subsidiecheck?utm_source=deel&utm_medium=mail";
// De check zelf, als de mail geen eigen lijst heeft en de bezoeker geen geldige
// link naar zijn overzicht meestuurde.
const CHECK_URL = "https://voortraject.nl/subsidiecheck";

// Alleen voor de mail-HTML hieronder: escapen hoort bij het renderen. Wat we in
// `leads_bewoners` opslaan blijft onbewerkt, precies wat de bezoeker typte.
export const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));

// ---- E-mail opbouwen ----

// "1 september 2026". Geeft niets terug bij onzin, bij een datum die al voorbij
// is of bij een datum meer dan een jaar weg: de client filtert al op "binnen
// drie maanden", en dit is het vangnet voor een oudere of andere aanroeper.
function einddatumTekst(iso: string | undefined): string {
  if (!iso) return "";
  const eind = new Date(iso);
  if (Number.isNaN(eind.getTime())) return "";
  const nu = Date.now();
  if (eind.getTime() <= nu || eind.getTime() > nu + 366 * 24 * 60 * 60 * 1000) return "";
  return new Intl.DateTimeFormat("nl-NL", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(
    eind,
  );
}

// Alleen de eerste zin van de omschrijving: de kaart moet in één oogopslag
// zeggen wat het is. De rest staat achter "Meer info".
const eersteZin = (s: string) => s.match(/^.*?[.!?](?=\s|$)/)?.[0] ?? s;

// Witte tekst op een donker vlak. In Gmail iOS (volledige omkering) blijft hij
// zo wit; elders doen de twee lagen niets.
const opDonker = (inhoud: string) => `<div class="gm-scherm"><div class="gm-verschil">${inhoud}</div></div>`;
const opDonkerInline = (inhoud: string) =>
  `<span class="gm-scherm"><span class="gm-verschil">${inhoud}</span></span>`;

const SCHADUW = "box-shadow:0 1px 2px rgba(21,44,78,0.06),0 12px 32px rgba(21,44,78,0.09);";
const NAVY = `bgcolor="${K.ink}" style="background-color:${K.ink};background-image:linear-gradient(160deg,${K.inkLicht} 0%,${K.ink} 100%);`;
const RUIMTE = (px: number) =>
  `<div style="height:${px}px;line-height:${px}px;font-size:0;mso-line-height-rule:exactly;">&nbsp;</div>`;

// Het ronde icoon rechtsboven, zoals in het CRM-dashboard.
const badge = (s: Soort, maat = 36) =>
  `<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td width="${maat}" height="${maat}" align="center" valign="middle" bgcolor="${s.kleur}" style="width:${maat}px;height:${maat}px;border-radius:50%;background-color:${s.kleur};background-image:linear-gradient(145deg,${s.licht} 0%,${s.kleur} 100%);box-shadow:0 4px 10px rgba(21,44,78,0.18);color:#FFFFFF;font-family:Arial,Helvetica,sans-serif;font-size:${Math.round(maat * 0.44)}px;font-weight:800;line-height:${maat}px;mso-line-height-rule:exactly;">${s.teken}</td></tr></table>`;

// Knoppen als tabelcel: Outlook geeft een <a> geen padding, een cel wel.
const okerKnop = (tekst: string, href: string) => `
  <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
    <td class="knop-cel" bgcolor="${K.oker}" style="border-radius:999px;background-color:${K.oker};background-image:linear-gradient(180deg,${K.okerLicht} 0%,${K.oker} 100%);box-shadow:0 8px 20px rgba(232,181,71,0.35);">
      <a href="${escapeHtml(href)}" class="knop" style="display:inline-block;padding:15px 26px;color:${K.ink};font-size:15px;font-weight:800;text-decoration:none;border-radius:999px;">${tekst}</a>
    </td>
  </tr></table>`;

const glasKnop = (href: string, icoon: string, tekst: string) => `
  <td class="knop-cel" bgcolor="#2A4569" style="border-radius:999px;background-color:#2A4569;background-image:linear-gradient(180deg,#2E4A70 0%,#263F62 100%);">
    <a href="${escapeHtml(href)}" class="knop" style="display:inline-block;padding:12px 18px;color:#FFFFFF;font-size:14px;font-weight:700;text-decoration:none;white-space:nowrap;border-radius:999px;"><img src="${icoon}" alt="" width="16" height="16" style="width:16px;height:16px;vertical-align:-3px;border:0;">&nbsp; ${opDonkerInline(tekst)}</a>
  </td>`;

function regelingKaart(r: Regeling): string {
  const s = soortVan(r);
  const bedrag = r.bedragIndicatie
    ? `<div style="margin-top:6px;font-size:24px;line-height:1.15;font-weight:800;color:${s.kleur};letter-spacing:-.01em;">${escapeHtml(r.bedragIndicatie)}</div>`
    : "";
  const omschrijving = r.omschrijving
    ? `<div style="margin-top:6px;font-size:14px;line-height:1.6;color:${K.zacht};">${escapeHtml(eersteZin(r.omschrijving))}</div>`
    : "";
  // Zelfde regel als op de kaart: zonder deze voorwaarde leest het bedrag als
  // een belofte (VVG € 17.000 geldt alleen in het NCG-programma).
  const alleenAls = r.alleenAls
    ? `<div style="margin-top:6px;font-size:14px;line-height:1.5;font-weight:700;color:${K.ink};">Alleen als ${escapeHtml(r.alleenAls)}</div>`
    : "";
  // De mail bewaart de bewoner, dus een deadline hoort er juist in, met de
  // datum voluit: een mail heeft geen uitklap.
  const einddatum = einddatumTekst(r.looptAfOp);
  const deadline = einddatum
    ? `<div style="margin-top:10px;font-size:13px;line-height:1.5;color:${K.ink};"><strong>Let op:</strong> aanvragen kan tot ${escapeHtml(einddatum)}.</div>`
    : "";
  // "Let op" komt letterlijk van de bron en staat op ongeveer één op de dertig
  // regelingen. Bij ISDE zegt hij dat je in Groningen en Noord-Drenthe beter de
  // Isolatieaanpak kunt nemen: precies ons werkgebied. Een wit vlak in de
  // getinte kaart, geen rood: het is een aanwijzing, geen fout.
  const letOp = r.letOp
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:14px;"><tr><td bgcolor="#FFFFFF" style="padding:13px 15px;background-color:#FFFFFF;border-radius:12px;font-size:13px;line-height:1.55;color:${K.tekst};"><strong style="color:${K.ink};">Let op:</strong> ${escapeHtml(r.letOp)}</td></tr></table>`
    : "";
  const meerInfo =
    r.bronUrl && /^https?:\/\//i.test(r.bronUrl)
      ? `<div style="margin-top:14px;"><a href="${escapeHtml(r.bronUrl)}" style="color:${K.ink};font-weight:700;font-size:13px;text-decoration:none;">Meer info &rarr;</a></div>`
      : "";

  return `<tr><td style="padding:0 0 16px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="${s.klasse}" bgcolor="${s.vlak}" style="background-color:${s.vlak};border-radius:20px;${SCHADUW}"><tr><td style="padding:22px 24px 20px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
        <td valign="top">
          <div style="font-size:12px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:${s.kleur};">${s.label}</div>
          ${bedrag}
        </td>
        <td valign="top" width="48" style="width:48px;padding-left:12px;">${badge(s)}</td>
      </tr></table>
      <div style="margin-top:12px;font-size:17px;font-weight:800;line-height:1.35;color:${K.ink};">${escapeHtml(r.titel ?? "Regeling")}</div>
      ${alleenAls}
      ${omschrijving}
      ${deadline}
      ${letOp}
      ${meerInfo}
    </td></tr></table>
  </td></tr>`;
}

// Eén teller zoals het CRM-dashboard: kop, rond icoon, groot getal in de kleur
// van de soort. Elke teller in een eigen cel met binnenruimte: Word (Outlook)
// negeert een lege tussenkolom.
function teller(s: Soort, aantal: number, woord: string, uitleg: string, plek: "links" | "rechts" | "alleen"): string {
  const ruimte = plek === "links" ? "padding-right:7px;" : plek === "rechts" ? "padding-left:7px;" : "";
  const breedte = plek === "alleen" ? "100%" : "50%";
  return `
  <td width="${breedte}" valign="top" style="width:${breedte};${ruimte}">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td valign="top" class="${s.klasse}" bgcolor="${s.vlak}" style="background-color:${s.vlak};border-radius:20px;${SCHADUW}padding:18px 18px 20px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
        <td valign="top" style="font-size:14px;font-weight:800;color:${K.ink};">${woord}</td>
        <td valign="top" width="32" style="width:32px;">${badge(s, 30)}</td>
      </tr></table>
      <div style="margin-top:6px;font-size:40px;line-height:1;font-weight:800;color:${s.kleur};letter-spacing:-.02em;">${aantal}</div>
      <div style="margin-top:8px;font-size:13px;line-height:1.45;color:${K.zacht};">${uitleg}</div>
    </td></tr></table>
  </td>`;
}

function tellers(subsidies: number, leningen: number): string {
  if (subsidies === 0 && leningen === 0) return "";
  // Een lege teller laten we weg; de andere neemt dan de hele breedte.
  const beide = subsidies > 0 && leningen > 0;
  const rij =
    (subsidies > 0
      ? teller(SOORT.subsidie, subsidies, "Subsidies", "Geld dat je niet terugbetaalt", beide ? "links" : "alleen")
      : "") +
    (leningen > 0
      ? teller(SOORT.lening, leningen, "Leningen", "Geld dat je leent en terugbetaalt", beide ? "rechts" : "alleen")
      : "");
  return `<tr><td style="padding:16px 0 0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>${rij}</tr></table></td></tr>`;
}

// De uitspraak over de woningvoorraad bij dit bouwjaar: dezelfde tekst als "de
// eerste stap" op het resultaat. Zie src/components/subsidiecheck/eersteStapTekst.ts
// voor de bronnen (Milieu Centraal) en de grenzen 1975/1992. Bewust gedupliceerd:
// een edge function draait op Deno en kan niets uit src/ importeren. Wijzigt de
// tekst daar, dan hier mee; src/test/eersteStap.test.ts bewaakt dat.
//
// De regel die alles stuurt: nooit een uitspraak over dít huis, alleen over
// woningen uit die bouwperiode. Wat er sindsdien is gedaan weten we niet.
function eersteStapZin(bouwjaar: number | null): string | null {
  if (!bouwjaar || bouwjaar < 1500 || bouwjaar > new Date().getFullYear()) return null;
  const opening = `Jouw huis is uit ${bouwjaar}.`;
  if (bouwjaar >= 1992) {
    return `${opening} Woningen uit die tijd kregen bij de bouw al redelijke isolatie mee. De winst zit dan meestal niet in de schil maar in verwarming en opwek.`;
  }
  const kern =
    bouwjaar >= 1975
      ? "Woningen uit die jaren kregen bij de bouw een dunne laag isolatie, naar de maatstaven van nu bescheiden."
      : "Woningen uit die tijd kregen bij de bouw geen isolatie mee.";
  return `${opening} ${kern} Wat er daarna is gedaan verschilt per woning.`;
}

const meervoud = (n: number, een: string, meer: string) => `${n} ${n === 1 ? een : meer}`;
const opsomming = (delen: string[]) =>
  delen.length <= 1 ? (delen[0] ?? "") : `${delen.slice(0, -1).join(", ")} en ${delen[delen.length - 1]}`;

function bouwEmailHtml(opts: {
  /** Volledige aanhefregel zonder komma, bijv. "Hallo Jan" of "Beste heer/mevrouw De Vries". */
  aanhef: string;
  adresregel: string;
  /**
   * Uit onze eigen bron. null = die bron antwoordde niet (of er was geen geldig
   * bewonertype): dan geen lijst, alleen een verwijzing naar het overzicht online.
   */
  regelingen: Regeling[] | null;
  overzichtUrl?: string;
  /** Bouwjaar uit de BAG; ontbreekt het, dan blijft de woningvoorraad-zin weg. */
  bouwjaar?: number | null;
  /** Onze echte Google-score; weglaten = geen score in de mail. */
  beoordeling?: { score: string; aantal: number | null };
}): string {
  const { aanhef, adresregel, overzichtUrl, bouwjaar, beoordeling } = opts;
  const metLijst = opts.regelingen !== null;
  const regelingen = opts.regelingen ?? [];
  const leningen = regelingen.filter((r) => r.type === "lening").length;
  const subsidies = regelingen.length - leningen;
  const bouwjaarZin = eersteStapZin(bouwjaar ?? null);

  // Binnen een niveaugroep eerst de subsidies, dan de leningen (stabiele sort,
  // dus bronvolgorde binnen één soort blijft). Zelfde ordening als de website.
  const typeRang = (t?: string) => (t === "lening" ? 1 : 0);
  const groepen = NIVEAU_VOLGORDE.map((niveau) => ({
    niveau,
    items: regelingen
      .filter((r) => (r.niveau ?? "overig") === niveau)
      .sort((a, b) => typeRang(a.type) - typeRang(b.type)),
  })).filter((g) => g.items.length > 0);

  // De verborgen voorbeeldregel die de inbox onder het onderwerp toont. Zonder
  // deze regel pakt de inbox de eerste tekst uit de mail, en dat is de alt-tekst
  // van het logo. Bij geen lijst valt hij terug op een gewone zin.
  const voorbeeldregel = metLijst
    ? `${opsomming(
        [
          subsidies > 0 ? meervoud(subsidies, "subsidie", "subsidies") : "",
          leningen > 0 ? meervoud(leningen, "lening", "leningen") : "",
        ].filter(Boolean),
      )} voor ${adresregel}, van ${opsomming(groepen.map((g) => NIVEAU_KORT[g.niveau]))}.`
    : `Je subsidieoverzicht voor ${adresregel} staat online voor je klaar.`;

  // De ene oker knop. Wie hem aanklikt, vraagt ons uit te zoeken wat er voor
  // dit huis echt in zit. Tot de ondertekende link naar een bevestigingspagina
  // er is (die legt de aanvraag pas vast als de pagina echt in een browser
  // opent, want virusscanners openen links in mails vanzelf), opent hij een
  // kant-en-klare mail aan het team: één tik op versturen en het verzoek is
  // binnen, met het adres in het onderwerp. Webmail (Gmail, Outlook.com) opent
  // zo'n link in een eigen opstelvenster.
  const aanvraagLink = `mailto:${TEAM_MAIL}?subject=${encodeURIComponent(
    `Laat gratis uitzoeken wat ik krijg: ${adresregel}`,
  )}&body=${encodeURIComponent(
    `Hallo,\n\nIk heb het subsidieoverzicht voor ${adresregel} ontvangen. Willen jullie voor me uitzoeken wat er voor mijn huis echt in zit?\n\n`,
  )}`;
  // WhatsApp met het adres al in het bericht: de ontvanger hoeft alleen nog zijn
  // vraag te typen, en wij weten meteen waar het over gaat.
  const waLink = `https://wa.me/${WHATSAPP_NUMMER}?text=${encodeURIComponent(
    `Hallo, ik heb het subsidieoverzicht voor ${adresregel} ontvangen. Ik heb daar een vraag over:`,
  )}`;
  const onlineLink = overzichtUrl ?? CHECK_URL;

  const kop = metLijst
    ? `${opDonker(`<div style="font-size:14px;font-weight:600;color:#C9D2E0;">Jouw subsidieoverzicht voor ${escapeHtml(adresregel)}</div>
      <div style="margin-top:8px;font-size:44px;line-height:1.05;font-weight:800;color:#FFFFFF;letter-spacing:-.02em;">${meervoud(regelingen.length, "regeling", "regelingen")}</div>
      <div style="margin-top:6px;font-size:17px;line-height:1.5;color:#E6EBF2;">voor de verduurzaming van je woning.</div>`)}
      ${RUIMTE(26)}
      ${okerKnop("Laat gratis uitzoeken wat ik krijg", aanvraagLink)}
      ${opDonker(`<div style="margin-top:12px;font-size:13px;line-height:1.5;color:#C9D2E0;">Dit overzicht is een indicatie. We zoeken voor je uit wat er voor jouw huis echt in zit. Je zit nergens aan vast.</div>`)}`
    : // Zonder lijst is het overzicht online de inhoud van de mail, en dus de
      // oker knop. Geen geldige overzichtUrl? Dan de check zelf.
      `${opDonker(`<div style="font-size:14px;font-weight:600;color:#C9D2E0;">Jouw subsidieoverzicht voor ${escapeHtml(adresregel)}</div>
      <div style="margin-top:8px;font-size:34px;line-height:1.1;font-weight:800;color:#FFFFFF;letter-spacing:-.02em;">Je overzicht staat online voor je klaar</div>
      <div style="margin-top:8px;font-size:16px;line-height:1.5;color:#E6EBF2;">Daar zie je per regeling wat je kunt krijgen en hoe je het aanvraagt.</div>`)}
      ${RUIMTE(26)}
      ${okerKnop("Bekijk je overzicht online", onlineLink)}`;

  const intro = metLijst
    ? `<tr><td style="padding:32px 4px 0;font-size:16px;line-height:1.65;color:${K.tekst};">
      <p style="margin:0 0 14px;">${escapeHtml(aanhef)},</p>
      <p style="margin:0;">${bouwjaarZin ? escapeHtml(bouwjaarZin) : "Hieronder staan alle regelingen die we voor je woning vonden."}</p>
      ${groepen.length > 1 ? `<p style="margin:16px 0 0;font-size:14px;line-height:1.6;color:${K.zacht};">${WAAROM_GROEPEN}</p>` : ""}
    </td></tr>`
    : `<tr><td style="padding:32px 4px 0;font-size:16px;line-height:1.65;color:${K.tekst};">
      <p style="margin:0 0 14px;">${escapeHtml(aanhef)},</p>
      <p style="margin:0;">${bouwjaarZin ? escapeHtml(bouwjaarZin) : "Fijn dat je de subsidiecheck hebt gedaan."}</p>
    </td></tr>`;

  const lijst = groepen
    .map(
      (g) =>
        `<tr><td style="padding:30px 4px 14px;font-size:17px;font-weight:800;color:${K.ink};">${NIVEAU_LABELS[g.niveau]} <span style="font-weight:600;color:${K.zacht};">&nbsp;${g.items.length}</span></td></tr>` +
        g.items.map(regelingKaart).join(""),
    )
    .join("");

  // Een geldige link naar het eigen overzicht: om later terug te kijken of door
  // te sturen. Klein, onder de lijst; de oker knop blijft het enige dat opvalt.
  const online =
    metLijst && overzichtUrl
      ? `<tr><td align="center" style="padding:6px 4px 0;font-size:14px;"><a href="${escapeHtml(overzichtUrl)}" style="color:${K.ink};font-weight:700;text-decoration:none;">Bekijk of deel je overzicht online &rarr;</a></td></tr>`
      : "";

  const score = beoordeling
    ? // "op Google" wordt het Google-logo zelf. Blokkeert de mail-app
      // afbeeldingen (Outlook doet dat standaard), dan valt de alt-tekst
      // "Google" op precies dezelfde plek in. Bewust zonder aantal reviews.
      `<div style="margin-top:18px;font-size:13px;color:#C9D2E0;"><span style="color:${K.oker};">&#9733;&#9733;&#9733;&#9733;&#9733;</span> ${opDonkerInline(`<strong style="color:#FFFFFF;">${escapeHtml(beoordeling.score)}</strong> op`)} <img src="${BEELD.google}" alt="Google" width="14" height="14" style="width:14px;height:14px;vertical-align:-2px;border:0;"></div>`
    : "";

  return `<!doctype html>
<html lang="nl" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><meta name="x-apple-disable-message-reformatting"><meta name="color-scheme" content="light only"><meta name="supported-color-schemes" content="light"><title>Jouw subsidieoverzicht</title>
<!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
<style>table,td,div,p,a,span,strong{font-family:Arial,Helvetica,sans-serif !important;}.knop{padding:0 !important;}.knop-cel{padding:14px 24px !important;}</style><![endif]-->
<style>
  :root { color-scheme: light only; supported-color-schemes: light; }
  /* Verloop op lichte kaarten, behalve in Gmail (zie boven in overzichtMail.ts). */
  .vl-sub { background-image: linear-gradient(180deg, #E3F1EA 0%, #F6FAF8 100%) !important; }
  .vl-len { background-image: linear-gradient(180deg, #E4EDF8 0%, #F6F9FD 100%) !important; }
  u + .body .vl-sub, u + .body .vl-len { background-image: none !important; }
  /* Gmail iOS keert ook witte tekst om; deze twee lagen zetten hem terug. */
  u + .body .gm-scherm { background: #000000; mix-blend-mode: screen; }
  u + .body .gm-verschil { background: #000000; mix-blend-mode: difference; }
  .knop { transition: transform .2s cubic-bezier(.34,1.56,.64,1); }
  .knop:hover { transform: translateY(-1px); }
  @media (prefers-reduced-motion: reduce) { .knop { transition: none; } }
</style></head>
<body class="body" style="margin:0;padding:0;background-color:${K.offwhite};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all;">${escapeHtml(voorbeeldregel)}&#8199;&#65279;&#847;&#8199;&#65279;&#847;&#8199;&#65279;&#847;&#8199;&#65279;&#847;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${K.offwhite}" style="background-color:${K.offwhite};font-family:${FONT};"><tr><td align="center" style="padding:24px 12px 8px;">
  <!--[if mso]><table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0"><tr><td><![endif]-->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;">

    <tr><td ${NAVY}border-radius:24px;box-shadow:0 18px 40px rgba(21,44,78,0.28);padding:32px 30px 34px;">
      <img src="${BEELD.logoWit}" alt="voortraject" width="144" height="40" style="display:block;width:144px;height:40px;border:0;color:#FFFFFF;font-size:22px;font-weight:700;">
      ${RUIMTE(36)}
      ${kop}
    </td></tr>

    ${metLijst ? tellers(subsidies, leningen) : ""}
    ${intro}
    ${metLijst ? `<tr><td><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${lijst}</table></td></tr>` : ""}
    ${online}

    <!-- Voor wie liever zelf contact opneemt. Eén woord per knop plus een icoon,
         met nowrap: in de mail-app op een telefoon is de kolom smal, en langere
         labels braken eerder over twee of drie regels. -->
    <tr><td style="padding:18px 0 0;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td ${NAVY}border-radius:24px;box-shadow:0 18px 40px rgba(21,44,78,0.24);padding:30px 28px;">
        ${opDonker(`<div style="font-size:20px;font-weight:800;color:#FFFFFF;line-height:1.3;">Liever zelf contact?</div>
        <div style="margin-top:8px;font-size:15px;line-height:1.6;color:#E6EBF2;">Stuur ons een WhatsApp, bel ons of antwoord op deze mail. Een adviseur kijkt gratis met je mee welke regelingen je voor jouw woning kunt combineren.</div>`)}
        ${RUIMTE(20)}
        <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
          ${glasKnop(waLink, BEELD.whatsapp, "WhatsApp")}<td width="10" style="width:10px;font-size:0;">&nbsp;</td>${glasKnop(TELEFOON_LINK, BEELD.telefoon, "Bel ons")}
        </tr></table>
        ${score}
      </td></tr></table>
    </td></tr>

    <!-- Doorgeven aan de buren. De mail is het enige stuk van de check dat
         buiten het scherm van de bezoeker voortleeft: hij wordt bewaard en
         doorgestuurd. Het extra verzoek staat onderaan, onder een kort kopje. -->
    <tr><td style="padding:36px 4px 0;">
      <div style="font-size:15px;font-weight:800;color:${K.ink};">Ken je iemand die ook wil verduurzamen?</div>
      <div style="margin-top:4px;font-size:14px;line-height:1.6;color:${K.zacht};">Huizen uit dezelfde tijd komen vaak voor dezelfde subsidie in aanmerking. Stuur ze <a href="${DEEL_URL}" style="color:${K.ink};font-weight:700;">de check voor hun eigen adres</a>.</div>
    </td></tr>

    <tr><td style="padding:40px 4px 0;">
      <div style="font-size:15px;color:${K.tekst};margin:0 0 22px;">Met vriendelijke groet,</div>
      ${HANDTEKENING_ALGEMEEN_HTML}
    </td></tr>

    <tr><td style="padding:24px 4px 32px;">
      <div style="font-size:12px;line-height:1.6;color:${K.zacht};">Dit overzicht is een indicatie op basis van de Energiesubsidiewijzer van Milieu Centraal en jouw postcode. Aan bedragen en voorwaarden kun je geen rechten ontlenen.</div>
    </td></tr>

  </table>
  <!--[if mso]></td></tr></table><![endif]-->
</td></tr></table>
</body></html>`;
}

// ---- Wat er in de mail aan de bezoeker mag ----

/** Straat en plaats uit de BAG, opgezocht bij postcode en huisnummer. */
export type BagAdres = { straat: string; plaats: string };

// Wat we van de request in de adresregel toelaten. Strenger dan de grenzen voor
// de lead (ADRES_MAX in index.ts): hier gaat het om tekst in een mail aan een
// vreemd adres, en een huisnummer of toevoeging heeft nooit een punt of spatie.
const POSTCODE_RE = /^[1-9][0-9]{3}[A-Z]{2}$/;
const HUISNUMMER_RE = /^[1-9][0-9]{0,4}$/;
const TOEVOEGING_RE = /^[A-Za-z0-9]{1,4}$/;
// Ook wat de BAG teruggeeft, controleren we: straat- en plaatsnamen bestaan uit
// letters, cijfers, spaties en een handvol leestekens. Zo kan zelfs een fout in
// die bron geen link in de mail zetten.
const BAG_NAAM_RE = /^[\p{L}0-9 .'()/-]{1,80}$/u;

/** Huisnummer en toevoeging uit de request, alleen als ze er streng uitzien. */
export function schoonHuisnummer(huisnummer: unknown, toevoeging: unknown): { nummer: string; toevoeging: string } | null {
  const nummer = typeof huisnummer === "string" ? huisnummer.trim() : "";
  if (!HUISNUMMER_RE.test(nummer)) return null;
  const toev = typeof toevoeging === "string" ? toevoeging.trim() : "";
  return { nummer, toevoeging: TOEVOEGING_RE.test(toev) ? toev : "" };
}

/**
 * De adresregel in de mail aan de bezoeker. Nooit de straat en plaats uit de
 * request: die komen uit de BAG, of anders staat er "postcode …, huisnummer …".
 */
export function mailAdresregel(postcode: string, huis: { nummer: string; toevoeging: string }, bag: BagAdres | null): string {
  const nummer = `${huis.nummer}${huis.toevoeging ? ` ${huis.toevoeging}` : ""}`;
  if (bag && BAG_NAAM_RE.test(bag.straat) && BAG_NAAM_RE.test(bag.plaats)) {
    return `${bag.straat} ${nummer}, ${bag.plaats}`;
  }
  return `postcode ${postcode.slice(0, 4)} ${postcode.slice(4)}, huisnummer ${nummer}`;
}

/**
 * Stelt de overzichtsmail aan de bezoeker samen uit de rauwe request.
 *
 * Bewust krijgt deze functie de hele request en kiest ze zelf wat ze gebruikt:
 * dan is hier, en in de test ervan, in één oogopslag te zien dat er van de
 * bezoeker alleen postcode, huisnummer, toevoeging, bewonertype, maatregelen en
 * een link naar onze eigen check doorkomen. De meegestuurde `regelingen` en
 * `adres` worden niet gelezen. Geen geldig bewonertype, of geen antwoord van onze
 * bron: dan een mail zonder lijst, met alleen de link naar het overzicht online.
 *
 * `aanhef` komt van de handler, uit naamvelden die alleen letters, spaties,
 * apostrof en streepje toelaten (NAME_RE): daar past geen domeinnaam in.
 */
export async function maakOverzichtMail(args: {
  payload: {
    input?: { postcode?: unknown; huisnummer?: unknown; toevoeging?: unknown; bewonertype?: unknown; maatregelen?: unknown };
    overzichtUrl?: unknown;
  };
  aanhef: string;
  bouwjaar?: number | null;
  beoordeling?: { score: string; aantal: number | null };
  haalRegelingen: (postcode: string, filterQuery: string) => Promise<Regeling[] | null>;
  haalBagAdres: (postcode: string, huisnummer: string) => Promise<BagAdres | null>;
}): Promise<{ onderwerp: string; html: string; metLijst: boolean } | null> {
  const input = args.payload.input ?? {};
  const postcode = typeof input.postcode === "string" ? input.postcode.replace(/\s+/g, "").toUpperCase() : "";
  const huis = schoonHuisnummer(input.huisnummer, input.toevoeging);
  if (!POSTCODE_RE.test(postcode) || !huis) return null;

  const bewonertype = typeof input.bewonertype === "string" ? input.bewonertype : null;
  const maatregelen = Array.isArray(input.maatregelen)
    ? input.maatregelen.filter((m): m is string => typeof m === "string")
    : [];
  const filterQuery = bouwEswFilterQuery(bewonertype, maatregelen);

  const [regelingen, bag] = await Promise.all([
    filterQuery ? args.haalRegelingen(postcode, filterQuery) : Promise.resolve(null),
    args.haalBagAdres(postcode, huis.nummer),
  ]);

  const html = bouwEmailHtml({
    aanhef: args.aanhef,
    adresregel: mailAdresregel(postcode, huis, bag),
    regelingen,
    overzichtUrl: schoonOverzichtUrl(args.payload.overzichtUrl),
    bouwjaar: args.bouwjaar,
    beoordeling: args.beoordeling,
  });
  const onderwerp = regelingen
    ? `Je subsidieoverzicht: ${regelingen.length} ${regelingen.length === 1 ? "regeling" : "regelingen"} voor je woning`
    : "Je subsidieoverzicht voor je woning";
  return { onderwerp, html, metLijst: regelingen !== null };
}
