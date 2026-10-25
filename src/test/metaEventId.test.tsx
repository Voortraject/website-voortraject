import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { PdokAdres } from "@/lib/pdok";
import type { SubsidieCheckInput } from "@/lib/subsidies";

// De twee pushes waar container v9 een Meta-event van maakt (subsidiecheck_start
// → ViewContent, subsidiecheck_lead → Lead) dragen elk een `event_id`; GTM leest
// die als dataLayer-variabele `event_id` en geeft hem als eventID aan Meta. Het
// id van de lead gaat óók mee naar de function (veld `eventId`, kolom
// meta_event_id), samen met de herkomst uit sessionStorage. Zo is een Lead uit de
// browser later te ontdubbelen tegen dezelfde Lead via de Conversions API.

vi.mock("@/integrations/supabase/external-client", () => ({
  SUPABASE_EXTERNAL_ANON_KEY: "test-anon-key",
  supabaseExternal: { from: vi.fn() },
}));
vi.mock("@/lib/gtm", () => ({ pushGtmEvent: vi.fn() }));
vi.mock("@/lib/woninginfo", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/woninginfo")>()),
  haalWoningInfo: vi.fn().mockResolvedValue({ energielabel: null, gebouw: null }),
}));
vi.mock("@/lib/subsidies", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/subsidies")>()),
  subsidieProvider: { naam: "test", check: vi.fn().mockResolvedValue([]) },
}));

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

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

let nu = 1_700_000_000_000;

beforeEach(() => {
  nu = 1_700_000_000_000;
  vi.spyOn(Date, "now").mockImplementation(() => nu);
  sessionStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.resetModules();
});

describe("event_id bij subsidiecheck_start", () => {
  it("gaat mee in de push als het adres bevestigd is", async () => {
    const { pushGtmEvent } = await import("@/lib/gtm");
    const { StapAdres } = await import("@/components/subsidiecheck/StapAdres");
    metQuery(
      <StapAdres
        initPostcode="9711AA"
        initHuisnummer="1"
        initToevoeging=""
        initBewonertype="woningeigenaar"
        initMaatregelen={[]}
        bevestigdAdres={adres}
        onStart={() => {}}
        onHandmatig={() => {}}
        onAdresWijzigen={() => {}}
        knopLabel="Zoek mijn subsidies"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Zoek mijn subsidies/ }));

    const start = vi.mocked(pushGtmEvent).mock.calls.find(([event]) => event === "subsidiecheck_start");
    expect(start).toBeDefined();
    expect(start![1]).toMatchObject({ gemeente: "Groningen", provincie: "Groningen" });
    expect(start![1]!.event_id).toMatch(UUID);
  });
});

describe("event_id en herkomst bij subsidiecheck_lead", () => {
  it("stuurt hetzelfde id naar de dataLayer en naar de function, met de herkomst", async () => {
    sessionStorage.setItem(
      "sc_herkomst",
      JSON.stringify({ utm_source: "meta", utm_medium: "paid_social", utm_campaign: "sc_okt", fbclid: "IwAR1" }),
    );
    vi.stubEnv("VITE_SUBSIDIECHECK_MAIL_URL", "https://functions.test/subsidiecheck-mail");
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ ok: true, leadId: "abc" }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    vi.resetModules();
    const { pushGtmEvent } = await import("@/lib/gtm");
    const { subsidieProvider } = await import("@/lib/subsidies");
    const { haalWoningInfo } = await import("@/lib/woninginfo");
    vi.mocked(subsidieProvider.check).mockResolvedValue([]);
    vi.mocked(haalWoningInfo).mockResolvedValue({ energielabel: null, gebouw: null });
    const { StapGegevens } = await import("@/components/subsidiecheck/StapGegevens");

    const onOntgrendeld = vi.fn();
    metQuery(
      <StapGegevens
        input={input}
        adres={adres}
        onOntgrendeld={onOntgrendeld}
        overzichtUrl="https://voortraject.nl/subsidiecheck?pc=9711AA&hn=1&type=woningeigenaar"
      />,
    );
    await screen.findByPlaceholderText(/Je voornaam/, {}, { timeout: 5_000 });
    fireEvent.click(screen.getByRole("checkbox", { name: /Subsidies uitzoeken/ }));
    fireEvent.change(screen.getByPlaceholderText(/Je voornaam/), { target: { value: "Jan" } });
    fireEvent.change(screen.getByPlaceholderText(/Je achternaam/), { target: { value: "de Vries" } });
    fireEvent.change(screen.getByPlaceholderText(/Je e-mailadres/), { target: { value: "jan@example.nl" } });
    fireEvent.change(screen.getByPlaceholderText(/Je telefoonnummer/), { target: { value: "0612345678" } });
    nu += 5_000;
    fireEvent.click(screen.getByRole("button", { name: /^Bekijk mijn/ }));

    await waitFor(() => expect(onOntgrendeld).toHaveBeenCalled(), { timeout: 5_000 });
    const verzoek = (fetchMock.mock.calls as unknown as [string, RequestInit][]).find(
      ([url]) => url === "https://functions.test/subsidiecheck-mail",
    );
    expect(verzoek).toBeDefined();
    const body = JSON.parse(verzoek![1].body as string);

    expect(body.eventId).toMatch(UUID);
    expect(body.herkomst).toEqual({ utm_source: "meta", utm_medium: "paid_social", utm_campaign: "sc_okt", fbclid: "IwAR1" });
    // De link voor de mail komt van de pagina (mét adres), niet uit window.location.
    expect(body.overzichtUrl).toBe("https://voortraject.nl/subsidiecheck?pc=9711AA&hn=1&type=woningeigenaar");
    // De tegels als lijst voor `subsidiecheck_hulpvragen`, en tijdens de overgang
    // ook nog als tekstregel voor een oudere function.
    expect(body.hulpvragen).toEqual(["Subsidies uitzoeken"]);
    expect(body.notitie).toBe("Wil hulp met: Subsidies uitzoeken");
    // En onthouden in de sessie, voor een klik of vraag die toch een nieuwe lead wordt.
    expect(JSON.parse(sessionStorage.getItem("sc_contact")!).hulpvragen).toEqual(["Subsidies uitzoeken"]);

    const lead = vi.mocked(pushGtmEvent).mock.calls.find(([event]) => event === "subsidiecheck_lead");
    expect(lead).toBeDefined();
    expect(lead![1]!.event_id).toBe(body.eventId);
    // Geen herkomst in de dataLayer: die hoort alleen bij de lead in het CRM.
    expect(JSON.stringify(lead![1])).not.toContain("IwAR1");
  }, 15_000);
});

describe("de vraag op het resultaat", () => {
  it("stuurt de herkomst mee, voor als de function er een nieuwe lead van maakt", async () => {
    sessionStorage.setItem("sc_herkomst", JSON.stringify({ utm_source: "meta" }));
    vi.stubEnv("VITE_SUBSIDIECHECK_MAIL_URL", "https://functions.test/subsidiecheck-mail");
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ ok: true }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    vi.resetModules();
    const { verstuurSubsidiecheckBericht } = await import("@/components/subsidiecheck/leadFormulier");

    await verstuurSubsidiecheckBericht({
      waarden: { voornaam: "Jan", tussenvoegsel: "", achternaam: "Test", email: "jan@example.nl", telefoon: "0612345678" },
      bericht: "Hoe zit het met de ISDE?",
      soort: "vraag",
      input,
      adres,
      duurMs: 5_000,
    });

    const [, opties] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(JSON.parse(opties.body as string)).toMatchObject({ actie: "bericht", soort: "vraag", herkomst: { utm_source: "meta" } });
  });
});
