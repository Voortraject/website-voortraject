import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { PdokAdres } from "@/lib/pdok";
import type { SubsidieCheckInput } from "@/lib/subsidies";

// De honeypot-garantie voor alle vier de formulieren die een lead wegschrijven:
// het contactformulier (bewoners), het zakelijke formulier op /zakelijk, de
// subsidiecheck-gegevenspoort en het "mail mij dit overzicht"-blok. Getest wordt
// telkens hetzelfde drietal:
//   1. het veld is een CSS-verborgen tekstveld dat autofill niet herkent,
//   2. een echte inzending levert nog steeds een lead op,
//   3. een gevuld honeypot-veld levert het bedankscherm op, zónder lead.

const { insertMock } = vi.hoisted(() => ({ insertMock: vi.fn() }));

vi.mock("@/integrations/supabase/external-client", () => ({
  SUPABASE_EXTERNAL_ANON_KEY: "test-anon-key",
  supabaseExternal: {
    from: (tabel: string) => ({ insert: (rij: unknown) => insertMock(tabel, rij) }),
  },
}));

vi.mock("@/lib/gtm", () => ({ pushGtmEvent: vi.fn() }));

// Contact.tsx trekt anders de hele layout (router, helmet) mee de test in.
vi.mock("@/components/Header", () => ({ Header: () => null }));
vi.mock("@/components/Footer", () => ({ Footer: () => null }));
vi.mock("@/components/Seo", () => ({ Seo: () => null }));

// De gegevenspoort haalt eerst de regelingen op; die bron mag hier niet uit.
vi.mock("@/lib/subsidies", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/subsidies")>()),
  subsidieProvider: { check: vi.fn().mockResolvedValue([]) },
}));

import { ZakelijkContactFormulier } from "@/components/ZakelijkContactFormulier";
import { StapGegevens } from "@/components/subsidiecheck/StapGegevens";
import { subsidieProvider } from "@/lib/subsidies";
import Contact from "@/pages/Contact";

const input: SubsidieCheckInput = {
  postcode: "9711AA",
  huisnummer: "1",
  bewonertype: "woningeigenaar",
  maatregelen: ["isolatie"],
};

const adres: PdokAdres = {
  straatnaam: "Grote Markt",
  woonplaatsnaam: "Groningen",
  gemeentenaam: "Groningen",
  provincienaam: "Groningen",
};

// Beide subsidiecheck-formulieren zitten achter een react-query provider.
const metQuery = (ui: ReactElement) =>
  render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      {ui}
    </QueryClientProvider>,
  );

// De formulieren weigeren een inzending binnen 2 seconden na laden (anti-bot).
// We zetten de klok daarom vooruit tussen invullen en verzenden.
let nu = 1_700_000_000_000;

beforeEach(() => {
  nu = 1_700_000_000_000;
  vi.spyOn(Date, "now").mockImplementation(() => nu);
  insertMock.mockReset();
  insertMock.mockResolvedValue({ error: null });
  // restoreAllMocks (afterEach) wist ook de implementatie van deze vi.fn().
  vi.mocked(subsidieProvider.check).mockResolvedValue([]);
});

afterEach(() => {
  vi.restoreAllMocks();
});

const wachtEvenAf = () => {
  nu += 5_000;
};

// Controlled React-inputs: fireEvent.change zet de waarde en vuurt onChange.
const vul = (veld: HTMLElement, waarde: string) => {
  fireEvent.change(veld, { target: { value: waarde } });
};

// Chrome's autofill kijkt naar name/id/label/placeholder. Deze namen zou het
// koppelen aan opgeslagen adresgegevens en dus invullen bij een echte bezoeker.
const AUTOFILL_NAMEN = [
  "email",
  "name",
  "naam",
  "tel",
  "phone",
  "company",
  "bedrijf",
  "url",
  "website",
  "address",
  "adres",
  "postcode",
];

const honeypotVan = (container: HTMLElement) => {
  const veld = container.querySelector<HTMLInputElement>('input[name="vt_check"]');
  if (!veld) throw new Error("Geen honeypot-veld gevonden");
  return veld;
};

