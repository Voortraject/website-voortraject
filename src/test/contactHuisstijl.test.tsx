import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

// Contactpagina in de huisstijl van oktober 2026. Lighthouse meldde een
// kopsprong h1 → h3; de groepen van het formulier en de rechterkolom zijn nu
// h2. En de verstuurknop is de ene oker pil van het scherm.

vi.mock("@/integrations/supabase/external-client", () => ({
  SUPABASE_EXTERNAL_ANON_KEY: "test-anon-key",
  supabaseExternal: { from: () => ({ insert: vi.fn() }) },
}));
vi.mock("@/lib/gtm", () => ({ pushGtmEvent: vi.fn() }));
vi.mock("@/components/Header", () => ({ Header: () => null }));
vi.mock("@/components/Footer", () => ({ Footer: () => null }));
vi.mock("@/components/Seo", () => ({ Seo: () => null }));
// ReviewsCompact heeft eigen tests en eigen kleuren (de letter-avatars); hier
// alleen zijn kop, op het niveau waarop hij die nu rendert.
vi.mock("@/components/ReviewsCompact", () => ({ ReviewsCompact: () => <h3>Wat bewoners zeggen</h3> }));
import Contact from "@/pages/Contact";

describe("Contactpagina: huisstijl", () => {
  it("heeft één h1 en slaat daarna geen kopniveau over", () => {
    const { container } = render(<Contact />);
    const niveaus = [...container.querySelectorAll("h1,h2,h3,h4,h5,h6")].map((h) => Number(h.tagName[1]));
    expect(niveaus[0]).toBe(1);
    expect(niveaus.filter((n) => n === 1)).toHaveLength(1);
    niveaus.forEach((n, i) => {
      if (i > 0) expect(n - niveaus[i - 1]).toBeLessThanOrEqual(1);
    });
  });

  it("maakt de groepskoppen en 'Wat kun je verwachten?' tot h2", () => {
    render(<Contact />);
    for (const naam of ["Jouw gegevens", "Jouw vraag", "Wat kun je verwachten?"]) {
      expect(screen.getByRole("heading", { level: 2, name: naam })).toBeTruthy();
    }
  });

  it("toont 'Verstuur bericht' als de oker pil", () => {
    render(<Contact />);
    const knop = screen.getByRole("button", { name: /Verstuur bericht/ });
    expect(knop.className).toMatch(/\bhs-knop\b/);
    expect(knop.className).toMatch(/\bhs-knop-oker\b/);
    expect(knop.className).toMatch(/\bw-full\b/);
    expect(knop.getAttribute("style")).toBeNull();
  });

  it("gebruikt geen hardgecodeerde kleuren in de opmaak", () => {
    const { container } = render(<Contact />);
    const metStijl = [...container.querySelectorAll("[style]")]
      .map((el) => el.getAttribute("style") ?? "")
      .filter((s) => /#[0-9a-f]{3,6}\b|rgba?\(/i.test(s));
    expect(metStijl).toEqual([]);
    const klassen = [...container.querySelectorAll("[class]")].map((el) => el.getAttribute("class") ?? "");
    expect(klassen.filter((k) => /#[0-9a-f]{3,6}\b/i.test(k))).toEqual([]);
  });
});
