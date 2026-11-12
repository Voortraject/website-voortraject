import "@testing-library/jest-dom";
import { DOH_URL } from "@/lib/email";

// jsdom kent deze observers niet; de carrousel (embla) valt er hard over zodra
// een test een pagina rendert waar er één op staat.
class LegeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}
Object.defineProperty(window, "IntersectionObserver", { writable: true, value: LegeObserver });
Object.defineProperty(window, "ResizeObserver", { writable: true, value: LegeObserver });
Object.defineProperty(globalThis, "IntersectionObserver", { writable: true, value: LegeObserver });
Object.defineProperty(globalThis, "ResizeObserver", { writable: true, value: LegeObserver });

// jsdom implementeert scrollIntoView niet. De formulieren scrollen daarmee naar
// het eerste veld met een fout (focusFirstError), dus elke test die een afgekeurde
// inzending doet, viel er anders over met een losse "unhandled rejection".
Object.defineProperty(Element.prototype, "scrollIntoView", { writable: true, value: () => {} });

// `prefers-reduced-motion` staat in tests bewust AAN. De zoeksequentie van de
// subsidiecheck duurt anders ruim drie seconden aan echte timers, en elke test
// die de poort of het resultaat rendert zou daarop moeten wachten. Met deze
// voorkeur slaat de sequentie zichzelf over, precies zoals bij een bezoeker die
// bewegingsreductie aan heeft staan. Wie de sequentie zelf wil testen, mockt
// matchMedia in dat testbestand.
const REDUCED_MOTION = "prefers-reduced-motion";

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: query.includes(REDUCED_MOTION),
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

// Geen echte DNS-verzoeken in tests. De e-mailvelden vragen bij Cloudflare na of er op het
// domein mail kan aankomen (src/lib/email.ts). Zonder deze regel hangen formuliertests af van
// het netwerk, en "example.nl" uit de fixtures heeft echt een null MX: elke inzending zou dan
// stranden. Zo krijgt elke test het fail-open-pad (geen oordeel, gewoon door). Een test die de
// check zelf wil zien, zet zijn eigen fetch neer.
const echteFetch = globalThis.fetch;
globalThis.fetch = ((invoer: RequestInfo | URL, opties?: RequestInit) => {
  const url = invoer instanceof Request ? invoer.url : String(invoer);
  if (url.startsWith(DOH_URL)) return Promise.reject(new TypeError("Geen DNS in tests"));
  return echteFetch(invoer, opties);
}) as typeof fetch;
