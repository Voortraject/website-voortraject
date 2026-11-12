import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactElement } from "react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { PdokAdres } from "@/lib/pdok";
import type { SubsidieCheckInput } from "@/lib/subsidies";

// De e-mailcontrole zoals de bezoeker hem in de formulieren tegenkomt: suggestie bij een
// vertypt domein (met één tik over te nemen, nooit stil aangepast), een blokkade alleen als
// er aantoonbaar geen mail kan aankomen, en bij een storing gewoon door (fail-open).

const { insertMock } = vi.hoisted(() => ({ insertMock: vi.fn() }));

vi.mock("@/integrations/supabase/external-client", () => ({
  SUPABASE_EXTERNAL_ANON_KEY: "test-anon-key",
  supabaseExternal: {
    from: (tabel: string) => ({ insert: (rij: unknown) => insertMock(tabel, rij) }),
  },
}));
vi.mock("@/lib/gtm", () => ({ pushGtmEvent: vi.fn() }));
vi.mock("@/components/Header", () => ({ Header: () => null }));
vi.mock("@/components/Footer", () => ({ Footer: () => null }));
vi.mock("@/components/Seo", () => ({ Seo: () => null }));
vi.mock("@/lib/woninginfo", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/woninginfo")>()),
  haalWoningInfo: () => Promise.resolve({ energielabel: null, gebouw: null }),
}));
vi.mock("@/lib/subsidies", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/subsidies")>()),
  subsidieProvider: { naam: "test", check: vi.fn() },
}));

import { ZakelijkContactFormulier } from "@/components/ZakelijkContactFormulier";
import { DirectContact } from "@/components/subsidiecheck/DirectContact";
import { StapGegevens } from "@/components/subsidiecheck/StapGegevens";
import { DOH_URL, _leegDomeinCache } from "@/lib/email";
import { subsidieProvider } from "@/lib/subsidies";
import Contact from "@/pages/Contact";

