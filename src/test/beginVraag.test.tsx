import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { BeginVraag } from "@/components/subsidiecheck/BeginVraag";

// De vraag na "Je aanvraag is binnen". Eén tik is meteen bewaard. Het antwoord
// gaat naar `gewenste_maatregelen`, dus "Weet ik nog niet" mag daar niet landen.

const OPTIES = ["Dak", "Muren", "Vloer", "Ramen", "Warmtepomp", "Weet ik nog niet"];
const DANK = "Dank je, dit staat bij je aanvraag.";

describe("waar wil je mee beginnen?", () => {
  let verstuur: ReturnType<typeof vi.fn>;
  beforeEach(() => {
    vi.useFakeTimers();
    verstuur = vi.fn(async () => undefined);
  });
  afterEach(() => vi.useRealTimers());

  const tik = (naam: string) =>
    act(async () => {
      fireEvent.click(screen.getByRole("radio", { name: naam }));
    });

  it("toont de vraag met de zes keuzes", () => {
    render(<BeginVraag verstuur={verstuur} />);
    expect(screen.getByText("Waar wil je mee beginnen?")).toBeInTheDocument();
    expect(screen.getAllByRole("radio").map((k) => k.textContent)).toEqual(OPTIES);
    expect(verstuur).not.toHaveBeenCalled();
  });

  it("één tik bewaart meteen, zonder bevestigknop", async () => {
    render(<BeginVraag verstuur={verstuur} />);
    await tik("Vloer");
    expect(verstuur).toHaveBeenCalledTimes(1);
    expect(verstuur).toHaveBeenCalledWith("Vloer");
    expect(screen.getByRole("radio", { name: "Vloer" })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByText(DANK)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Bevestigen" })).toBeNull();
  });

  it("'Weet ik nog niet' bedankt wel maar stuurt niets naar de lead", async () => {
    render(<BeginVraag verstuur={verstuur} />);
    await tik("Weet ik nog niet");
    expect(verstuur).not.toHaveBeenCalled();
    expect(screen.getByText(DANK)).toBeInTheDocument();
  });

  it("na het bewaren ligt de keuze vast", async () => {
    render(<BeginVraag verstuur={verstuur} />);
    await tik("Dak");
    await tik("Ramen");
    expect(verstuur).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("radio", { name: "Ramen" })).toHaveAttribute("aria-checked", "false");
  });

  it("twee snelle tikken sturen maar één bericht", async () => {
    let klaar: () => void = () => {};
    verstuur = vi.fn(() => new Promise<void>((r) => (klaar = r)));
    render(<BeginVraag verstuur={verstuur} />);
    await act(async () => {
      fireEvent.click(screen.getByRole("radio", { name: "Dak" }));
      fireEvent.click(screen.getByRole("radio", { name: "Muren" }));
    });
    await act(async () => klaar());
    expect(verstuur).toHaveBeenCalledTimes(1);
    expect(verstuur).toHaveBeenCalledWith("Dak");
  });

  it("lukt het bewaren niet, dan kan het met een nieuwe tik nog eens", async () => {
    const fout = vi.spyOn(console, "error").mockImplementation(() => {});
    verstuur = vi.fn().mockRejectedValueOnce(new Error("netwerk")).mockResolvedValueOnce(undefined);
    render(<BeginVraag verstuur={verstuur} />);
    await tik("Dak");
    expect(screen.getByRole("alert")).toHaveTextContent("Dat lukte niet. Probeer het nog eens.");
    await tik("Dak");
    expect(verstuur).toHaveBeenCalledTimes(2);
    expect(screen.getByText(DANK)).toBeInTheDocument();
    fout.mockRestore();
  });

  it("'Overslaan' stuurt niets en laat het blok verdwijnen", async () => {
    render(<BeginVraag verstuur={verstuur} />);
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Overslaan" }));
    });
    await act(async () => vi.advanceTimersByTime(600));
    expect(verstuur).not.toHaveBeenCalled();
    expect(screen.queryByText("Waar wil je mee beginnen?")).toBeNull();
  });
});
