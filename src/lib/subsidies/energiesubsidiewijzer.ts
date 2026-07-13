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
// Niet de bron: Verbeterjehuis/Milieu Centraal zelf, social en assets.
const UITSLUITEN_RE =
  /verbeterjehuis\.nl|milieucentraal\.nl|facebook|twitter|x\.com|linkedin|instagram|youtube|whatsapp|google|gstatic|cookie/i;
// De uitvoerende instanties (sterke voorkeur).
const UITVOERDER_RE =
  /\b(?:rvo\.nl|snn\.nl|warmtefonds\.nl|provincie\.[a-z-]+\.nl|[a-z-]*gemeente[a-z-]*\.nl)\b/i;
// Generieker; alleen als er geen uitvoerder-link is.
const ZWAKKE_BRON_RE = /\brijksoverheid\.nl\b/i;

// Eerste échte bronlink: de uitvoerende instantie wint van een generieke
// rijksoverheid.nl-link; Verbeterjehuis/social/assets tellen niet mee.
function officieleBron(html: string): string | undefined {
  let zwak: string | undefined;
  for (const m of html.matchAll(ALLE_HREFS_RE)) {
    const url = m[1];
    if (UITSLUITEN_RE.test(url)) continue;
    if (UITVOERDER_RE.test(url)) return url;
    if (!zwak && ZWAKKE_BRON_RE.test(url)) zwak = url;
  }
  return zwak;
}

/** Verrijkt een regeling met bedrag, belangrijkste voorwaarde en officiële bron. */
export function parseDetail(html: string): RegelingDetail {
  const officieleBronUrl = officieleBron(html);
  return {
    bedragIndicatie: sectieTekst(html, "Bedrag"),
    belangrijksteVoorwaarde: sectieTekst(html, "Belangrijkste voorwaarden"),
    voorWie: sectieTekst(html, "Voor wie"),
    officieleBronUrl,
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
