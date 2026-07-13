import { parseResultaten } from "./energiesubsidiewijzer";
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

export const energiesubsidiewijzerProvider: SubsidieProvider = {
  naam: "Energiesubsidiewijzer",
  async check(input: SubsidieCheckInput): Promise<SubsidieRegeling[]> {
    try {
      const regelingen = await haalLijst(input.postcode);
      // Elke NL-postcode heeft altijd landelijke regelingen; 0 betekent dus een
      // parse-/bronprobleem, niet "echt niets" → val netjes terug.
      if (regelingen.length === 0) throw new Error("geen regelingen geparset");
      return regelingen;
    } catch (err) {
      // TODO go-live: bij terugval een zachte melding tonen ("basisoverzicht,
      // live bron even niet bereikbaar") i.p.v. stil de basisset serveren.
      console.warn("[Energiesubsidiewijzer] live-bron faalde, terugval op basisset:", err);
      return mockSubsidieProvider.check(input);
    }
  },
};
