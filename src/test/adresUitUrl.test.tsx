import { readdirSync, readFileSync } from "fs";
import { join } from "path";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter, MemoryRouter, type MemoryRouterProps, useLocation, useNavigate } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Het adres van de subsidiecheck mag nooit in de URL staan: de Meta-pixel stuurt
// bij elk event de volledige URL mee (zie checkStaat.ts en docs/tracking.md).
// Deze test bewaakt alle wegen waarlangs het er tóch in kan komen:
//
//  1. een link met adres (de overzichtsmail): het script in index.html haalt het
//     eruit vóórdat GTM laadt, en AdresUitUrl zet het in de history-state;
//  2. een navigatie binnen de app naar /subsidiecheck?pc=…: AdresUitUrl haalt het
//     eruit vóór virtual_page_view, ook als de check zelf nog niet geladen is;
//  3. de check zelf: geen stap, geen "adres wijzigen" en geen handmatig adres
//     schrijft het adres terug in de URL;
//  4. de code: geen bestand bouwt een URL met adres, behalve bouwOverzichtUrl.

vi.mock("@/components/Header", () => ({ Header: () => null }));
vi.mock("@/components/Footer", () => ({ Footer: () => null }));
vi.mock("@/components/Seo", () => ({ Seo: () => null }));

// De stappen als knoppen die precies de callbacks van de echte stappen aanroepen.
vi.mock("@/components/subsidiecheck/StapAdres", () => ({
  StapAdres: (p: {
    initPostcode: string;
    initHuisnummer: string;
    onStart: (pc: string, hn: string, tv: string, type: string, gekozen: string[]) => void;
    onHandmatig: (pc: string, hn: string, tv: string, type: string, gekozen: string[], straat: string, stad: string) => void;
  }) => (
    <div>
      <p>stap-adres {`${p.initPostcode}|${p.initHuisnummer}`}</p>
      <button type="button" onClick={() => p.onStart("9711 ab", "5", "b", "woningeigenaar", ["isolatie"])}>
        start
      </button>
      <button
        type="button"
        onClick={() => p.onHandmatig("9999zz", "7", "", "huurder", ["isolatie"], "Nieuwbouwlaan", "Groningen")}
      >
        handmatig
      </button>
    </div>
  ),
}));
vi.mock("@/components/subsidiecheck/StapGegevens", () => ({
  StapGegevens: ({ overzichtUrl }: { overzichtUrl?: string }) => (
    <div>
      stap-gegevens <output data-testid="overzicht-url">{overzichtUrl}</output>
    </div>
  ),
}));
vi.mock("@/components/subsidiecheck/StapResultaat", () => ({ StapResultaat: () => <div>stap-resultaat</div> }));
vi.mock("@/components/subsidiecheck/Voortgang", () => ({
  Voortgang: ({ onStapKlik }: { onStapKlik?: () => void }) => (
    <button type="button" onClick={onStapKlik}>
      jouw woning
    </button>
  ),
}));

vi.mock("@/hooks/usePdokAdres", () => ({
  usePdokAdres: (postcode: string) => ({
    data: postcode
      ? { straatnaam: "Grote Markt", woonplaatsnaam: "Groningen", gemeentenaam: "Groningen", provincienaam: "Groningen" }
      : null,
    isPending: false,
  }),
}));
vi.mock("@/hooks/usePandContour", () => ({ usePandContour: () => ({ data: undefined }) }));
vi.mock("@/hooks/usePand3d", () => ({ usePand3d: () => ({ data: undefined }) }));
vi.mock("@/hooks/useWoningInfo", () => ({ useWoningInfo: () => ({ data: undefined }) }));

import { RouteTracker } from "@/components/RouteTracker";
import { AdresUitUrl } from "@/components/subsidiecheck/AdresUitUrl";
import { adresUitState, ADRES_SLEUTELS } from "@/components/subsidiecheck/checkStaat";
import Subsidiecheck from "@/pages/Subsidiecheck";

const ADRES_IN_URL = new RegExp(`[?&](${ADRES_SLEUTELS.join("|")})=`);

