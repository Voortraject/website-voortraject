import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";

// "Liever even bellen? Laat je nummer achter" op stap 1 van de subsidiecheck.
// Bedoeld voor bezoekers uit een Meta-advertentie die de check niet willen doen:
// de link brengt ze naar /contact, met de herkomst (utm, fbclid) in de URL en het
// adres in de history-state. Het contactformulier schrijft de herkomst en een
// meta_event_id weg, en pusht bewoner_lead met hetzelfde event_id (GTM v10 maakt
// daar een Meta Lead met content_name "contact" van).

const { insertMock, zoekAdresMock } = vi.hoisted(() => ({ insertMock: vi.fn(), zoekAdresMock: vi.fn() }));

vi.mock("@/integrations/supabase/external-client", () => ({
  SUPABASE_EXTERNAL_ANON_KEY: "test-anon-key",
  supabaseExternal: {
    from: (tabel: string) => ({ insert: (rij: unknown) => insertMock(tabel, rij) }),
  },
}));
vi.mock("@/lib/gtm", () => ({ pushGtmEvent: vi.fn() }));
vi.mock("@/lib/pdok", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/pdok")>()),
  zoekAdres: zoekAdresMock,
}));
vi.mock("@/components/Header", () => ({ Header: () => null }));
vi.mock("@/components/Footer", () => ({ Footer: () => null }));
vi.mock("@/components/Seo", () => ({ Seo: () => null }));

import { adresVoorContact } from "@/components/subsidiecheck/checkStaat";
import { LieverBellen } from "@/components/subsidiecheck/LieverBellen";
import { StapAdres } from "@/components/subsidiecheck/StapAdres";
import { pushGtmEvent } from "@/lib/gtm";
import { herkomstZoekstring } from "@/lib/herkomst";
import Contact from "@/pages/Contact";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const GRONINGEN = {
  straatnaam: "Grote Markt",
  woonplaatsnaam: "Groningen",
  gemeentenaam: "Groningen",
  provincienaam: "Groningen",
};

let nu = 1_700_000_000_000;

