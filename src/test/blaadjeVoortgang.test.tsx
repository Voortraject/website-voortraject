import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

// Het blaadje op het wachtscherm van de subsidiecheck vult zich met de
// voortgang. De afspraak is dat die vulling eerlijk is: pas 100% als de bron
// echt geantwoord heeft. Deze test bewaakt die regel.

import { Blaadje } from "@/components/Blaadje";
import { ZoekKaart } from "@/components/subsidiecheck/Zoeksequentie";
import { WACHT_PLAFOND, doelVulling } from "@/hooks/useLaadsequentie";

describe("doelVulling", () => {
  it("volgt de eerste twee zoekstappen", () => {
    expect(doelVulling(0, false).doel).toBeCloseTo(1 / 3);
    expect(doelVulling(1, false).doel).toBeCloseTo(2 / 3);
  });

  it("wordt niet vol zolang de bron niet geantwoord heeft", () => {
    expect(doelVulling(2, false).doel).toBe(WACHT_PLAFOND);
    // Ook als de sequentie is overgeslagen (fase 3) en er toch nog gewacht wordt.
    expect(doelVulling(3, false).doel).toBe(WACHT_PLAFOND);
    expect(WACHT_PLAFOND).toBeLessThan(1);
  });

  it("loopt pas naar 100% als het antwoord er is", () => {
    expect(doelVulling(2, true).doel).toBe(1);
    expect(doelVulling(3, true).doel).toBe(1);
  });

  it("springt niet vooruit op een vroeg antwoord: de stappen blijven zichtbaar", () => {
    expect(doelVulling(0, true).doel).toBeCloseTo(1 / 3);
    expect(doelVulling(1, true).doel).toBeCloseTo(2 / 3);
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
