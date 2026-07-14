// Parser voor de Energiesubsidiewijzer van Verbeterjehuis (RVO/Milieu Centraal,
// CC-0). Zet de server-rendered HTML om naar onze bron-onafhankelijke types.
// Bewust regex-gebaseerd (geen DOM-dependency), zodat dezelfde parser werkt in
// de tests (jsdom), in de browser én straks in een Supabase edge function (Deno).
//
// Twee lagen, net als de bron:
//  - parseResultaten(html)  → de lijst per postcode (titel, niveau, type, link).
//  - parseDetail(html)      → verrijking per regeling (bedrag, voorwaarde, bron).
//
// Mapping-keuzes (gevalideerd tegen echte pagina's, zie fixtures + tests):
//  - niveau komt uit de label-class `register-card__label--*`. Verbeterjehuis
//    kent GEEN losse "provincie": hun labels zijn national-government /
//    municipality / other (+ soms province). Regionale regelingen (SNN, Nij
//    Begun) staan bij hen onder Rijksoverheid of Overig.
//  - type komt uit het URL-pad: /leningen/ = lening, anders subsidie
//    (/overig/, zoals een btw-verlaging, rekenen we tot "geen lening" = subsidie).

import type { Bewonertype, Maatregel, SubsidieNiveau, SubsidieRegeling, SubsidieType } from "./types";
import { ALLE_MAATREGELEN } from "./types";

const LABEL_NAAR_NIVEAU: Record<string, SubsidieNiveau> = {
  "national-government": "rijk",
  province: "provincie",
  municipality: "gemeente",
  other: "overig",
};

const NIVEAU_AANBIEDER: Record<SubsidieNiveau, string> = {
  rijk: "Rijksoverheid",
  provincie: "Provincie",
  gemeente: "Gemeente",
  overig: "Overige aanbieders",
};

// Alle bewonertypes: de lijst is al op postcode gefilterd door de bron; wij
// filteren client-side niet verder weg tenzij we detail-doelgroepen hebben.
const ALLE_BEWONERTYPES: Bewonertype[] = ["woningeigenaar", "huurder", "vve", "verhuurder"];

// Losse named entities die in de teksten voorkomen; numeriek (&#x..; / &#..;)
// wordt generiek afgehandeld.
const NAMED: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
};

export function decodeEntities(input: string): string {
  return input
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&([a-zA-Z]+);/g, (m, name) => NAMED[name] ?? m);
}

// Verwijdert HTML-tags, decodeert entities en normaliseert witruimte.
function schoon(fragment: string): string {
  return decodeEntities(fragment.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
}

function eersteMatch(bron: string, re: RegExp): string | undefined {
  const m = bron.match(re);
  return m ? schoon(m[1]) : undefined;
}

/** Laatste padsegment als stabiel id, bijv. "isde-subsidie-rijksoverheid". */
function slugVanUrl(url: string): string {
  const zonderQuery = url.split(/[?#]/)[0].replace(/\/+$/, "");
  return zonderQuery.split("/").pop() || url;
}

function typeVanUrl(url: string): SubsidieType {
  return /\/leningen\//i.test(url) ? "lening" : "subsidie";
}

// Eén regeling-kaart uit de resultatenlijst. Geen nested <a> in een kaart, dus
// non-greedy tot de eerste </a> is veilig.
const KAART_RE = /<a\b([^>]*\bclass="c-register-card"[^>]*)>([\s\S]*?)<\/a>/gi;
const HREF_RE = /href="([^"]+)"/i;
const TITEL_RE = /<h2\b[^>]*class="[^"]*register-card__title[^"]*"[^>]*>([\s\S]*?)<\/h2>/i;
const LABEL_RE = /register-card__label--([a-z-]+)/i;
const BODY_RE = /<span\b[^>]*class="[^"]*register-card__body[^"]*"[^>]*>([\s\S]*?)<\/span>/i;

/**
 * Parset de resultatenlijst (server-rendered HTML voor één postcode) naar onze
 * regelingen. Bedrag/voorwaarde/officiële bron staan niet op de lijst; die
 * komen uit parseDetail() per regeling.
 */
export function parseResultaten(html: string): SubsidieRegeling[] {
  const regelingen: SubsidieRegeling[] = [];
  const gezien = new Set<string>();

  for (const kaart of html.matchAll(KAART_RE)) {
    const attrs = kaart[1];
    const inner = kaart[2];

    const href = attrs.match(HREF_RE)?.[1];
    const titel = eersteMatch(inner, TITEL_RE);
    if (!href || !titel) continue;

    const id = slugVanUrl(href);
    if (gezien.has(id)) continue; // dedupe (bron kan een kaart herhalen)
    gezien.add(id);

    const labelSuffix = inner.match(LABEL_RE)?.[1]?.toLowerCase();
    const niveau: SubsidieNiveau = (labelSuffix && LABEL_NAAR_NIVEAU[labelSuffix]) || "overig";
    const type = typeVanUrl(href);

    regelingen.push({
      id,
      titel,
      niveau,
      type,
      aanbieder: NIVEAU_AANBIEDER[niveau],
      omschrijving: eersteMatch(inner, BODY_RE) ?? "",
      bronUrl: href,
      // Lijst kent geen maatregel-/doelgroepfilter per regeling; de bron heeft
      // al op postcode gefilterd, dus tonen we ze breed (detail kan verfijnen).
      maatregelen: [...ALLE_MAATREGELEN] as Maatregel[],
      doelgroepen: [...ALLE_BEWONERTYPES],
    });
  }

  return regelingen;
}

// ---- Detailpagina-verrijking ----

export type RegelingDetail = {
  bedragIndicatie?: string;
  belangrijksteVoorwaarde?: string;
  voorWie?: string;
  /** Officiële externe bron (rvo.nl, snn.nl, gemeente, …), niet verbeterjehuis. */
  officieleBronUrl?: string;
};

// Sectie met een kop (h2/h3) "Bedrag" of "Belangrijkste voorwaarden": pak de
// eerstvolgende alinea (<p>) of het eerste lijstpunt (<li>). Bij een lijst
// voorwaarden pakken we zo de belangrijkste (eerste) regel.
function sectieTekst(html: string, kop: string): string | undefined {
  const re = new RegExp(
    `<h[23]\\b[^>]*>\\s*${kop}\\s*</h[23]>([\\s\\S]{0,1500}?)<(?:h[23]|section|footer)\\b`,
    "i",
  );
  const m = html.match(re);
  if (!m) return undefined;
  const eerste = m[1].match(/<(p|li)\b[^>]*>([\s\S]*?)<\/\1>/i)?.[2] ?? m[1];
  const tekst = schoon(eerste);
  return tekst.length > 0 ? tekst : undefined;
}

const ALLE_HREFS_RE = /href="(https?:\/\/[^"]+)"/gi;
// Niet de bron: Verbeterjehuis/Milieu Centraal zelf, social, assets én de
// generieke ministerie-pagina ("een initiatief van …") die op elke pagina staat.
const UITSLUITEN_RE =
  /verbeterjehuis\.nl|milieucentraal\.nl|rijksoverheid\.nl\/ministeries|zetookdeknopom\.nl|facebook|twitter|x\.com|linkedin|instagram|youtube|whatsapp|google|gstatic|cookie/i;
