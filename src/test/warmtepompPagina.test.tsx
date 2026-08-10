import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import type { ReactElement } from "react";
import { describe, expect, it, vi } from "vitest";

/**
 * De warmtepomppagina zet cijfers en een wettelijke norm op een publieke site.
 * Die mogen niet stilletjes verkeerd raken.
 *
 * Let op wat hier bewust NIET staat: ISDE. Die regeling geldt niet in Groningen
 * en Noord-Drenthe, dus een landelijk bedrag als uitgangspunt nemen klopt voor
 * een groot deel van het werkgebied niet. Zelfde afspraak als op de
 * isolatiepagina.
 */

vi.mock("@/components/Header", () => ({ Header: () => null }));
vi.mock("@/components/Footer", () => ({
  Footer: ({ cta }: { cta?: ReactElement }) => <footer>{cta}</footer>,
}));
vi.mock("@/components/Seo", () => ({ Seo: () => null }));

import Warmtepomp from "@/pages/maatregelen/Warmtepomp";
import {
  euro,
  getal,
  GELUID,
  RENDEMENT,
  SYSTEMEN,
  VERWARMINGSTEST,
} from "@/data/warmtepomp";

const toon = () => render(<MemoryRouter><Warmtepomp /></MemoryRouter>);

const hybride = SYSTEMEN.find((s) => s.id === "hybride")!;
const elektrisch = SYSTEMEN.find((s) => s.id === "elektrisch")!;

describe("warmtepomppagina: de keuze tussen hybride en volledig elektrisch", () => {
  it("zet beide systemen naast elkaar met hun aanschafprijs vóór subsidie", () => {
    const { container } = toon();

    expect(screen.getByRole("heading", { name: hybride.naam })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: elektrisch.naam })).toBeInTheDocument();
    expect(container.textContent).toContain(euro(hybride.aanschaf));
    expect(container.textContent).toContain(euro(elektrisch.aanschaf));
    expect(screen.getAllByText("Aanschaf vóór subsidie")).toHaveLength(2);
  });

  it("noemt per systeem de eis die de woning stelt", () => {
    toon();
    // Dit is het verschil dat de keuze bepaalt: een hybride kan in een matig
    // geïsoleerd huis, volledig elektrisch niet.
    expect(screen.getByText(/Werkt ook in een matig geïsoleerde woning/)).toBeInTheDocument();
    expect(screen.getByText(/8 tot 12 cm dak- en vloerisolatie/)).toBeInTheDocument();
  });
});

describe("warmtepomppagina: de rekenvoorbeelden", () => {
  it("toont het verbruik voor en na, met de bedragen uit de datamodule", () => {
    const { container } = toon();

    for (const s of SYSTEMEN) {
      const { voor, na } = s.referentie;
      expect(container.textContent).toContain(
        `Nu ${getal(voor.gas)} m³ gas en ${getal(voor.stroom)} kWh stroom, samen ${euro(voor.kosten)} per jaar.`,
      );
      expect(container.textContent).toContain(
        `Dat scheelt ongeveer ${euro(voor.kosten - na.kosten)} per jaar`,
      );
    }
  });

  it("laat de gasaansluiting bij volledig elektrisch echt vervallen", () => {
    const { container } = toon();
    // Zou hier "0 m³ gas" staan, dan leest het als een restje gasverbruik.
    expect(container.textContent).toContain(`Daarna ${getal(elektrisch.referentie.na.stroom)} kWh stroom`);
    expect(container.textContent).not.toContain("Daarna 0 m³ gas");
  });

  it("zegt erbij dat de twee sommen over twee verschillende woningen gaan", () => {
    toon();
    // Zonder dit voorbehoud lijkt € 600 naast € 1.000 een eerlijke vergelijking,
    // en dat is het niet: de ene woning is matig geïsoleerd, de andere goed.
    expect(
      screen.getByText(/Deze twee sommen gaan over twee verschillende woningen/),
    ).toBeInTheDocument();
  });
});

