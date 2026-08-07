import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

// Rooktest voor /zakelijk (voorheen /partners). Bewaakt de drie dingen die deze
// pagina uniek maken: de verbrede doelgroep, het zakelijke contactformulier (de
// enige route naar `leads_uitvoerders` sinds /contact bewoner-only werd) en de
// CTA's die naar dat formulier ankeren in plaats van naar /contact.

vi.mock("@/integrations/supabase/external-client", () => ({
  SUPABASE_EXTERNAL_ANON_KEY: "test-anon-key",
  supabaseExternal: { from: () => ({ insert: vi.fn() }) },
}));

vi.mock("@/lib/gtm", () => ({ pushGtmEvent: vi.fn() }));

// Trekken anders de hele layout (router, helmet) mee de test in.
vi.mock("@/components/Header", () => ({ Header: () => null }));
vi.mock("@/components/Footer", () => ({ Footer: () => null }));
vi.mock("@/components/Seo", () => ({ Seo: () => null }));

import Zakelijk from "@/pages/Zakelijk";

describe("pagina /zakelijk", () => {
  it("spreekt bedrijven breder aan dan alleen uitvoerders", () => {
    render(<Zakelijk />);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      /Wij vangen het voortraject op/,
    );
    // Het doelgroepenblok noemt uitvoerders als kern, met de andere types erbij.
    expect(screen.getByRole("heading", { name: /Voor wie we werken/ })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Uitvoerders en aannemers/ })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Installateurs/ })).toBeInTheDocument();
  });

  it("bevat het zakelijke contactformulier", () => {
    render(<Zakelijk />);

    expect(screen.getByLabelText(/^Bedrijfsnaam/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Voornaam contactpersoon/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Verstuur bericht/ })).toBeInTheDocument();
  });

  it("laat de kennismakings-CTA's naar het formulier op de pagina wijzen", () => {
    const { container } = render(<Zakelijk />);

    const ctas = Array.from(container.querySelectorAll<HTMLAnchorElement>("a"))
      .filter((a) => /Plan een kennismaking/.test(a.textContent ?? ""));

    expect(ctas.length).toBeGreaterThan(0);
    // /contact is sinds de bewoner-only ombouw geen route meer voor bedrijven.
    for (const cta of ctas) expect(cta.getAttribute("href")).toBe("#contact");

    expect(container.querySelector("#contact")).not.toBeNull();
  });
});
