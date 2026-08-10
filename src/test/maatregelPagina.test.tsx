import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import type { ReactElement } from "react";
import { describe, expect, it, vi } from "vitest";

/**
 * Bewaakt de content die het oude MaatregelPagina-template stilletjes weggooide.
 *
 * De pagina's leverden `watValtEronder`, `routeTekst`, `aandachtspunten`,
 * `keurmerken`, `subsidiesIntro`/`subsidiesItems`, `kostenFooter`, `extraInfo`,
 * `onderhoud` en `combineren` netjes aan, maar het template renderde ze niet.
 * Dat is precies het soort fout dat geen enkele melding geeft: de pagina bouwt
 * gewoon op, alleen mist de helft. Deze test faalt zodra dat opnieuw gebeurt.
 */

vi.mock("@/components/Header", () => ({ Header: () => null }));
vi.mock("@/components/Footer", () => ({
  Footer: ({ cta }: { cta?: ReactElement }) => <footer>{cta}</footer>,
}));
vi.mock("@/components/Seo", () => ({
  // Zet de JSON-LD echt in de DOM, zodat we kunnen controleren dat FAQPage en
  // BreadcrumbList worden meegegeven.
  Seo: ({ jsonLd }: { jsonLd?: Record<string, unknown>[] }) => (
    <script type="application/ld+json" data-testid="jsonld">
      {JSON.stringify(jsonLd ?? [])}
    </script>
  ),
}));

import Isolatie from "@/pages/maatregelen/Isolatie";
import Warmtepomp from "@/pages/maatregelen/Warmtepomp";
import Laadpaal from "@/pages/maatregelen/Laadpaal";
import Thuisbatterij from "@/pages/maatregelen/Thuisbatterij";
import Airco from "@/pages/maatregelen/Airco";

const toon = (pagina: ReactElement) => render(<MemoryRouter>{pagina}</MemoryRouter>);

