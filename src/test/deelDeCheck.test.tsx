import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { DeelDeCheck } from "@/components/subsidiecheck/DeelDeCheck";

// Waar dit blok voor bestaat: de bezoeker geeft de check door, niet zijn eigen
// overzicht. De oude knop kopieerde `window.location.href`, mét postcode en
// huisnummer erin. Deze test bewaakt dat de gekopieerde link kaal blijft.

const pushGtmEvent = vi.hoisted(() => vi.fn());
vi.mock("@/lib/gtm", () => ({ pushGtmEvent }));

const schrijf = vi.fn().mockResolvedValue(undefined);

beforeEach(() => {
  pushGtmEvent.mockClear();
  schrijf.mockClear();
  Object.defineProperty(navigator, "clipboard", {
    value: { writeText: schrijf },
    configurable: true,
  });
});

describe("het deelblok onder het resultaat", () => {
  it("kopieert de kale check, zonder adres van de bezoeker", async () => {
    render(<DeelDeCheck bewonertype="woningeigenaar" />);

    fireEvent.click(screen.getByRole("button", { name: /Deel de tool/i }));

    expect(schrijf).toHaveBeenCalledTimes(1);
    const gekopieerd = schrijf.mock.calls[0][0] as string;
    expect(gekopieerd).toBe("https://voortraject.nl/subsidiecheck?utm_source=deel&utm_medium=link");
    for (const param of ["pc=", "hn=", "tv=", "str=", "pl="]) {
      expect(gekopieerd).not.toContain(param);
    }

    expect(await screen.findByText(/Link gekopieerd/i)).toBeInTheDocument();
    expect(pushGtmEvent).toHaveBeenCalledWith("subsidiecheck_deel", { bewonertype: "woningeigenaar" });
  });

  it("stuurt geen event als de browser het klembord weigert", () => {
    schrijf.mockRejectedValueOnce(new Error("geweigerd"));
    render(<DeelDeCheck bewonertype="huurder" />);

    fireEvent.click(screen.getByRole("button", { name: /Deel de tool/i }));

    // Meten wat er niet gebeurd is, zou het deelcijfer optillen met kliks die
    // niets opleverden.
    expect(pushGtmEvent).not.toHaveBeenCalled();
  });
});
