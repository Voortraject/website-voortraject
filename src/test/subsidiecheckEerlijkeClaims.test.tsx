import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";

// Bewaakt de claims die de subsidiecheck aan de bezoeker doet. Dit is een
// publieke marketingsite: een onjuiste regel kost hier geloofwaardigheid, en
// juist geloofwaardigheid is wat deze tool moet opleveren.
//
// Twee dingen liepen mis en mogen niet terugkomen:
//  1. Elke regelingkaart toonde "Voor vrijwel alle maatregelen". Dat komt niet
//     uit de bron: de Energiesubsidiewijzer levert per regeling géén
//     maatregelenlijst, dus de parser vult `maatregelen` met alle acht. Een
//     isolatiesubsidie kreeg zo dezelfde regel als een brede regeling.
//  2. De beloftes bij de check zeiden "Geen account nodig", terwijl de stap
//     erna om naam, e-mail en telefoon vraagt.

import { SubsidiecheckCta } from "@/components/sections/SubsidiecheckCta";
import { SubsidieCard } from "@/components/subsidiecheck/SubsidieCard";
import { SUBSIDIECHECK_BELOFTES } from "@/config/beloftes";
import { ALLE_MAATREGELEN, type SubsidieRegeling } from "@/lib/subsidies";

// Precies zoals de live edge function een regeling teruggeeft: alle acht
// maatregelen en alle vier de doelgroepen, ook bij een regeling die feitelijk
// alleen over isolatie gaat. Geverifieerd tegen de bron voor postcode 7811AB.
const isolatieRegeling: SubsidieRegeling = {
  id: "subsidie-lokale-aanpak-isolatie-emmen",
  titel: "Subsidie lokale aanpak isolatie Emmen",
  niveau: "gemeente",
  type: "subsidie",
  aanbieder: "Gemeente",
  omschrijving:
    "De subsidie 'Lokale aanpak isolatie' is er voor woningeigenaren in de gemeente Emmen die hun huis willen isoleren.",
  bedragIndicatie: "tot € 1.500",
  belangrijksteVoorwaarde: "Je bent eigenaar én bewoner van de woning",
  bronUrl: "https://gemeente.emmen.nl/subsidie-lokale-aanpak-isolatie",
  maatregelen: [...ALLE_MAATREGELEN],
  doelgroepen: ["woningeigenaar", "huurder", "vve", "verhuurder"],
};

describe("claims op de regelingkaart", () => {
  it("claimt geen maatregelen, ook niet als de bron alle acht meestuurt", () => {
    render(<SubsidieCard regeling={isolatieRegeling} />);

    expect(screen.queryByText(/vrijwel alle maatregelen/i)).toBeNull();
    // Ook geen opsomming: de bron weet het simpelweg niet per regeling.
    expect(screen.queryByText(/^Voor .*Isolatie en glas/i)).toBeNull();
  });

  it("herhaalt de combineer-belofte niet op elke kaart", () => {
    render(<SubsidieCard regeling={isolatieRegeling} />);
    fireEvent.click(screen.getByRole("button", { name: /bekijk voorwaarden/i }));

    // De uitklap toont wél de echte voorwaarde uit de bron.
    expect(screen.getByText(/Je bent eigenaar én bewoner/i)).toBeInTheDocument();
    // Maar niet de generieke zin die op alle twaalf kaarten stond; die staat nu
    // één keer op het resultaat zelf.
    expect(screen.queryByText(/vaak te combineren/i)).toBeNull();
  });
});

describe("beloftes bij de subsidiecheck", () => {
  it("belooft niets over accounts, want de check vraagt wél gegevens", () => {
    const alles = SUBSIDIECHECK_BELOFTES.join(" | ").toLowerCase();
    expect(alles).not.toContain("account");
    // "1 minuut" haalt niemand: drie velden, vier velden, een keuzevraag en een
    // zoekstap van enkele seconden.
    expect(alles).not.toContain("1 minuut");
  });

  it("toont op de homepage exact dezelfde beloftes als stap 1", () => {
    render(
      <MemoryRouter>
        <SubsidiecheckCta />
      </MemoryRouter>,
    );

    for (const belofte of SUBSIDIECHECK_BELOFTES) {
      expect(screen.getByText(belofte)).toBeInTheDocument();
    }
  });
});
