// Route "bericht" van subsidiecheck-mail, als puur bestand naast de function
// zodat vitest het rechtstreeks kan importeren (src/test/subsidiecheckBericht.test.ts).
// Zelfde patroon als beveiliging.ts en leadInsert.ts.
//
// Waarom dit bestaat (oktober 2026, plan in de CRM-repo:
// tasks/subsidietool-antwoorden-overzichtelijk.md): na de poort kan een bezoeker
// drie dingen doen, en tot nu toe gingen ze alle drie als vrije tekst achter
// `notities` en elk met een eigen mail naar het team. Maar twee ervan zijn geen
// bericht, het zijn klikken:
//
//   uitzoeken → de oker knop "Laat gratis uitzoeken wat ik krijg";
//   lastigst  → de keuzes bij "Wat vind je het lastigst?";
//   vraag     → wat de bezoeker zelf typt (DirectContact).
//
// Een klik is een kenmerk van de lead en hoort in een kolom: het CRM toont hem als
// label of vinkje. Alleen een getypte vraag is communicatie: die gaat via de RPC
// `subsidietool_vraag_registreren` naar de communicatietab, en alleen dáárvoor
// krijgt het team een mail. `notities` is weer helemaal van het team; deze route
// raakt dat veld niet meer aan.
//
// Deno kan niets uit src/ importeren, dus de vaste teksten hieronder zijn
// kopieën. src/test/subsidiecheckBericht.test.ts bewaakt dat ze gelijk blijven.

import { insertLead, type LeadClient } from "./leadInsert.ts";

/**
 * Kopie van UITZOEK_BERICHT in src/components/subsidiecheck/uitzoekAanvraag.ts.
 * Alleen nog nodig om een oude gecachte websitebundel te herkennen, die `soort`
 * nog niet meestuurt.
 */
export const UITZOEK_BERICHT =
  "Laat gratis uitzoeken wat ik krijg: ik wil graag dat jullie voor mijn woning uitzoeken welke subsidies en leningen ik echt kan krijgen.";

/** Kopregel van een hulpvraag uit de poort zoals oude bundels hem als `notitie` sturen. */
export const HULPREGEL_PREFIX = "Wil hulp met: ";

export const BERICHT_SOORTEN = ["uitzoeken", "lastigst", "vraag"] as const;
export type BerichtSoort = (typeof BERICHT_SOORTEN)[number];

/** Grenzen op een lijst labels. Ruim: de poort heeft vier tegels, LastigsteVraag vier opties. */
export const MAX_LABELS = 8;
export const MAX_LABEL_LENGTE = 80;

/**
 * Een lijst labels uit de request, of null als hij niet bruikbaar is.
 *
 * Streng, want dit gaat ongewijzigd een text[]-kolom in die het CRM als labels
 * toont: alleen strings, getrimd, lege weg, dubbele weg, hooguit MAX_LABELS
 * stuks van hooguit MAX_LABEL_LENGTE tekens, geen `<` of `>`. Klopt één element
 * niet, dan is de hele lijst ongeldig (null) in plaats van stil ingekort: een
 * half overgenomen keuze ziet er geloofwaardig uit en is dan juist misleidend.
 */
export function schoonLabels(waarde: unknown): string[] | null {
  if (!Array.isArray(waarde)) return null;
  const labels: string[] = [];
  for (const item of waarde) {
    if (typeof item !== "string") return null;
    const label = item.trim();
    if (!label) continue;
    if (label.length > MAX_LABEL_LENGTE || /[<>]/.test(label)) return null;
    if (!labels.includes(label)) labels.push(label);
  }
  if (labels.length === 0 || labels.length > MAX_LABELS) return null;
  return labels;
}

/** Splitst "Kop: a, b, c" na de kop op ", " en controleert het resultaat. */
function labelsUitTekst(rest: string): string[] | null {
  return schoonLabels(rest.split(", "));
}

const LASTIGST_RE = /^Lastigst(?:\s*\(bijgewerkt\))?:\s*([\s\S]*)$/;

export type BepaaldBericht =
  | { soort: "uitzoeken" }
  | { soort: "lastigst"; keuzes: string[] }
  | { soort: "vraag"; tekst: string }
  /** Soort "lastigst" zonder bruikbare keuzes: de aanroeper antwoordt 400. */
  | { soort: "ongeldig" };

