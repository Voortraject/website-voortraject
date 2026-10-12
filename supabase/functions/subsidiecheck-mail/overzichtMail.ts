// De overzichtsmail aan de bezoeker, als puur bestand naast de function zodat
// vitest hem echt kan opbouwen (src/test/subsidiecheckMailBeveiliging.test.ts).
// Verhuisd uit index.ts in oktober 2026; de opmaak zelf is ongewijzigd.
//
// Harde regel sinds de Spamhaus-listing van oktober 2026: in deze mail komt
// géén tekst uit de request. De regelingen komen uit onze eigen bron, de
// adresregel uit postcode en huisnummer (streng gevalideerd) of uit de BAG, en
// de aanhef uit een voornaam die alleen letters mag bevatten. Zie
// tasks/formulieren-misbruik-2026-10.md.

import { bouwEswFilterQuery, schoonOverzichtUrl, type MailRegeling } from "./beveiliging.ts";

type Regeling = MailRegeling;

// Huisstijl (institutional B2B). E-mail kan geen CSS-variabelen/Tailwind, dus
// inline hex uit de gedocumenteerde palette (uitzondering op de token-regel).
const KLEUR = {
  primary: "#152C4E",
  accent: "#E8B547",
  achtergrond: "#FBFAF7",
  kaart: "#FFFFFF",
  border: "#E5E7EB",
  muted: "#6B7280",
  // Het zandvlak uit de huisstijl (--secondary). Voor de enkele "Let op" die de
  // bron meestuurt: opvallend genoeg om te lezen, niet rood, want het is een
  // aanwijzing en geen fout. Mail kan geen transparantie, dus de volle tint.
  zacht: "#F0E4D0",
};

const TELEFOON = "050 211 26 89";
const TELEFOON_LINK = "tel:0502112689";
// Zelfde nummer als de knop op de site (src/lib/whatsapp.ts): zonder + en zonder 0.
const WHATSAPP_NUMMER = "31502112689";
const FONT_STACK = "'Inter',Arial,sans-serif";
// Kleur per TYPE — het beslissende onderscheid: subsidie = groen (geld dat je
// niet terugbetaalt), lening = staalblauw (geld dat je leent). Bewust géén
// rood/oranje: dat leest als "slecht" tegenover groen, terwijl een lening ook
// prima kan zijn. Blauw naast groen leest als twee neutrale categorieën en is
// de conventiekleur voor financiering. Dit is de enige kleurtaal in de lijst;
// het niveau tonen we als tekstkop, niet als kleur, zodat het rustig blijft.
const SUBSIDIE_KLEUR = "#2E7D5B";
const LENING_KLEUR = "#3A6EA5";
// Heel lichte kaart-achtergrond per type (subtiele tint, versterkt het signaal).
const SUBSIDIE_VLAK = "#F0F6F4";
const LENING_VLAK = "#EEF3F9";

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

// Wit-transparant logo (voor de navy header). Staat sinds 24-08-2026 in
// `public/mail/`, net als de iconen hieronder, en niet meer in de Supabase-bucket
// `logos`. Die bucket-URL kwam binnen met Cache-Control: no-cache, dus Gmail's
// afbeeldingsproxy moest bij elke keer openen opnieuw de supabase.co-gateway
// raken, en een hernoeming in de bucket brak direct live mail. Dat is twee keer
// gebeurd. Wijzig je het logo, geef het dan een NIEUWE bestandsnaam en pas ook
// de <img>-tags in de n8n-mailworkflows van het CRM aan.
const LOGO_URL = "https://voortraject.nl/mail/voortraject-logo-wit.png";

