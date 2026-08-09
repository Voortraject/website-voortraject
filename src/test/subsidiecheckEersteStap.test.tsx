import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { describe, expect, it, vi } from "vitest";

// Stap 1 van de subsidiecheck is de plek waar de meeste bezoekers afhaken: hier
// staat alleen nog een vraag om moeite, en nog geen enkele uitkomst. Deze test
// bewaakt de vier dingen die daar bewust aan gedaan zijn, zodat ze niet
// terloops weer sneuvelen.

vi.mock("@/lib/gtm", () => ({ pushGtmEvent: vi.fn() }));

import { Header } from "@/components/Header";
import { StapAdres } from "@/components/subsidiecheck/StapAdres";
import { Voortgang } from "@/components/subsidiecheck/Voortgang";
import {
  CIJFER_WERKGEBIED,
  GEMIDDELD_AANTAL_SUBSIDIES,
  GEMIDDELDE_SUBSIDIES_KOP,
  GEMIDDELDE_SUBSIDIES_STAART,
  GEMIDDELDE_SUBSIDIES_ZIN,
} from "@/config/cijfers";
import type { Bewonertype } from "@/lib/subsidies";

const toon = (ui: ReactElement) =>
  render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      {ui}
    </QueryClientProvider>,
  );

const stapAdres = (overschrijf: Partial<React.ComponentProps<typeof StapAdres>> = {}) =>
  toon(
    <StapAdres
      initPostcode=""
      initHuisnummer=""
      initToevoeging=""
      initBewonertype={null}
      initMaatregelen={[]}
      bevestigdAdres={null}
      onStart={() => {}}
      onHandmatig={() => {}}
      onAdresWijzigen={() => {}}
      {...overschrijf}
    />,
  );

describe("de compacte header van de check", () => {
  it("laat alleen het logo staan, geen navigatie en geen tweede CTA", () => {
    render(<Header compact />);

    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveAttribute("href", "/");
    // De knop verwees naar de pagina waar de bezoeker al staat.
    expect(screen.queryByText(/Check jouw subsidies/i)).toBeNull();
    expect(screen.queryByRole("button", { name: /menu openen/i })).toBeNull();
  });

  it("laat de gewone header ongemoeid", () => {
    render(<Header />);

    expect(screen.getByRole("navigation", { name: /hoofdnavigatie/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Check jouw subsidies/i)).toBeInTheDocument();
  });
});

describe("het cijfer op stap 1", () => {
  it("houdt getal en zin bij elkaar", () => {
    expect(GEMIDDELDE_SUBSIDIES_KOP).toBe(`Gemiddeld ${GEMIDDELD_AANTAL_SUBSIDIES} subsidies`);
    expect(GEMIDDELDE_SUBSIDIES_STAART).toBe(`per adres in ${CIJFER_WERKGEBIED}`);
    expect(GEMIDDELDE_SUBSIDIES_ZIN).toBe(`${GEMIDDELDE_SUBSIDIES_KOP} ${GEMIDDELDE_SUBSIDIES_STAART}`);
  });

  it("blijft een heel getal: we tonen het gemeten gemiddelde naar beneden afgerond", () => {
    expect(Number.isInteger(GEMIDDELD_AANTAL_SUBSIDIES)).toBe(true);
    expect(GEMIDDELD_AANTAL_SUBSIDIES).toBeGreaterThan(0);
  });

  it("staat boven de velden, dus vóór de eerste inspanning", () => {
    const { container } = stapAdres();

    const zin = screen.getByText(GEMIDDELDE_SUBSIDIES_KOP);
    const postcode = container.querySelector("#sc-postcode");
    expect(postcode).not.toBeNull();
    // DOCUMENT_POSITION_FOLLOWING = het postcodeveld komt ná de cijferregel.
    expect(zin.compareDocumentPosition(postcode!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("noemt het cijfer niet bij huurders, VvE's en verhuurders", () => {
    // Gemeten is er alleen voor woningeigenaren (zie src/config/cijfers.ts);
    // voor de andere groepen zou dit een niet-nagemeten belofte zijn.
    for (const type of ["huurder", "vve", "verhuurder"] as Bewonertype[]) {
      const { unmount } = stapAdres({ initBewonertype: type });
      expect(screen.queryByText(GEMIDDELDE_SUBSIDIES_KOP)).toBeNull();
      unmount();
    }
  });

  it("noemt het cijfer wél bij de standaardsituatie (woningeigenaar)", () => {
    stapAdres({ initBewonertype: "woningeigenaar" });
    expect(screen.getByText(GEMIDDELDE_SUBSIDIES_KOP)).toBeInTheDocument();
  });
});

describe("geruststelling over het adres", () => {
  it("staat bij de velden die de vraag oproepen, niet pas onder de knop", () => {
    const { container } = stapAdres();

    const regel = screen.getByText(/Je adres gebruiken we om de regelingen op te zoeken/i);
    const knop = screen.getByRole("button", { name: /subsidies/i });
    // De geruststelling hoort vóór de verzendknop te staan.
    expect(regel.compareDocumentPosition(knop) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(container.querySelector("#sc-toevoeging")).not.toBeNull();
  });
});

describe("de keuzeregel boven de knop", () => {
  it("is één zin en geen omkaderd keuzeblok", () => {
    stapAdres();

    // De standaard, in lopende tekst: er valt hier voor de meeste bezoekers
    // niets te kiezen, dus het hoort geen blok te zijn dat om aandacht vraagt.
    expect(screen.getByText(/We zoeken voor woningeigenaren op alle maatregelen/i)).toBeInTheDocument();
    expect(screen.queryByText("Waarop we zoeken")).toBeNull();
  });

  it("klapt de keuzes alsnog open via Aanpassen", () => {
    stapAdres();

    fireEvent.click(screen.getByRole("button", { name: /aanpassen/i }));

    expect(screen.getByText("Ik ben…")).toBeInTheDocument();
    expect(screen.getByText("Waar ben je in geïnteresseerd?")).toBeInTheDocument();
  });

  it("toont de zin niet als de bezoeker al van de standaard afwijkt", () => {
    // Wie als huurder binnenkomt heeft wél iets te kiezen; dan hoort het blok
    // meteen open te staan in plaats van samengevat te zijn.
    stapAdres({ initBewonertype: "huurder" });

    expect(screen.queryByText(/We zoeken voor/i)).toBeNull();
    expect(screen.getByText("Ik ben…")).toBeInTheDocument();
  });
});

describe("voortgang op stap 1", () => {
  const lijn = (container: HTMLElement) =>
    // Het meelopende stukje is het enige element met een inline breedte.
    container.querySelector<HTMLElement>("span[style*='width']");

  it("begint niet op nul: wie de check opent is al begonnen", () => {
    const { container } = render(<Voortgang stappen={["Jouw woning", "Je gegevens", "Resultaat"]} huidige={1} deel={0.2} />);

    expect(lijn(container)?.style.width).toBe("20%");
  });

  it("loopt verder zodra het adres herkend is", () => {
    const { container } = render(<Voortgang stappen={["Jouw woning", "Je gegevens", "Resultaat"]} huidige={1} deel={0.7} />);

    expect(lijn(container)?.style.width).toBe("70%");
  });

  it("houdt de balk leeg als er niets te melden valt", () => {
    const { container } = render(<Voortgang stappen={["Jouw woning", "Je gegevens", "Resultaat"]} huidige={3} />);

    expect(lijn(container)).toBeNull();
  });
});
