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

  it("laat de tekening meebewegen met wat er aan staat", () => {
    const { container } = toon();

    const tekening = () => container.querySelector('svg[role="img"]')!;
    expect(tekening().getAttribute("aria-label")).toMatch(/zonder isolatie/);

    fireEvent.click(knop(dak.naam));
    expect(tekening().getAttribute("aria-label")).toMatch(/met isolatie in: dak/);
  });

  it("toont per maatregel het uitgangspunt zodra je hem aanzet", () => {
    toon();

    fireEvent.click(knop(spouw.naam));
    // Zonder dit voorbehoud is de belofte niet waar: spouwisolatie kan alleen
    // als er een spouw is en die nog leeg is.
    expect(screen.getByText(new RegExp(spouw.noot!.slice(0, 40)))).toBeInTheDocument();
  });

  it("laat spouw- en gevelisolatie elkaar uitsluiten", () => {
    toon();

    fireEvent.click(knop(spouw.naam));
    expect(knop(spouw.naam)).toHaveAttribute("aria-pressed", "true");

    // Je doet het één of het ander: een woning zonder spouw isoleer je aan de
    // gevel. Allebei optellen zou een besparing beloven die je niet krijgt.
    fireEvent.click(knop(gevel.naam));
    expect(knop(gevel.naam)).toHaveAttribute("aria-pressed", "true");
    expect(knop(spouw.naam)).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByText(euro(gevel.perType.hoekwoning.euro))).toBeInTheDocument();
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

describe("isolatiepagina: eerlijk over subsidie", () => {
  it("presenteert de cijfers vóór subsidie en verwijst naar het adres", () => {
    toon();
    expect(screen.getByText(/Hier staat nog geen subsidie in/)).toBeInTheDocument();
    expect(
      screen.getByText(/in Groningen en Noord-Drenthe loopt dat anders dan in de rest van het land/),
    ).toBeInTheDocument();
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
    expect(screen.getByText(/gecontroleerd op 10 augustus 2026/)).toBeInTheDocument();
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