/**
 * Wat voor bericht dit is. `soort` uit de request wint; ontbreekt die (een oude
 * gecachte websitebundel, die stuurt alleen tekst), dan leiden we hem af uit de
 * vaste teksten die die bundel stuurt:
 *
 *   precies UITZOEK_BERICHT          → uitzoeken
 *   "Lastigst: a, b" (ook "(bijgewerkt)") → lastigst, keuzes uit de tekst
 *   al het andere                    → vraag
 *
 * Bij twijfel een vraag: die komt in het CRM én in de mail, dus er raakt niets kwijt.
 */
export function bepaalBericht(payload: { soort?: unknown; bericht?: unknown; keuzes?: unknown }): BepaaldBericht {
  const tekst = typeof payload.bericht === "string" ? payload.bericht.trim() : "";
  const opgegeven = BERICHT_SOORTEN.find((s) => s === payload.soort);
  const lastigst = LASTIGST_RE.exec(tekst);
  const soort: BerichtSoort =
    opgegeven ?? (tekst === UITZOEK_BERICHT ? "uitzoeken" : lastigst ? "lastigst" : "vraag");

  if (soort === "uitzoeken") return { soort };
  if (soort === "lastigst") {
    const keuzes = schoonLabels(payload.keuzes) ?? (lastigst ? labelsUitTekst(lastigst[1]) : null);
    return keuzes ? { soort, keuzes } : { soort: "ongeldig" };
  }
  return { soort, tekst };
}

/**
 * De hulpvragen uit de poort voor `subsidiecheck_hulpvragen`, plus wat er van
 * `notitie` nog naar `notities` mag.
 *
 * `hulpvragen` uit de request wint. Een oude bundel stuurt alleen de tekstregel
 * "Wil hulp met: a, b"; dan halen we de labels daaruit. De nieuwe bundel stuurt
 * beide (zodat een oude function hem ook nog begrijpt), en dan is die regel
 * dubbel. Een hulpregel komt dus nooit meer in `notities`, tenzij hij niet te
 * ontleden is en er ook geen `hulpvragen` zijn: onbekende tekst gooien we niet weg.
 */
export function bepaalHulpvragen(
  hulpvragenRuw: unknown,
  notitie: string | null,
): { hulpvragen: string[] | null; notitie: string | null } {
  const uitRequest = schoonLabels(hulpvragenRuw);
  if (!notitie || !notitie.startsWith(HULPREGEL_PREFIX)) return { hulpvragen: uitRequest, notitie };
  if (uitRequest) return { hulpvragen: uitRequest, notitie: null };
  const uitTekst = labelsUitTekst(notitie.slice(HULPREGEL_PREFIX.length));
  return uitTekst ? { hulpvragen: uitTekst, notitie: null } : { hulpvragen: null, notitie };
}

// ---- De route zelf ----

/** RPC uit het CRM; zie de kop van index.ts voor de signatuur. */
export const VRAAG_RPC = "subsidietool_vraag_registreren";

// Alleen het stukje client dat deze route gebruikt, net als LeadClient. Let op
// `PromiseLike`: de builders van supabase-js zijn thenables, geen kale Promises.
type Lezen = {
  eq: (kolom: string, waarde: string) => Lezen;
  maybeSingle: () => PromiseLike<{ data: { id?: unknown } | null; error: unknown }>;
};
type Bijwerken = PromiseLike<{ error: unknown }> & {
  eq: (kolom: string, waarde: string) => Bijwerken;
  is: (kolom: string, waarde: null) => Bijwerken;
};
export type BerichtClient = {
  from: (tabel: string) => ReturnType<LeadClient["from"]> & {
    select: (kolommen: string) => Lezen;
    update: (rij: Record<string, unknown>) => Bijwerken;
  };
  rpc: (
    naam: string,
    args: Record<string, unknown>,
  ) => PromiseLike<{ data: unknown; error: { code?: string; message?: string } | null }>;
};

export type BerichtUitkomst =
  | { ok: true; mailed: boolean; nieuweLead: boolean }
  | { ok: false; fout: string };

/**
 * Verwerkt een bericht dat al door validatie, honeypot en volumerem is.
 *
 * Met een `leadId` dat bij dit e-mailadres hoort, werken we die lead bij; anders
 * maken we er een (een dubbele lead is vervelend, een verloren aanvraag erger).
 * `stuurTeamMail` wordt alleen bij een getypte vraag aangeroepen.
 */
