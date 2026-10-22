import { useEffect, type RefObject } from "react";

// Beweging van de site: blokken veren gestaffeld in als ze in beeld komen.
// Bij "minder beweging" staat alles meteen op zijn plek (src/test/setup.ts zet
// die schakelaar in tests aan, dus tests wachten nergens op).
//
// Begonnen in de subsidietool (src/components/subsidiecheck/beweging.ts
// exporteert dit nog door, met de klassen van het resultaat); de rest van de
// site gebruikt de klassen hs-in en hs-wacht uit src/styles/huisstijl.css.

export const minderBeweging = (): boolean =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export interface StaffelKlassen {
  /** Klasse die de veer-animatie start. */
  in: string;
  /** Klasse voor de wachtstand onder de vouw. */
  wacht: string;
}

const SITE: StaffelKlassen = { in: "hs-in", wacht: "hs-wacht" };

/**
 * Laat elk element met `data-veer` binnen de container gestaffeld inveren. Wat
 * al in beeld staat begint meteen; wat lager staat wacht tot het in beeld
 * scrolt, en wordt daarna losgelaten. Zonder IntersectionObserver of bij minder
 * beweging: niets, dan staat alles gewoon stil.
 *
 * Zet `data-veer` niet op de hero of iets anders in het eerste scherm dat de
 * laadsnelheid bepaalt: dat moet er meteen staan.
 */
export function useStaffel(container: RefObject<HTMLElement>, aan = true, klassen: StaffelKlassen = SITE): void {
  const { in: inKlasse, wacht } = klassen;
  useEffect(() => {
    const el = container.current;
    if (!aan || !el || minderBeweging()) return;
    const items = [...el.querySelectorAll<HTMLElement>("[data-veer]")];
    let volgnummer = 0;
    const veer = (item: HTMLElement, i: number) => {
      item.style.setProperty("--i", String(i));
      item.classList.remove(wacht);
      item.classList.add(inKlasse);
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
        item.classList.add(wacht);
        io.observe(item);
      }
    }
    return () => io?.disconnect();
  }, [container, aan, inKlasse, wacht]);
}