const controleerHoneypotOpzet = (container: HTMLElement) => {
  const veld = honeypotVan(container);

  // Een gewoon tekstveld: bots slaan type="hidden" juist over.
  expect(veld.getAttribute("type")).toBe("text");

  // Onzichtbaar voor autofill, toetsenbord en schermlezers.
  expect(veld.getAttribute("autocomplete")).toBe("off");
  expect(veld.getAttribute("tabindex")).toBe("-1");

  // Uit beeld gezet met CSS, niet met display:none of type=hidden.
  const wrapper = veld.closest<HTMLElement>("div[aria-hidden='true']");
  expect(wrapper).not.toBeNull();
  expect(wrapper!.style.position).toBe("absolute");
  expect(parseInt(wrapper!.style.left, 10)).toBeLessThan(-999);

  // Geen naam waar browser-autofill op aanslaat.
  const naam = veld.getAttribute("name")!.toLowerCase();
  for (const verboden of AUTOFILL_NAMEN) expect(naam).not.toContain(verboden);
};

// Eis 4: de honeypot mag nooit mee in de insert (die kolom bestaat niet in de
// tabel — de insert zou er hard op falen).
const controleerGeenHoneypotInPayload = (rij: unknown) => {
  const sleutels = Object.keys(rij as object);
  expect(sleutels).not.toContain("vt_check");
  expect(sleutels).not.toContain("honeypot");
};

describe("contactformulier bewoners", () => {
  const vulIn = () => {
    vul(screen.getByLabelText(/^Voornaam/), "Jan");
    vul(screen.getByLabelText(/^Achternaam/), "de Vries");
    vul(screen.getByLabelText(/^E-mailadres/), "jan@example.nl");
    vul(screen.getByLabelText(/^Telefoonnummer/), "0612345678");
    vul(screen.getByLabelText(/^Bericht/), "Graag advies over isolatie.");
  };

  it("heeft een correct opgezet honeypot-veld", () => {
    const { container } = render(<Contact />);
    controleerHoneypotOpzet(container);
  });

  it("schrijft een lead weg bij een normale inzending", async () => {
    render(<Contact />);
    vulIn();
    wachtEvenAf();
    fireEvent.click(screen.getByRole("button", { name: /Verstuur bericht/ }));

    await screen.findByText(/Bedankt!/);
    expect(insertMock).toHaveBeenCalledTimes(1);
    const [tabel, rij] = insertMock.mock.calls[0];
    expect(tabel).toBe("leads_bewoners");
    expect(rij).toMatchObject({ voornaam: "Jan", achternaam: "de Vries", email: "jan@example.nl" });
    controleerGeenHoneypotInPayload(rij);
  });

  it("slaat de insert over bij een gevuld honeypot-veld, maar toont wel het bedankscherm", async () => {
    const { container } = render(<Contact />);
    vulIn();
    // Zoals een bot doet: het verborgen veld tóch invullen.
    vul(honeypotVan(container), "https://spam.example");
    wachtEvenAf();
    fireEvent.click(screen.getByRole("button", { name: /Verstuur bericht/ }));

    await screen.findByText(/Bedankt!/);
    expect(insertMock).not.toHaveBeenCalled();
  });
});

