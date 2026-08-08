import { SUPABASE_EXTERNAL_ANON_KEY, supabaseExternal } from "@/integrations/supabase/external-client";
import { normalizePostcode, type PdokAdres } from "@/lib/pdok";
import { TELEFOON_FOUT, validatePhoneNL } from "@/lib/telefoon";
import {
  ALLE_MAATREGELEN,
  MAATREGEL_LABELS,
  type Maatregel,
  type SubsidieCheckInput,
  type SubsidieRegeling,
} from "@/lib/subsidies";

// Gedeelde logica voor de twee lead-formulieren van de subsidiecheck: de
// gegevens-poort (StapGegevens) en het "mail mij dit overzicht"-blok
// (MailOverzicht). Eén plek voor de validatie én voor de `leads_bewoners`-insert
// zodat de kolommen niet uiteenlopen (data-integriteit, CLAUDE.md-regel 2).

// Alle schrijfroutes naar het CRM lopen door dit bestand: de poort, het
// mailblok en het vraagblok. Daarom zit de testmodus-check hier en niet in de
// componenten. Eén plek, geen pad dat er per ongeluk langs kan.
import { isTestmodus } from "@/config/testmodus";

/** Logt wat er in testmodus níet is weggeschreven, zodat je het toch kunt nalezen. */
function meldTestmodus(wat: string, payload: unknown): void {
  console.info(`[subsidiecheck testmodus] ${wat}. Dit zou naar het CRM zijn gegaan:`, payload);
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const NAME_RE = /^[\p{L}\s'-]+$/u;

// De nummercheck woont in src/lib/telefoon.ts en wordt gedeeld met het
// contactformulier. Hier ook geëxporteerd zodat bestaande imports blijven werken.
export { validatePhoneNL };

// Bewust géén HTML-escaping op de invoer: wat we opslaan moet exact zijn wat de
// bezoeker typte. Escapen hoort bij het renderen (React doet dat zelf, en het
// CRM toont deze kolommen als platte tekst), niet bij het opslaan.

// Ruwe invoer uit de formuliervelden.
export interface ContactVelden {
  voornaam: string;
  tussenvoegsel: string;
  achternaam: string;
  email: string;
  telefoon: string;
}

// Getrimde, gevalideerde waarden (tussenvoegsel is "" als het leeg is).
export interface ContactSchoon {
  voornaam: string;
  tussenvoegsel: string;
  achternaam: string;
  email: string;
  telefoon: string;
}

export type ContactResultaat = { fout: string } | { waarden: ContactSchoon };

// Valideert de contactvelden en geeft óf de eerste foutmelding, óf de schone
// waarden terug. Pure functie (geen state/side effects) zodat beide formulieren
// exact dezelfde regels delen en dit los te testen is.
export function valideerContact(
  velden: ContactVelden,
  opties: {
    /** False op de vraag-route van het resultaat: daar is bellen niet het doel. */
    telefoonVerplicht?: boolean;
  } = {},
): ContactResultaat {
  const telefoonVerplicht = opties.telefoonVerplicht ?? true;
  const voornaam = velden.voornaam.trim();
  if (!voornaam) return { fout: "Vul je voornaam in." };
  if (voornaam.length > 100 || !NAME_RE.test(voornaam)) return { fout: "Je voornaam bevat ongeldige tekens." };

  const tussenvoegsel = velden.tussenvoegsel.trim();
  if (tussenvoegsel && (tussenvoegsel.length > 25 || !NAME_RE.test(tussenvoegsel)))
    return { fout: "Het tussenvoegsel bevat ongeldige tekens." };

  const achternaam = velden.achternaam.trim();
  if (!achternaam || achternaam.length < 2 || achternaam.length > 100 || !NAME_RE.test(achternaam))
    return { fout: "Vul je achternaam in." };

  const email = velden.email.trim();
  if (!EMAIL_RE.test(email) || email.length > 255) return { fout: "Dit lijkt geen geldig e-mailadres." };

  const telefoon = velden.telefoon.trim();
  if (!telefoon && telefoonVerplicht) return { fout: "Vul je telefoonnummer in." };
  // Een ingevuld nummer moet altijd kloppen, ook als het veld optioneel is: een
  // onbruikbaar nummer in het CRM is erger dan een leeg veld.
  if (telefoon && !validatePhoneNL(telefoon)) return { fout: TELEFOON_FOUT };

  return { waarden: { voornaam, tussenvoegsel, achternaam, email, telefoon } };
}

// De aangevinkte interesses als platte tekst voor `subsidiecheck_interesses`,
// bijvoorbeeld "Isolatie & glas, Warmtepomp, Thuisbatterij". Altijd in de
// volgorde waarin de chips op de site staan (ALLE_MAATREGELEN), niet in
// klikvolgorde, zodat het CRM leest zoals de bezoeker het zag. Rauwe tekst: de
// `&` blijft een gewone ampersand (escapen hoort bij het renderen).
export function bouwSubsidiecheckInteresses(maatregelen: Maatregel[]): string {
  return ALLE_MAATREGELEN.filter((m) => maatregelen.includes(m))
    .map((m) => MAATREGEL_LABELS[m])
    .join(", ");
}

// Schrijft de subsidiecheck-lead rechtstreeks in het CRM (`leads_bewoners`),
// exact dezelfde tabel/kolommen als het contactformulier — alleen `bron` en
// `formulier` verschillen. De kolom `naam` bewust niet meesturen: een BEFORE INSERT-trigger in
// het CRM stelt die zelf samen uit voornaam/tussenvoegsel/achternaam.
//
// `notities` blijft leeg (die kolom is voor het team zelf) en
// `gewenste_maatregelen` raken we niet aan; de aangevinkte onderwerpen gaan naar
// de eigen kolom `subsidiecheck_interesses`.
/**
 * Wat we uit publieke bronnen al weten over de woning en meesturen naar het CRM,
 * zodat het team het niet hoeft op te zoeken. Alleen kolommen die daar al bestaan.
 */
export interface LeadVerrijking {
  /** Energieklasse uit EP-Online, bijv. "C". Alleen als er echt een label is. */
  energielabel?: string;
  /** Bouwjaar uit de BAG. */
  bouwjaar?: number;
}

/** Laat de verrijkingsvelden weg als ze leeg zijn (geen lege kolommen schrijven). */
function verrijkingsVelden(verrijking?: LeadVerrijking): Record<string, string | number> {
  const velden: Record<string, string | number> = {};
  if (verrijking?.energielabel) velden.energielabel = verrijking.energielabel;
  if (typeof verrijking?.bouwjaar === "number") velden.bouwjaar = verrijking.bouwjaar;
  return velden;
}

export async function schrijfSubsidiecheckLead(args: {
  waarden: ContactSchoon;
  input: SubsidieCheckInput;
  adres: Pick<PdokAdres, "straatnaam" | "woonplaatsnaam">;
  /** Vraag van de bezoeker, of de gekozen termijn. Gaat als platte tekst naar `notities`. */
  notitie?: string;
  verrijking?: LeadVerrijking;
}): Promise<void> {
  const { waarden, input, adres, notitie, verrijking } = args;
  if (isTestmodus()) return void meldTestmodus("lead-insert overgeslagen", { waarden, input, notitie });
  const extra = verrijkingsVelden(verrijking);
  const { error } = await supabaseExternal.from("leads_bewoners").insert({
    ...extra,
    tenant_id: "00000000-0000-0000-0000-000000000001",
    voornaam: waarden.voornaam,
    tussenvoegsel: waarden.tussenvoegsel || null,
    achternaam: waarden.achternaam,
    email: waarden.email,
    // Leeg nummer als NULL, niet als lege string: de vraag-route op het resultaat
    // vraagt het telefoonnummer niet verplicht.
    telefoon: waarden.telefoon || null,
    postcode: normalizePostcode(input.postcode),
    huisnummer: input.huisnummer,
    toevoeging: input.toevoeging?.trim() || null,
    straat: adres.straatnaam,
    stad: adres.woonplaatsnaam,
    // Normaal leeg (die kolom is voor het team zelf); alleen een vraag van de
    // bezoeker zelf zetten we erin, ongewijzigd zoals getypt.
    notities: notitie?.trim() || null,
    subsidiecheck_interesses: bouwSubsidiecheckInteresses(input.maatregelen),
    // Het bewonertype uit stap 1, in de codes van het `Bewonertype`-type (ook de
    // waarden achter `?type=` in de deel-link). CHECK op de kolom: alleen NULL of
    // 'woningeigenaar' | 'huurder' | 'vve' | 'verhuurder' — het type dwingt dat
    // hier al af, dus geen extra vertaling.
    subsidiecheck_type_bewoner: input.bewonertype,
    // Welk formulier de lead opleverde. n8n bepaalt hiermee de taaktitel én of de
    // bevestigingsmail uitgaat: wie alleen de subsidiecheck deed krijgt die niet,
    // want die heeft het overzicht al. CHECK op de kolom: alleen
    // 'contactformulier', 'subsidietool' of NULL.
    formulier: "subsidietool",
    // Eigen lead uit onze eigen tool, dus bron "Voortraject". Het CRM normaliseert
    // dit (trigger `normaliseer_lead_bron`) via de naam in `lead_bronnen` naar de
    // code `voortraject`; vóór deze wijziging viel "Subsidiecheck" terug op
    // `website`. Welk formulier de lead opleverde staat in `formulier` hierboven.
    bron: "Voortraject",
    status: "nieuw",
  } as never);
  if (!error) return;

  // De verrijkingskolommen zijn een extraatje: als het CRM er een weigert (bijv.
  // een CHECK op `energielabel` die "A+++" niet kent), mag dat nooit de lead
  // kosten. Eén keer opnieuw, zonder die velden.
  if (Object.keys(extra).length > 0) {
    console.error("Lead-insert faalde met verrijking, opnieuw zonder", error);
    return schrijfSubsidiecheckLead({ waarden, input, adres, notitie });
  }
  throw error;
}

// Productie: de edge function (VITE_SUBSIDIECHECK_MAIL_URL) schrijft de lead én
// stuurt de bezoeker het overzicht per mail (Resend). Is de var niet gezet, dan
// valt alles terug op een directe lead-insert: dan gaat er geen mail uit, maar de
// lead gaat niet verloren.
const MAIL_FUNCTIE_URL = import.meta.env.VITE_SUBSIDIECHECK_MAIL_URL as string | undefined;

/** True als de mailfunctie geconfigureerd is (dan wordt het overzicht ook gemaild). */
export const kanOverzichtMailen = !!MAIL_FUNCTIE_URL;

// Schrijft de lead én stuurt (in productie) het overzicht per mail. Via de edge
// function als VITE_SUBSIDIECHECK_MAIL_URL gezet is; anders een directe
// lead-insert zonder mail (de lead gaat nooit verloren). Gedeeld door de
// gegevens-poort (StapGegevens) en het mail-blok onderaan het resultaat
// (MailOverzicht), zodat het maar op één plek staat.
//
// Geeft het lead-id terug zodra de function dat meestuurt. Daarmee kan een vraag
// die de bezoeker later op het resultaat stelt bij dezelfde lead landen, in
// plaats van als tweede, dubbele lead in het CRM.
export async function verstuurSubsidiecheckLead(args: {
  waarden: ContactSchoon;
  input: SubsidieCheckInput;
  adres: Pick<PdokAdres, "straatnaam" | "woonplaatsnaam">;
  regelingen: SubsidieRegeling[];
  /** Kopregel voor `notities`, bijv. de gekozen termijn uit de poort. */
  notitie?: string;
  verrijking?: LeadVerrijking;
  overzichtUrl?: string;
  honeypot?: string;
}): Promise<{ leadId?: string }> {
  const { waarden, input, adres, regelingen, notitie, verrijking, overzichtUrl, honeypot } = args;

  if (isTestmodus()) {
    meldTestmodus("lead + overzichtmail overgeslagen", { waarden, input, notitie, aantalRegelingen: regelingen.length });
    return {};
  }

  if (!MAIL_FUNCTIE_URL) {
    // Terugval: alleen de lead, geen mail.
    await schrijfSubsidiecheckLead({ waarden, input, adres, notitie, verrijking });
    return {};
  }

  const res = await fetch(MAIL_FUNCTIE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // Vereist door de Supabase function-gateway; anon-key is publiek.
      apikey: SUPABASE_EXTERNAL_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_EXTERNAL_ANON_KEY}`,
    },
    body: JSON.stringify({
      voornaam: waarden.voornaam,
      tussenvoegsel: waarden.tussenvoegsel || undefined,
      achternaam: waarden.achternaam,
      email: waarden.email,
      telefoon: waarden.telefoon,
      honeypot: honeypot ?? "",
      notitie,
      energielabel: verrijking?.energielabel,
      bouwjaar: verrijking?.bouwjaar,
      input: {
        postcode: normalizePostcode(input.postcode),
        huisnummer: input.huisnummer,
        toevoeging: input.toevoeging?.trim() || undefined,
        bewonertype: input.bewonertype,
        maatregelen: input.maatregelen,
      },
      adres: { straatnaam: adres.straatnaam, woonplaatsnaam: adres.woonplaatsnaam },
      overzichtUrl,
      // Alleen wat de mail nodig heeft — geen interne filtervelden meesturen.
      regelingen: regelingen.map((r) => ({
        titel: r.titel,
        niveau: r.niveau,
        type: r.type,
        bedragIndicatie: r.bedragIndicatie,
        omschrijving: r.omschrijving,
        bronUrl: r.bronUrl,
      })),
    }),
  });
  if (!res.ok) throw new Error(`subsidiecheck-mail gaf status ${res.status}`);

  // Het id is meegenomen sinds de function het teruggeeft; oudere versies (of een
  // gefaalde parse) leveren gewoon niets op en dan valt een later bericht terug
  // op een nieuwe lead. Nooit hierop laten struikelen: de lead staat al veilig.
  try {
    const data = (await res.json()) as { leadId?: unknown };
    return typeof data.leadId === "string" ? { leadId: data.leadId } : {};
  } catch {
    return {};
  }
}

/** Maximale lengte van een vraag, gelijk aan het bericht op het contactformulier. */
export const MAX_BERICHT = 1000;

/** Valideert een vrije vraag. Geeft de foutmelding, of null als het goed is. */
export function valideerBericht(bericht: string): string | null {
  const tekst = bericht.trim();
  if (!tekst) return "Vul je vraag in.";
  if (tekst.length > MAX_BERICHT) return `Je vraag is te lang (maximaal ${MAX_BERICHT} tekens).`;
  return null;
}

// Stuurt een vraag die de bezoeker op het resultaat stelt. De vraag komt in
// `notities` op de lead én per mail bij het team, met de bezoeker als
// antwoordadres zodat "beantwoorden" meteen bij de juiste persoon uitkomt.
//
// Met een bekend `leadId` (de bezoeker kwam net door de gegevens-poort) vult de
// function de notitie aan bij díe lead: geen tweede lead voor dezelfde persoon.
// Zonder id, of zonder edge function, wordt het een nieuwe lead met de vraag in
// `notities` — een dubbele lead is vervelend, een verloren vraag is erger.
export async function verstuurSubsidiecheckBericht(args: {
  waarden: ContactSchoon;
  bericht: string;
  input: SubsidieCheckInput;
  adres: Pick<PdokAdres, "straatnaam" | "woonplaatsnaam">;
  leadId?: string;
  overzichtUrl?: string;
  honeypot?: string;
}): Promise<void> {
  const { waarden, bericht, input, adres, leadId, overzichtUrl, honeypot } = args;

  if (isTestmodus()) return meldTestmodus("vraag niet verstuurd", { waarden, input, bericht });

  if (!MAIL_FUNCTIE_URL) {
    await schrijfSubsidiecheckLead({ waarden, input, adres, notitie: bericht });
    return;
  }

  const res = await fetch(MAIL_FUNCTIE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_EXTERNAL_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_EXTERNAL_ANON_KEY}`,
    },
    body: JSON.stringify({
      actie: "bericht",
      leadId,
      bericht,
      voornaam: waarden.voornaam,
      tussenvoegsel: waarden.tussenvoegsel || undefined,
      achternaam: waarden.achternaam,
      email: waarden.email,
      telefoon: waarden.telefoon || undefined,
      honeypot: honeypot ?? "",
      input: {
        postcode: normalizePostcode(input.postcode),
        huisnummer: input.huisnummer,
        toevoeging: input.toevoeging?.trim() || undefined,
        bewonertype: input.bewonertype,
        maatregelen: input.maatregelen,
      },
      adres: { straatnaam: adres.straatnaam, woonplaatsnaam: adres.woonplaatsnaam },
      overzichtUrl,
    }),
  });
  if (!res.ok) throw new Error(`subsidiecheck-mail (bericht) gaf status ${res.status}`);
}
