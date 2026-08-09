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
  GEMIDDELD_AANTAL_REGELINGEN,
  GEMIDDELDE_REGELINGEN_KOP,
  GEMIDDELDE_REGELINGEN_STAART,
  GEMIDDELDE_REGELINGEN_ZIN,
} from "@/config/cijfers";
import { SUBSIDIECHECK_BELOFTES } from "@/config/beloftes";
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

describe("het feitje op stap 1", () => {
  it("houdt getal en zin bij elkaar", () => {
    expect(GEMIDDELDE_REGELINGEN_KOP).toBe(`Gemiddeld ${GEMIDDELD_AANTAL_REGELINGEN} regelingen`);
    expect(GEMIDDELDE_REGELINGEN_ZIN).toBe(`${GEMIDDELDE_REGELINGEN_KOP} ${GEMIDDELDE_REGELINGEN_STAART}`);
  });

  it("blijft een heel getal: we tonen het gemeten gemiddelde naar beneden afgerond", () => {
    expect(Number.isInteger(GEMIDDELD_AANTAL_REGELINGEN)).toBe(true);
    expect(GEMIDDELD_AANTAL_REGELINGEN).toBeGreaterThan(0);
  });

  it("noemt geen regio, zodat niemand buiten het werkgebied zich uitgesloten voelt", () => {
    // Het getal is landelijk gemeten (zie src/config/cijfers.ts). Zodra hier een
    // provincie in de zin sluipt, klopt het getal niet meer met wat het belooft.
    expect(GEMIDDELDE_REGELINGEN_ZIN).not.toMatch(/Groningen|Drenthe|Friesland|Frysl/i);
  });

  it("staat boven de velden, dus vóór de eerste inspanning", () => {
    const { container } = stapAdres();

    const zin = screen.getByText(GEMIDDELDE_REGELINGEN_KOP);
    const postcode = container.querySelector("#sc-postcode");
    expect(postcode).not.toBeNull();
    // DOCUMENT_POSITION_FOLLOWING = het postcodeveld komt ná het feitje.
    expect(zin.compareDocumentPosition(postcode!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("noemt het cijfer niet bij huurders, VvE's en verhuurders", () => {
    // Gemeten is er alleen voor woningeigenaren (zie src/config/cijfers.ts);
    // voor de andere groepen zou dit een niet-nagemeten belofte zijn.
    for (const type of ["huurder", "vve", "verhuurder"] as Bewonertype[]) {
      const { unmount } = stapAdres({ initBewonertype: type });
      expect(screen.queryByText(GEMIDDELDE_REGELINGEN_KOP)).toBeNull();
      unmount();
    }
  });

  it("noemt het cijfer wél bij de standaardsituatie (woningeigenaar)", () => {
    stapAdres({ initBewonertype: "woningeigenaar" });
    expect(screen.getByText(GEMIDDELDE_REGELINGEN_KOP)).toBeInTheDocument();
  });
});

describe("bewijs bij de knop", () => {
  it("toont de drie beloftes met een vinkje, ook op een telefoon", () => {
    const { container } = stapAdres();

    for (const belofte of SUBSIDIECHECK_BELOFTES) {
      expect(screen.getByText(belofte)).toBeInTheDocument();
    }
    // Er staat een vinkje bij elke belofte...
    const vinkjes = container.querySelectorAll(".lucide-check");
    expect(vinkjes).toHaveLength(SUBSIDIECHECK_BELOFTES.length);
    // ...en geen enkele is verborgen. Eerder stond er `hidden sm:inline` op,
    // waardoor een telefoon puntjes zag in plaats van vinkjes.
    for (const vinkje of vinkjes) expect(vinkje.classList.contains("hidden")).toBe(false);
  });

  it("laat geen ruisregel over het adres meer staan", () => {
    stapAdres();
    expect(screen.queryByText(/Je adres gebruiken we/i)).toBeNull();
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
