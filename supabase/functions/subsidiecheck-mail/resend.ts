// Versturen via Resend, verhuisd uit index.ts (november 2026). Een puur bestand
// naast de function, zodat vitest met een nagebootste fetch kan zien wat er
// precies naar Resend gaat (src/test/subsidiecheckAfmelden.test.ts).

export const RESEND_ENDPOINT = "https://api.resend.com/emails";

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
