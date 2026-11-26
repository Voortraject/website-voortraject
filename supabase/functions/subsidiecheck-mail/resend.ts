// Versturen via Resend, verhuisd uit index.ts (november 2026). Een puur bestand
// naast de function, zodat vitest met een nagebootste fetch kan zien wat er
// precies naar Resend gaat (src/test/subsidiecheckAfmelden.test.ts).

export const RESEND_ENDPOINT = "https://api.resend.com/emails";

// De afzender van alle mail uit deze function: hetzelfde teamadres als de rest van de teammail (CRM en n8n, TEAM_AFZENDER
// in supabase/functions/_gedeeld/mail/adressen.ts van de CRM-repo). Was noreply@, terwijl de mail zegt "antwoord op deze
// mail": een tweede teamadres voor dezelfde soort mail (besluit eigenaar 26-11-2026, afzender-plan.md in de CRM-repo).
// Bewust een vaste waarde en niet meer het geheim MAIL_FROM: dan kan een oude waarde daar niet stil blijven winnen.
// Altijd het Resend-subdomein: het hoofddomein staat sinds 28-10-2026 niet meer in Resend.
export const AFZENDER = "Voortraject <team@mail.voortraject.nl>";

export async function verstuurMail(opts: {
  apiKey: string;
  from: string;
  to: string;
  replyTo: string;
  subject: string;
  html: string;
  /** Tekstdeel naast de HTML (multipart/alternative). */
  text?: string;
  /** Extra mailkoppen, zoals List-Unsubscribe (afmelden.ts). */
  headers?: Record<string, string>;
}): Promise<boolean> {
  const body: Record<string, unknown> = {
    from: opts.from,
    to: [opts.to],
    reply_to: opts.replyTo,
    subject: opts.subject,
    html: opts.html,
  };
  if (opts.text) body.text = opts.text;
  if (opts.headers) body.headers = opts.headers;

  const res = await fetch(RESEND_ENDPOINT, {
    method: "POST",
    headers: { Authorization: `Bearer ${opts.apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    console.error("Resend-fout", res.status, await res.text());
    return false;
  }
  return true;
}