// Elke locatie die de router ooit toont, in volgorde. Zo zien we ook een
// tussenstap met adres die meteen weer verdwijnt.
let bezocht: string[] = [];
const Locatie = () => {
  const { pathname, search, state } = useLocation();
  bezocht.push(pathname + search);
  return (
    <>
      <output data-testid="locatie">{pathname + search}</output>
      <output data-testid="adres">{JSON.stringify(adresUitState(state))}</output>
    </>
  );
};
const adresInState = () => JSON.parse(screen.getByTestId("adres").textContent ?? "null");
const locatie = () => screen.getByTestId("locatie").textContent ?? "";

const Terug = () => {
  const navigate = useNavigate();
  return (
    <button type="button" onClick={() => navigate(-1)}>
      terug
    </button>
  );
};

const stapEvents = () => (window.dataLayer ?? []).filter((r) => r.event === "subsidiecheck_stap");

beforeEach(() => {
  bezocht = [];
  window.dataLayer = [];
  sessionStorage.clear();
  delete window.__scAdresUitUrl;
});

afterEach(() => {
  delete window.__scAdresUitUrl;
  window.history.replaceState(null, "", "/");
});

// ---- 1. Het script in index.html ----

const indexHtml = readFileSync("index.html", "utf8");
const script = /<script id="sc-adres-uit-url">([\s\S]*?)<\/script>/.exec(indexHtml)?.[1] ?? "";

/** Laadt `url` en draait het script, zoals de browser bij een volledige paginalading. */
const laadMetScript = (url: string) => {
  window.history.replaceState({ al: "er" }, "", url);
  new Function(script)();
  return window.location.pathname + window.location.search + window.location.hash;
};

describe("het script in index.html", () => {
  it("is het eerste script in <head>, dus vóór Consent Mode, GTM en Axeptio", () => {
    expect(script).not.toBe("");
    const head = indexHtml.slice(0, indexHtml.indexOf("</head>"));
    expect(head.indexOf("<script")).toBe(head.indexOf('<script id="sc-adres-uit-url">'));
    expect(head.indexOf('<script id="sc-adres-uit-url">')).toBeLessThan(head.indexOf("googletagmanager"));
  });

  it("haalt het adres uit de URL en laat utm-tags, fbclid, type en m staan", () => {
    const na = laadMetScript(
      "/subsidiecheck?pc=9711AB&hn=5&tv=b&str=Grote%20Markt&pl=Groningen&type=woningeigenaar&m=isolatie" +
        "&utm_source=meta&utm_campaign=sc_okt&fbclid=IwAR0abc#boven",
    );

    expect(na).toBe("/subsidiecheck?type=woningeigenaar&m=isolatie&utm_source=meta&utm_campaign=sc_okt&fbclid=IwAR0abc#boven");
    expect(na).not.toMatch(ADRES_IN_URL);
    expect(window.__scAdresUitUrl).toEqual({ pc: "9711AB", hn: "5", tv: "b", str: "Grote Markt", pl: "Groningen" });
    // De bestaande history-state blijft staan.
    expect(window.history.state).toEqual({ al: "er" });
  });

  it("werkt ook met een slash achter het pad", () => {
    expect(laadMetScript("/subsidiecheck/?pc=9711AB&hn=5")).toBe("/subsidiecheck/");
    expect(window.__scAdresUitUrl).toEqual({ pc: "9711AB", hn: "5" });
  });

  it("doet niets op andere pagina's", () => {
    expect(laadMetScript("/?pc=9711AB&hn=5")).toBe("/?pc=9711AB&hn=5");
    expect(laadMetScript("/subsidiecheck-test?pc=9711AB")).toBe("/subsidiecheck-test?pc=9711AB");
    expect(window.__scAdresUitUrl).toBeUndefined();
  });

  it("laat een URL zonder adres helemaal met rust", () => {
    expect(laadMetScript("/subsidiecheck?utm_source=deel&utm_medium=mail")).toBe(
      "/subsidiecheck?utm_source=deel&utm_medium=mail",
    );
    expect(window.__scAdresUitUrl).toBeUndefined();
  });
});

// ---- 2. Binnenkomst: de link uit de mail en een navigatie binnen de app ----

type Entry = NonNullable<MemoryRouterProps["initialEntries"]>[number];

