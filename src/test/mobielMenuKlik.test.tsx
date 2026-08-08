import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Bewaakt dat kliks in het mobiele menu meetbaar blijven voor Google Tag
// Manager. Er zijn hier twee verschillende fouten geweest, allebei onzichtbaar
// in de UI en allebei goed voor nul metingen op het menu dat het merendeel van
// de bezoekers gebruikt.
//
// 1. Een stopPropagation() op het paneel, om te voorkomen dat de
//    achtergrond-klik het menu sloot. React koppelt zijn listeners op de
//    root-container, dus dat hield ook het native event tegen en de klik
//    bereikte `document` nooit. Daar luistert GTM.
// 2. Het menu sloot synchroon in de onClick van de link zelf. De klik kwam dan
//    wel bij `document`, maar met een target die al uit de DOM was gehaald,
//    zodat de CSS-kiezer "header a" niet meer matchte.
//
// De tests hieronder controleren daarom niet "vuurt de tag", maar de drie
// voorwaarden daarvoor: bereikt het event `document`, hangt het element daar
// nog in de DOM, en matcht het nog met de kiezer van de trigger.
//
// LET OP, over de dekking: fout 1 wordt hier aantoonbaar gevangen (zonder de
// fix falen de propagatie-tests). Fout 2 NIET. jsdom timet de state-flush van
// React anders dan een echte browser, waardoor het element hier ook zónder de
// fix nog in de DOM hangt; dat is met een ruwe dispatchEvent buiten act()
// nagegaan en gaf hetzelfde resultaat. De `inDom`/`matchtSelector`-asserties
// leggen de eis dus wél vast en beschrijven de bedoeling, maar het bewijs voor
// fout 2 komt uit de GTM-preview in een echte browser, niet uit deze suite.

import { Header } from "@/components/Header";

interface Meting {
  tekst: string;
  /** Hangt het element nog in het document op het moment dat GTM kijkt? */
  inDom: boolean;
  /** Matcht het nog met de CSS-kiezer van de trigger "Klik navigatielink"? */
  matchtSelector: boolean;
}

let documentKliks: Meting[];
const vangKlik = (e: Event) => {
  // jsdom kan niet navigeren; zonder dit logt elke link-klik een fout.
  e.preventDefault();
  const el = e.target as HTMLElement;
  documentKliks.push({
    tekst: el.textContent ?? "",
    inDom: document.contains(el),
    matchtSelector: el.matches("header a"),
  });
};

const gemeten = (tekst: string) => documentKliks.find((m) => m.tekst.includes(tekst));

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

    // Doorkomen alleen is niet genoeg: het menu mag ook niet al ontmount zijn.
    // Een losgekoppeld element matcht niet meer met "header a", en dan vuurt de
    // trigger alsnog niet.
    expect(gemeten("Zakelijk")).toMatchObject({ inDom: true, matchtSelector: true });
  });

  it("laat ook de subsidiecheck-knop doorkomen, nog gekoppeld aan het document", () => {
    const menu = openMobielMenu();

    fireEvent.click(menu.getByRole("link", { name: /Check jouw subsidies/ }));

    expect(gemeten("Check jouw subsidies")).toMatchObject({ inDom: true, matchtSelector: true });
  });

  it("laat een item uit een uitgeklapt submenu doorkomen, nog gekoppeld aan het document", () => {
    const menu = openMobielMenu();
    fireEvent.click(menu.getByRole("button", { name: /Verduurzamen/ }));

    fireEvent.click(menu.getByRole("link", { name: "Warmtepomp" }));

    expect(gemeten("Warmtepomp")).toMatchObject({ inDom: true, matchtSelector: true });
  });

  it("sluit het menu alsnog, vlak ná de klik", async () => {
    const menu = openMobielMenu();

    fireEvent.click(menu.getByRole("link", { name: "Zakelijk" }));

    // Direct na de klik staat het menu nog open (dat is precies de bedoeling),
    // maar het sluit zodra de event-lus leeg is.
    expect(screen.getByLabelText("Mobiele navigatie")).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByLabelText("Mobiele navigatie")).not.toBeInTheDocument());
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

