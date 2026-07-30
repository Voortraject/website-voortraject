import { SUPABASE_EXTERNAL_ANON_KEY, supabaseExternal } from "@/integrations/supabase/external-client";
import { normalizePostcode, type PdokAdres } from "@/lib/pdok";
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

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const NAME_RE = /^[\p{L}\s'-]+$/u;

// Zelfde NL-nummercheck als het contactformulier: 0xxxxxxxxx of +31xxxxxxxxx.
export const validatePhoneNL = (raw: string): boolean => {
  const cleaned = raw.replace(/[\s-]/g, "");
  if (!/^[+0-9]+$/.test(cleaned)) return false;
  return /^0[0-9]{9}$/.test(cleaned) || /^\+31[0-9]{9}$/.test(cleaned);
};

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
export function valideerContact(velden: ContactVelden): ContactResultaat {
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
  if (!telefoon) return { fout: "Vul je telefoonnummer in." };
  if (!validatePhoneNL(telefoon))
    return { fout: "Vul een geldig Nederlands telefoonnummer in (bijvoorbeeld 06 12345678)." };

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
// exact dezelfde tabel/kolommen als het contactformulier — alleen `bron`
// verschilt. De kolom `naam` bewust niet meesturen: een BEFORE INSERT-trigger in
// het CRM stelt die zelf samen uit voornaam/tussenvoegsel/achternaam.
//
// `notities` blijft leeg (die kolom is voor het team zelf) en
// `gewenste_maatregelen` raken we niet aan; de aangevinkte onderwerpen gaan naar
// de eigen kolom `subsidiecheck_interesses`.
export async function schrijfSubsidiecheckLead(args: {
  waarden: ContactSchoon;
  input: SubsidieCheckInput;
  adres: Pick<PdokAdres, "straatnaam" | "woonplaatsnaam">;
}): Promise<void> {
  const { waarden, input, adres } = args;
  const { error } = await supabaseExternal.from("leads_bewoners").insert({
    tenant_id: "00000000-0000-0000-0000-000000000001",
    voornaam: waarden.voornaam,
    tussenvoegsel: waarden.tussenvoegsel || null,
    achternaam: waarden.achternaam,
    email: waarden.email,
    telefoon: waarden.telefoon,
    postcode: normalizePostcode(input.postcode),
    huisnummer: input.huisnummer,
    toevoeging: input.toevoeging?.trim() || null,
    straat: adres.straatnaam,
    stad: adres.woonplaatsnaam,
    notities: null,
    subsidiecheck_interesses: bouwSubsidiecheckInteresses(input.maatregelen),
    // Welk formulier de lead opleverde. n8n bepaalt hiermee de taaktitel én of de
    // bevestigingsmail uitgaat: wie alleen de subsidiecheck deed krijgt die niet,
    // want die heeft het overzicht al. CHECK op de kolom: alleen
    // 'contactformulier', 'subsidietool' of NULL.
    formulier: "subsidietool",
    bron: "Subsidiecheck",
    status: "nieuw",
  } as never);
  if (error) throw error;
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
export async function verstuurSubsidiecheckLead(args: {
  waarden: ContactSchoon;
  input: SubsidieCheckInput;
  adres: Pick<PdokAdres, "straatnaam" | "woonplaatsnaam">;
  regelingen: SubsidieRegeling[];
  overzichtUrl?: string;
  honeypot?: string;
}): Promise<void> {
  const { waarden, input, adres, regelingen, overzichtUrl, honeypot } = args;

  if (!MAIL_FUNCTIE_URL) {
    // Terugval: alleen de lead, geen mail.
    await schrijfSubsidiecheckLead({ waarden, input, adres });
    return;
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
}
