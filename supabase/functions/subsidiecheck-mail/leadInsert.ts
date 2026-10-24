// Schrijft een lead uit de subsidiecheck naar `leads_bewoners`, met terugval.
//
// Een los, puur bestand naast de function, net als beveiliging.ts: zo kan vitest
// het rechtstreeks importeren (src/test/subsidiecheckLeadInsert.test.ts).

// Alleen het stukje client dat we hier gebruiken; het echte type komt uit een
// Deno-import die de eslint-config van de site niet kent.
export type LeadClient = {
  from: (tabel: string) => {
    insert: (rij: Record<string, unknown>) => {
      select: (kolommen: string) => {
        maybeSingle: () => Promise<{ data: { id?: unknown } | null; error: unknown }>;
      };
    };
  };
};

/**
 * Weigert de database de insert omdat er een kolom niet bestaat? PostgREST meldt
 * dat als PGRST204 ("Could not find the '…' column … in the schema cache"),
 * Postgres zelf als 42703 (undefined_column).
 */
export function isOnbekendeKolom(fout: unknown): boolean {
  if (typeof fout !== "object" || fout === null) return false;
  const code = (fout as { code?: unknown }).code;
  return code === "PGRST204" || code === "42703";
}

const heeftVelden = (rij: Record<string, unknown>) => Object.keys(rij).length > 0;

/**
 * Schrijft de lead weg en geeft het resultaat van de insert terug (met het id).
 *
 * Twee lagen zijn een extraatje en mogen nooit een lead kosten:
 *
 *  - de verrijking (energielabel, bouwjaar, toestemming): weigert het CRM er een,
 *    bijvoorbeeld door een CHECK die een labelvorm niet kent, dan opnieuw zonder;
 *  - de herkomst (utm-tags, fbclid, meta_event_id): die kolommen komen met een
 *    aparte CRM-migratie, en deze function kan eerder live gaan. Een onbekende
 *    kolom (isOnbekendeKolom) → opnieuw zonder alleen de herkomst, met een
 *    waarschuwing in de log. Zo blijven de verrijking en vooral het
 *    toestemmingsbewijs staan.
 *
 * Bewust geen vlag die iemand na de migratie moet omzetten: zodra de kolommen er
 * zijn, lukt de eerste poging en vullen ze zich vanzelf. Tot dan kost het één
 * mislukte insert per lead en een regel in de log.
 *
 * Volgorde bij een fout: een onbekende kolom laat eerst de herkomst vallen, elke
 * andere fout eerst de verrijking, en als laatste gaat alleen de basis. Hooguit
 * drie pogingen; een fout op de basis zelf komt terug bij de aanroeper.
 */
export async function insertLead(
  supabase: LeadClient,
  basis: Record<string, unknown>,
  verrijking: Record<string, unknown>,
  herkomst: Record<string, unknown> = {},
) {
  const voegIn = (rij: Record<string, unknown>) =>
    supabase.from("leads_bewoners").insert(rij).select("id").maybeSingle();

  let metVerrijking = verrijking;
  let metHerkomst = herkomst;
  let uitkomst = await voegIn({ ...basis, ...metVerrijking, ...metHerkomst });

  while (uitkomst.error && (heeftVelden(metHerkomst) || heeftVelden(metVerrijking))) {
    if (heeftVelden(metHerkomst) && (isOnbekendeKolom(uitkomst.error) || !heeftVelden(metVerrijking))) {
      console.warn(
        "Lead-insert faalde mét herkomst (bestaan de kolommen al? zie de CRM-migratie), opnieuw zonder",
        uitkomst.error,
      );
      metHerkomst = {};
    } else {
      console.error("Lead-insert faalde mét verrijking, opnieuw zonder", uitkomst.error);
      metVerrijking = {};
    }
    uitkomst = await voegIn({ ...basis, ...metVerrijking, ...metHerkomst });
  }
  return uitkomst;
}
