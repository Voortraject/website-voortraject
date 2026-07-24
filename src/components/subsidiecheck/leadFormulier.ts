import { supabaseExternal } from "@/integrations/supabase/external-client";
import { normalizePostcode, type PdokAdres } from "@/lib/pdok";
import type { SubsidieCheckInput } from "@/lib/subsidies";

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

export const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));

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

// Schrijft de subsidiecheck-lead rechtstreeks in het CRM (`leads_bewoners`),
// exact dezelfde tabel/kolommen als het contactformulier — alleen `bron`
// verschilt. De kolom `naam` bewust niet meesturen: een BEFORE INSERT-trigger in
// het CRM stelt die zelf samen uit voornaam/tussenvoegsel/achternaam.
export async function schrijfSubsidiecheckLead(args: {
  waarden: ContactSchoon;
  input: SubsidieCheckInput;
  adres: Pick<PdokAdres, "straatnaam" | "woonplaatsnaam">;
  notities: string;
}): Promise<void> {
  const { waarden, input, adres, notities } = args;
  const { error } = await supabaseExternal.from("leads_bewoners").insert({
    tenant_id: "00000000-0000-0000-0000-000000000001",
    voornaam: escapeHtml(waarden.voornaam),
    tussenvoegsel: waarden.tussenvoegsel ? escapeHtml(waarden.tussenvoegsel) : null,
    achternaam: escapeHtml(waarden.achternaam),
    email: waarden.email,
    telefoon: waarden.telefoon,
    postcode: normalizePostcode(input.postcode),
    huisnummer: input.huisnummer,
    toevoeging: input.toevoeging?.trim() ? escapeHtml(input.toevoeging.trim()) : null,
    straat: escapeHtml(adres.straatnaam),
    stad: escapeHtml(adres.woonplaatsnaam),
    notities,
    bron: "Subsidiecheck",
    status: "nieuw",
  } as never);
  if (error) throw error;
}