const toonCheck = (entry: Entry) =>
  render(
    <MemoryRouter initialEntries={[entry]}>
      <AdresUitUrl />
      <Subsidiecheck />
      <Locatie />
      <Terug />
    </MemoryRouter>,
  );

describe("binnenkomst met een adres", () => {
  it("vult de check voor uit een deeplink met ?pc=&hn= en haalt die uit de URL", async () => {
    toonCheck("/subsidiecheck?pc=9711AB&hn=5&type=woningeigenaar&utm_source=meta&fbclid=abc");

    expect(await screen.findByText(/stap-gegevens/)).toBeInTheDocument();
    expect(locatie()).toBe("/subsidiecheck?type=woningeigenaar&utm_source=meta&fbclid=abc");
    expect(adresInState()).toMatchObject({ pc: "9711AB", hn: "5" });
    // De link voor in de mail heeft het adres wél, anders toont hij niets.
    expect(screen.getByTestId("overzicht-url").textContent).toBe(
      "https://voortraject.nl/subsidiecheck?pc=9711AB&hn=5&type=woningeigenaar",
    );
    // Eén stap gemeld: de check springt bij het opruimen van de URL niet om.
    expect(stapEvents()).toHaveLength(1);
    expect(stapEvents()[0]).toMatchObject({ stap: 2 });
  });

  it("neemt het adres over dat het script in index.html klaarzette", async () => {
    window.__scAdresUitUrl = { pc: "9711AB", hn: "5", tv: "b" };
    toonCheck("/subsidiecheck?type=woningeigenaar");

    expect(await screen.findByText(/stap-gegevens/)).toBeInTheDocument();
    expect(locatie()).toBe("/subsidiecheck?type=woningeigenaar");
    expect(adresInState()).toMatchObject({ pc: "9711AB", hn: "5", tv: "b" });
    expect(window.__scAdresUitUrl).toBeUndefined();
    expect(stapEvents()).toHaveLength(1);
  });

  it("haalt ook lege of onbruikbare adresparameters uit de URL", async () => {
    toonCheck("/subsidiecheck?pc=&hn=" + "9".repeat(300));

    expect(await screen.findByText(/stap-adres/)).toBeInTheDocument();
    expect(locatie()).not.toMatch(ADRES_IN_URL);
  });

  it("toont na een herlaad hetzelfde adres uit de history-state", async () => {
    toonCheck({
      pathname: "/subsidiecheck",
      search: "?type=woningeigenaar",
      state: { scAdres: { pc: "9711AB", hn: "5", tv: "", str: "", pl: "" } },
    });

    expect(await screen.findByText(/stap-gegevens/)).toBeInTheDocument();
    expect(screen.getByTestId("overzicht-url").textContent).toContain("pc=9711AB&hn=5");
  });
});

describe("navigatie binnen de app naar /subsidiecheck?pc=…", () => {
  const Naar = ({ url }: { url: string }) => {
    const navigate = useNavigate();
    return (
      <button type="button" onClick={() => navigate(url)}>
        naar de check
      </button>
    );
  };

  it("haalt het adres uit de URL vóór virtual_page_view, ook zolang de check zelf nog laadt", async () => {
    // Echte history, zodat we zien wat window.location zegt op het moment van de
    // push: dat is wat de Meta-pixel meestuurt. De check zelf staat hier bewust
    // niet bij, net als in productie zolang zijn lazy chunk nog laadt.
    window.history.replaceState(null, "", "/");
    const urlBijPush: string[] = [];
    const dataLayer: Record<string, unknown>[] = [];
    dataLayer.push = (...rijen: Record<string, unknown>[]) => {
      for (const rij of rijen) if (rij.event === "virtual_page_view") urlBijPush.push(window.location.href);
      return Array.prototype.push.apply(dataLayer, rijen);
    };
    window.dataLayer = dataLayer;

    render(
      <BrowserRouter>
        <AdresUitUrl />
        <RouteTracker />
        <Naar url="/subsidiecheck?pc=9711AB&hn=5&type=woningeigenaar" />
        <Locatie />
      </BrowserRouter>,
    );
    fireEvent.click(screen.getByRole("button", { name: "naar de check" }));

    await waitFor(() => expect(urlBijPush).toHaveLength(1));
    expect(urlBijPush[0]).toBe(`${window.location.origin}/subsidiecheck?type=woningeigenaar`);
    expect(window.location.search).toBe("?type=woningeigenaar");
    expect(adresInState()).toMatchObject({ pc: "9711AB", hn: "5" });
  });
});