describe("zakelijk contactformulier", () => {
  const vulIn = () => {
    vul(screen.getByLabelText(/^Bedrijfsnaam/), "Bouwbedrijf Test");
    vul(screen.getByLabelText(/Voornaam contactpersoon/), "Jan");
    vul(screen.getByLabelText(/Achternaam contactpersoon/), "de Vries");
    vul(screen.getByLabelText(/^E-mailadres/), "jan@bouwbedrijf.nl");
    vul(screen.getByLabelText(/^Telefoonnummer/), "0612345678");
    vul(screen.getByLabelText(/^Bericht/), "Wij lopen vast op de offerte-opvolging.");
  };

  it("heeft een correct opgezet honeypot-veld", () => {
    const { container } = render(<ZakelijkContactFormulier />);
    controleerHoneypotOpzet(container);
  });

  it("schrijft een lead weg bij een normale inzending", async () => {
    render(<ZakelijkContactFormulier />);
    vulIn();
    wachtEvenAf();
    fireEvent.click(screen.getByRole("button", { name: /Verstuur bericht/ }));

    await screen.findByText(/Bedankt!/);
    expect(insertMock).toHaveBeenCalledTimes(1);
    const [tabel, rij] = insertMock.mock.calls[0];
    expect(tabel).toBe("leads_uitvoerders");
    // De kolomnamen moeten exact overeenkomen met de live CRM-tabel; de
    // gegenereerde types lopen hierop achter, zie het component zelf.
    expect(rij).toMatchObject({
      bedrijfsnaam: "Bouwbedrijf Test",
      contactpersoon_voornaam: "Jan",
      contactpersoon_achternaam: "de Vries",
      email: "jan@bouwbedrijf.nl",
      telefoon: "0612345678",
      notities: "Wij lopen vast op de offerte-opvolging.",
      bron: "Voortraject",
      status: "nieuw",
    });
    // `contactpersoon` wordt door een CRM-trigger samengesteld, niet door ons.
    expect(Object.keys(rij as object)).not.toContain("contactpersoon");
    controleerGeenHoneypotInPayload(rij);
  });

  it("slaat de insert over bij een gevuld honeypot-veld, maar toont wel het bedankscherm", async () => {
    const { container } = render(<ZakelijkContactFormulier />);
    vulIn();
    vul(honeypotVan(container), "https://spam.example");
    wachtEvenAf();
    fireEvent.click(screen.getByRole("button", { name: /Verstuur bericht/ }));

    await screen.findByText(/Bedankt!/);
    expect(insertMock).not.toHaveBeenCalled();
  });
});

describe("subsidiecheck gegevenspoort", () => {
  const vulIn = () => {
    // De hulpvraag is verplicht voordat het formulier verstuurt.
    fireEvent.click(screen.getByRole("checkbox", { name: /De aanvraag regelen/ }));
    vul(screen.getByPlaceholderText(/Je voornaam/), "Jan");
    vul(screen.getByPlaceholderText(/Je achternaam/), "de Vries");
    vul(screen.getByPlaceholderText(/Je e-mailadres/), "jan@example.nl");
    vul(screen.getByPlaceholderText(/Je telefoonnummer/), "0612345678");
  };

  it("heeft een correct opgezet honeypot-veld", async () => {
    const { container } = metQuery(<StapGegevens input={input} adres={adres} onOntgrendeld={() => {}} />);
    // De poort zoekt nu eerst (en toont dat); het formulier volgt daarna.
    await screen.findByPlaceholderText(/Je voornaam/);
    controleerHoneypotOpzet(container);
  });

  it("schrijft een lead weg en ontgrendelt het resultaat", async () => {
    const onOntgrendeld = vi.fn();
    metQuery(<StapGegevens input={input} adres={adres} onOntgrendeld={onOntgrendeld} />);
    // De poort zoekt nu eerst (en toont dat); het formulier volgt daarna.
    await screen.findByPlaceholderText(/Je voornaam/);
    vulIn();
    wachtEvenAf();
    fireEvent.click(screen.getByRole("button", { name: /Bekijk mijn subsidieoverzicht/ }));

    await waitFor(() => expect(onOntgrendeld).toHaveBeenCalled());
    expect(insertMock).toHaveBeenCalledTimes(1);
    const [tabel, rij] = insertMock.mock.calls[0];
    expect(tabel).toBe("leads_bewoners");
    expect(rij).toMatchObject({ email: "jan@example.nl", bron: "Voortraject" });
    controleerGeenHoneypotInPayload(rij);
  });

  it("slaat de insert over bij een gevuld honeypot-veld, maar ontgrendelt wel", async () => {
    const onOntgrendeld = vi.fn();
    const { container } = metQuery(<StapGegevens input={input} adres={adres} onOntgrendeld={onOntgrendeld} />);
    // De poort zoekt nu eerst (en toont dat); het formulier volgt daarna.
    await screen.findByPlaceholderText(/Je voornaam/);
    vulIn();
    vul(honeypotVan(container), "https://spam.example");
    wachtEvenAf();
    fireEvent.click(screen.getByRole("button", { name: /Bekijk mijn subsidieoverzicht/ }));

    await waitFor(() => expect(onOntgrendeld).toHaveBeenCalled());
    expect(insertMock).not.toHaveBeenCalled();
  });
});