// De algemene mailhandtekening van Voortraject, onder de groet in plaats van de regel
// "Team Voortraject". KOPIE van handtekeningAlgemeenHtml() in src/lib/mailHandtekening.ts van
// de CRM-repo; daar staat hij ook in elke n8n-mail. Verandert hij daar, dan hier mee.
// Inline stijlen en vaste kleuren: mailclients strippen een <style>-blok en kennen geen tokens.
const HANDTEKENING_ALGEMEEN_HTML = "<table cellpadding=\"0\" cellspacing=\"0\" border=\"0\" style=\"border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;color:#152C4E;\"><tr><td width=\"170\" align=\"center\" style=\"width:170px;vertical-align:middle;padding:0 22px 0 0;\"><a href=\"https://voortraject.nl\" style=\"display:block;text-decoration:none;\"><img src=\"https://voortraject.nl/mail/voortraject-logo-blauw.png\" width=\"170\" height=\"45\" alt=\"Voortraject\" style=\"display:block;width:170px;height:45px;border:0;margin:0 auto;\"></a></td><td style=\"vertical-align:middle;padding:4px 0 4px 22px;border-left:2px solid #E8B547;\"><table cellpadding=\"0\" cellspacing=\"0\" border=\"0\" style=\"border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;\"><tr><td colspan=\"2\" style=\"font-size:17px;line-height:22px;font-weight:bold;color:#152C4E;padding:0;\">Team Voortraject</td></tr><tr><td colspan=\"2\" style=\"font-size:13px;line-height:18px;color:#5C6B80;padding:0 0 12px 0;\">Gratis advies over verduurzamen en subsidies</td></tr><tr><td width=\"62\" style=\"width:62px;font-size:12px;line-height:20px;color:#8A94A3;padding:0;\">Telefoon</td><td style=\"font-size:13px;line-height:20px;padding:0;\"><a href=\"tel:+31502112689\" style=\"color:#152C4E;text-decoration:none;\">050 211 26 89</a></td></tr><tr><td width=\"62\" style=\"width:62px;font-size:12px;line-height:20px;color:#8A94A3;padding:0;\">E-mail</td><td style=\"font-size:13px;line-height:20px;padding:0;\"><a href=\"mailto:info@voortraject.nl\" style=\"color:#152C4E;text-decoration:none;\">info@voortraject.nl</a></td></tr><tr><td width=\"62\" style=\"width:62px;font-size:12px;line-height:20px;color:#8A94A3;padding:0;\">Website</td><td style=\"font-size:13px;line-height:20px;padding:0;\"><a href=\"https://voortraject.nl\" style=\"color:#152C4E;text-decoration:none;\">voortraject.nl</a></td></tr></table></td></tr></table>";

// Iconen in de knoppen en bij de Google-score. Deze staan wél op de website
// (`public/mail/`, meegebouwd door Cloudflare Pages) en niet in de storage-bucket
// hierboven: dan horen ze bij de code die ze gebruikt en gaan ze mee met dezelfde
// PR. Ze zijn 96px voor schermen met een hoge pixeldichtheid en worden op 14-16px
// getoond. LET OP: ze bestaan pas op het moment dat de site gedeployed is —
// deploy de site dus vóór deze function, anders staat er in de mail even een
// gebroken plaatje (de alt-tekst vangt dat op).
const ICOON = {
  whatsapp: "https://voortraject.nl/mail/wa.png",
  telefoon: "https://voortraject.nl/mail/tel.png",
  google: "https://voortraject.nl/mail/google.png",
};

// De check zonder adres, om door te sturen naar buren of familie. De utm-tags
// zijn dezelfde als op de site (zie src/components/subsidiecheck/delen.ts), zodat
// doorgestuurde bezoekers in GA4 onder Bron/Medium terugkomen in plaats van als
// direct verkeer.
const DEEL_URL = "https://voortraject.nl/subsidiecheck?utm_source=deel&utm_medium=mail";
// De check zelf, als de mail geen eigen lijst heeft en de bezoeker geen geldige
// link naar zijn overzicht meestuurde.
const CHECK_URL = "https://voortraject.nl/subsidiecheck";

// (Niveau-kleuren zijn bewust verwijderd: kleur = alleen het type, zie hierboven.)
const TYPE_LABELS: Record<string, string> = { subsidie: "Subsidie", lening: "Lening" };

// Alleen voor de mail-HTML hieronder: escapen hoort bij het renderen. Wat we in
// `leads_bewoners` opslaan blijft onbewerkt — precies wat de bezoeker typte.
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

