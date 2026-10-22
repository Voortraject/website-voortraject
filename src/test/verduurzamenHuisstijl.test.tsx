import { render, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import type { ReactElement } from "react";
import { describe, expect, it, vi } from "vitest";

/**
 * Huisstijl oktober 2026 op /verduurzamen en de maatregelpagina's.
 *
 * 1. De lichte tint per sectie wordt voor de hele reeks gekozen (toonReeks),
 *    zodat optionele secties het ritme niet kunnen breken en de laatste sectie
 *    boven de footer altijd op off-white staat.
 * 2. Eén oker knop per scherm: op /verduurzamen staat de subsidiecheck vlak
 *    boven het slotblok, dus daar is de slotknop niet oker.
 */

vi.mock("@/components/Header", () => ({ Header: () => null }));
vi.mock("@/components/Footer", () => ({
  Footer: ({ cta }: { cta?: ReactElement }) => <footer>{cta}</footer>,
}));
vi.mock("@/components/Seo", () => ({ Seo: () => null }));

import { toonReeks } from "@/components/maatregel/stijl";
import Verduurzamen from "@/pages/Verduurzamen";
import Isolatie from "@/pages/maatregelen/Isolatie";
import Warmtepomp from "@/pages/maatregelen/Warmtepomp";
import Airco from "@/pages/maatregelen/Airco";
import Thuisbatterij from "@/pages/maatregelen/Thuisbatterij";
import Zonnepanelen from "@/pages/maatregelen/Zonnepanelen";
import Laadpaal from "@/pages/maatregelen/Laadpaal";
import Onderhoud from "@/pages/maatregelen/Onderhoud";

const toon = (pagina: ReactElement) => render(<MemoryRouter>{pagina}</MemoryRouter>);

describe("toonReeks", () => {
  it("wisselt om en om en begint met off-white", () => {
    expect(toonReeks(["licht", "licht", "licht"])).toEqual(["zand", "warm", "zand"]);
  });

  it("laat donker en vaste blokken staan en eindigt elk volgend stuk op off-white", () => {
    expect(toonReeks(["licht", "licht", "donker", "licht", "vast", "licht", "licht", "licht"])).toEqual([
      "zand",
      "warm",
      "navy",
      "zand",
      null,
      "zand",
      "warm",
      "zand",
    ]);
  });
});

describe("maatregelpagina's in de huisstijl", () => {
  const paginas: [string, ReactElement][] = [
    ["isolatie", <Isolatie key="i" />],
    ["warmtepomp", <Warmtepomp key="w" />],
    ["airco", <Airco key="a" />],
    ["thuisbatterij", <Thuisbatterij key="t" />],
    ["zonnepanelen", <Zonnepanelen key="z" />],
    ["laadpaal", <Laadpaal key="l" />],
    ["onderhoud", <Onderhoud key="o" />],
  ];

  it.each(paginas)("%s begint en eindigt op off-white", (_naam, pagina) => {
    const { container } = toon(pagina);
    const bgs = Array.from(container.querySelectorAll("main > section"))
      .map((s) => s.getAttribute("data-bg"))
      .filter(Boolean);
    expect(bgs[0]).toBe("zand");
    expect(bgs.at(-1)).toBe("zand");
  });

  it.each(paginas)("%s heeft één oker knop in de slot-CTA", (_naam, pagina) => {
    const { container } = toon(pagina);
    const footer = container.querySelector("footer") as HTMLElement;
    expect(footer.querySelectorAll(".hs-knop-oker")).toHaveLength(1);
  });

});

describe("/verduurzamen in de huisstijl", () => {
  it("heeft geen oker slotknop vlak onder de oker knop van de subsidiecheck", () => {
    const { container } = toon(<Verduurzamen />);
    const footer = container.querySelector("footer") as HTMLElement;
    expect(footer.querySelectorAll(".hs-knop-oker")).toHaveLength(0);
    expect(within(footer).getByRole("link", { name: "Plan een gratis gesprek" })).toHaveClass("hs-knop-licht");
  });
});
