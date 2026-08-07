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

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});
