// Kleine helper voor GTM-events (dataLayer). Consent-veilig: wij pushen
// alleen events; of er daadwerkelijk tags vuren beslist GTM op basis van de
// Axeptio-consentstatus (Google Consent Mode). Push dus nooit
// persoonsgegevens (naam, e-mail, volledig adres) — alleen grove context
// zoals gemeente of aantallen.

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

export function pushGtmEvent(event: string, data: Record<string, string | number> = {}) {
  if (typeof window === "undefined") return;
  window.dataLayer?.push({ event, ...data });
}
