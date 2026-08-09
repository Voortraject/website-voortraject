import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Bewaakt de funnel-meting van de subsidiecheck. subsidiecheck_start meet pas
// het afrónden van stap 1, dus zonder subsidiecheck_stap ontbreekt de noemer en
// is uitval per stap niet te berekenen. Deze test legt vast dat élke getoonde
// stap precies één keer gemeld wordt, ook de instap halverwege via een gedeelde
// link.
//
// pushGtmEvent bewust niet gemockt: we controleren wat er echt in de dataLayer
// komt. De stap-componenten zijn wél gestubd, zodat hun eigen events (start,
// voltooid, lead) deze meting niet vervuilen.

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

const toon = (url: string) =>
  render(
    <MemoryRouter initialEntries={[url]}>
      <Subsidiecheck />
    </MemoryRouter>,
  );

const stapEvents = () => (window.dataLayer ?? []).filter((r) => r.event === "subsidiecheck_stap");

describe("subsidiecheck funnel", () => {
  beforeEach(() => {
    window.dataLayer = [];
    sessionStorage.clear();
  });

  it("meldt stap 1 zodra de bezoeker de check opent", async () => {
    toon("/subsidiecheck");

    await screen.findByText("stap-adres");
    expect(stapEvents()).toHaveLength(1);
    expect(stapEvents()[0]).toMatchObject({
      event: "subsidiecheck_stap",
      stap: 1,
      stap_naam: "Jouw woning",
    });
  });

  it("meldt de instap halverwege, bij binnenkomst via een gedeelde link", async () => {
    toon(`/subsidiecheck?${ADRES_PARAMS}`);

    await screen.findByText("stap-gegevens");
    expect(stapEvents()).toHaveLength(1);
    expect(stapEvents()[0]).toMatchObject({ stap: 2, stap_naam: "Je gegevens" });
  });

  it("meldt het resultaat wanneer het contact van deze sessie al bekend is", async () => {
    // Wat de poort openzet is het bewaarde contact, niet een losse vlag. Een
    // verzonnen sleutel in sessionStorage laat de bezoeker dus niet meer door.
    sessionStorage.setItem(
      "sc_contact",
      JSON.stringify({ voornaam: "Jan", achternaam: "de Vries", email: "jan@example.nl" }),
    );
    toon(`/subsidiecheck?${ADRES_PARAMS}`);

    await screen.findByText("stap-resultaat");
    expect(stapEvents()).toHaveLength(1);
    expect(stapEvents()[0]).toMatchObject({ stap: 3, stap_naam: "Resultaat" });
  });

  it("meldt een stap niet opnieuw bij een re-render zonder stapwissel", async () => {
    const { rerender } = toon("/subsidiecheck");
    await screen.findByText("stap-adres");

    rerender(
      <MemoryRouter initialEntries={["/subsidiecheck"]}>
        <Subsidiecheck />
      </MemoryRouter>,
    );

    expect(stapEvents()).toHaveLength(1);
  });

  it("stuurt geen postcode of huisnummer mee", async () => {
    toon(`/subsidiecheck?${ADRES_PARAMS}`);

    await screen.findByText("stap-gegevens");
    const push = JSON.stringify(stapEvents()[0]);
    expect(push).not.toContain("9711");
    expect(push).not.toContain("hn");
  });
});
