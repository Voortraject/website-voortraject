import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import type { ReactElement } from "react";
import { describe, expect, it, vi } from "vitest";

/**
 * De isolatiepagina zet cijfers over besparing op een publieke site. Die mogen
 * niet stilletjes verkeerd raken.
 *
 * Let op wat hier bewust NIET staat: subsidiebedragen. Welke regeling voor een
 * bezoeker geldt hangt van het adres af (Nij Begun in Groningen en
 * Noord-Drenthe, elders landelijk en gemeentelijk). Een landelijk bedrag als
 * uitgangspunt nemen klopt voor een groot deel van het werkgebied niet.
 */

vi.mock("@/components/Header", () => ({ Header: () => null }));
vi.mock("@/components/Footer", () => ({
  Footer: ({ cta }: { cta?: ReactElement }) => <footer>{cta}</footer>,
}));
vi.mock("@/components/Seo", () => ({ Seo: () => null }));

import Isolatie from "@/pages/maatregelen/Isolatie";
import { ISOLATIE_MAATREGELEN, euro } from "@/data/isolatie";

const toon = () => render(<MemoryRouter><Isolatie /></MemoryRouter>);

const dak = ISOLATIE_MAATREGELEN.find((m) => m.id === "dak")!;
const spouw = ISOLATIE_MAATREGELEN.find((m) => m.id === "spouw")!;
const gevel = ISOLATIE_MAATREGELEN.find((m) => m.id === "gevel")!;
const vloer = ISOLATIE_MAATREGELEN.find((m) => m.id === "vloer")!;

const knop = (naam: string) => screen.getByRole("button", { name: new RegExp(`^${naam}`) });

