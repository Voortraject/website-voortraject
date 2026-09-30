import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

/**
 * De 404. Twee dingen mogen niet terloops sneuvelen: de pagina staat op
 * noindex (Cloudflare Pages geeft een onbekend adres terug met status 200, dus
 * anders ziet Google hem als echte inhoud), en hij is geen doodlopend eind maar
 * wijst door naar de routes die wel bestaan.
 */

vi.mock("@/components/Header", () => ({ Header: () => null }));
vi.mock("@/components/Footer", () => ({ Footer: () => null }));
vi.mock("@/components/Seo", () => ({
  Seo: ({ noindex, path }: { noindex?: boolean; path: string }) => (
    <meta data-testid="seo" data-noindex={String(!!noindex)} data-path={path} />
  ),
}));

import NotFound from "@/pages/NotFound";

const toon = () =>
  render(
    <MemoryRouter initialEntries={["/bestaat-niet"]}>
      <NotFound />
    </MemoryRouter>,
  );

describe("404-pagina", () => {
  it("staat op noindex", () => {
    toon();
    const seo = screen.getByTestId("seo");
    expect(seo.dataset.noindex).toBe("true");
    expect(seo.dataset.path).toBe("/bestaat-niet");
  });

  it("heeft één Nederlandse h1", () => {
    toon();
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Deze pagina is weggewaaid");
  });

  it("wijst door naar de subsidiecheck, verduurzamen, contact en home", () => {
    const { container } = toon();
    const hrefs = Array.from(container.querySelectorAll("a")).map((a) => a.getAttribute("href"));
    expect(hrefs).toEqual(
      expect.arrayContaining(["/subsidiecheck", "/verduurzamen", "/contact", "/", "tel:+31502112689"]),
    );
  });
});
