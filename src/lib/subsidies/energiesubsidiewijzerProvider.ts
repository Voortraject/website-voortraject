import {
  SUPABASE_EXTERNAL_ANON_KEY,
} from "@/integrations/supabase/external-client";
import {
  filterOpMaatregelen,
  naarRegeling,
  type EswApiRegeling,
} from "./energiesubsidiewijzerApi";
import type { SubsidieProvider } from "./provider";
import {
  BEWONERTYPE_RESIDENT,
  bouwEswFilterQuery,
  type SubsidieCheckInput,
  type SubsidieRegeling,
} from "./types";

// Live provider tegen de Energiesubsidiewijzer van Milieu Centraal.
//
// Twee modi, afhankelijk van de omgeving:
//  - PRODUCTIE: een edge function (`VITE_SUBSIDIECHECK_URL`) haalt serverside op,
//    vertaalt naar onze types én cachet, en levert JSON. Wij lezen die JSON hier
//    zo over. De API-key van Milieu Centraal zit in die function, niet hier: hij
//    hoort niet in code die naar de browser gaat.
//  - DEV: is die env-var niet gezet, dan praten we via de Vite-proxy `/mc-api`
//    (zie vite.config.ts) rechtstreeks met de API. Die proxy zet de key er
//    server-side op, uit je lokale `.env`. Zo kun je lokaal bouwen zonder de
//    function te deployen.
const FUNCTIE_URL = import.meta.env.VITE_SUBSIDIECHECK_URL as string | undefined;
const DEV_API_PROXY = "/mc-api/regulation/search";

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

// --- Dev: rechtstreeks de API via de Vite-proxy ---
// De API kent geen gedocumenteerde maatregel-parameter, maar levert de
// maatregelen per regeling mee, dus filteren we hier zelf. Precies wat de edge
// function in productie ook doet.
async function haalViaDevProxy(input: SubsidieCheckInput): Promise<SubsidieRegeling[]> {
  const url = new URL(DEV_API_PROXY, window.location.origin);
  url.searchParams.set("cityId", input.postcode);
  url.searchParams.set("targetGroup", BEWONERTYPE_RESIDENT[input.bewonertype]);
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`Energiesubsidiewijzer-API gaf status ${res.status}`);
  const data = await res.json();
  if (!Array.isArray(data)) throw new Error("Energiesubsidiewijzer-API gaf geen lijst terug");
  return filterOpMaatregelen(data as EswApiRegeling[], input.maatregelen).map(naarRegeling);
}

export const energiesubsidiewijzerProvider: SubsidieProvider = {
  naam: "Energiesubsidiewijzer",
  async check(input: SubsidieCheckInput): Promise<SubsidieRegeling[]> {
    // Een bronfout gooit hier bewust DOOR (geen stille terugval op voorbeelddata
    // meer): react-query retry't en toont daarna de eerlijke foutstaat met
    // "Opnieuw proberen". Nepdata tonen is erger dan een nette fout, want de
    // bezoeker neemt beslissingen op dit overzicht en krijgt het ook per mail.
    // Bijkomend: een provider die intern catcht schakelt die retry-laag uit, en
    // een fout resultaat bleef zo 5 minuten in de query-cache hangen.
    // Een lege-maar-geldige lijst (0 regelingen voor deze situatie) komt gewoon
    // door en toont de nette "geen regelingen"-staat.
    const regelingen = FUNCTIE_URL
      ? await haalViaFunctie(input.postcode, bouwEswFilterQuery(input.bewonertype, input.maatregelen))
      : await haalViaDevProxy(input);
    return metCuratedBedrag(regelingen);
  },
};