describe("isolatiepagina: de configurator", () => {
  it("begint op nul, zonder gekozen maatregelen", () => {
    toon();
    expect(screen.getByText("Zet hiernaast een maatregel aan")).toBeInTheDocument();
    expect(screen.getByText(euro(0))).toBeInTheDocument();
  });

  it("telt de besparing op als je maatregelen aanzet", () => {
    toon();

    // Standaard staat de hoekwoning aan.
    fireEvent.click(knop(dak.naam));
    expect(screen.getByText(euro(dak.perType.hoekwoning.euro))).toBeInTheDocument();

    fireEvent.click(knop(spouw.naam));
    const samen = dak.perType.hoekwoning.euro + spouw.perType.hoekwoning.euro;
    expect(screen.getByText(euro(samen))).toBeInTheDocument();
  });

  it("rekent opnieuw als je een ander woningtype kiest", () => {
    toon();

    fireEvent.click(knop(dak.naam));
    fireEvent.click(screen.getByRole("button", { name: "Vrijstaand" }));

    expect(screen.getByText(euro(dak.perType.vrijstaand.euro))).toBeInTheDocument();
    // Het cijfer van de hoekwoning hoort dan weg te zijn als totaal.
    expect(dak.perType.vrijstaand.euro).not.toBe(dak.perType.hoekwoning.euro);
  });

  it("toont de terugverdientijd op de kaart en op het totaal", () => {
    toon();

    // Dak los: 6.500 / 480 is bijna 14 jaar.
    fireEvent.click(knop(dak.naam));
    const dakTijd = Math.round(
      dak.perType.hoekwoning.kosten / dak.perType.hoekwoning.euro,
    );
    expect(screen.getAllByText(`${dakTijd} jaar`).length).toBeGreaterThan(0);

    // Met vloer erbij loopt het totaal apart van de losse kaarten.
    fireEvent.click(knop(vloer.naam));
    const samenTijd = Math.round(
      (dak.perType.hoekwoning.kosten + vloer.perType.hoekwoning.kosten) /
        (dak.perType.hoekwoning.euro + vloer.perType.hoekwoning.euro),
    );
    expect(screen.getByText(`${samenTijd} jaar`)).toBeInTheDocument();

    // Zonder dit voorbehoud is het getal niet waar voor het werkgebied: met
    // Nij Begun wordt tot 100 procent vergoed.
    expect(
      screen.getByText(/Investering en terugverdientijd zijn vóór subsidie/),
    ).toBeInTheDocument();
  });

  it("wijst de maatregel aan die zichzelf het snelst terugverdient", () => {
    toon();
    // De pagina zegt verderop "begin bij de maatregel met de kortste
    // terugverdientijd", dus dan hoort de tool die ook aan te wijzen.
    expect(screen.getAllByText("Snelst terugverdiend")).toHaveLength(1);
    expect(knop(spouw.naam).textContent).toMatch(/Snelst terugverdiend/);
  });

  it("laat in de voortgangsbalk zien hoever de schil dicht is", () => {
    toon();
    // Hoekwoning: dak 480, gevel 750, vloer 180, glas 90 is samen € 1.500.
    expect(screen.getByText(/^0% van/)).toBeInTheDocument();

    fireEvent.click(knop(dak.naam));
    const haalbaar =
      dak.perType.hoekwoning.euro +
      gevel.perType.hoekwoning.euro +
      vloer.perType.hoekwoning.euro +
      90;
    const deel = Math.round((dak.perType.hoekwoning.euro / haalbaar) * 100);
    expect(screen.getByText(`${deel}% van ${euro(haalbaar)} per jaar`)).toBeInTheDocument();
  });

  it("laat de tekening meebewegen met wat er aan staat", () => {
    const { container } = toon();

    const tekening = () => container.querySelector('svg[role="img"]')!;
    expect(tekening().getAttribute("aria-label")).toMatch(/zonder isolatie/);

    fireEvent.click(knop(dak.naam));
    expect(tekening().getAttribute("aria-label")).toMatch(/met isolatie in: dak/);
  });

  it("laat de warmtestromen stoppen zodra je dat bouwdeel isoleert", () => {
    const { container } = toon();
    const stroomt = (bron: string) => {
      const stromen = Array.from(
        container.querySelectorAll<SVGElement>(`[data-stroom="${bron}"]`),
      );
      expect(stromen.length, `geen warmtestromen voor ${bron}`).toBeGreaterThan(0);
      return stromen.every((s) => s.style.opacity !== "0");
    };

    expect(stroomt("dak")).toBe(true);
    fireEvent.click(knop(dak.naam));
    expect(stroomt("dak")).toBe(false);
    // De rest van de schil lekt nog wel; alleen het dak is dicht.
    expect(stroomt("vloer")).toBe(true);

    // De gevel is dicht via spouw óf gevel: allebei stoppen dezelfde stroom.
    expect(stroomt("gevel")).toBe(true);
    fireEvent.click(knop(spouw.naam));
    expect(stroomt("gevel")).toBe(false);
  });

  it("houdt de warmtestromen binnen het kader van de tekening", () => {
    // De stromen zijn langer dan de pijlen die er stonden, dus ze liepen aan
    // drie kanten het kader uit. Dit is geen som die je met de hand blijft
    // narekenen als er een stroom bij komt.
    const { container } = toon();
    const svg = container.querySelector('svg[role="img"]')!;
    const [vx, vy, vBreed, vHoog] = svg.getAttribute("viewBox")!.split(" ").map(Number);

    const stromen = Array.from(container.querySelectorAll("[data-stroom]"));
    expect(stromen.length).toBeGreaterThan(0);

    for (const stroom of stromen) {
      const getallen = (stroom.getAttribute("d") ?? "").match(/-?\d+(?:\.\d+)?/g)!.map(Number);
      for (let i = 0; i < getallen.length; i += 2) {
        const [x, y] = [getallen[i], getallen[i + 1]];
        // Een bezier blijft binnen de omhullende van zijn punten, dus passen
        // alle punten, dan past de kromme.
        const waar = `${stroom.getAttribute("data-stroom")} op ${x},${y}`;
        expect(x, `${waar} steekt links uit`).toBeGreaterThanOrEqual(vx);
        expect(x, `${waar} steekt rechts uit`).toBeLessThanOrEqual(vx + vBreed);
        expect(y, `${waar} steekt boven uit`).toBeGreaterThanOrEqual(vy);
        expect(y, `${waar} steekt onder uit`).toBeLessThanOrEqual(vy + vHoog);
      }
    }
  });

  it("kleurt het hele dakvlak bij dakisolatie, niet alleen de snede", () => {
    // Zat de isolatie alleen in de opengewerkte snede, dan leek er bij het dak
    // niets te gebeuren. Het dakvlak hoort mee te kleuren, net als de gevel.
    const { container } = toon();
    const dakvlak = () => container.querySelector<SVGElement>('[data-laag="dak"]')!;

    expect(dakvlak().style.opacity).toBe("0");
    fireEvent.click(knop(dak.naam));
    expect(dakvlak().style.opacity).toBe("1");
  });

  it("toont per maatregel het uitgangspunt zodra je hem aanzet", () => {
    toon();

    fireEvent.click(knop(spouw.naam));
    // Zonder dit voorbehoud is de belofte niet waar: spouwisolatie kan alleen
    // als er een spouw is en die nog leeg is.
    expect(screen.getByText(new RegExp(spouw.noot!.slice(0, 40)))).toBeInTheDocument();
  });

  it("laat spouw- en gevelisolatie samen aanzetten", () => {
    toon();

    // Milieu Centraal zegt het met zoveel woorden: buitengevelisolatie kun je
    // combineren met spouwmuurisolatie, alleen wordt de buitenlaag dan dunner.
    // De configurator mag de een dus niet stilzwijgend uitzetten.
    fireEvent.click(knop(spouw.naam));
    fireEvent.click(knop(gevel.naam));

    expect(knop(spouw.naam)).toHaveAttribute("aria-pressed", "true");
    expect(knop(gevel.naam)).toHaveAttribute("aria-pressed", "true");
  });

  it("telt de gevel één keer als spouw en gevel allebei aan staan", () => {
    toon();

    fireEvent.click(knop(spouw.naam));
    fireEvent.click(knop(gevel.naam));

    // Allebei kom je op dezelfde geïsoleerde gevel uit, dus de besparing
    // verdubbelt niet: het hoogste van de twee telt.
    const samen = spouw.perType.hoekwoning.euro + gevel.perType.hoekwoning.euro;
    expect(screen.getByText(euro(gevel.perType.hoekwoning.euro))).toBeInTheDocument();
    expect(screen.queryByText(euro(samen))).not.toBeInTheDocument();

    // De investering telt wél op, want je betaalt allebei de ingrepen.
    const kosten = spouw.perType.hoekwoning.kosten + gevel.perType.hoekwoning.kosten;
    expect(screen.getByText(euro(kosten))).toBeInTheDocument();
  });

  it("legt uit waarom de teller blijft staan bij spouw plus gevel", () => {
    toon();

    fireEvent.click(knop(gevel.naam));
    expect(screen.queryByText(/De gevel telt één keer mee/)).not.toBeInTheDocument();

    // Zonder deze uitleg lijkt een teller die niet meebeweegt een fout.
    fireEvent.click(knop(spouw.naam));
    expect(screen.getByText(/De gevel telt één keer mee/)).toBeInTheDocument();
  });

  it("laat de glasbesparing afhangen van wat er nu in zit", () => {
    toon();
    const glas = ISOLATIE_MAATREGELEN.find((m) => m.id === "glas")!;
    const vanafDubbel = glas.keuzes!.startpunt.find((s) => s.id === "dubbel")!;
    const vanafEnkel = glas.keuzes!.startpunt.find((s) => s.id === "enkel")!;

    fireEvent.click(knop(glas.naam));
    expect(screen.getByText(euro(vanafDubbel.euro))).toBeInTheDocument();

    // Van enkel glas naar isolerend glas levert een veelvoud op van de stap
    // vanaf gewoon dubbel glas. Eén cijfer voor "glas" zou dus misleiden.
    fireEvent.click(screen.getByRole("button", { name: "Enkel glas" }));
    expect(screen.getByText(euro(vanafEnkel.euro))).toBeInTheDocument();
    expect(vanafEnkel.euro).toBeGreaterThan(vanafDubbel.euro * 2);
  });

  it("houdt het glasblok bij de ene keuze die de teller beweegt", () => {
    toon();
    const glas = ISOLATIE_MAATREGELEN.find((m) => m.id === "glas")!;
    fireEvent.click(knop(glas.naam));

    expect(screen.getByRole("button", { name: "Enkel glas" })).toBeInTheDocument();
    // Milieu Centraal komt voor triple op dezelfde besparing uit als voor HR++.
    // Als knop in de configurator bewoog die keuze de teller dus niet, en vroeg
    // hij vooral om alinea's uitleg waarom er niets gebeurt.
    expect(screen.queryByRole("button", { name: "Triple" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "HR++" })).not.toBeInTheDocument();

    // De investering geldt voor bestaande kozijnen; dat mag niet stilzwijgend blijven.
    expect(screen.getByText(/geldt voor isolerend glas in je bestaande kozijnen/)).toBeInTheDocument();
  });

  it("verplaatst het verhaal over triple naar de FAQ, waar het niet verloren gaat", () => {
    const { container } = toon();
    const tekst = container.textContent ?? "";
    // Wat uit de configurator verdween, hoort ergens anders op de pagina te staan.
    expect(tekst).toMatch(/U-waarde van ongeveer 1,1 en triple glas 0,4 tot 0,9/);
    expect(tekst).toMatch(/Op je gasrekening scheelt dat verschil weinig/);
    expect(tekst).toMatch(/vraagt vaak nieuwe kozijnen/);
  });

  it("telt bij 'alles aanzetten' niet allebei de gevelroutes mee", () => {
    toon();
    fireEvent.click(screen.getByRole("button", { name: /Alles aanzetten/ }));

    const zonderGevel = ISOLATIE_MAATREGELEN.filter((m) => m.id !== "gevel").reduce(
      (som, m) => som + m.perType.hoekwoning.euro,
      0,
    );
    expect(screen.getByText(euro(zonderGevel))).toBeInTheDocument();
    expect(knop(gevel.naam)).toHaveAttribute("aria-pressed", "false");
  });
});

