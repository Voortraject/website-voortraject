import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

/**
 * Cloudflare eist bij Turnstile in de modus Invisible dat het privacybeleid
 * verwijst naar hun Turnstile Privacy Addendum. Die verwijzing moet een echte,
 * klikbare link blijven, en de rest van de tekst mag er niet door veranderen.
 */

vi.mock("@/components/Header", () => ({ Header: () => null }));
vi.mock("@/components/Footer", () => ({ Footer: () => null }));
vi.mock("@/components/Seo", () => ({ Seo: () => null }));

import Privacy from "@/pages/Privacy";

describe("privacyverklaring", () => {
  it("verwijst met een link naar de Turnstile Privacy Addendum", () => {
    render(<Privacy />);
    const link = screen.getByRole("link", { name: "Turnstile Privacy Addendum" });
    expect(link.getAttribute("href")).toBe("https://www.cloudflare.com/turnstile-privacy-policy/");
    expect(link.parentElement?.textContent).toContain(
      "Om onze formulieren te beschermen tegen spam en bots gebruiken we Cloudflare Turnstile. Lees in de Turnstile Privacy Addendum hoe Cloudflare daarbij met je gegevens omgaat.",
    );
  });

  it("laat geen ruwe link-opmaak op de pagina staan", () => {
    const { container } = render(<Privacy />);
    expect(container.textContent).not.toMatch(/\]\(https?:/);
  });
});
