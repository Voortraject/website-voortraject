import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Bewaakt dat kliks in het mobiele menu `document` bereiken.
//
// Hier zat een echte meetfout: het paneel had een `onClick` met
// stopPropagation() om te voorkomen dat de achtergrond-klik het menu sloot.
// React koppelt zijn listeners op de root-container, dus die stopPropagation()
// hield ook het native event tegen en de klik kwam nooit bij `document`. Daar
// luistert Google Tag Manager, dus geen enkele klik in het mobiele menu werd
// gemeten — en dat is het menu dat het merendeel van de bezoekers gebruikt.
//
// De test klikt daarom niet op "vuurt de tag", maar op de voorwaarde daarvoor:
// bereikt het event de document-listener. Dat is precies wat GTM nodig heeft.

import { Header } from "@/components/Header";

let documentKliks: string[];
const vangKlik = (e: Event) => {
  // jsdom kan niet navigeren; zonder dit logt elke link-klik een fout.
  e.preventDefault();
  documentKliks.push((e.target as HTMLElement).textContent ?? "");
};

beforeEach(() => {
  documentKliks = [];
  document.addEventListener("click", vangKlik);
});

afterEach(() => {
  document.removeEventListener("click", vangKlik);
  vi.restoreAllMocks();
});

const openMobielMenu = () => {
  render(<Header />);
  fireEvent.click(screen.getByLabelText("Menu openen"));
  return within(screen.getByLabelText("Mobiele navigatie"));
};

describe("mobiel menu", () => {
  it("laat een klik op een menu-item doorkomen tot document, zodat GTM hem ziet", () => {
    const menu = openMobielMenu();

    fireEvent.click(menu.getByRole("link", { name: "Zakelijk" }));

    expect(documentKliks).toContain("Zakelijk");
  });

  it("laat ook de subsidiecheck-knop doorkomen tot document", () => {
    const menu = openMobielMenu();

    fireEvent.click(menu.getByRole("link", { name: /Check jouw subsidies/ }));

    expect(documentKliks.some((t) => t.includes("Check jouw subsidies"))).toBe(true);
  });

  it("sluit niet bij het uitklappen van een submenu", () => {
    const menu = openMobielMenu();

    fireEvent.click(menu.getByRole("button", { name: /Verduurzamen/ }));

    // Menu staat nog open én de submenu-items zijn nu zichtbaar.
    expect(screen.getByLabelText("Mobiele navigatie")).toBeInTheDocument();
    expect(menu.getByRole("link", { name: "Warmtepomp" })).toBeInTheDocument();
  });

  it("sluit wél bij een klik op de achtergrond naast het paneel", () => {
    render(<Header />);
    fireEvent.click(screen.getByLabelText("Menu openen"));
    const achtergrond = screen.getByLabelText("Mobiele navigatie").closest("div.fixed");

    fireEvent.click(achtergrond!);

    expect(screen.queryByLabelText("Mobiele navigatie")).not.toBeInTheDocument();
  });
});
