import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { LastigsteVraag } from "@/components/subsidiecheck/LastigsteVraag";

// De vraag na "Je aanvraag is binnen": wat vindt de bewoner het lastigst? Het
// antwoord geeft het team een opening voor het belgesprek. Eerst aanvinken, dan
// één keer bevestigen: er mag precies één bericht uitgaan, met de keuzes als
// lijst (die gaan naar `subsidiecheck_lastigst`; laatste keuze wint).

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
  const bevestig = () =>
    act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Bevestigen" }));
    });

  it("toont de vraag met vier keuzes, waarvan je er meer mag kiezen", () => {
    render(<LastigsteVraag verstuur={verstuur} />);
    expect(screen.getByText("Wat vind je het lastigst?")).toBeInTheDocument();
    expect(screen.getByText("Kies er gerust meer. Dan kunnen we daar meteen op ingaan.")).toBeInTheDocument();
    expect(screen.getAllByRole("checkbox").map((k) => k.textContent)).toEqual(OPTIES);
    tik(OPTIES[0]);
    tik(OPTIES[3]);
    expect(screen.getByRole("checkbox", { name: OPTIES[0] })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("checkbox", { name: OPTIES[3] })).toHaveAttribute("aria-checked", "true");
  });

  it("aanvinken alleen stuurt niets, ook niet na lang wachten", async () => {
    render(<LastigsteVraag verstuur={verstuur} />);
    tik(OPTIES[1]);
    await act(async () => vi.advanceTimersByTime(60_000));
    tik(OPTIES[2]);
    await act(async () => vi.advanceTimersByTime(60_000));
    expect(verstuur).not.toHaveBeenCalled();
    expect(screen.queryByText("Dank je, dit staat bij je aanvraag.")).toBeNull();
  });

  it("de knop verschijnt pas bij een keuze", () => {
    render(<LastigsteVraag verstuur={verstuur} />);
    expect(screen.queryByRole("button", { name: "Bevestigen" })).toBeNull();
    tik(OPTIES[0]);
    expect(screen.getByRole("button", { name: "Bevestigen" })).toBeInTheDocument();
    tik(OPTIES[0]);
    expect(screen.queryByRole("button", { name: "Bevestigen" })).toBeNull();
  });

  it("bevestigen stuurt de keuzes één keer, in de volgorde van de opties", async () => {
    render(<LastigsteVraag verstuur={verstuur} />);
    tik(OPTIES[3]);
    tik(OPTIES[0]);
    tik(OPTIES[2]);
    await bevestig();
    expect(verstuur).toHaveBeenCalledTimes(1);
    expect(verstuur).toHaveBeenCalledWith([
      "Door de bomen het bos niet meer zien",
      "Een betrouwbare uitvoerder vinden",
      "Het papierwerk",
    ]);
    expect(screen.getByText("Dank je, dit staat bij je aanvraag.")).toBeInTheDocument();
  });

  it("na bevestigen ligt de keuze vast: geen tweede bericht", async () => {
    render(<LastigsteVraag verstuur={verstuur} />);
    tik(OPTIES[1]);
    await bevestig();
    tik(OPTIES[2]);
    expect(screen.getByRole("checkbox", { name: OPTIES[2] })).toHaveAttribute("aria-checked", "false");
    expect(screen.queryByRole("button", { name: "Bevestigen" })).toBeNull();
    await act(async () => vi.advanceTimersByTime(60_000));
    expect(verstuur).toHaveBeenCalledTimes(1);
  });

  it("dubbelklikken op bevestigen stuurt toch maar één bericht", async () => {
    let klaar: () => void = () => {};
    verstuur = vi.fn(() => new Promise<void>((r) => (klaar = r)));
    render(<LastigsteVraag verstuur={verstuur} />);
    tik(OPTIES[0]);
    const knop = screen.getByRole("button", { name: "Bevestigen" });
    await act(async () => {
      fireEvent.click(knop);
      fireEvent.click(knop);
    });
    await act(async () => klaar());
    expect(verstuur).toHaveBeenCalledTimes(1);
  });

  it("lukt het versturen niet, dan kan het nog eens", async () => {
    const fout = vi.spyOn(console, "error").mockImplementation(() => {});
    verstuur = vi.fn().mockRejectedValueOnce(new Error("netwerk")).mockResolvedValueOnce(undefined);
    render(<LastigsteVraag verstuur={verstuur} />);
    tik(OPTIES[0]);
    await bevestig();
    expect(screen.getByRole("alert")).toHaveTextContent("Dat lukte niet. Probeer het nog eens.");
    await bevestig();
    expect(verstuur).toHaveBeenCalledTimes(2);
    expect(screen.getByText("Dank je, dit staat bij je aanvraag.")).toBeInTheDocument();
    fout.mockRestore();
  });

  it("'Overslaan' stuurt niets en laat het blok verdwijnen", async () => {
    render(<LastigsteVraag verstuur={verstuur} />);
    tik(OPTIES[1]);
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Overslaan" }));
    });
    await act(async () => vi.advanceTimersByTime(600));
    expect(verstuur).not.toHaveBeenCalled();
    expect(screen.queryByText("Wat vind je het lastigst?")).toBeNull();
  });
});