// Elke melding in de mail heeft dezelfde vorm als op de site: vetgedrukt
// "Let op:" en dan de mededeling. Zie het Melding-component in SubsidieCard.tsx.
function meldingRegel(tekst: string): string {
  return `<div style="margin-top:8px;font-size:13px;line-height:1.5;color:${KLEUR.primary};"><strong>Let op:</strong> ${tekst}</div>`;
}

function regelingRij(r: Regeling): string {
  const typeKleur = r.type === "lening" ? LENING_KLEUR : SUBSIDIE_KLEUR;
  const typeVlak = r.type === "lening" ? LENING_VLAK : SUBSIDIE_VLAK;
  // `r.type` kwam vroeger uit de payload (nu uit onze eigen bron), en een gewone
  // objectlookup vindt ook geërfde sleutels: `type: "toString"` gaf de
  // prototypefunctie terug in plaats van undefined, waarna de `??`-terugval niet
  // aansloeg en de functiebron ongeëscaped in de mail belandde. Daarom alleen
  // eigen sleutels. (hasOwnProperty.call in plaats van Object.hasOwn: dit bestand
  // valt ook onder de typecheck van de site, die es2022 niet kent.)
  const typeLabel =
    (r.type && Object.prototype.hasOwnProperty.call(TYPE_LABELS, r.type) ? TYPE_LABELS[r.type] : null) ?? "Subsidie";
  const titel = escapeHtml(r.titel ?? "Regeling");
  const bedrag = r.bedragIndicatie
    ? `<span style="white-space:nowrap;font-weight:700;font-size:15px;color:${KLEUR.primary};">${escapeHtml(r.bedragIndicatie)}</span>`
    : "";
  const omschrijving = r.omschrijving
    ? `<div style="margin-top:4px;font-size:14px;line-height:1.5;color:${KLEUR.muted};">${escapeHtml(r.omschrijving)}</div>`
    : "";
  // "Let op" komt letterlijk van de bron en staat op ongeveer één op de dertig
  // regelingen. Bij ISDE zegt hij dat je in Groningen en Noord-Drenthe beter de
  // Isolatieaanpak kunt nemen: precies ons werkgebied, dus die hoort net zo goed
  // in de mail als op de site. Zandkleurig vlak, geen rood: het is een
  // aanwijzing, geen fout.
  const letOp = r.letOp
    ? `<div style="margin-top:10px;padding:10px 12px;background:${KLEUR.zacht};border-radius:6px;font-size:13px;line-height:1.5;color:${KLEUR.muted};"><strong style="color:${KLEUR.primary};">Let op:</strong> ${escapeHtml(r.letOp)}</div>`
    : "";
  // De mail bewaart de bewoner, dus een deadline hoort er juist in. Hier wél de
  // datum voluit en niet, zoals op de kaart, een verwijzing naar de uitklap: een
  // mail heeft geen uitklap.
  const einddatum = einddatumTekst(r.looptAfOp);
  const deadline = einddatum ? meldingRegel(`aanvragen kan tot ${escapeHtml(einddatum)}.`) : "";
  const bron =
    r.bronUrl && /^https?:\/\//i.test(r.bronUrl)
      ? `<div style="margin-top:8px;font-size:13px;"><a href="${escapeHtml(r.bronUrl)}" style="color:${KLEUR.primary};font-weight:600;">Meer info &rarr;</a></div>`
      : "";

  // Eén kleur per kaart, bepaald door het TYPE (groen = subsidie, terracotta =
  // lening): de gevulde pill én de 4px linkerrand. Verder neutraal (witte kaart,
  // grijze rand), zodat de lijst rustig blijft.
  return `
    <tr>
      <td style="padding:14px 16px;border:1px solid ${KLEUR.border};border-left:4px solid ${typeKleur};border-radius:8px;background:${typeVlak};">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
          <td style="vertical-align:top;">
            <span style="display:inline-block;padding:2px 9px;border-radius:999px;background:${typeKleur};color:#ffffff;font-size:10px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;">${typeLabel}</span>
          </td>
          <td style="vertical-align:top;text-align:right;padding-left:12px;">${bedrag}</td>
        </tr></table>
        <div style="margin-top:6px;font-size:16px;font-weight:700;line-height:1.35;color:${KLEUR.primary};">${titel}</div>
        ${omschrijving}
        ${deadline}
        ${letOp}
        ${bron}
      </td>
    </tr>
    <tr><td style="height:10px;line-height:10px;font-size:0;">&nbsp;</td></tr>`;
}