// De uitvoerende instanties (sterke voorkeur boven andere content-links).
const UITVOERDER_RE =
  /\b(?:rvo\.nl|snn\.nl|warmtefonds\.nl|provincie\.[a-z-]+\.nl|[a-z-]*gemeente[a-z.-]*\.nl)\b/i;
// Documenten (postcodelijsten, voorwaarden-PDF's) zijn een slechtere landing
// dan de regelingpagina zelf; alleen als er niets beters is.
const DOCUMENT_RE = /\.pdf(?:$|[?#])/i;

// Beste bronlink uit de cóntent (alles vóór de footer: die bevat op elke
// pagina dezelfde generieke ministerie-link, die anders als bron zou winnen
// voor regelingen buiten de uitvoerder-whitelist — denk aan belastingdienst.nl,
// svn.nl, nhg.nl of nijbegun.nl). Rangorde: uitvoerder-pagina > uitvoerder-PDF
// > andere pagina > andere PDF; bij gelijke rang wint documentvolgorde.
function officieleBron(html: string): string | undefined {
  const content = html.split(/<footer\b/i)[0];
  let beste: { url: string; rang: number } | undefined;
  for (const m of content.matchAll(ALLE_HREFS_RE)) {
    const url = m[1];
    if (UITSLUITEN_RE.test(url)) continue;
    const rang = (UITVOERDER_RE.test(url) ? 0 : 2) + (DOCUMENT_RE.test(url) ? 1 : 0);
    if (rang === 0) return url;
    if (!beste || rang < beste.rang) beste = { url, rang };
  }
  return beste?.url;
}

// De "Bedrag"-sectie is een hele alinea; voor het compacte bedrag-slot destilleren
// we een korte indicatie: het hoogste euro-bedrag ("tot € 10.000") of anders een
// percentage ("50–100% van de kosten"). Geen getal → geen indicatie (eerlijk;
// bijv. ISDE hangt af van de maatregel).
export function beknoptBedrag(tekst?: string): string | undefined {
  if (!tekst) return undefined;
  const euros = [...tekst.matchAll(/€\s?([\d.]+)/g)]
    .map((m) => parseInt(m[1].replace(/\./g, ""), 10))
    .filter((n) => Number.isFinite(n) && n > 0);
  if (euros.length) {
    const max = Math.max(...euros);
    return `tot € ${max.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
  }
  const reeks = tekst.match(/(\d{1,3})\s*%\s*(?:tot|-|–|en)\s*(\d{1,3})\s*%/i);
  if (reeks) return `${reeks[1]}–${reeks[2]}% van de kosten`;
  const enkel = tekst.match(/\b(?:tot|maximaal)?\s*(\d{1,3})\s*%/i);
  if (enkel) return `tot ${enkel[1]}% van de kosten`;
  return undefined;
}

/** Verrijkt een regeling met bedrag, belangrijkste voorwaarde en officiële bron. */
export function parseDetail(html: string): RegelingDetail {
  return {
    bedragIndicatie: beknoptBedrag(sectieTekst(html, "Bedrag")),
    belangrijksteVoorwaarde: sectieTekst(html, "Belangrijkste voorwaarden"),
    voorWie: sectieTekst(html, "Voor wie"),
    officieleBronUrl: officieleBron(html),
  };
}

/** Voegt detailvelden samen in een regeling uit de lijst. */
export function verrijk(regeling: SubsidieRegeling, detail: RegelingDetail): SubsidieRegeling {
  return {
    ...regeling,
    bedragIndicatie: detail.bedragIndicatie ?? regeling.bedragIndicatie,
    belangrijksteVoorwaarde: detail.belangrijksteVoorwaarde ?? regeling.belangrijksteVoorwaarde,
    voorWie: detail.voorWie ?? regeling.voorWie,
    bronUrl: detail.officieleBronUrl ?? regeling.bronUrl,
  };
}
