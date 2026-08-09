import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

// De poort moet dicht zijn. Niemand hoort het subsidieoverzicht te zien zonder
// zijn gegevens in te vullen, en dat mag niet afhangen van één boolean of van
// één sleutel in de opslag van de browser.
//
// Wat deze test daarom vastlegt:
//  1. wie binnenkomt met een adres in de URL, ziet de gegevensstap — niet het
//     overzicht, ook niet via een gedeelde of gebookmarkte link;
//  2. de oude ontsnappingsroute `sc_poort_ontgrendeld = "1"` werkt niet meer;
//  3. half of onzinnig opgeslagen contact telt niet als "ingevuld";
//  4. een compleet contact (wie de poort dus écht doorlopen heeft) mag door.

vi.mock("@/components/Header", () => ({ Header: () => null }));
vi.mock("@/components/Footer", () => ({ Footer: () => null }));
vi.mock("@/components/Seo", () => ({ Seo: () => null }));
vi.mock("@/components/subsidiecheck/StapAdres", () => ({ StapAdres: () => <div>stap-adres</div> }));
vi.mock("@/components/subsidiecheck/StapGegevens", () => ({
  StapGegevens: () => <div>stap-gegevens</div>,
}));
vi.mock("@/components/subsidiecheck/StapResultaat", () => ({
  StapResultaat: () => <div>stap-resultaat</div>,
}));

vi.mock("@/lib/gtm", () => ({ pushGtmEvent: vi.fn() }));

vi.mock("@/hooks/usePdokAdres", () => ({
  usePdokAdres: (postcode: string) => ({
    data: postcode
      ? {
          straatnaam: "Grote Markt",
          woonplaatsnaam: "Groningen",
          gemeentenaam: "Groningen",
          provincienaam: "Groningen",
        }
      : null,
    isPending: false,
  }),
}));
vi.mock("@/hooks/usePandContour", () => ({ usePandContour: () => ({ data: undefined }) }));
vi.mock("@/hooks/usePand3d", () => ({ usePand3d: () => ({ data: undefined }) }));
vi.mock("@/hooks/useWoningInfo", () => ({ useWoningInfo: () => ({ data: undefined }) }));

import Subsidiecheck from "@/pages/Subsidiecheck";

const ADRES_PARAMS = "pc=9711AA&hn=1&type=woningeigenaar";

const toon = () =>
  render(
    <MemoryRouter initialEntries={[`/subsidiecheck?${ADRES_PARAMS}`]}>
      <Subsidiecheck />
    </MemoryRouter>,
  );

beforeEach(() => {
  sessionStorage.clear();
});

describe("de gegevens-poort laat niemand zomaar door", () => {
  it("toont de gegevensstap bij een gedeelde link met adres", async () => {
    toon();

    expect(await screen.findByText("stap-gegevens")).toBeInTheDocument();
    expect(screen.queryByText("stap-resultaat")).toBeNull();
  });

  it("negeert de oude vlag sc_poort_ontgrendeld", async () => {
    // Dit was genoeg om binnen te komen: één regel in de console van de browser.
    sessionStorage.setItem("sc_poort_ontgrendeld", "1");
    toon();

    expect(await screen.findByText("stap-gegevens")).toBeInTheDocument();
    expect(screen.queryByText("stap-resultaat")).toBeNull();
  });

  it("laat halve of onbruikbare gegevens niet gelden als ingevuld", async () => {
    for (const contact of [
      {},
      { voornaam: "Jan" },
      { email: "jan@example.nl" },
      { voornaam: "", email: "jan@example.nl" },
      { voornaam: "Jan", email: "geen-adres" },
    ]) {
      sessionStorage.setItem("sc_contact", JSON.stringify(contact));
      const { unmount } = toon();

      expect(await screen.findByText("stap-gegevens")).toBeInTheDocument();
      expect(screen.queryByText("stap-resultaat")).toBeNull();
      unmount();
    }
  });

  it("laat wél door wie de poort in deze sessie heeft ingevuld", async () => {
    sessionStorage.setItem(
      "sc_contact",
      JSON.stringify({ voornaam: "Jan", achternaam: "de Vries", email: "jan@example.nl" }),
    );
    toon();

    expect(await screen.findByText("stap-resultaat")).toBeInTheDocument();
    expect(screen.queryByText("stap-gegevens")).toBeNull();
  });
});