function groepBlok(niveau: Niveau, regelingen: Regeling[]): string {
  if (regelingen.length === 0) return "";
  const rijen = regelingen.map(regelingRij).join("");
  return `
    <tr><td style="padding:18px 0 10px;">
      <span style="font-size:16px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:${KLEUR.primary};">${NIVEAU_LABELS[niveau]}</span>
      <span style="font-size:14px;color:${KLEUR.muted};"> &middot; ${regelingen.length}</span>
    </td></tr>
    <tr><td>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rijen}</table>
    </td></tr>`;
}

// Eén legenda-item: gekleurde stip + aantal + label ("● 6 subsidies").
function legendaItem(aantal: number, label: string, kleur: string): string {
  return `<span style="font-size:14px;color:${KLEUR.primary};font-weight:600;white-space:nowrap;"><span style="display:inline-block;width:9px;height:9px;border-radius:50%;background:${kleur};margin-right:7px;vertical-align:middle;"></span>${aantal} ${label}</span>`;
}

// Hero-samenvatting bovenaan (de "piek"), in één omkaderd kaartje zodat het als
// één rustig object leest i.p.v. los tekst op de witte achtergrond. Groot totaal
// + een verhoudingsbalk die de mix subsidies/leningen in één oogopslag toont
// (geen los optelwerk), met een legenda eronder. De per-niveau telling laten we
// hier weg — die komt direct eronder al terug als groepskoppen (dubbel =
// rommelig). Staat vóór de lijst, zodat de kernboodschap altijd zichtbaar is.
function bouwSamenvattingBlok(regelingen: Regeling[]): string {
  const totaal = regelingen.length;
  const leningen = regelingen.filter((r) => r.type === "lening").length;
  const subsidies = totaal - leningen;
  const meervoud = totaal === 1 ? "regeling" : "regelingen";

  // Verhoudingsbalk: groen segment (subsidies) + blauw segment (leningen). Het
  // groene deel rondt af, het blauwe krijgt de rest zodat de som exact 100% is.
  const groenPct = totaal > 0 ? Math.round((subsidies / totaal) * 100) : 0;
  const blauwPct = 100 - groenPct;
  const segment = (pct: number, kleur: string) =>
    pct > 0 ? `<td width="${pct}%" style="background:${kleur};height:12px;line-height:12px;font-size:0;">&nbsp;</td>` : "";
  const balk = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-radius:7px;overflow:hidden;">
      <tr>${segment(groenPct, SUBSIDIE_KLEUR)}${segment(blauwPct, LENING_KLEUR)}</tr>
    </table>`;

  // Legenda: alleen de types die er zijn.
  const legenda = [
    subsidies > 0 ? legendaItem(subsidies, subsidies === 1 ? "subsidie" : "subsidies", SUBSIDIE_KLEUR) : "",
    leningen > 0 ? legendaItem(leningen, leningen === 1 ? "lening" : "leningen", LENING_KLEUR) : "",
  ]
    .filter(Boolean)
    .join(`<span style="display:inline-block;width:18px;"></span>`);

  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 22px;background:${KLEUR.achtergrond};border:1px solid #EAE4D8;border-radius:14px;overflow:hidden;">
      <tr><td style="height:4px;background:${KLEUR.accent};line-height:4px;font-size:0;">&nbsp;</td></tr>
      <tr><td style="padding:22px 24px;">
        <div style="font-size:13px;font-weight:600;color:${KLEUR.muted};margin:0 0 3px;">We vonden voor jouw woning</div>
        <div style="line-height:1;margin:0 0 16px;">
          <span style="font-size:46px;font-weight:800;color:${KLEUR.primary};">${totaal}</span>
          <span style="font-size:20px;font-weight:700;color:${KLEUR.primary};">&nbsp;${meervoud}</span>
        </div>
        ${balk}
        <div style="margin-top:12px;">${legenda}</div>
      </td></tr>
    </table>`;
}

