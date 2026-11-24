// De overzichtsmail aan de bezoeker, als puur bestand naast de function zodat
// vitest hem echt kan opbouwen (src/test/subsidiecheckMailBeveiliging.test.ts).
// Verhuisd uit index.ts in oktober 2026.
//
// Harde regel sinds de Spamhaus-listing van oktober 2026: in deze mail komt
// géén tekst uit de request. De regelingen komen uit onze eigen bron, de
// adresregel uit postcode en huisnummer (streng gevalideerd) of uit de BAG, en
// de aanhef uit een voornaam die alleen letters mag bevatten. Zie
// tasks/formulieren-misbruik-2026-10.md. Dat geldt ook voor de tekstversie.
//
// De opmaak is sinds 24-11-2026 de vaste mailopmaak van Voortraject (opmaak.ts,
// een kopie uit de CRM-repo; goedgekeurd door de eigenaar): logobalk, één
// witte kaart, inktblauwe knop, regelingen als blok met okerstreep en de lichte
// teamafsluiting. Daarvoor was het "variant D" (oktober 2026), met een donkere
// kop, gekleurde kaarten en een donker contactblok. Die vlakken hadden een
// vastgezette kleur achter tekst, en die wordt in de Gmail-app op de iPhone in
// donkere modus onleesbaar. De bewaking in het CRM meldt dat sinds 24-11-2026.
// Regel: een vastgezette achtergrond (linear-gradient) alleen in de logobalk;
// src/test/subsidiecheckMailVasteOpmaak.test.ts bewaakt dat en de rest van de spec.

import { bouwEswFilterQuery, schoonOverzichtUrl, type MailRegeling } from "./beveiliging.ts";
import {
  afsluitingTeam,
  afsluitingTeamTekst,
  alinea,
  blok,
  KANTOOR_TELEFOON,
  kleineTekst,
  knop,
  mailDocument,
  OKER,
  tekstLink,
  titel,
  tussenkop,
  voetnoot,
} from "./opmaak.ts";

type Regeling = MailRegeling;

const TELEFOON_LINK = "tel:+31502112689";
// Zelfde nummer als de knop op de site (src/lib/whatsapp.ts): zonder + en zonder 0.
const WHATSAPP_NUMMER = "31502112689";
const TEAM_MAIL = "info@voortraject.nl";

// Subsidie of lening: het beslissende onderscheid (geld dat je niet terugbetaalt
// tegenover geld dat je leent). In de vaste opmaak als kop van het blok.
const soortLabel = (r: Regeling) => (r.type === "lening" ? "Lening" : "Subsidie");

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

// De check zonder adres, om door te sturen naar buren of familie. De utm-tags
// zijn dezelfde als op de site (zie src/components/subsidiecheck/delen.ts), zodat
// doorgestuurde bezoekers in GA4 onder Bron/Medium terugkomen in plaats van als
// direct verkeer.
const DEEL_URL = "https://voortraject.nl/subsidiecheck?utm_source=deel&utm_medium=mail";
// De check zelf, als de mail geen eigen lijst heeft en de bezoeker geen geldige
// link naar zijn overzicht meestuurde.
const CHECK_URL = "https://voortraject.nl/subsidiecheck";

const INDICATIE = "Dit overzicht is een indicatie. We zoeken voor je uit wat er voor jouw huis echt in zit. Je zit nergens aan vast.";
const CONTACT =
  "Een adviseur kijkt gratis met je mee welke regelingen je voor jouw woning kunt combineren.";
const BUREN = "Huizen uit dezelfde tijd komen vaak voor dezelfde subsidie in aanmerking.";
const DISCLAIMER =
  "Dit overzicht is een indicatie op basis van de Energiesubsidiewijzer van Milieu Centraal en jouw postcode. Aan bedragen en voorwaarden kun je geen rechten ontlenen.";

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

