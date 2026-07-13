import { parseDetail, parseResultaten, verrijk, type RegelingDetail } from "./energiesubsidiewijzer";
import { mockSubsidieProvider } from "./mockProvider";
import type { SubsidieProvider } from "./provider";
import type { SubsidieCheckInput, SubsidieRegeling } from "./types";

// Live provider tegen de Energiesubsidiewijzer (Verbeterjehuis, CC-0).
//
// Basis-URL van de bron:
//  - dev: de Vite-proxy `/esw` (zie vite.config.ts) — geen CORS, geen deploy.
//  - prod: een edge function in het CRM-Supabaseproject die serverside ophaalt,
//    parset, de detailvelden (bedrag/voorwaarde) verrijkt én cachet. Dan zetten
//    we BRON_BASIS op die function-URL; de rest van deze provider blijft gelijk.
const BRON_BASIS = "/esw";

async function haalLijst(postcode: string): Promise<SubsidieRegeling[]> {
  const url = `${BRON_BASIS}/energiesubsidiewijzer?postalcode=${encodeURIComponent(postcode)}`;
  const res = await fetch(url, { headers: { Accept: "text/html" } });
  if (!res.ok) throw new Error(`Energiesubsidiewijzer gaf status ${res.status}`);
  return parseResultaten(await res.text());
}

// Detailverrijking (bedrag/voorwaarde/officiële bron) staat niet op de lijst.
// In DEV halen we die per regeling op via dezelfde proxy, met een sessie-cache
// zodat een regeling maar één keer wordt opgehaald. In PRODUCTIE doet de edge
// function dit serverside mét duurzame caching, en levert 'ie de regelingen al
// verrijkt aan — dan slaan we dit hier over.
const detailCache = new Map<string, RegelingDetail>();

async function haalDetail(bronUrl: string): Promise<RegelingDetail> {
  const pad = new URL(bronUrl, "https://www.verbeterjehuis.nl").pathname;
  const bestaand = detailCache.get(pad);
  if (bestaand) return bestaand;
  try {
    const res = await fetch(`${BRON_BASIS}${pad}`, { headers: { Accept: "text/html" } });
    const detail = res.ok ? parseDetail(await res.text()) : {};
    detailCache.set(pad, detail);
    return detail;
  } catch {
    return {};
  }
}

async function verrijkAlles(regelingen: SubsidieRegeling[]): Promise<SubsidieRegeling[]> {
  const resultaten = await Promise.allSettled(
    regelingen.map(async (r) => verrijk(r, await haalDetail(r.bronUrl))),
  );
  return resultaten.map((u, i) => (u.status === "fulfilled" ? u.value : regelingen[i]));
}

export const energiesubsidiewijzerProvider: SubsidieProvider = {
  naam: "Energiesubsidiewijzer",
  async check(input: SubsidieCheckInput): Promise<SubsidieRegeling[]> {
    try {
      const regelingen = await haalLijst(input.postcode);
      // Elke NL-postcode heeft altijd landelijke regelingen; 0 betekent dus een
      // parse-/bronprobleem, niet "echt niets" → val netjes terug.
      if (regelingen.length === 0) throw new Error("geen regelingen geparset");
      // In DEV verrijken we hier met detailvelden; in PROD levert de edge
      // function ze al verrijkt (dan is import.meta.env.DEV false).
      return import.meta.env.DEV ? verrijkAlles(regelingen) : regelingen;
    } catch (err) {
      // TODO go-live: bij terugval een zachte melding tonen ("basisoverzicht,
      // live bron even niet bereikbaar") i.p.v. stil de basisset serveren.
      console.warn("[Energiesubsidiewijzer] live-bron faalde, terugval op basisset:", err);
      return mockSubsidieProvider.check(input);
    }
  },
};