describe("warmtepomppagina: is jouw woning er klaar voor", () => {
  it("geeft de verwarmingstest als stappen die je zelf kunt doen", () => {
    toon();
    // Het getal staat ook in de FAQ, dus zoek de kop van het testblok zelf.
    expect(
      screen.getByRole("heading", {
        name: new RegExp(`op ${VERWARMINGSTEST.temperatuur} graden`),
      }),
    ).toBeInTheDocument();
    for (const stap of VERWARMINGSTEST.stappen) {
      expect(screen.getByText(stap.kop)).toBeInTheDocument();
    }
  });

  it("laat zien wat het afgiftesysteem met het rendement doet", () => {
    const { container } = toon();
    for (const meting of RENDEMENT.metingen) {
      expect(container.textContent).toContain(meting.buiten);
      expect(container.textContent).toContain(getal(meting.vloer));
      expect(container.textContent).toContain(getal(meting.radiator));
    }
    // Het punt van het blok: vloerverwarming levert meer op dan radiatoren.
    for (const meting of RENDEMENT.metingen) {
      expect(meting.vloer).toBeGreaterThan(meting.radiator);
    }
  });
});

describe("warmtepomppagina: geluid en vakmanschap", () => {
  it("noemt de norm met de plek waar hij geldt", () => {
    const { container } = toon();
    expect(container.textContent).toContain(`${GELUID.grenswaarde} dB`);
    expect(container.textContent).toContain(GELUID.artikel);
    // De afstand tot de grens is niet het criterium; dat misverstand is precies
    // waar het schema over gaat.
    expect(screen.getByText(/Wat telt is hoeveel geluid er op de perceelgrens overblijft/)).toBeInTheDocument();
  });

  it("heeft een schema met een tekstalternatief", () => {
    const { container } = toon();
    const schema = container.querySelector('svg[role="img"]');
    expect(schema?.getAttribute("aria-label")).toMatch(/perceelgrens/);
  });

  it("koppelt BRL 6000-21 aan bodemwarmte en zet STEK niet neer als wettelijke eis", () => {
    const { container } = toon();
    // De oude tekst noemde BRL 6000-21 "de erkenning voor het ontwerp en de
    // installatie van warmtepompen" en STEK "verplichte certificering".
    // Allebei net niet: BRL 6000-21 gaat over bodemenergie en STEK is een
    // aanvullende erkenning.
    expect(screen.getByText("BRL 6000-21 met SIKB 11000")).toBeInTheDocument();
    expect(screen.getByText(/Alleen van toepassing als de warmte uit de bodem komt/)).toBeInTheDocument();
    expect(screen.getByText(/Wettelijk verplicht voor de monteur/)).toBeInTheDocument();
    expect(container.textContent).not.toMatch(/STEK, verplichte certificering/);
  });
});

describe("warmtepomppagina: eerlijk over subsidie en bronnen", () => {
  it("neemt geen landelijk subsidiebedrag als uitgangspunt", () => {
    const { container } = toon();
    // ISDE geldt niet voor een groot deel van het werkgebied, dus de pagina
    // hoort er niet op te leunen. Stond eerder in de subsidielijst én in een
    // FAQ-antwoord.
    expect(container.textContent).not.toMatch(/ISDE/);
  });

  it("verwijst naar de bronnen met een controledatum", () => {
    const { container } = toon();
    const hosts = Array.from(container.querySelectorAll<HTMLAnchorElement>("a")).map((a) => a.href);
    expect(hosts.some((h) => h.includes("milieucentraal.nl"))).toBe(true);
    expect(hosts.some((h) => h.includes("consumentenbond.nl"))).toBe(true);
    expect(hosts.some((h) => h.includes("iplo.nl"))).toBe(true);
    expect(container.textContent).toMatch(/gecontroleerd op 10 augustus 2026/i);
  });
});
