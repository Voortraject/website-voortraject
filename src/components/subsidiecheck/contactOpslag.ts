// Onthoudt binnen één sessie wie er door de gegevens-poort is gekomen, zodat het
// resultaat niet nóg een keer om naam, e-mail en telefoon hoeft te vragen. Dat
// dubbele invulwerk is precies de reden dat bezoekers na de check afhaken: ze
// hebben hun gegevens al gegeven en krijgen dan een leeg contactformulier.
//
// Bewust `sessionStorage` (weg zodra het tabblad sluit) en bewust alleen de
// gegevens die de bezoeker zelf net heeft ingevuld. `leadId` komt terug van de
// edge function en laat een later bericht bij dezelfde lead landen in plaats van
// een tweede, dubbele lead in het CRM.

const SLEUTEL = "sc_contact";

export type BekendContact = {
  voornaam: string;
  tussenvoegsel?: string;
  achternaam: string;
  email: string;
  telefoon?: string;
  /** Id van de zojuist aangemaakte lead in het CRM, als de function die teruggaf. */
  leadId?: string;
};

/** Bewaart het contact van deze sessie. Faalt stil: opslag is een gemak, geen eis. */
export function bewaarContact(contact: BekendContact): void {
  try {
    sessionStorage.setItem(SLEUTEL, JSON.stringify(contact));
  } catch {
    /* private mode of vol → het resultaat vraagt de gegevens gewoon opnieuw */
  }
}

/** Het contact van deze sessie, of null. Ongeldige inhoud telt als niets. */
export function leesContact(): BekendContact | null {
  try {
    const ruw = sessionStorage.getItem(SLEUTEL);
    if (!ruw) return null;
    const data = JSON.parse(ruw) as Partial<BekendContact>;
    // Minimale eis om het formulier te mogen overslaan: een e-mailadres om het
    // antwoord naartoe te sturen, en een voornaam om mee aan te spreken.
    if (typeof data.email !== "string" || !data.email.includes("@")) return null;
    if (typeof data.voornaam !== "string" || data.voornaam.trim() === "") return null;
    return {
      voornaam: data.voornaam,
      tussenvoegsel: typeof data.tussenvoegsel === "string" ? data.tussenvoegsel : undefined,
      achternaam: typeof data.achternaam === "string" ? data.achternaam : "",
      email: data.email,
      telefoon: typeof data.telefoon === "string" ? data.telefoon : undefined,
      leadId: typeof data.leadId === "string" ? data.leadId : undefined,
    };
  } catch {
    return null;
  }
}

/** Vult het bewaarde contact aan, bijvoorbeeld met een later opgegeven nummer. */
export function vulContactAan(velden: Partial<BekendContact>): void {
  const huidig = leesContact();
  if (!huidig) return;
  bewaarContact({ ...huidig, ...velden });
}
