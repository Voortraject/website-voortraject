import {
  SUPABASE_EXTERNAL_ANON_KEY,
} from "@/integrations/supabase/external-client";
import { parseDetail, parseResultaten, verrijk, type RegelingDetail } from "./energiesubsidiewijzer";
import { mockSubsidieProvider } from "./mockProvider";
import type { SubsidieProvider } from "./provider";
import { bouwEswFilterQuery, type SubsidieCheckInput, type SubsidieRegeling } from "./types";

// Live provider tegen de Energiesubsidiewijzer (Verbeterjehuis, CC-0).
//
// Twee modi, afhankelijk van de omgeving:
//  - PRODUCTIE: een edge function (`VITE_SUBSIDIECHECK_URL`) haalt serverside op,
//    parset, verrijkt (bedrag/voorwaarde/bron) én cachet, en levert JSON. Wij
//    lezen die JSON hier zo over — geen HTML-parsing of CORS in de browser.
//  - DEV: is die env-var niet gezet, dan praten we via de Vite-proxy `/esw`
//    (zie vite.config.ts) rechtstreeks met de bron en parsen/verrijken we
//    client-side. Zo kun je lokaal bouwen zonder de function te deployen.
const FUNCTIE_URL = import.meta.env.VITE_SUBSIDIECHECK_URL as string | undefined;
const DEV_PROXY = "/esw";

// Curated indicaties voor bekende regelingen waarvoor de bron geen schoon bedrag
// teruggeeft. ISDE noemt geen los percentage omdat het bedrag per maatregel
// verschilt (isolatie per m², warmtepomp een vast bedrag); wij tonen een eigen
// indicatie i.p.v. een leeg veld. Alléén als terugval: een echt bedrag uit de
// bron wint altijd. Sleutel = de stabiele regeling-id (laatste padsegment).
const CURATED_BEDRAG: Record<string, string> = {
  "isde-subsidie-rijksoverheid": "tot ± 30% van de kosten",
};

// Vult de curated indicatie in waar de bron er geen gaf. Raakt de weergave én de
// mail (die dezelfde client-lijst meestuurt), zonder de edge function te wijzigen.
function metCuratedBedrag(regelingen: SubsidieRegeling[]): SubsidieRegeling[] {
  return regelingen.map((r) =>
    r.bedragIndicatie || !CURATED_BEDRAG[r.id] ? r : { ...r, bedragIndicatie: CURATED_BEDRAG[r.id] },
  );
}

// --- Productie: JSON via de edge function (al verrijkt) ---
// De filters (bewonertype + maatregelen) gaan mee; de function forwardt ze naar
// de bron, zodat Verbeterjehuis exact dezelfde lijst als hun eigen tool geeft.
async function haalViaFunctie(postcode: string, filters: string): Promise<SubsidieRegeling[]> {
  const url = `${FUNCTIE_URL}?postalcode=${encodeURIComponent(postcode)}&${filters}`;
  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
      // Vereist door de Supabase function-gateway; anon-key is publiek.
      apikey: SUPABASE_EXTERNAL_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_EXTERNAL_ANON_KEY}`,
    },
  });
  if (!res.ok) throw new Error(`Subsidiecheck-function gaf status ${res.status}`);
  const data = (await res.json()) as { regelingen?: SubsidieRegeling[] };
  return data.regelingen ?? [];
}

// --- Dev: HTML via de Vite-proxy, client-side geparset + verrijkt ---
async function haalLijstViaProxy(postcode: string, filters: string): Promise<SubsidieRegeling[]> {
  const url = `${DEV_PROXY}/energiesubsidiewijzer?postalcode=${encodeURIComponent(postcode)}&${filters}`;
  const res = await fetch(url, { headers: { Accept: "text/html" } });
  if (!res.ok) throw new Error(`Energiesubsidiewijzer gaf status ${res.status}`);
  return parseResultaten(await res.text());
}

// Detailverrijking staat niet op de lijst; in DEV halen we die per regeling op
// via dezelfde proxy, met een sessie-cache zodat een regeling maar één keer
// wordt opgehaald.
const detailCache = new Map<string, RegelingDetail>();

async function haalDetailViaProxy(bronUrl: string): Promise<RegelingDetail> {
  const pad = new URL(bronUrl, "https://www.verbeterjehuis.nl").pathname;
  const bestaand = detailCache.get(pad);
  if (bestaand) return bestaand;
  try {
    const res = await fetch(`${DEV_PROXY}${pad}`, { headers: { Accept: "text/html" } });
    const detail = res.ok ? parseDetail(await res.text()) : {};
    detailCache.set(pad, detail);
    return detail;
  } catch {
    return {};
  }
}

async function verrijkAlles(regelingen: SubsidieRegeling[]): Promise<SubsidieRegeling[]> {
  const resultaten = await Promise.allSettled(
    regelingen.map(async (r) => verrijk(r, await haalDetailViaProxy(r.bronUrl))),
  );
  return resultaten.map((u, i) => (u.status === "fulfilled" ? u.value : regelingen[i]));
}

export const energiesubsidiewijzerProvider: SubsidieProvider = {
  naam: "Energiesubsidiewijzer",
  async check(input: SubsidieCheckInput): Promise<SubsidieRegeling[]> {
    try {
      // Bewonertype + maatregelen → Verbeterjehuis-filterparameters (bron filtert
      // server-side, exact zoals hun eigen tool).
      const filters = bouwEswFilterQuery(input.bewonertype, input.maatregelen);
      // Een bronfout gooit (→ mock-terugval hieronder); een lege-maar-geldige
      // lijst (0 regelingen voor deze situatie) komt gewoon door en toont de
      // nette "geen regelingen"-staat, niet stiekem voorbeelddata.
      const regelingen = FUNCTIE_URL
        ? await haalViaFunctie(input.postcode, filters)
        : await verrijkAlles(await haalLijstViaProxy(input.postcode, filters));
      return metCuratedBedrag(regelingen);
    } catch (err) {
      // TODO go-live: bij terugval een zachte melding tonen ("basisoverzicht,
      // live bron even niet bereikbaar") i.p.v. stil de basisset serveren.
      console.warn("[Energiesubsidiewijzer] live-bron faalde, terugval op basisset:", err);
      return mockSubsidieProvider.check(input);
    }
  },
};