beforeEach(() => {
  nu = 1_700_000_000_000;
  vi.spyOn(Date, "now").mockImplementation(() => nu);
  sessionStorage.clear();
  insertMock.mockReset();
  insertMock.mockResolvedValue({ error: null });
  zoekAdresMock.mockReset();
  zoekAdresMock.mockResolvedValue(GRONINGEN);
  vi.mocked(pushGtmEvent).mockClear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

// Toont waar de router heen ging, zodat de test de querystring kan lezen.
const Waar = () => {
  const { pathname, search } = useLocation();
  return <output data-testid="waar">{pathname + search}</output>;
};

const check = (url: string) =>
  render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <MemoryRouter initialEntries={[url]}>
        <Waar />
        <Routes>
          <Route
            path="/subsidiecheck"
            element={
              <StapAdres
                initPostcode=""
                initHuisnummer=""
                initToevoeging=""
                initBewonertype={null}
                initMaatregelen={[]}
                bevestigdAdres={null}
                onStart={() => {}}
                onHandmatig={() => {}}
                onAdresWijzigen={() => {}}
                knopLabel="Zoek mijn subsidies"
                uitweg={(adres) => <LieverBellen adres={adres} />}
              />
            }
          />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );

const vul = (veld: HTMLElement, waarde: string) => fireEvent.change(veld, { target: { value: waarde } });

describe("adresVoorContact", () => {
  it("geeft een volledig adres door, met genormaliseerde postcode", () => {
    expect(adresVoorContact({ pc: "9711 aa", hn: "1", tv: "B", str: "Grote Markt", pl: "Groningen" })).toEqual({
      pc: "9711AA",
      hn: "1",
      tv: "B",
      str: "Grote Markt",
      pl: "Groningen",
    });
  });

  it("geeft niets door zolang postcode of huisnummer niet bruikbaar is", () => {
    expect(adresVoorContact({ pc: "", hn: "", tv: "", str: "", pl: "" })).toBeNull();
    expect(adresVoorContact({ pc: "9711", hn: "1", tv: "", str: "", pl: "" })).toBeNull();
    expect(adresVoorContact({ pc: "9711AA", hn: "", tv: "", str: "", pl: "" })).toBeNull();
    expect(adresVoorContact({ pc: "9711AA", hn: "123456", tv: "", str: "", pl: "" })).toBeNull();
  });

  it("laat straat en plaats weg als er één ontbreekt of niet deugt", () => {
    expect(adresVoorContact({ pc: "9711AA", hn: "1", tv: "", str: "Grote Markt", pl: "" })).toMatchObject({
      str: "",
      pl: "",
    });
    expect(adresVoorContact({ pc: "9711AA", hn: "1", tv: "", str: "<b>", pl: "Groningen" })).toMatchObject({
      str: "",
      pl: "",
    });
  });
});

describe("herkomstZoekstring", () => {
  it("neemt utm-tags en fbclid uit de URL mee, en niets anders", () => {
    const zoek = herkomstZoekstring("?utm_source=meta&utm_medium=paid_social&fbclid=IwAR1&type=woningeigenaar&test=1");
    expect(new URLSearchParams(zoek).toString()).toBe("utm_source=meta&utm_medium=paid_social&fbclid=IwAR1");
  });

  it("geeft de first touch uit sessionStorage voorrang, en laat ongeldige waarden weg", () => {
    sessionStorage.setItem("sc_herkomst", JSON.stringify({ utm_source: "meta", utm_campaign: "dorpen_okt" }));
    const params = new URLSearchParams(herkomstZoekstring("?utm_source=google&utm_term=met%20spatie"));
    expect(params.get("utm_source")).toBe("meta");
    expect(params.get("utm_campaign")).toBe("dorpen_okt");
    expect(params.has("utm_term")).toBe(false);
  });

  it("is leeg zonder herkomst", () => {
    expect(herkomstZoekstring("")).toBe("");
  });
});

describe("Liever even bellen? op stap 1 van de check", () => {
  it("staat er als rustige link onder de knop, met de zin uit de advertentie", () => {
    check("/subsidiecheck");
    expect(screen.getByText(/Liever even bellen\?/)).toBeInTheDocument();
    const link = screen.getByRole("link", { name: "Laat je nummer achter" });
    expect(link).toHaveAttribute("href", "/contact");
    // Geen knop: de check blijft de hoofdroute.
    expect(screen.queryByRole("button", { name: /nummer achter/ })).toBeNull();
  });

  it("geeft herkomst in de URL en het adres als state mee, en het contactformulier schrijft alles weg", async () => {
    check(
      "/subsidiecheck?utm_source=meta&utm_medium=paid_social&utm_campaign=dorpen&utm_content=video_a&utm_term=ten_boer&fbclid=IwAR1abc",
    );

    vul(screen.getByLabelText(/^Postcode/), "9711AA");
    vul(screen.getByLabelText(/^Huisnummer/), "1");
    // De live adrescheck herkent het huis (na een halve seconde wachten).
    await screen.findByText(/Grote Markt 1, Groningen/, {}, { timeout: 2_000 });

    const link = screen.getByRole("link", { name: "Laat je nummer achter" });
    // Het adres staat nooit in de URL.
    expect(link.getAttribute("href")).not.toMatch(/[?&](pc|hn|tv|str|pl)=/);
    fireEvent.click(link);

    // Op /contact: herkomst in de URL, het adres voorgevuld en bevestigd.
    const waar = new URL(screen.getByTestId("waar").textContent!, "https://voortraject.nl");
    expect(waar.pathname).toBe("/contact");
    expect(Object.fromEntries(waar.searchParams)).toEqual({
      utm_source: "meta",
      utm_medium: "paid_social",
      utm_campaign: "dorpen",
      utm_content: "video_a",
      utm_term: "ten_boer",
      fbclid: "IwAR1abc",
    });
    expect(screen.getByLabelText(/^Postcode/)).toHaveValue("9711 AA");
    expect(screen.getByLabelText(/^Huisnummer/)).toHaveValue("1");
    expect(screen.getByText(/Grote Markt 1, Groningen/)).toBeInTheDocument();

    vul(screen.getByLabelText(/^Voornaam/), "Jan");
    vul(screen.getByLabelText(/^Achternaam/), "de Vries");
    vul(screen.getByLabelText(/^E-mailadres/), "jan@example.nl");
    vul(screen.getByLabelText(/^Telefoonnummer/), "0612345678");
    vul(screen.getByLabelText(/^Bericht/), "Bel me liever.");
    nu += 5_000;
    fireEvent.click(screen.getByRole("button", { name: /Verstuur bericht/ }));
    await screen.findByText(/Bedankt!/);

    const [tabel, rij] = insertMock.mock.calls[0];
    expect(tabel).toBe("leads_bewoners");
    expect(rij).toMatchObject({
      formulier: "contactformulier",
      postcode: "9711AA",
      huisnummer: "1",
      straat: "Grote Markt",
      stad: "Groningen",
      utm_source: "meta",
      utm_medium: "paid_social",
      utm_campaign: "dorpen",
      utm_content: "video_a",
      utm_term: "ten_boer",
      fbclid: "IwAR1abc",
    });
    expect(rij.meta_event_id).toMatch(UUID);

    const lead = vi.mocked(pushGtmEvent).mock.calls.find(([event]) => event === "bewoner_lead");
    expect(lead).toBeDefined();
    expect(lead![1]).toEqual({ heeft_adres: 1, heeft_vraag: 1, event_id: rij.meta_event_id });
    // Geen persoonsgegevens in de dataLayer.
    expect(JSON.stringify(lead)).not.toMatch(/Jan|Vries|example|0612|9711|Grote Markt/);
  });

  it("zonder adres en herkomst gaat er een kale link naar /contact", async () => {
    check("/subsidiecheck");
    fireEvent.click(screen.getByRole("link", { name: "Laat je nummer achter" }));
    expect(screen.getByTestId("waar").textContent).toBe("/contact");
    expect(screen.getByLabelText(/^Postcode/)).toHaveValue("");
    expect(zoekAdresMock).not.toHaveBeenCalled();
  });
});

describe("contactformulier met een meegegeven adres zonder straat", () => {
  it("zoekt het adres zelf op bij binnenkomst", async () => {
    render(
      <MemoryRouter initialEntries={[{ pathname: "/contact", state: { scAdres: { pc: "9711AA", hn: "1", tv: "", str: "", pl: "" } } }]}>
        <Contact />
      </MemoryRouter>,
    );
    await waitFor(() => expect(zoekAdresMock).toHaveBeenCalledWith("9711 AA", "1"));
    expect(await screen.findByText(/Grote Markt 1, Groningen/)).toBeInTheDocument();
  });
});

describe("contactformulier zonder herkomst", () => {
  it("stuurt geen lege utm-velden mee, wel een meta_event_id", async () => {
    render(<Contact />, { wrapper: MemoryRouter });
    vul(screen.getByLabelText(/^Voornaam/), "Jan");
    vul(screen.getByLabelText(/^Achternaam/), "de Vries");
    vul(screen.getByLabelText(/^E-mailadres/), "jan@example.nl");
    vul(screen.getByLabelText(/^Telefoonnummer/), "0612345678");
    vul(screen.getByLabelText(/^Bericht/), "Vraag.");
    nu += 5_000;
    fireEvent.click(screen.getByRole("button", { name: /Verstuur bericht/ }));
    await screen.findByText(/Bedankt!/);

    const [, rij] = insertMock.mock.calls[0];
    expect(Object.keys(rij).filter((k) => k.startsWith("utm_") || k === "fbclid")).toEqual([]);
    expect(rij.meta_event_id).toMatch(UUID);
  });
});