export async function verwerkBericht(
  deps: {
    supabase: BerichtClient;
    /** `opgeslagen`: staat de vraag in de communicatietab, of heeft alleen de mail hem? */
    stuurTeamMail: (opts: { tekst: string; nieuweLead: boolean; opgeslagen: boolean }) => Promise<boolean>;
    nu?: () => Date;
  },
  args: {
    bericht: Exclude<BepaaldBericht, { soort: "ongeldig" }>;
    leadId: string | null;
    email: string;
    tenantId: string;
    /**
     * De gewone leadvelden (met `subsidiecheck_hulpvragen` als die er zijn), voor
     * als er een nieuwe lead nodig is. Zonder `notities`.
     */
    leadVelden: Record<string, unknown>;
    verrijking: Record<string, unknown>;
    herkomst: Record<string, unknown>;
  },
): Promise<BerichtUitkomst> {
  const { supabase, stuurTeamMail } = deps;
  const nu = (deps.nu ?? (() => new Date()))();
  const { bericht, leadId, email, tenantId } = args;

  // Wat de klik op de lead zet; voor bijwerken én voor een nieuwe lead hetzelfde.
  const klikVelden: Record<string, unknown> =
    bericht.soort === "uitzoeken"
      ? { uitzoeken_aangevraagd_op: nu.toISOString() }
      : bericht.soort === "lastigst"
        ? { subsidiecheck_lastigst: bericht.keuzes }
        : {};

  let id: string | null = null;
  let nieuweLead = true;

  try {
    if (leadId) {
      // Bijwerken mag alleen als id én e-mailadres bij elkaar horen. Een uuid
      // raden is al onbegonnen werk; het bijpassende e-mailadres raden maakt
      // schrijven bij een vreemde lead praktisch onmogelijk.
      const { data: bestaand, error: leesFout } = await supabase
        .from("leads_bewoners")
        .select("id")
        .eq("id", leadId)
        .eq("tenant_id", tenantId)
        .eq("email", email)
        .maybeSingle();
      if (leesFout) console.error("Lead ophalen faalde", leesFout);
      if (typeof bestaand?.id === "string") {
        id = bestaand.id;
        nieuweLead = false;
        if (bericht.soort === "uitzoeken") {
          // Alleen de eerste klik telt: dat is het moment waarop de bewoner om
          // hulp vroeg. Een tweede klik (andere tab, mobiele balk) verandert niets.
          const { error } = await supabase
            .from("leads_bewoners")
            .update(klikVelden)
            .eq("id", id)
            .is("uitzoeken_aangevraagd_op", null);
          if (error) throw error;
        } else if (bericht.soort === "lastigst") {
          // Laatste keuze wint: de bewoner bevestigt zijn hele lijst in één keer.
          const { error } = await supabase.from("leads_bewoners").update(klikVelden).eq("id", id);
          if (error) throw error;
        }
      }
    }

    if (nieuweLead) {
      // `notities` gaat niet mee: die kolom is van het team. De klik zit bij de
      // basisvelden en niet bij de verrijking, want die valt bij een fout weg.
      const basis: Record<string, unknown> = { ...args.leadVelden, ...klikVelden };
      delete basis.notities;
      const { data, error } = await insertLead(supabase, basis, args.verrijking, args.herkomst);
      if (error) throw error;
      id = typeof data?.id === "string" ? data.id : null;
    }
  } catch (err) {
    console.error("Bericht opslaan faalde", err);
    return { ok: false, fout: "opslaan" };
  }

  // Een klik is nu vastgelegd. Geen mail: de lead is al gemeld en het CRM toont
  // de klik bij de lead.
  if (bericht.soort !== "vraag") return { ok: true, mailed: false, nieuweLead };

  // Een getypte vraag: als inkomende regel in de communicatietab. Faalt dat, dan
  // gaat hij nog wel per mail naar het team; pas als óók die mail niet weg kan,
  // is de vraag echt nergens en krijgt de bezoeker een fout.
  let opgeslagen = false;
  if (id) {
    try {
      const { error } = await supabase.rpc(VRAAG_RPC, { p_lead_id: id, p_email: email, p_tekst: bericht.tekst });
      if (error) console.error(`Vraag registreren faalde (${error.code}): ${error.message}`);
      else opgeslagen = true;
    } catch (err) {
      console.error("Vraag registreren faalde", err);
    }
  } else {
    console.error("Vraag registreren overgeslagen: de insert gaf geen lead-id terug");
  }

  let mailed = false;
  try {
    mailed = await stuurTeamMail({ tekst: bericht.tekst, nieuweLead, opgeslagen });
  } catch (err) {
    console.error("Teammail bij vraag faalde", err);
  }
  if (!opgeslagen && !mailed) return { ok: false, fout: "vraag-kwijt" };
  return { ok: true, mailed, nieuweLead };
}
