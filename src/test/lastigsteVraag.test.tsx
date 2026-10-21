import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { LastigsteVraag, OPSLAAN_NA_MS } from "@/components/subsidiecheck/LastigsteVraag";

// De vraag na "Je aanvraag is binnen": wat vindt de bewoner het lastigst? Het
// antwoord geeft het team een opening voor het belgesprek. Elke keuze wordt
// bewaard zonder extra knop, maar niet per tik: de route "bericht" zet elk
// bericht als eigen blok in de notities en mailt het team, dus we wachten tot
// de bewoner even niets meer aantikt.

const OPTIES = [
  "Door de bomen het bos niet meer zien",
  "De subsidies maximaal benutten",
  "Een betrouwbare uitvoerder vinden",
  "Het papierwerk",
];

describe("wat vind je het lastigst?", () => {
  let verstuur: ReturnType<typeof vi.fn>;
  beforeEach(() => {
    vi.useFakeTimers();
    verstuur = vi.fn(async () => undefined);
  });
  afterEach(() => vi.useRealTimers());

  const tik = (naam: string) => fireEvent.click(screen.getByRole("checkbox", { name: naam }));

  it("toont de vraag met vier keuzes, waarvan je er meer mag kiezen", () => {
    render(<LastigsteVraag verstuur={verstuur} />);
    expect(screen.getByText("Wat vind je het lastigst?")).toBeInTheDocument();
    expect(screen.getByText("Kies er gerust meer. Dan kunnen we daar meteen op ingaan.")).toBeInTheDocument();
    expect(screen.getAllByRole("checkbox").map((k) => k.textContent)).toEqual(OPTIES);
    tik(OPTIES[0]);
    tik(OPTIES[3]);
    expect(screen.getByRole("checkbox", { name: OPTIES[0] })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("checkbox", { name: OPTIES[3] })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByText("Dank je, dit staat bij je aanvraag.")).toBeInTheDocument();
  });

  it("bewaart pas als er even niets meer wordt aangetikt, in één regel en in de volgorde van de keuzes", async () => {
    render(<LastigsteVraag verstuur={verstuur} />);
    tik(OPTIES[3]);
    tik(OPTIES[0]);
    await act(async () => vi.advanceTimersByTime(OPSLAAN_NA_MS - 100));
    expect(verstuur).not.toHaveBeenCalled();
    await act(async () => vi.advanceTimersByTime(200));
    expect(verstuur).toHaveBeenCalledTimes(1);
    expect(verstuur).toHaveBeenCalledWith("Lastigst: Door de bomen het bos niet meer zien, Het papierwerk");
  });

  it("werkt een eerder bewaard antwoord bij in plaats van het nog eens te sturen", async () => {
    render(<LastigsteVraag verstuur={verstuur} />);
    tik(OPTIES[1]);
    await act(async () => vi.advanceTimersByTime(OPSLAAN_NA_MS + 10));
    // Zelfde keuze opnieuw aan en uit: per saldo niets veranderd, dus niets sturen.
    tik(OPTIES[2]);
    tik(OPTIES[2]);
    await act(async () => vi.advanceTimersByTime(OPSLAAN_NA_MS + 10));
    expect(verstuur).toHaveBeenCalledTimes(1);
    tik(OPTIES[2]);
    await act(async () => vi.advanceTimersByTime(OPSLAAN_NA_MS + 10));
    expect(verstuur).toHaveBeenCalledTimes(2);
    expect(verstuur).toHaveBeenLastCalledWith(
      "Lastigst (bijgewerkt): De subsidies maximaal benutten, Een betrouwbare uitvoerder vinden",
    );
  });

  it("zonder keuze gaat er niets weg", async () => {
    render(<LastigsteVraag verstuur={verstuur} />);
    tik(OPTIES[0]);
    tik(OPTIES[0]);
    await act(async () => vi.advanceTimersByTime(OPSLAAN_NA_MS * 2));
    expect(verstuur).not.toHaveBeenCalled();
    expect(screen.queryByText("Dank je, dit staat bij je aanvraag.")).toBeNull();
  });

  it("'Overslaan' bewaart een openstaande keuze meteen en laat het blok verdwijnen", async () => {
    render(<LastigsteVraag verstuur={verstuur} />);
    tik(OPTIES[1]);
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Overslaan" }));
    });
    expect(verstuur).toHaveBeenCalledWith("Lastigst: De subsidies maximaal benutten");
    await act(async () => vi.advanceTimersByTime(600));
    expect(screen.queryByText("Wat vind je het lastigst?")).toBeNull();
  });
});
