import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// De onderkant van de homepagina in de huisstijl van oktober 2026: gedrag dat
// bij het herontwerp verandert of juist moet blijven.
//  - de cijferband telt één keer op, niet bij elke passage opnieuw;
//  - de reviews schuiven niet meer vanzelf (geen autoplay);
//  - de veelgestelde vragen: één tegelijk open, met kloppende aria.

const { useGoogleReviewsMock } = vi.hoisted(() => ({ useGoogleReviewsMock: vi.fn() }));
vi.mock("@/hooks/useGoogleReviews", () => ({ useGoogleReviews: useGoogleReviewsMock }));

import { Cijfers } from "@/components/sections/Cijfers";
import { Faq } from "@/components/sections/Faq";
import { Reviews } from "@/components/sections/Reviews";
import { ReviewsCompact } from "@/components/ReviewsCompact";

const origineelMatchMedia = window.matchMedia;
const origineelIO = window.IntersectionObserver;

// Deze tests gaan juist over beweging, dus hier staat bewegingsreductie UIT.
const zonderReductie = () => {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })) as typeof window.matchMedia;
};

beforeEach(() => {
  useGoogleReviewsMock.mockReturnValue({ reviews: null, stats: { rating: 4.9, user_rating_count: 33 } });
});

afterEach(() => {
  window.matchMedia = origineelMatchMedia;
  window.IntersectionObserver = origineelIO;
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("cijferband telt één keer", () => {
  it("blijft op de eindwaarde staan als de band uit beeld en weer in beeld gaat", () => {
    zonderReductie();
    vi.useFakeTimers({ toFake: ["requestAnimationFrame", "cancelAnimationFrame", "performance"] });

    // Elke observer (de band zelf én het gestaffeld inveren) krijgt een melding
    // voor de elementen die hij volgt.
    const observers: { cb: (e: Partial<IntersectionObserverEntry>[]) => void; els: Element[] }[] = [];
    const melden = (staat: Partial<IntersectionObserverEntry>) => {
      for (const o of [...observers]) {
        if (o.els.length) o.cb(o.els.map((target) => ({ ...staat, target })));
      }
    };
    class StuurbareObserver {
      private o: { cb: (e: Partial<IntersectionObserverEntry>[]) => void; els: Element[] };
      constructor(cb: (e: Partial<IntersectionObserverEntry>[]) => void) {
        this.o = { cb, els: [] };
        observers.push(this.o);
      }
      observe(el: Element) {
        this.o.els.push(el);
      }
      unobserve(el: Element) {
        this.o.els = this.o.els.filter((x) => x !== el);
      }
      disconnect() {
        this.o.els = [];
      }
      takeRecords() {
        return [];
      }
    }
    window.IntersectionObserver = StuurbareObserver as unknown as typeof IntersectionObserver;

    const { container } = render(<Cijfers />);
    const zichtbaar = () => [...container.querySelectorAll("[aria-hidden='true']")].map((e) => e.textContent).join(" ");

    expect(zichtbaar()).not.toContain("20.000");

    act(() => melden({ intersectionRatio: 0.6, isIntersecting: true }));
    act(() => {
      vi.advanceTimersByTime(2500);
    });
    expect(zichtbaar()).toContain("20.000");

    // Uit beeld en terug: geen tweede telling vanaf nul.
    act(() => melden({ intersectionRatio: 0, isIntersecting: false }));
    expect(zichtbaar()).toContain("20.000");
    act(() => melden({ intersectionRatio: 0.6, isIntersecting: true }));
    act(() => {
      vi.advanceTimersByTime(16);
    });
    expect(zichtbaar()).toContain("20.000");
  });

  it("geeft schermlezers de eindwaarde in één keer", () => {
    const { container } = render(<Cijfers />);
    const sr = [...container.querySelectorAll(".sr-only")].map((e) => e.textContent).join(" | ");
    expect(sr).toContain("20.000+ m²");
    expect(sr).toContain("4,9");
  });
});

describe("reviews zonder autoplay", () => {
  it.each([
    ["Reviews", () => <Reviews />],
    ["ReviewsCompact", () => <ReviewsCompact />],
  ])("%s start geen interval", async (_naam, maak) => {
    zonderReductie();
    const spion = vi.spyOn(window, "setInterval");
    render(maak());
    // Laat embla initialiseren en de effecten lopen.
    await act(async () => {
      await new Promise((r) => setTimeout(r, 30));
    });
    const lang = spion.mock.calls.filter(([, ms]) => typeof ms === "number" && ms >= 1000);
    expect(lang).toHaveLength(0);
  });

  it("puntjes hebben een raakvlak van minstens 24px", async () => {
    render(<Reviews />);
    await act(async () => {
      await new Promise((r) => setTimeout(r, 30));
    });
    const punten = screen.queryAllByRole("button", { name: /Ga naar review/ });
    expect(punten.length).toBeGreaterThan(1);
    for (const knop of punten) {
      expect(knop.className).toMatch(/\bh-6\b/);
      expect(knop.className).toMatch(/\bmin-w-6\b/);
    }
  });
});

describe("veelgestelde vragen", () => {
  it("houdt één vraag tegelijk open, met aria-expanded en aria-controls", () => {
    render(<Faq />);
    const vragen = screen.getAllByRole("button");
    expect(vragen.length).toBe(6);
    for (const v of vragen) {
      expect(v).toHaveAttribute("aria-expanded", "false");
      const id = v.getAttribute("aria-controls");
      expect(id).toBeTruthy();
      expect(document.getElementById(id!)).not.toBeNull();
    }

    fireEvent.click(vragen[0]);
    expect(vragen[0]).toHaveAttribute("aria-expanded", "true");

    fireEvent.click(vragen[1]);
    expect(vragen[0]).toHaveAttribute("aria-expanded", "false");
    expect(vragen[1]).toHaveAttribute("aria-expanded", "true");

    fireEvent.click(vragen[1]);
    expect(vragen[1]).toHaveAttribute("aria-expanded", "false");
  });

  it("verbergt dichte antwoorden voor schermlezers en toont open antwoorden", () => {
    render(<Faq />);
    const vraag = screen.getByRole("button", { name: /Wat kost het mij/ });
    const paneel = document.getElementById(vraag.getAttribute("aria-controls")!)!;
    expect(paneel).toHaveAttribute("aria-hidden", "true");
    fireEvent.click(vraag);
    expect(paneel).not.toHaveAttribute("aria-hidden", "true");
    expect(paneel).toHaveAttribute("role", "region");
  });

  it("heeft een kop met id voor aria-labelledby", () => {
    render(<Faq />);
    const kop = screen.getByRole("heading", { level: 2, name: /Veelgestelde vragen/ });
    expect(kop.closest("section")).toHaveAttribute("aria-labelledby", kop.id);
  });
});
