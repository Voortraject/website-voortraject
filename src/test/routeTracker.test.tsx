import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, useNavigate } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";

// Bewaakt de SPA-paginameting. Drie dingen kunnen hier stil kapot gaan en zijn
// dan pas weken later in GA4 zichtbaar: dubbeltellen van de landingspagina,
// een verkeerde titel door de Helmet-timing, en het belangrijkste: het adres
// van de bezoeker dat via de querystring van /subsidiecheck in GA4 belandt.
//
// pushGtmEvent bewust NIET gemockt: we willen zien wat er echt in de dataLayer
// terechtkomt, want dat is wat GTM leest.

import { RouteTracker } from "@/components/RouteTracker";

const Navigeerknop = ({ naar, label }: { naar: string; label: string }) => {
  const navigate = useNavigate();
  return (
    <button type="button" onClick={() => navigate(naar)}>
      {label}
    </button>
  );
};

const rendered = () =>
  render(
    <MemoryRouter initialEntries={["/"]}>
      <RouteTracker />
      <Navigeerknop naar="/over-ons" label="naar over ons" />
      <Navigeerknop naar="/subsidiecheck?pc=9711AB&hn=5&tv=a" label="naar de check" />
    </MemoryRouter>,
  );

const events = () => (window.dataLayer ?? []).filter((r) => r.event === "virtual_page_view");

describe("RouteTracker", () => {
  beforeEach(() => {
    window.dataLayer = [];
    document.title = "Beginpagina | Voortraject";
  });

  it("meet de eerste weergave niet, want die telt de GA4-configuratietag al", async () => {
    rendered();

    // Even wachten: als er tóch gepusht wordt, gebeurt dat in de volgende frame.
    await new Promise((r) => setTimeout(r, 50));
    expect(events()).toHaveLength(0);
  });

  it("pusht bij navigatie het pad en de titel van de nieuwe pagina", async () => {
    rendered();

    document.title = "Over ons | Voortraject";
    fireEvent.click(screen.getByRole("button", { name: "naar over ons" }));

    await waitFor(() => expect(events()).toHaveLength(1));
    expect(events()[0]).toMatchObject({
      event: "virtual_page_view",
      page_path: "/over-ons",
      page_title: "Over ons | Voortraject",
    });
  });

  it("houdt de querystring buiten de meting, zodat het adres niet in GA4 lekt", async () => {
    rendered();

    fireEvent.click(screen.getByRole("button", { name: "naar de check" }));

    await waitFor(() => expect(events()).toHaveLength(1));
    expect(events()[0].page_path).toBe("/subsidiecheck");

    // Harde ondergrens: nergens in de push mag postcode of huisnummer opduiken.
    const push = JSON.stringify(events()[0]);
    expect(push).not.toContain("9711");
    expect(push).not.toContain("pc=");
    expect(push).not.toContain("hn=");
  });
});
