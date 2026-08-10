import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import type { ReactElement } from "react";
import { describe, expect, it, vi } from "vitest";

/**
 * De hub op /verduurzamen. Die URL redirectte naar de homepage, waardoor de
 * sectie geen startpunt had: de nav-knop "Verduurzamen" lichtte alleen op de
 * isolatiepagina op en een bezoeker die nog niet wist welke maatregel hij zocht
 * kwam nergens uit.
 *
 * De belangrijkste eis aan deze pagina is dat hij naar alle zeven pagina's
 * linkt en dat de volgorde van de route klopt. Dat is precies wat een
 * overzichtspagina moet doen, en het is met het blote oog niet vol te houden
 * zodra er een maatregel bijkomt.
 */

vi.mock("@/components/Header", () => ({ Header: () => null }));
vi.mock("@/components/Footer", () => ({
  Footer: ({ cta }: { cta?: ReactElement }) => <footer>{cta}</footer>,
}));
vi.mock("@/components/Seo", () => ({
  Seo: ({ jsonLd }: { jsonLd?: Record<string, unknown>[] }) => (
    <script type="application/ld+json" data-testid="jsonld">
      {JSON.stringify(jsonLd ?? [])}
    </script>
  ),
}));

import Verduurzamen from "@/pages/Verduurzamen";
import { MAATREGELEN, MAATREGEL_VOLGORDE, ROUTE } from "@/data/maatregelen";

const toon = () => render(<MemoryRouter><Verduurzamen /></MemoryRouter>);

const hrefs = (container: HTMLElement) =>
  Array.from(container.querySelectorAll<HTMLAnchorElement>("a")).map((a) => a.getAttribute("href"));

describe("hub /verduurzamen: alle zeven pagina's", () => {
  it("linkt naar elke maatregelpagina, inclusief onderhoud", () => {
    const { container } = toon();
    const links = hrefs(container);
    for (const info of Object.values(MAATREGELEN)) {
      expect(links, `mist een link naar ${info.label}`).toContain(info.href);
    }
  });

  it("toont per maatregel de vraag die de pagina beantwoordt", () => {
    const { container } = toon();
    for (const info of Object.values(MAATREGELEN)) {
      expect(container.textContent).toContain(info.kernvraag);
    }
  });

  it("zet onderhoud buiten de zes maatregelen", () => {
    const { container } = toon();
    // Onderhoud is geen maatregel maar wat er daarna komt; als zevende kaart
    // liet het bovendien een gat vallen in het raster van drie.
    expect(MAATREGEL_VOLGORDE).not.toContain("onderhoud");
    expect(MAATREGEL_VOLGORDE).toHaveLength(6);
    expect(container.textContent).toContain("En daarna");
  });
});

describe("hub /verduurzamen: de route", () => {
  it("toont de drie stappen in volgorde", () => {
    const { container } = toon();
    for (const stap of ROUTE) {
      expect(container.textContent).toContain(stap.titel);
      expect(container.textContent).toContain(stap.korte);
    }
    // De volgorde is de inhoud van deze pagina, dus die wordt echt gecontroleerd.
    const posities = ROUTE.map((s) => container.textContent?.indexOf(s.titel) ?? -1);
    expect(posities).toEqual([...posities].sort((a, b) => a - b));
  });

  it("hangt elke maatregel onder de juiste stap", () => {
    const { container } = toon();
    const route = container.querySelector("#route");
    expect(route).not.toBeNull();
    for (const slug of MAATREGEL_VOLGORDE) {
      const info = MAATREGELEN[slug];
      expect(info.stap, `${slug} hoort een routestap te hebben`).toBeDefined();
      expect(
        within(route as HTMLElement).getAllByText(info.label).length,
        `${info.label} ontbreekt in de routeband`,
      ).toBeGreaterThan(0);
    }
    // Onderhoud staat bewust niet in de route.
    expect(MAATREGELEN.onderhoud.stap).toBeUndefined();
  });
});

describe("hub /verduurzamen: conversie en structured data", () => {
  it("stuurt naar de subsidiecheck en naar het gratis gesprek", () => {
    const { container } = toon();
    const links = hrefs(container);
    expect(links).toContain("/subsidiecheck");
    expect(links).toContain("/contact");
  });

  it("geeft BreadcrumbList en ItemList mee", () => {
    toon();
    const schemas = JSON.parse(screen.getByTestId("jsonld").textContent ?? "[]");
    const types = schemas.map((s: { "@type": string }) => s["@type"]);
    expect(types).toContain("BreadcrumbList");
    expect(types).toContain("ItemList");

    const lijst = schemas.find((s: { "@type": string }) => s["@type"] === "ItemList");
    expect(lijst.itemListElement).toHaveLength(7);
  });

  it("zet de slot-CTA binnen de footer, net als de maatregelpagina's", () => {
    const { container } = toon();
    const footer = container.querySelector("footer");
    expect(footer).not.toBeNull();
    expect(within(footer as HTMLElement).getByText(/Welke stap is bij jou de/)).toBeInTheDocument();
  });

  it("houdt het achtergrondritme aan", () => {
    const { container } = toon();
    const bgs = Array.from(container.querySelectorAll("main > section")).map(
      (s, i) => s.getAttribute("data-bg") ?? `vast-${i}`,
    );
    const botsingen = bgs.filter((bg, i) => i > 0 && bg === bgs[i - 1]);
    expect(botsingen).toEqual([]);
  });
});
