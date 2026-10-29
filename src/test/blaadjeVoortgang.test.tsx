import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

// Het blaadje op het wachtscherm van de subsidiecheck vult zich met de
// voortgang. De afspraak is dat die vulling eerlijk is: pas 100% als de bron
// echt geantwoord heeft, en nergens stilstand. Deze test bewaakt die regels.

import { Blaadje } from "@/components/Blaadje";
import { ZoekKaart } from "@/components/subsidiecheck/Zoeksequentie";
import { PLAN_MS, SPRINT_MS, WACHT_PLAFOND, vullingOp } from "@/hooks/useLaadsequentie";

// Samples van de curve, voor de checks op "nergens stil" en "versnelt".
const reeks = (klaarOp: number | null, totMs: number) =>
  Array.from({ length: Math.floor(totMs / 50) + 1 }, (_, i) => vullingOp(i * 50, klaarOp));

describe("vullingOp", () => {
  it("loopt op tijd in één versnellende curve naar 100%", () => {
    expect(vullingOp(0, 0)).toBe(0);
    expect(vullingOp(PLAN_MS, 0)).toBe(1);
    // Naar het eind toe sneller dan aan het begin (Harrison e.a. 2007).
    const begin = vullingOp(300, 0) - vullingOp(0, 0);
    const eind = vullingOp(PLAN_MS, 0) - vullingOp(PLAN_MS - 300, 0);
    expect(eind).toBeGreaterThan(begin * 2);
  });

  it("staat nergens stil zolang hij onderweg is", () => {
    const v = reeks(null, 20_000);
    for (let i = 1; i < v.length; i++) expect(v[i]).toBeGreaterThan(v[i - 1]);
  });

  it("wordt niet vol zolang de bron niet geantwoord heeft", () => {
    expect(vullingOp(60_000, null)).toBeLessThan(WACHT_PLAFOND);
    expect(WACHT_PLAFOND).toBeLessThan(1);
  });

  it("springt niet vooruit op een vroeg antwoord", () => {
    expect(vullingOp(500, 0)).toBe(vullingOp(500, null));
  });

  it("sprint na een laat antwoord binnen SPRINT_MS naar 100%", () => {
    const klaarOp = 6000;
    expect(vullingOp(klaarOp, klaarOp)).toBeCloseTo(vullingOp(klaarOp, null));
    expect(vullingOp(klaarOp + SPRINT_MS, klaarOp)).toBe(1);
  });
});

describe("Blaadje", () => {
  it("is decoratief en gebruikt alleen designtokens", () => {
    const { container } = render(<Blaadje vulling={0.5} />);
    const svg = container.querySelector("svg")!;
    expect(svg.getAttribute("aria-hidden")).toBe("true");
    const kleuren = [...svg.querySelectorAll("rect")].map((r) => r.getAttribute("fill"));
    expect(kleuren).toEqual(["hsl(var(--secondary))", "hsl(var(--primary))", "hsl(var(--accent))"]);
  });

  it("laat de okerlijn weg als het blad leeg of vol is", () => {
    const leeg = render(<Blaadje vulling={0} />).container;
    const vol = render(<Blaadje vulling={1} />).container;
    expect(leeg.querySelectorAll("rect")).toHaveLength(2);
    expect(vol.querySelectorAll("rect")).toHaveLength(2);
  });
});

describe("ZoekKaart", () => {
  it("toont de voortgang als progressbar voor schermlezers", () => {
    render(<ZoekKaart adresRegel="Hoofdstraat 12, Emmen" fase={0} klaar={false} />);
    const balk = screen.getByRole("progressbar", { name: "Voortgang van het zoeken" });
    expect(balk.getAttribute("aria-valuemax")).toBe("100");
  });
});