describe("isolatiepagina: zes secties plus de FAQ", () => {
  it("blijft op maximaal zes inhoudelijke secties", () => {
    // Afspraak met de opdrachtgever: zes per pagina. De hero telt niet mee, de
    // subsidiecheck-band ook niet (die heeft geen data-bg, want hij brengt zijn
    // eigen kleur mee) en de FAQ staat er los naast.
    const { container } = toon();
    const metAchtergrond = Array.from(container.querySelectorAll("main > section")).filter((s) =>
      s.hasAttribute("data-bg"),
    );
    // Eerste is de hero, laatste de FAQ.
    expect(metAchtergrond.slice(1, -1)).toHaveLength(6);
  });

  it("heeft geen losse subsidiesectie meer naast het paneel in de configurator", () => {
    toon();
    // Twee keer hetzelfde verhaal, een paar schermen uit elkaar. Het paneel bij
    // de bedragen wint, want dáár mist de subsidie.
    expect(screen.queryByText(/Subsidies bij deze/)).not.toBeInTheDocument();
  });
});

describe("isolatiepagina: eerlijk over subsidie", () => {
  it("presenteert de cijfers vóór subsidie en verwijst naar het adres", () => {
    toon();
    expect(screen.getByText(/Hier staat nog geen subsidie in/)).toBeInTheDocument();
    expect(
      screen.getByText(/in Groningen en Noord-Drenthe loopt dat anders dan in de rest van het land/),
    ).toBeInTheDocument();
  });

  it("noemt de drie routes bij de bedragen waar ze nog niet in zitten", () => {
    const { container } = toon();
    expect(screen.getByText(/Nij Begun, tot 100 procent vergoed/)).toBeInTheDocument();
    expect(screen.getByText(/verdubbelt bij twee of meer maatregelen/)).toBeInTheDocument();
    expect(screen.getByText(/Gemeentelijke regelingen, stapelbaar/)).toBeInTheDocument();

    const link = Array.from(container.querySelectorAll<HTMLAnchorElement>("a")).find((a) =>
      /subsidies stapelt/i.test(a.textContent ?? ""),
    );
    expect(link?.getAttribute("href")).toBe("/subsidies/stapelen");
  });

  it("neemt geen landelijk subsidiebedrag als uitgangspunt", () => {
    const { container } = toon();
    // ISDE geldt niet voor een groot deel van het werkgebied, dus de pagina
    // hoort er niet op te leunen.
    expect(container.textContent).not.toMatch(/ISDE/);
  });

  it("verwijst naar de bron met een controledatum", () => {
    const { container } = toon();
    const bron = Array.from(container.querySelectorAll<HTMLAnchorElement>("a")).find((a) =>
      a.href.includes("milieucentraal.nl"),
    );
    expect(bron).toBeDefined();
    expect(screen.getByText(/gecontroleerd op 11 augustus 2026/)).toBeInTheDocument();
    expect(screen.getByText(/gasprijs van € 1,37 per m³/)).toBeInTheDocument();
  });
});

