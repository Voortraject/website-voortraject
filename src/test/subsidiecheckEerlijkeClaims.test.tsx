import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";

// Bewaakt de claims die de subsidiecheck aan de bezoeker doet. Dit is een
// publieke marketingsite: een onjuiste regel kost hier geloofwaardigheid, en
// juist geloofwaardigheid is wat deze tool moet opleveren.
//
// Twee dingen liepen mis en mogen niet terugkomen:
//  1. Elke regelingkaart toonde "Voor vrijwel alle maatregelen". De scrape gaf
//     per regeling géén maatregelenlijst, dus `maatregelen` werd met alle acht
//     gevuld en een isolatiesubsidie kreeg dezelfde regel als een brede
//     regeling. De officiële API levert ze wél, dus de kaart mag er nu iets over
//     zeggen — maar alleen wanneer de bron zegt dat de regeling écht smal is
//     (`beperktTot`), en nooit op grond van een lijst die wij zelf hebben
//     volgezet.
//  2. De beloftes bij de check zeiden "Geen account nodig", terwijl de stap
//     erna om naam, e-mail en telefoon vraagt.

import { SubsidiecheckCta } from "@/components/sections/SubsidiecheckCta";
import { SubsidieCard } from "@/components/subsidiecheck/SubsidieCard";
import { SUBSIDIECHECK_BELOFTES } from "@/config/beloftes";
import { ALLE_MAATREGELEN, type SubsidieRegeling } from "@/lib/subsidies";

// Zoals de oude scrape een regeling teruggaf: alle maatregelen en alle vier de
// doelgroepen, ook bij een regeling die feitelijk alleen over isolatie gaat.
// `beperktTot` is leeg, want de scrape wist het niet. Geverifieerd tegen de bron
// voor postcode 7811AB.
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

  it("zegt het wél als de bron meldt dat een regeling smal is", () => {
    // Nu de officiële API de maatregelen per regeling levert, mag de beperking
    // op de dichte kaart staan: wie een warmtepomp zoekt moet zonder klikken
    // zien dat dit een isolatiesubsidie is.
    render(<SubsidieCard regeling={{ ...isolatieRegeling, beperktTot: "isolatie en glas" }} />);

    expect(screen.getByText(/Alleen voor isolatie en glas/i)).toBeInTheDocument();
  });

  it("herhaalt de combineer-belofte niet op elke kaart", () => {
    render(<SubsidieCard regeling={isolatieRegeling} />);
    fireEvent.click(screen.getByRole("button", { name: /bekijk voorwaarden/i }));

    // De uitklap toont wél de echte voorwaarde uit de bron.
    expect(screen.getByText(/Je bent eigenaar én bewoner/i)).toBeInTheDocument();
    // Maar niet de generieke zin die op alle twaalf kaarten stond; die staat nu
    // één keer op het resultaat zelf (zie subsidiecheckGroepen.test.tsx).
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

describe("de uitzondering die de bron meldt", () => {
  const metLetOp = {
    ...isolatieRegeling,
    letOp:
      "Woon je in Groningen of Noord-Drenthe? Dan kun je meedoen aan de Isolatieaanpak Nij Begun. Je hoeft dan géén ISDE-subsidie aan te vragen voor isolatie- en ventilatiemaatregelen.",
  };

  it("zet op de dichte kaart alleen de melding, niet de hele tekst", () => {
    render(<SubsidieCard regeling={metLetOp} />);

    expect(screen.getByText(/er geldt een uitzondering/i)).toBeInTheDocument();
    // De tekst van de bron is te lang voor de dichte kaart: 428 tekens bij ISDE
    // maakten er een blok van zes regels van dat de hele lijst uit balans trok.
    expect(screen.queryByText(/Isolatieaanpak Nij Begun/)).toBeNull();
  });

  it("toont de volledige uitzondering wel in de uitklap", () => {
    render(<SubsidieCard regeling={metLetOp} />);
    fireEvent.click(screen.getByRole("button", { name: /bekijk voorwaarden/i }));

    expect(screen.getByText(/géén ISDE-subsidie aan te vragen/)).toBeInTheDocument();
  });

  it("meldt niets als de bron geen uitzondering geeft", () => {
    render(<SubsidieCard regeling={isolatieRegeling} />);

    expect(screen.queryByText(/let op/i)).toBeNull();
  });
});