// Alleen de eerste zin van de omschrijving: het blok moet in één oogopslag
// zeggen wat het is. De rest staat achter "Meer info".
const eersteZin = (s: string) => s.match(/^.*?[.!?](?=\s|$)/)?.[0] ?? s;

const geldigeBron = (r: Regeling) => !!r.bronUrl && /^https?:\/\//i.test(r.bronUrl);

// Wat er in het blok van één regeling staat, als regels (zonder opmaak). De HTML
// en de tekstversie gebruiken dezelfde lijst, zodat ze niet uit elkaar lopen.
function regelingRegels(r: Regeling): { bedrag: string; regels: { tekst: string; vet?: boolean; letOp?: boolean }[] } {
  const regels: { tekst: string; vet?: boolean; letOp?: boolean }[] = [];
  // Zelfde regel als op de kaart: zonder deze voorwaarde leest het bedrag als
  // een belofte (VVG € 17.000 geldt alleen in het NCG-programma).
  if (r.alleenAls) regels.push({ tekst: `Alleen als ${r.alleenAls}`, vet: true });
  if (r.omschrijving) regels.push({ tekst: eersteZin(r.omschrijving) });
  // De mail bewaart de bewoner, dus een deadline hoort er juist in, met de
  // datum voluit: een mail heeft geen uitklap.
  const einddatum = einddatumTekst(r.looptAfOp);
  if (einddatum) regels.push({ tekst: `aanvragen kan tot ${einddatum}.`, letOp: true });
  // "Let op" komt letterlijk van de bron en staat op ongeveer één op de dertig
  // regelingen. Bij ISDE zegt hij dat je in Groningen en Noord-Drenthe beter de
  // Isolatieaanpak kunt nemen: precies ons werkgebied.
  if (r.letOp) regels.push({ tekst: r.letOp, letOp: true });
  return { bedrag: r.bedragIndicatie ?? "", regels };
}

// Tekst in het blok: 15/22 zoals het gegevensblok van de spec, inkt erft van de inhoudcel.
const blokRegel = (html: string, marge = "8px 0 0", extra = "") =>
  `<p style="margin:${marge};font-size:15px;line-height:22px;${extra}">${html}</p>`;

function regelingBlok(r: Regeling): string {
  const { bedrag, regels } = regelingRegels(r);
  const inhoud = [
    `<p style="margin:0;font-size:16px;line-height:26px;font-weight:700;">${escapeHtml(r.titel ?? "Regeling")}</p>`,
    bedrag ? blokRegel(escapeHtml(bedrag), "0", "font-weight:600;") : "",
    ...regels.map((g) =>
      g.letOp
        ? blokRegel(`<strong>Let op:</strong> ${escapeHtml(g.tekst)}`)
        : blokRegel(escapeHtml(g.tekst), "8px 0 0", g.vet ? "font-weight:600;" : ""),
    ),
    geldigeBron(r) ? blokRegel(tekstLink(r.bronUrl!, "Meer info")) : "",
  ].filter(Boolean);
  return blok(inhoud.join("\n"), soortLabel(r));
}