describe("isolatiepagina: het ventilatieblok", () => {
  it("behandelt de drie soorten ventilatie", () => {
    toon();
    expect(screen.getByText("Natuurlijke ventilatie")).toBeInTheDocument();
    expect(screen.getByText("Mechanische afzuiging")).toBeInTheDocument();
    expect(screen.getByText("Balansventilatie met WTW")).toBeInTheDocument();
  });

  it("noemt het vochtrisico", () => {
    toon();
    // Staat bewust op meer plekken: het ventilatieblok, de aandachtspunten en de FAQ.
    expect(screen.getAllByText(/vocht en schimmel/).length).toBeGreaterThan(1);
  });
});

describe("isolatiegegevens", () => {
  it("heeft voor elk woningtype een besparing en een investering", () => {
    for (const m of ISOLATIE_MAATREGELEN) {
      for (const [type, waarden] of Object.entries(m.perType)) {
        expect(waarden.euro, `${m.naam} / ${type}: besparing ontbreekt`).toBeGreaterThan(0);
        expect(waarden.m3, `${m.naam} / ${type}: gasbesparing ontbreekt`).toBeGreaterThan(0);
        expect(waarden.kosten, `${m.naam} / ${type}: kosten ontbreken`).toBeGreaterThan(0);
      }
    }
  });

  it("laat gevelisolatie nooit onder spouwmuurisolatie zakken", () => {
    // De gevel aan de buitenkant isoleren brengt je op een hogere isolatiewaarde
    // dan het vullen van de spouw, bij elk woningtype. Stond het gevelcijfer
    // vlak op het hoekwoning-bedrag van de bron, dan kwam een vrijstaande woning
    // op minder uit dan met spouwisolatie. Dat kan niet.
    for (const type of Object.keys(spouw.perType) as (keyof typeof spouw.perType)[]) {
      expect(
        gevel.perType[type].m3,
        `${type}: gevelisolatie bespaart minder dan spouwmuurisolatie`,
      ).toBeGreaterThanOrEqual(spouw.perType[type].m3);
      expect(gevel.perType[type].euro).toBeGreaterThanOrEqual(spouw.perType[type].euro);
    }
  });

  it("houdt de euro's in lijn met de kubieke meters gas", () => {
    // Milieu Centraal rekent met € 1,37 per m³. Een regel die daar ver naast
    // zit is een overtypfout, niet een afwijkend geval.
    for (const m of ISOLATIE_MAATREGELEN) {
      for (const [type, w] of Object.entries(m.perType)) {
        const verwacht = w.m3 * 1.37;
        expect(
          Math.abs(w.euro - verwacht) / verwacht,
          `${m.naam} / ${type}: ${euro(w.euro)} past niet bij ${w.m3} m³`,
        ).toBeLessThan(0.12);
      }
    }
  });
});
