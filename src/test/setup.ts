import "@testing-library/jest-dom";

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
