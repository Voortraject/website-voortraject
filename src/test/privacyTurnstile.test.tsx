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
      "Om onze formulieren te beschermen tegen spam en bots gebruiken wij Cloudflare Turnstile. In de Turnstile Privacy Addendum leest u hoe Cloudflare daarbij met uw gegevens omgaat.",
    );
  });

  it("noemt Cloudflare bij de doorgifte buiten de EER, naast Google en Microsoft", () => {
    const { container } = render(<Privacy />);
    expect(container.textContent).toContain("(waaronder Google, Microsoft en Cloudflare)");
  });

  it("zegt dat de e-mailcontrole alleen het domein naar Cloudflare stuurt (src/lib/email.ts, DOH_URL)", () => {
    const { container } = render(<Privacy />);
    expect(container.textContent).toContain(
      'daarvoor gaat alleen het deel na de @ (bijvoorbeeld "gmail.com"), niet uw volledige e-mailadres, naar de DNS-dienst van Cloudflare.',
    );
  });

  it("laat geen ruwe link-opmaak op de pagina staan", () => {
    const { container } = render(<Privacy />);
    expect(container.textContent).not.toMatch(/\]\(https?:/);
  });
});