function regelingTekst(r: Regeling): string {
  const { bedrag, regels } = regelingRegels(r);
  return [
    `${r.titel ?? "Regeling"} (${soortLabel(r).toLowerCase()}${bedrag ? `, ${bedrag}` : ""})`,
    ...regels.map((g) => (g.letOp ? `Let op: ${g.tekst}` : g.tekst)),
    geldigeBron(r) ? `Meer info: ${r.bronUrl}` : "",
  ]
    .filter(Boolean)
    .map((regel, i) => (i === 0 ? `- ${regel}` : `  ${regel}`))
    .join("\n");
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

function bouwEmail(opts: {
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
}): { html: string; tekst: string } {
  const { aanhef, adresregel, overzichtUrl, bouwjaar, beoordeling } = opts;
  const metLijst = opts.regelingen !== null;
  const regelingen = opts.regelingen ?? [];
  const leningen = regelingen.filter((r) => r.type === "lening").length;
  const subsidies = regelingen.length - leningen;
  const bouwjaarZin = eersteStapZin(bouwjaar ?? null);
  const adres = escapeHtml(adresregel);

  // Binnen een niveaugroep eerst de subsidies, dan de leningen (stabiele sort,
  // dus bronvolgorde binnen één soort blijft). Zelfde ordening als de website.
  const typeRang = (t?: string) => (t === "lening" ? 1 : 0);
  const groepen = NIVEAU_VOLGORDE.map((niveau) => ({
    niveau,
    items: regelingen
      .filter((r) => (r.niveau ?? "overig") === niveau)
      .sort((a, b) => typeRang(a.type) - typeRang(b.type)),
  })).filter((g) => g.items.length > 0);

  // "2 subsidies en 1 lening": de tellers van variant D als zin.
  const aantallen =
    opsomming(
      [
        subsidies > 0 ? meervoud(subsidies, "subsidie", "subsidies") : "",
        leningen > 0 ? meervoud(leningen, "lening", "leningen") : "",
      ].filter(Boolean),
    ) || "geen regelingen";

  // De verborgen voorbeeldregel die de inbox onder het onderwerp toont. Zonder
  // deze regel pakt de inbox de eerste tekst uit de mail, en dat is de alt-tekst
  // van het logo. Bij geen lijst valt hij terug op een gewone zin.
  const voorbeeldregel = metLijst
    ? `${aantallen} voor ${adresregel}${groepen.length ? `, van ${opsomming(groepen.map((g) => NIVEAU_KORT[g.niveau]))}` : ""}.`
    : `Je subsidieoverzicht voor ${adresregel} staat online voor je klaar.`;

  // De ene knop. Wie hem aanklikt, vraagt ons uit te zoeken wat er voor dit huis
  // echt in zit. Tot de ondertekende link naar een bevestigingspagina er is (die
  // legt de aanvraag pas vast als de pagina echt in een browser opent, want
  // virusscanners openen links in mails vanzelf), opent hij een kant-en-klare
  // mail aan het team: één tik op versturen en het verzoek is binnen, met het
  // adres in het onderwerp. Webmail (Gmail, Outlook.com) opent zo'n link in een
  // eigen opstelvenster.
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

  // ---- HTML ----

  const begin = metLijst
    ? [
        alinea(`We vonden <strong>${aantallen}</strong> voor de verduurzaming van ${adres}.` +
          (subsidies > 0 && leningen > 0 ? " Een subsidie hoef je niet terug te betalen, een lening wel." : "")),
        bouwjaarZin ? alinea(escapeHtml(bouwjaarZin)) : "",
        alinea(INDICATIE),
        knop(aanvraagLink, "Laat gratis uitzoeken wat ik krijg"),
      ]
    : // Zonder lijst is het overzicht online de inhoud van de mail, en dus de
      // knop. Geen geldige overzichtUrl? Dan de check zelf.
      [
        alinea(escapeHtml(bouwjaarZin ?? "Fijn dat je de subsidiecheck hebt gedaan.")),
        alinea(`Je overzicht voor ${adres} staat online voor je klaar. Daar zie je per regeling wat je kunt krijgen en hoe je het aanvraagt.`),
        knop(onlineLink, "Bekijk je overzicht online"),
      ];

  const lijst = metLijst
    ? [
        groepen.length > 1 ? kleineTekst(WAAROM_GROEPEN) : "",
        ...groepen.map((g) => tussenkop(NIVEAU_LABELS[g.niveau]) + "\n" + g.items.map(regelingBlok).join("\n")),
        // Een geldige link naar het eigen overzicht: om later terug te kijken of
        // door te sturen. Een tekstlink; de knop blijft het enige dat opvalt.
        overzichtUrl ? alinea(tekstLink(overzichtUrl, "Bekijk of deel je overzicht online")) : "",
      ]
    : [];

  // Onze echte Google-score, als kleine regel onder het contactkopje. Bewust
  // zonder aantal reviews, en als tekst: zonder plaatjes leest hij net zo.
  const score = beoordeling
    ? kleineTekst(`<span style="color:${OKER};">&#9733;&#9733;&#9733;&#9733;&#9733;</span> <strong>${escapeHtml(beoordeling.score)}</strong> op Google`)
    : "";

  const inhoud = [
    titel("Jouw subsidieoverzicht"),
    alinea(`${escapeHtml(aanhef)},`),
    ...begin,
    ...lijst,
    // Voor wie liever zelf contact opneemt: dezelfde drie wegen als variant D,
    // nu als links in de tekst (de knoppen met icoon hadden een vastgezet vlak).
    tussenkop("Liever zelf contact?"),
    alinea(
      `Stuur ons een ${tekstLink(waLink, "WhatsApp")}, bel ${tekstLink(TELEFOON_LINK, KANTOOR_TELEFOON)} of antwoord op deze mail. ${CONTACT}`,
    ),
    score,
    // Doorgeven aan de buren. De mail is het enige stuk van de check dat buiten
    // het scherm van de bezoeker voortleeft: hij wordt bewaard en doorgestuurd.
    tussenkop("Ken je iemand die ook wil verduurzamen?"),
    alinea(`${BUREN} Stuur ze ${tekstLink(DEEL_URL, "de check voor hun eigen adres")}.`, "0 0 24px"),
    afsluitingTeam(),
    voetnoot(DISCLAIMER),
  ].filter(Boolean);

  const html = mailDocument({ inhoud: inhoud.join("\n"), titel: "Jouw subsidieoverzicht", voorbeeldregel });

  // ---- Tekstversie: dezelfde inhoud, zonder opmaak ----

  const tekstBegin = metLijst
    ? [
        `We vonden ${aantallen} voor de verduurzaming van ${adresregel}.` +
          (subsidies > 0 && leningen > 0 ? " Een subsidie hoef je niet terug te betalen, een lening wel." : ""),
        bouwjaarZin ?? "",
        `${INDICATIE} Laat het gratis uitzoeken: antwoord op deze mail of mail naar ${TEAM_MAIL}.`,
      ]
    : [
        bouwjaarZin ?? "Fijn dat je de subsidiecheck hebt gedaan.",
        `Je overzicht voor ${adresregel} staat online voor je klaar. Daar zie je per regeling wat je kunt krijgen en hoe je het aanvraagt.\n${onlineLink}`,
      ];
  const tekstLijst = metLijst
    ? [
        groepen.length > 1 ? WAAROM_GROEPEN : "",
        ...groepen.map((g) => `${NIVEAU_LABELS[g.niveau]}\n\n${g.items.map(regelingTekst).join("\n\n")}`),
        overzichtUrl ? `Bekijk of deel je overzicht online:\n${overzichtUrl}` : "",
      ]
    : [];
  const tekst = [
    "Jouw subsidieoverzicht",
    `${aanhef},`,
    ...tekstBegin,
    ...tekstLijst,
    `Liever zelf contact?\nStuur ons een WhatsApp (${waLink}), bel ${KANTOOR_TELEFOON} of antwoord op deze mail. ${CONTACT}`,
    beoordeling ? `${beoordeling.score} van 5 sterren op Google` : "",
    `Ken je iemand die ook wil verduurzamen?\n${BUREN} Stuur ze de check voor hun eigen adres:\n${DEEL_URL}`,
    afsluitingTeamTekst(),
    DISCLAIMER,
  ]
    .filter(Boolean)
    .join("\n\n");

  return { html, tekst };
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
}): Promise<{ onderwerp: string; html: string; tekst: string; metLijst: boolean } | null> {
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

  const { html, tekst } = bouwEmail({
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
  return { onderwerp, html, tekst, metLijst: regelingen !== null };
}
