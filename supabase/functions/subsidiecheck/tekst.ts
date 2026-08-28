// ⚠️ KOPIE — bron van waarheid is src/lib/subsidies/tekst.ts.
// Gegenereerd, niet met de hand bewerken: de edge function (Deno) kan niet uit
// de Vite-app importeren. Bij een wijziging: daar aanpassen en hier opnieuw
// overnemen (alleen de importpaden krijgen een .ts-extensie).

// Tekst-helpers die de Energiesubsidiewijzer-bron nodig heeft, los van de vraag
// of de data via de officiële API (JSON met HTML-fragmenten) of via de oude
// HTML-scrape binnenkomt. Beide leveren HTML-brokjes aan, dus beide moeten
// entities decoderen, tags strippen en een bedrag destilleren.
//
// Bewust hier en niet in energiesubsidiewijzer.ts: die parser verdwijnt zodra de
// API-route definitief is (zie tasks/todo.md), deze helpers blijven.

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

/** Verwijdert HTML-tags, decodeert entities en normaliseert witruimte. */
export function schoon(fragment: string): string {
  return decodeEntities(fragment.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
}

// De bedragtekst van de bron is een hele alinea; voor het compacte bedrag-slot
// destilleren we een korte indicatie: het hoogste euro-bedrag ("tot € 10.000")
// of anders een percentage ("50–100% van de kosten"). Geen getal → geen
// indicatie (eerlijk; ISDE hangt bijvoorbeeld af van de maatregel).
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

/**
 * Eerste alinea of eerste lijstpunt uit een HTML-fragment. De bron levert
 * `Conditions` nu eens als `<ul><li>…`, dan weer als `<p>…`; in beide gevallen
 * is het eerste item de belangrijkste regel. Zonder tags: de hele tekst.
 */
export function eersteRegel(fragment?: string): string | undefined {
  if (!fragment) return undefined;
  const eerste = fragment.match(/<(p|li)\b[^>]*>([\s\S]*?)<\/\1>/i)?.[2] ?? fragment;
  const tekst = schoon(eerste);
  return tekst.length > 0 ? tekst : undefined;
}