// ---- 3. De check zelf schrijft het adres nooit terug in de URL ----

describe("binnen de check", () => {
  it("houdt het adres buiten de URL bij starten, adres wijzigen, handmatig adres en terug", async () => {
    toonCheck("/subsidiecheck");
    await screen.findByText(/stap-adres/);

    fireEvent.click(screen.getByRole("button", { name: "start" }));
    expect(await screen.findByText(/stap-gegevens/)).toBeInTheDocument();
    expect(adresInState()).toMatchObject({ pc: "9711AB", hn: "5", tv: "b" });

    // "Jouw woning" in de voortgang: terug naar stap 1, adres voorgevuld.
    fireEvent.click(screen.getByRole("button", { name: "jouw woning" }));
    expect(await screen.findByText("stap-adres 9711AB|5")).toBeInTheDocument();
    expect(locatie()).toContain("edit=1");

    fireEvent.click(screen.getByRole("button", { name: "handmatig" }));
    expect(await screen.findByText(/stap-gegevens/)).toBeInTheDocument();
    expect(adresInState()).toMatchObject({ pc: "9999ZZ", hn: "7", str: "Nieuwbouwlaan", pl: "Groningen" });
    expect(screen.getByTestId("overzicht-url").textContent).toContain("str=Nieuwbouwlaan&pl=Groningen");

    // Terug: de vorige history-entry, met het adres van dát moment.
    fireEvent.click(screen.getByRole("button", { name: "terug" }));
    expect(await screen.findByText("stap-adres 9711AB|5")).toBeInTheDocument();
    expect(adresInState()).toMatchObject({ pc: "9711AB", hn: "5" });

    expect(bezocht.length).toBeGreaterThan(3);
    for (const url of bezocht) expect(url).not.toMatch(ADRES_IN_URL);
  });
});

// ---- 4. Geen code bouwt een URL met adres, behalve bouwOverzichtUrl ----

describe("de code", () => {
  const bestanden = (map: string): string[] =>
    readdirSync(map, { withFileTypes: true }).flatMap((item) => {
      const pad = join(map, item.name);
      if (item.isDirectory()) return item.name === "test" || item.name === "node_modules" ? [] : bestanden(pad);
      return /\.(tsx?|js|html)$/.test(item.name) ? [pad] : [];
    });

  // Commentaar eruit: daar staat ?pc=…&hn=… als uitleg.
  const zonderCommentaar = (code: string) =>
    code
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/<!--[\s\S]*?-->/g, "")
      .replace(/(^|[^:"'`])\/\/.*$/gm, "$1");

  // Een adresparameter in een URL-tekst, of als sleutel die op URLSearchParams gezet wordt.
  const ADRES_URL = new RegExp(
    [
      `[?&](${ADRES_SLEUTELS.join("|")})=`,
      `\\.(set|append)\\(\\s*["'\`](${ADRES_SLEUTELS.join("|")})["'\`]`,
      `new URLSearchParams\\(\\{[^}]*\\b(${ADRES_SLEUTELS.join("|")})\\s*:`,
    ].join("|"),
  );

  it("bouwt nergens een URL met adres, behalve bouwOverzichtUrl voor de mail", () => {
    const toegestaan = new Set([join("src", "components", "subsidiecheck", "checkStaat.ts")]);
    const treffers = [...bestanden("src"), ...bestanden(join("supabase", "functions")), ...bestanden("public"), ...bestanden("functions"), "index.html"]
      .filter((pad) => !toegestaan.has(pad))
      .filter((pad) => ADRES_URL.test(zonderCommentaar(readFileSync(pad, "utf8"))));

    expect(treffers).toEqual([]);
  });

  it("zet AdresUitUrl in App.tsx vóór RouteTracker", () => {
    const app = readFileSync(join("src", "App.tsx"), "utf8");
    expect(app.indexOf("<AdresUitUrl />")).toBeGreaterThan(-1);
    expect(app.indexOf("<AdresUitUrl />")).toBeLessThan(app.indexOf("<RouteTracker />"));
  });
});