/** Nep-DoH: domeinen die niet bestaan (NXDOMAIN); de rest heeft een MX. `offline` = netwerkfout. */
const dns = ({ bestaatNiet = [] as string[], offline = false } = {}) => {
  const fetchMock = vi.fn(async (invoer: RequestInfo | URL) => {
    const url = String(invoer);
    if (!url.startsWith(DOH_URL) || offline) throw new TypeError("Failed to fetch");
    const naam = new URL(url).searchParams.get("name") ?? "";
    const antwoord = bestaatNiet.includes(naam)
      ? { Status: 3 }
      : { Status: 0, Answer: [{ type: 15, data: `10 mx.${naam}.` }] };
    return new Response(JSON.stringify(antwoord), { status: 200 });
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
};

// De formulieren weigeren een inzending binnen 2 seconden na laden (anti-bot).
let nu = 1_700_000_000_000;

beforeEach(() => {
  nu = 1_700_000_000_000;
  vi.spyOn(Date, "now").mockImplementation(() => nu);
  insertMock.mockReset();
  insertMock.mockResolvedValue({ error: null });
  vi.mocked(subsidieProvider.check).mockResolvedValue([]);
  _leegDomeinCache();
  sessionStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

const vul = (veld: HTMLElement, waarde: string) => fireEvent.change(veld, { target: { value: waarde } });

const vulContactIn = (email: string) => {
  render(<Contact />, { wrapper: MemoryRouter });
  vul(screen.getByLabelText(/^Voornaam/), "Jan");
  vul(screen.getByLabelText(/^Achternaam/), "de Vries");
  vul(screen.getByLabelText(/^E-mailadres/), email);
  vul(screen.getByLabelText(/^Telefoonnummer/), "0612345678");
  vul(screen.getByLabelText(/^Bericht/), "Graag advies over isolatie.");
  nu += 5_000;
  return screen.getByLabelText(/^E-mailadres/) as HTMLInputElement;
};

const verstuurContact = () => fireEvent.click(screen.getByRole("button", { name: /Verstuur bericht/ }));

describe("e-mailcontrole op /contact", () => {
  it("stelt bij het verlaten van het veld een correctie voor, en neemt die met één tik over", async () => {
    dns();
    const veld = vulContactIn("jan@gmial.com");
    fireEvent.blur(veld);

    const knop = await screen.findByRole("button", { name: "Gebruik jan@gmail.com" });
    expect(screen.getByText(/Bedoelde je/)).toBeInTheDocument();
    // Een vraag, geen correctie: het veld staat nog zoals getypt.
    expect(veld.value).toBe("jan@gmial.com");
    expect(veld).toHaveAttribute("aria-describedby", expect.stringMatching(/.+/));

    fireEvent.click(knop);
    expect(veld.value).toBe("jan@gmail.com");
    expect(screen.queryByText(/Bedoelde je/)).not.toBeInTheDocument();
    expect(document.activeElement).toBe(veld);

    verstuurContact();
    await screen.findByText(/Bedankt!/);
    expect(insertMock.mock.calls[0][1].email).toBe("jan@gmail.com");
  });

  it("houdt de eerste klik tegen bij een suggestie, de tweede gaat door met het getypte adres", async () => {
    dns();
    vulContactIn("jan@hotmail.be");

    verstuurContact();
    await screen.findByText(/Klopt je adres toch\? Verstuur dan nog een keer\./);
    expect(screen.getByRole("button", { name: "Gebruik jan@hotmail.nl" })).toBeInTheDocument();
    expect(insertMock).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(screen.getByLabelText(/^E-mailadres/));

    verstuurContact();
    await screen.findByText(/Bedankt!/);
    expect(insertMock.mock.calls[0][1].email).toBe("jan@hotmail.be");
  });

  it("blokkeert versturen als het domein niet bestaat, tot het adres klopt", async () => {
    dns({ bestaatNiet: ["voortrajekt.nl"] });
    const veld = vulContactIn("jan@voortrajekt.nl");
    fireEvent.blur(veld);

    await screen.findByText(/Op dit adres kan geen mail aankomen/);
    expect(veld).toHaveAttribute("aria-invalid", "true");

    // Ook herhaald versturen helpt niet: dit is een fout, geen vraag.
    for (let poging = 0; poging < 2; poging++) {
      verstuurContact();
      await waitFor(() => expect(screen.getByRole("button", { name: /Verstuur bericht/ })).not.toBeDisabled());
    }
    expect(insertMock).not.toHaveBeenCalled();
    expect(screen.getByText(/Op dit adres kan geen mail aankomen/)).toBeInTheDocument();

    vul(veld, "jan@voortraject.nl");
    expect(screen.queryByText(/Op dit adres kan geen mail aankomen/)).not.toBeInTheDocument();
    expect(veld).toHaveAttribute("aria-invalid", "false");

    verstuurContact();
    await screen.findByText(/Bedankt!/);
    expect(insertMock.mock.calls[0][1].email).toBe("jan@voortraject.nl");
  });

  it("toont bij een niet-bestaand domein mét suggestie beide, en het gaat pas door na de correctie", async () => {
    dns({ bestaatNiet: ["gmail.con"] });
    vulContactIn("jan@gmail.con");

    verstuurContact();
    await screen.findByText(/Op dit adres kan geen mail aankomen/);
    fireEvent.click(screen.getByRole("button", { name: "Gebruik jan@gmail.com" }));

    verstuurContact();
    await screen.findByText(/Bedankt!/);
    expect(insertMock.mock.calls[0][1].email).toBe("jan@gmail.com");
  });

  it("laat de lead door als de DNS-controle niet lukt (fail-open)", async () => {
    dns({ offline: true });
    const veld = vulContactIn("jan@bouwbedrijf.nl");
    fireEvent.blur(veld);

    verstuurContact();
    await screen.findByText(/Bedankt!/);
    expect(insertMock.mock.calls[0][1].email).toBe("jan@bouwbedrijf.nl");
    expect(screen.queryByText(/Op dit adres kan geen mail aankomen/)).not.toBeInTheDocument();
  });

  it("controleert niets op de belroute als het e-mailveld leeg blijft", async () => {
    const fetchMock = dns();
    render(
      <MemoryRouter initialEntries={[{ pathname: "/contact", state: { bellen: true } }]}>
        <Contact />
      </MemoryRouter>,
    );
    vul(screen.getByLabelText(/^Voornaam/), "Jan");
    vul(screen.getByLabelText(/^Telefoonnummer/), "0612345678");
    fireEvent.blur(screen.getByLabelText(/^E-mailadres/));
    nu += 5_000;
    fireEvent.click(screen.getByRole("button", { name: "Bel mij terug" }));

    await screen.findByText(/Bedankt, Jan!/);
    expect(insertMock.mock.calls[0][1].email).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("e-mailcontrole op /zakelijk", () => {
  it("blokkeert een niet-bestaand domein en neemt een suggestie over", async () => {
    dns({ bestaatNiet: ["outlook.con"] });
    render(<ZakelijkContactFormulier />);
    vul(screen.getByLabelText(/^Bedrijfsnaam/), "Bouwbedrijf de Vries");
    vul(screen.getByLabelText("Voornaam contactpersoon"), "Jan");
    vul(screen.getByLabelText("Achternaam contactpersoon"), "de Vries");
    vul(screen.getByLabelText(/^E-mailadres/), "jan@outlook.con");
    vul(screen.getByLabelText(/^Telefoonnummer/), "0612345678");
    vul(screen.getByLabelText(/^Bericht/), "Wij willen graag samenwerken.");
    nu += 5_000;

    fireEvent.click(screen.getByRole("button", { name: /Verstuur bericht/ }));
    await screen.findByText(/Op dit adres kan geen mail aankomen/);
    expect(insertMock).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Gebruik jan@outlook.com" }));
    fireEvent.click(screen.getByRole("button", { name: /Verstuur bericht/ }));
    await screen.findByText(/Bedankt!/);
    const [tabel, rij] = insertMock.mock.calls[0];
    expect(tabel).toBe("leads_uitvoerders");
    expect(rij.email).toBe("jan@outlook.com");
  });
});

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

const metQuery = (ui: ReactElement) =>
  render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      {ui}
    </QueryClientProvider>,
  );

describe("e-mailcontrole in de subsidiecheck", () => {
  it("poort: geen lead zolang het domein niet bestaat", async () => {
    dns({ bestaatNiet: ["ziggo.nll"] });
    const onOntgrendeld = vi.fn();
    metQuery(<StapGegevens input={input} adres={adres} onOntgrendeld={onOntgrendeld} />);
    await screen.findByPlaceholderText(/Je voornaam/, {}, { timeout: 5_000 });

    vul(screen.getByPlaceholderText(/Je voornaam/), "Jan");
    vul(screen.getByPlaceholderText(/Je achternaam/), "de Vries");
    vul(screen.getByPlaceholderText(/Je e-mailadres/), "jan@ziggo.nll");
    vul(screen.getByPlaceholderText(/Je telefoonnummer/), "0612345678");
    nu += 5_000;
    fireEvent.click(screen.getByRole("button", { name: /^Bekijk mijn/ }));

    await screen.findByText(/Op dit adres kan geen mail aankomen/);
    expect(screen.getByRole("button", { name: "Gebruik jan@ziggo.nl" })).toBeInTheDocument();
    expect(insertMock).not.toHaveBeenCalled();
    expect(onOntgrendeld).not.toHaveBeenCalled();
    expect(screen.getByPlaceholderText(/Je e-mailadres/)).toHaveAttribute("aria-invalid", "true");

    fireEvent.click(screen.getByRole("button", { name: "Gebruik jan@ziggo.nl" }));
    fireEvent.click(screen.getByRole("button", { name: /^Bekijk mijn/ }));
    await waitFor(() => expect(onOntgrendeld).toHaveBeenCalled(), { timeout: 5_000 });
    expect(insertMock.mock.calls[0][1].email).toBe("jan@ziggo.nl");
  });

  it("vraagblok: suggestie onder het e-mailveld voor wie niet door de poort kwam", async () => {
    dns();
    render(<DirectContact input={input} adres={adres} />);
    const veld = screen.getByPlaceholderText(/Je e-mailadres/);
    vul(veld, "jan@hotmial.com");
    fireEvent.blur(veld);
    expect(await screen.findByRole("button", { name: "Gebruik jan@hotmail.com" })).toBeInTheDocument();
  });
});