describe("maatregelpagina's tonen alle aangeleverde content", () => {
  it("toont wat er onder de maatregel valt", () => {
    // Isolatie gebruikt deze prop niet meer: daar doet de doorsnede met de
    // ISDE-tabel hetzelfde werk, maar beter.
    toon(<Laadpaal />);
    expect(screen.getByText(/1-fase laadpaal voor een eenvoudige aansluiting/)).toBeInTheDocument();
    expect(screen.getByText(/Load balancing, dat het vermogen veilig verdeelt/)).toBeInTheDocument();
  });

  it("toont de plek in de verduurzamingsroute", () => {
    toon(<Isolatie />);
    expect(screen.getByText(/Isolatie is bijna altijd de eerste stap/)).toBeInTheDocument();
    // De drie stappen van de route staan er als strip, met deze maatregel actief.
    expect(screen.getByText("Beperk je verbruik")).toBeInTheDocument();
    expect(screen.getByText("Wek zelf op")).toBeInTheDocument();
    expect(screen.getByText("Gebruik het slim")).toBeInTheDocument();
    expect(screen.getByText("Deze maatregel")).toBeInTheDocument();
  });

  it("toont de aandachtspunten en de eigen kostenvoetnoot", () => {
    toon(<Isolatie />);
    expect(
      screen.getByText(/Goed isoleren zonder goed ventileren geeft vocht en schimmel/),
    ).toBeInTheDocument();
    expect(screen.getByText(/Wat het beïnvloedt zijn bouwjaar/)).toBeInTheDocument();
  });

  it("toont de subsidie-informatie met een link naar de subsidiepagina's", () => {
    const { container } = toon(<Isolatie />);
    expect(screen.getByText(/best gesubsidieerde maatregelen/)).toBeInTheDocument();
    expect(screen.getByText(/Nij Begun, tot 100 procent vergoed/)).toBeInTheDocument();
    const link = Array.from(container.querySelectorAll<HTMLAnchorElement>("a")).find((a) =>
      /subsidies stapelt/i.test(a.textContent ?? ""),
    );
    expect(link?.getAttribute("href")).toBe("/subsidies/stapelen");
  });

  it("toont de keurmerken en certificeringen", () => {
    toon(<Warmtepomp />);
    expect(screen.getByText(/BRL 6000-21/)).toBeInTheDocument();
    expect(screen.getByText(/STEK, verplichte certificering/)).toBeInTheDocument();
    expect(
      screen.getByText(/Wij koppelen je alleen aan uitvoerders die deze certificeringen/),
    ).toBeInTheDocument();
  });

  it("toont de losse blokken: onderhoud en combineren", () => {
    // Thuisbatterij had hier een contextblok met "de salderingsregeling wordt
    // stapsgewijs afgebouwd". Die claim klopte niet meer (saldering stopt in
    // één keer op 1 januari 2027) en het blok is opgegaan in de eigen sectie
    // van die pagina. Zie thuisbatterijPagina.test.tsx.
    const airco = toon(<Airco />);
    expect(
      airco.getByText(/Filters schoonmaken of vervangen kun je vaak zelf/),
    ).toBeInTheDocument();

    const laadpaal = toon(<Laadpaal />);
    const links = Array.from(laadpaal.container.querySelectorAll<HTMLAnchorElement>("a")).map((a) =>
      a.getAttribute("href"),
    );
    expect(links).toContain("/verduurzamen/zonnepanelen");
    expect(links).toContain("/verduurzamen/thuisbatterij");
  });

  it("toont álle FAQ's, niet alleen de eerste vijf", () => {
    toon(<Warmtepomp />);
    // De zesde vraag viel voorheen buiten de slice(0, 5).
    expect(screen.getByText(/Zit ik vast aan een bepaald merk\?/)).toBeInTheDocument();
  });

  it("geeft FAQPage en BreadcrumbList mee als structured data", () => {
    toon(<Warmtepomp />);
    const schemas = JSON.parse(screen.getByTestId("jsonld").textContent ?? "[]");
    const types = schemas.map((s: { "@type": string }) => s["@type"]);
    expect(types).toContain("BreadcrumbList");
    expect(types).toContain("FAQPage");

    const faq = schemas.find((s: { "@type": string }) => s["@type"] === "FAQPage");
    expect(faq.mainEntity).toHaveLength(6);
    expect(faq.mainEntity[0].acceptedAnswer.text).toMatch(/isolatie en je type verwarming/);
  });

  it("zet de subsidiecheck halverwege de pagina als tweede CTA", () => {
    toon(<Isolatie />);
    expect(
      screen.getByRole("button", { name: /Bekijk mijn subsidies/ }),
    ).toBeInTheDocument();
  });

  it("toont de processectie niet meer", () => {
    toon(<Isolatie />);
    // Stond op alle zes de pagina's identiek (de DEFAULT_PROCES) en voegde niets
    // toe aan de maatregel zelf.
    expect(screen.queryByText(/Zo pakken wij het voor je/)).not.toBeInTheDocument();
    expect(screen.queryByText("Intakegesprek")).not.toBeInTheDocument();
  });
});

describe("het achtergrondritme klopt bij elke combinatie van secties", () => {
  // Bijna elke sectie is optioneel, dus de volgorde van achtergronden moet zo
  // gekozen zijn dat er nooit twee dezelfde naast elkaar vallen. Dat is met het
  // blote oog niet te controleren: je ziet het alleen op de ene pagina die net
  // die combinatie heeft.
  const paginas: [string, ReactElement][] = [
    ["isolatie", <Isolatie key="i" />],
    ["warmtepomp", <Warmtepomp key="w" />],
    ["thuisbatterij", <Thuisbatterij key="t" />],
    ["airco", <Airco key="a" />],
    ["laadpaal", <Laadpaal key="l" />],
  ];

  it.each(paginas)("%s heeft geen twee gelijke achtergronden op rij", (naam, pagina) => {
    const { container } = toon(pagina);
    // Secties zonder data-bg (de subsidiecheck-CTA brengt zijn eigen zandkleur
    // mee) krijgen een unieke waarde, zodat ze de vergelijking niet vervuilen.
    const bgs = Array.from(container.querySelectorAll("main > section")).map(
      (s, i) => s.getAttribute("data-bg") ?? `vast-${i}`,
    );

    expect(bgs.length).toBeGreaterThan(5);
    const botsingen = bgs
      .map((bg, i) => (i > 0 && bg === bgs[i - 1] ? `${bgs[i - 1]} → ${bg} (sectie ${i})` : null))
      .filter(Boolean);
    expect(botsingen, `${naam} heeft aangrenzende secties met dezelfde achtergrond`).toEqual([]);
  });
});
