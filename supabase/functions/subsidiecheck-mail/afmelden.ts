// Afmelden voor herinneringen onder het subsidieoverzicht (CRM-plan
// tasks/mail-versturen/afmelden-plan.md, 3.2, 3.3 en 3.8).
//
// Het overzicht zelf gaat altijd: de bezoeker vroeg er net om. De afmeldlink is
// voor de herinneringen en opvolgmails die het CRM daarna stuurt. Wie zich hier
// afmeldt, krijgt die niet meer. Een puur bestand naast de function, net als
// beveiliging.ts, zodat vitest het rechtstreeks kan importeren
// (src/test/subsidiecheckAfmelden.test.ts).
//
// Benodigde databasefunctie (levert het CRM, live sinds 25-11-2026):
//
//   public.mail_uitschrijflinks(p_tenant uuid, p_email text) returns jsonb
//
// Alleen service_role. Maakt zo nodig de rij in `mail_uitschrijvingen` en geeft
// {"token", "kop", "pagina"} terug, of null bij een leeg of ongeldig adres. Het
// token ligt vast per adres, dus elke mail aan dat adres krijgt dezelfde link.

export type Afmeldlinks = {
  /** Voor de kop List-Unsubscribe: de edge function `mail-uitschrijven`, die de POST van de mailapp afhandelt. */
  kop: string;
  /** Voor de zichtbare regel in de mail: de pagina in het bewonersportaal. */
  pagina: string;
};

// Alleen het stukje client dat we hier gebruiken, net als RemClient in index.ts.
// `PromiseLike`: `rpc()` levert een thenable builder op, geen kale Promise.
export type AfmeldClient = {
  rpc: (
    naam: string,
    args: Record<string, unknown>,
  ) => PromiseLike<{ data: unknown; error: { code?: string; message?: string } | null }>;
};

export const AFMELD_FUNCTIE = "mail_uitschrijflinks";

// Het vaste contract uit het CRM-plan (3.8). Wijkt een link daarvan af, dan gaat
// hij niet in de mail: liever geen afmeldregel dan een link naar een plek die we
// niet kennen, in een mail aan een vreemd adres.
const KOP_BEGIN = "https://lfelnfukbrxznkevnevr.supabase.co/functions/v1/mail-uitschrijven?t=";
const PAGINA_BEGIN = "https://mijn.voortraject.nl/afmelden/";
// nieuw_portaal_token() geeft 32 tekens URL-veilige base64. Iets ruimer, zodat
// een langer token later niet stil de afmeldregel uitzet.
const TOKEN_RE = /^[A-Za-z0-9_-]{16,128}$/;

/** Bewust kort: een trage database mag de mail aan de bezoeker niet ophouden. */
export const AFMELD_TIMEOUT_MS = 3000;

/** Leest het antwoord van de databasefunctie; alles wat niet precies klopt wordt null. */
export function leesAfmeldlinks(data: unknown): Afmeldlinks | null {
  if (typeof data !== "object" || data === null) return null;
  const { token, kop, pagina } = data as Record<string, unknown>;
  if (typeof token !== "string" || !TOKEN_RE.test(token)) return null;
  if (kop !== `${KOP_BEGIN}${token}` || pagina !== `${PAGINA_BEGIN}${token}`) return null;
  return { kop, pagina };
}

/**
 * Haalt de afmeldlinks voor dit adres op. Geeft null bij elke hapering (fout,
 * geen antwoord binnen de tijd, onverwacht antwoord): dan gaat het overzicht
 * zonder kop en zonder afmeldregel. Logt alleen de uitkomst, nooit het adres of
 * het token.
 */
export async function haalAfmeldlinks(
  client: AfmeldClient,
  tenant: string,
  email: string,
  timeoutMs = AFMELD_TIMEOUT_MS,
): Promise<Afmeldlinks | null> {
  let klok: ReturnType<typeof setTimeout> | undefined;
  try {
    const teLaat = new Promise<"te-laat">((resolve) => {
      klok = setTimeout(() => resolve("te-laat"), timeoutMs);
    });
    const antwoord = await Promise.race([client.rpc(AFMELD_FUNCTIE, { p_tenant: tenant, p_email: email }), teLaat]);
    if (antwoord === "te-laat") {
      console.warn("Afmeldlinks: geen antwoord binnen de tijd, overzicht gaat zonder afmeldregel");
      return null;
    }
    if (antwoord.error) {
      // Alleen de code: de melding zelf kan in theorie een waarde uit de aanroep bevatten.
      console.error(`Afmeldlinks niet op te halen (${antwoord.error.code ?? "onbekend"}), overzicht gaat zonder afmeldregel`);
      return null;
    }
    const links = leesAfmeldlinks(antwoord.data);
    if (!links) {
      console.warn(
        antwoord.data === null
          ? "Afmeldlinks: geen link voor dit adres, overzicht gaat zonder afmeldregel"
          : "Afmeldlinks: onverwacht antwoord, overzicht gaat zonder afmeldregel",
      );
      return null;
    }
    console.log("Afmeldlinks: opgehaald");
    return links;
  } catch {
    console.error("Afmeldlinks niet op te halen (uitzondering), overzicht gaat zonder afmeldregel");
    return null;
  } finally {
    if (klok !== undefined) clearTimeout(klok);
  }
}

/**
 * De koppen voor afmelden met één klik (RFC 8058), of undefined zonder links.
 * Alleen HTTPS, geen mailto: (die kwam bij de Email Agent op info@ binnen).
 */
export function afmeldKoppen(links: Afmeldlinks | null): Record<string, string> | undefined {
  if (!links) return undefined;
  return {
    "List-Unsubscribe": `<${links.kop}>`,
    "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
  };
}
