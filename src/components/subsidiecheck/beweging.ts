import { useEffect, type RefObject } from "react";

// Beweging op het resultaat: blokken veren gestaffeld in en tellers tellen op.
// Bij "minder beweging" staat alles meteen op zijn plek (src/test/setup.ts zet
// die schakelaar in tests aan, dus tests wachten nergens op).

export const minderBeweging = (): boolean =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Laat elk element met `data-veer` binnen de container gestaffeld inveren. Wat
 * al in beeld staat begint meteen; wat lager staat wacht tot het in beeld
 * scrolt. Zonder IntersectionObserver of bij minder beweging: niets, dan staat
 * alles gewoon stil.
 */
export function useStaffel(container: RefObject<HTMLElement>, aan = true): void {
  useEffect(() => {
    const el = container.current;
    if (!aan || !el || minderBeweging()) return;
    const items = [...el.querySelectorAll<HTMLElement>("[data-veer]")];
    let volgnummer = 0;
    const veer = (item: HTMLElement, i: number) => {
      item.style.setProperty("--i", String(i));
      item.classList.remove("rs-wacht");
      item.classList.add("rs-in");
    };
    const io =
      "IntersectionObserver" in window
        ? new IntersectionObserver(
            (entries) => {
              let j = 0;
              for (const e of entries) {
                if (!e.isIntersecting) continue;
                io?.unobserve(e.target);
                veer(e.target as HTMLElement, j++);
              }
            },
            { rootMargin: "0px 0px -8% 0px" },
          )
        : null;
    for (const item of items) {
      if (item.getBoundingClientRect().top < window.innerHeight) veer(item, volgnummer++);
      else if (io) {
        item.classList.add("rs-wacht");
        io.observe(item);
      }
    }
    return () => io?.disconnect();
  }, [container, aan]);
}