// De uitspraak over de woningvoorraad bij dit bouwjaar — dezelfde tekst als "de
// eerste stap" op het resultaat. Zie src/components/subsidiecheck/eersteStapTekst.ts
// voor de bronnen (Milieu Centraal) en de grenzen 1975/1992. Bewust gedupliceerd:
// een edge function draait op Deno en kan niets uit src/ importeren. Wijzigt de
// tekst daar, dan hier mee — src/test/eersteStap.test.ts bewaakt dat.
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
  /** Onze echte Google-score; weglaten = geen bewijsregel in de mail. */
  beoordeling?: { score: string; aantal: number | null };
}): string {
  const { aanhef, adresregel, overzichtUrl, bouwjaar, beoordeling } = opts;
  const metLijst = opts.regelingen !== null;
  const regelingen = opts.regelingen ?? [];
  const bouwjaarZin = eersteStapZin(bouwjaar ?? null);
  // WhatsApp met het adres al in het bericht: de ontvanger hoeft alleen nog zijn
  // vraag te typen, en wij weten meteen waar het over gaat.
  const waLink = `https://wa.me/${WHATSAPP_NUMMER}?text=${encodeURIComponent(
    `Hallo, ik heb het subsidieoverzicht voor ${adresregel} ontvangen. Ik heb daar een vraag over:`,
  )}`;
  // Binnen een niveaugroep eerst de subsidies, dan de leningen (stabiele sort,
  // dus bronvolgorde binnen één type blijft). Zelfde ordening als de website.
  const typeRang = (t?: string) => (t === "lening" ? 1 : 0);
  const groepen = NIVEAU_VOLGORDE.map((niveau) =>
    groepBlok(
      niveau,
      regelingen
        .filter((r) => (r.niveau ?? "overig") === niveau)
        .sort((a, b) => typeRang(a.type) - typeRang(b.type)),
    ),
  ).join("");
  // Alleen bij twee of meer groepen: bij één groep valt er niets te combineren
  // en zou de zin een loze belofte zijn.
  const aantalGroepen = NIVEAU_VOLGORDE.filter((niveau) =>
    regelingen.some((r) => (r.niveau ?? "overig") === niveau),
  ).length;
  const waaromGroepen =
    aantalGroepen > 1
      ? `<p style="margin:0 0 4px;font-size:14px;line-height:1.5;color:${KLEUR.muted};">${WAAROM_GROEPEN}</p>`
      : "";

  return `<!doctype html>
<html lang="nl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><meta name="color-scheme" content="light"><meta name="supported-color-schemes" content="light"><title>Voortraject - Jouw subsidieoverzicht</title></head>
<body style="margin:0;padding:0;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:${KLEUR.achtergrond};padding:32px 16px;font-family:${FONT_STACK};">
    <tr><td align="center">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;width:100%;background:${KLEUR.kaart};border-radius:12px;overflow:hidden;">

        <!-- Header: gecentreerd wit logo op navy. De linear-gradient is een
             dark-mode-slot: Gmail herkleurt effen achtergrondkleuren in dark
             mode (navy wordt lila), maar laat achtergrond-gradients met rust. -->
        <tr><td style="background-color:${KLEUR.primary};background-image:linear-gradient(${KLEUR.primary},${KLEUR.primary});padding:32px 24px;text-align:center;">
          <img src="${LOGO_URL}" alt="voortraject" width="216" height="60" style="height:60px;width:216px;display:inline-block;border:0;outline:none;text-decoration:none;color:#FFFFFF;font-size:24px;font-weight:700;font-family:Arial,Helvetica,sans-serif;">
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:40px 32px;color:${KLEUR.primary};line-height:1.6;">
          <p style="font-size:16px;margin:0 0 20px;">${escapeHtml(aanhef)},</p>
          ${
            metLijst
              ? `<p style="font-size:16px;margin:0 0 20px;">Hier is je persoonlijke subsidieoverzicht voor <strong>${escapeHtml(adresregel)}</strong>.</p>

          ${bouwSamenvattingBlok(regelingen)}`
              : `<p style="font-size:16px;margin:0 0 20px;">Je persoonlijke subsidieoverzicht voor <strong>${escapeHtml(adresregel)}</strong> staat online voor je klaar.</p>`
          }
          ${
            // Hieronder stond nog een alinea: "Dat is meer dan de meeste mensen
            // denken. Je hoeft niets te kiezen: veel regelingen zijn te
            // combineren, en wij zoeken gratis voor je uit welke voor jouw
            // woning het meeste opleveren." Eruit op verzoek: het aanbod om mee
            // te kijken staat verderop al in het adviesblok, en hier stond het
            // tussen de uitkomst en de lijst in.
            bouwjaarZin
              ? `<p style="font-size:15px;margin:0 0 20px;line-height:1.6;">${escapeHtml(bouwjaarZin)}</p>`
              : ""
          }
          ${
            !metLijst
              ? // Zonder lijst is de link naar het overzicht de inhoud van de mail,
                // dus een echte knop in plaats van een tekstlink. Geen overzichtUrl
                // (of geen geldige)? Dan de check zelf.
                `<p style="font-size:15px;margin:0 0 16px;line-height:1.6;">Daar zie je per regeling wat je kunt krijgen en hoe je het aanvraagt.</p>
          <p style="margin:0 0 24px;"><a href="${escapeHtml(overzichtUrl ?? CHECK_URL)}" style="display:inline-block;background:${KLEUR.accent};color:${KLEUR.primary};font-size:15px;font-weight:700;text-decoration:none;padding:12px 20px;border-radius:8px;">Bekijk je overzicht online</a></p>`
              : overzichtUrl
                ? `<p style="text-align:center;margin:0 0 24px;font-size:14px;"><a href="${escapeHtml(overzichtUrl)}" style="color:${KLEUR.primary};font-weight:600;text-decoration:none;">Bekijk of deel je volledige overzicht online &rarr;</a></p>`
                : ""
          }

          <!-- De belofte: het volledige overzicht in de mail — alle subsidies en
               leningen per niveau onder elkaar, met erboven waarom er groepen zijn. -->
          ${metLijst ? waaromGroepen : ""}
          ${metLijst ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 8px;">${groepen}</table>` : ""}

          <!-- Scheidslijn: markeert het einde van de regelingenlijst en de
               overgang naar het advies-blok. -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:20px 0 0;">
            <tr><td style="border-top:1px solid ${KLEUR.border};font-size:0;line-height:0;height:1px;">&nbsp;</td></tr>
          </table>

          <!-- Conversie-blok in huisstijl (oker linkerrand). Bewust dezelfde
               drempelloze routes als op het resultaat: antwoorden op deze mail
               (het antwoordadres is info@voortraject.nl), WhatsApp met het adres
               al ingevuld, of bellen. Vroeger stond hier één knop naar /contact,
               een leeg formulier dat de bezoeker al een keer had ingevuld.

               De twee knoppen stonden eerder met hun volle tekst naast elkaar
               ("Stel je vraag via WhatsApp" en "Bel 050 211 26 89"). In de
               mail-app op een telefoon is de kolom nog geen 300px breed, dus
               brak élk label over twee of drie regels en werd het blok een
               kluwen. Nu: één woord per knop plus een icoon, met nowrap, zodat
               ze gegarandeerd naast elkaar op één regel passen. Het nummer is
               niet verdwenen — het staat voluit in de voettekst. -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0 8px;background:${KLEUR.achtergrond};border-left:4px solid ${KLEUR.accent};border-radius:4px;">
            <tr><td style="padding:20px 24px;">
              <p style="font-size:15px;font-weight:700;color:${KLEUR.primary};margin:0 0 6px;">Gratis advies over jouw overzicht</p>
              <p style="font-size:14px;color:${KLEUR.muted};margin:0 0 16px;line-height:1.6;"><strong style="color:${KLEUR.primary};font-weight:600;">Antwoord op deze mail</strong> met je vraag, of stuur een WhatsApp-bericht. Een van onze adviseurs kijkt dan naar jouw adres. Gratis en vrijblijvend, reactie binnen 1 werkdag.</p>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
                <td style="padding-right:10px;">
                  <a href="${escapeHtml(waLink)}" style="display:inline-block;background:${KLEUR.accent};color:${KLEUR.primary};font-size:14px;font-weight:700;text-decoration:none;padding:11px 16px;border-radius:8px;white-space:nowrap;"><img src="${ICOON.whatsapp}" alt="" width="16" height="16" style="width:16px;height:16px;vertical-align:-3px;border:0;"> &nbsp;WhatsApp</a>
                </td>
                <td>
                  <a href="${TELEFOON_LINK}" style="display:inline-block;border:1px solid ${KLEUR.primary};color:${KLEUR.primary};font-size:14px;font-weight:700;text-decoration:none;padding:10px 15px;border-radius:8px;white-space:nowrap;"><img src="${ICOON.telefoon}" alt="" width="16" height="16" style="width:16px;height:16px;vertical-align:-3px;border:0;"> &nbsp;Bel ons</a>
                </td>
              </tr></table>
              ${
                beoordeling
                  ? // "op Google" wordt het Google-logo zelf. Blokkeert de mail-app
                    // afbeeldingen (Outlook doet dat standaard), dan valt de alt-tekst
                    // "Google" op precies dezelfde plek in — de regel blijft dus in elk
                    // geval leesbaar.
                    `<p style="font-size:13px;color:${KLEUR.muted};margin:14px 0 0;">&#9733;&#9733;&#9733;&#9733;&#9733; <strong style="color:${KLEUR.primary};">${beoordeling.score}</strong> op <img src="${ICOON.google}" alt="Google" width="14" height="14" style="width:14px;height:14px;vertical-align:-2px;border:0;">${beoordeling.aantal ? ` &middot; ${beoordeling.aantal} reviews` : ""}</p>`
                  : ""
              }
            </td></tr>
          </table>

          <!-- Doorgeven aan de buren. De mail is het enige stuk van de check dat
               buiten het scherm van de bezoeker voortleeft: hij wordt bewaard en
               doorgestuurd. Dan hoort er ook een link in te staan waarmee de
               ontvanger zijn éígen adres kan invullen — de rest van deze mail
               gaat over één huis. -->
          <p style="font-size:14px;color:${KLEUR.muted};margin:20px 0 0;line-height:1.6;">Ken je iemand die dit ook moet doen? Huizen uit dezelfde tijd komen vaak voor dezelfde regelingen in aanmerking. Stuur ze <a href="${DEEL_URL}" style="color:${KLEUR.primary};font-weight:600;">de check voor hun eigen adres</a>.</p>

          <p style="font-size:16px;margin:24px 0 4px;">Met vriendelijke groet,</p>
          <div style="line-height:24px">&nbsp;</div>${HANDTEKENING_ALGEMEEN_HTML}
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:${KLEUR.achtergrond};padding:24px 32px;text-align:center;border-top:1px solid ${KLEUR.border};">
          <p style="font-size:12px;color:${KLEUR.muted};margin:0 0 8px;line-height:1.6;font-style:italic;">Dit overzicht is een indicatie op basis van de Energiesubsidiewijzer, in samenwerking met voorlichtingsorganisatie Milieu Centraal, en jouw postcode. Aan de bedragen en voorwaarden kunnen geen rechten worden ontleend.</p>
          <p style="font-size:12px;color:${KLEUR.muted};margin:0;line-height:1.6;"><strong style="color:${KLEUR.primary};">Voortraject</strong><br>Vragen? Bel <a href="${TELEFOON_LINK}" style="color:${KLEUR.muted};">${TELEFOON}</a> of reageer op deze mail.</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
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
