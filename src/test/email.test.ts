import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  BEKENDE_DOMEINEN,
  DOH_URL,
  DOH_WACHT_MS,
  ECHT_ZONDER_SUGGESTIE,
  _leegDomeinCache,
  controleerDomein,
  domeinSuggestie,
  domeinVan,
  isGeldigEmail,
} from "@/lib/email";

// De e-mailcontrole van alle formulieren (src/lib/email.ts). Syntax en suggestie zijn een
// kopie van het CRM; de domeincheck is fail-open: alleen echt bewijs houdt een lead tegen.

describe("isGeldigEmail (zelfde regel als het CRM)", () => {
  it.each(["jan@gmail.com", " jan@gmail.com ", "jan.de.vries+test@bouwbedrijf.nl", "a@b.co", "JAN@HOME.NL"])(
    "accepteert %s",
    (adres) => expect(isGeldigEmail(adres)).toBe(true),
  );

  it.each(["", "jan", "jan@gmail", "jan@@gmail.com", "jan gmail.com", "jan@gm ail.com", "@gmail.com", "jan@.com"])(
    "weigert %j",
    (adres) => expect(isGeldigEmail(adres)).toBe(false),
  );
});

describe("domeinVan", () => {
  it("geeft het domein, genormaliseerd", () => {
    expect(domeinVan(" Jan@GMail.COM ")).toBe("gmail.com");
  });
  it("geeft null zonder bruikbaar domein", () => {
    expect(domeinVan("jan@localhost")).toBeNull();
    expect(domeinVan("jan")).toBeNull();
  });
});

describe("domeinSuggestie", () => {
  it.each([
    ["jan@gmial.com", "jan@gmail.com"],
    ["jan@gmail.con", "jan@gmail.com"],
    ["jan@gmai.com", "jan@gmail.com"],
    ["jan@hotmial.com", "jan@hotmail.com"],
    ["jan@hotmail.nll", "jan@hotmail.nl"],
    ["jan@outlok.com", "jan@outlook.com"],
    ["jan@zigo.nl", "jan@ziggo.nl"],
    ["jan@kpnmial.nl", "jan@kpnmail.nl"],
    ["jan@hom.nl", "jan@home.nl"],
    ["jan@planet.nk", "jan@planet.nl"],
    ["jan@icloud.co", "jan@icloud.com"],
    ["jan@lve.nl", "jan@live.nl"],
  ])("%s → %s", (getypt, verwacht) => {
    expect(domeinSuggestie(getypt)).toBe(verwacht);
  });

  it("laat het deel vóór de @ precies zoals de bezoeker het typte", () => {
    expect(domeinSuggestie("  Jan.de.Vries@Gmial.com ")).toBe("Jan.de.Vries@gmail.com");
  });

  it.each(BEKENDE_DOMEINEN.map((d) => [d]))("geen suggestie voor het bekende domein %s", (domein) => {
    expect(domeinSuggestie(`jan@${domein}`)).toBeNull();
    expect(domeinSuggestie(`jan@${domein.toUpperCase()}`)).toBeNull();
  });

  it.each(["voortraject.nl", "bouwbedrijf.nl", "example.nl", "kpn.nl", "gemeente.groningen.nl", "hanze.nl"])(
    "geen valse suggestie voor een gewoon domein (%s)",
    (domein) => expect(domeinSuggestie(`jan@${domein}`)).toBeNull(),
  );

  it("geen suggestie bij ongeldige syntax", () => {
    expect(domeinSuggestie("jan@gmial")).toBeNull();
    expect(domeinSuggestie("jan gmial.com")).toBeNull();
  });
});

// ---------- Domeincheck via DNS-over-HTTPS ----------

type Antwoord = { Status: number; Answer?: { type: number; data: string }[] };

/** Nep-DoH: per "naam type" een antwoord. Wat er niet in staat, is een netwerkfout. */
const nepDns = (antwoorden: Record<string, Antwoord>) =>
  vi.fn(async (invoer: RequestInfo | URL) => {
    const url = new URL(String(invoer));
    const sleutel = `${url.searchParams.get("name")} ${url.searchParams.get("type")}`;
    const antwoord = antwoorden[sleutel];
    if (!antwoord) throw new TypeError(`geen antwoord voor ${sleutel}`);
    return new Response(JSON.stringify(antwoord), { status: 200 });
  });

const MX = (data: string) => ({ type: 15, data });

beforeEach(() => {
  _leegDomeinCache();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("controleerDomein", () => {
  it("NXDOMAIN → bestaat_niet", async () => {
    vi.stubGlobal("fetch", nepDns({ "gmail.con MX": { Status: 3 } }));
    expect(await controleerDomein("gmail.con")).toBe("bestaat_niet");
  });

  it("MX-records → bestaat", async () => {
    vi.stubGlobal("fetch", nepDns({ "gmail.com MX": { Status: 0, Answer: [MX("5 gmail-smtp-in.l.google.com.")] } }));
    expect(await controleerDomein("gmail.com")).toBe("bestaat");
  });

  it('null MX ("0 .", RFC 7505) → bestaat_niet', async () => {
    vi.stubGlobal("fetch", nepDns({ "example.nl MX": { Status: 0, Answer: [MX("0 .")] } }));
    expect(await controleerDomein("example.nl")).toBe("bestaat_niet");
  });

  it("geen MX maar wel een A-record → bestaat (mail gaat dan naar het domein zelf)", async () => {
    vi.stubGlobal(
      "fetch",
      nepDns({
        "klein.nl MX": { Status: 0 },
        "klein.nl A": { Status: 0, Answer: [{ type: 1, data: "203.0.113.7" }] },
        "klein.nl AAAA": { Status: 0 },
      }),
    );
    expect(await controleerDomein("klein.nl")).toBe("bestaat");
  });

  it("alleen een AAAA-record → bestaat", async () => {
    vi.stubGlobal(
      "fetch",
      nepDns({
        "zes.nl MX": { Status: 0 },
        "zes.nl A": { Status: 0 },
        "zes.nl AAAA": { Status: 0, Answer: [{ type: 28, data: "2001:db8::1" }] },
      }),
    );
    expect(await controleerDomein("zes.nl")).toBe("bestaat");
  });

  it("geen MX, geen A en geen AAAA → bestaat_niet", async () => {
    vi.stubGlobal(
      "fetch",
      nepDns({ "leeg.nl MX": { Status: 0 }, "leeg.nl A": { Status: 0 }, "leeg.nl AAAA": { Status: 0 } }),
    );
    expect(await controleerDomein("leeg.nl")).toBe("bestaat_niet");
  });

  it("SERVFAIL → onbekend (geen bewijs, dus door)", async () => {
    vi.stubGlobal("fetch", nepDns({ "gmial.com MX": { Status: 2 } }));
    expect(await controleerDomein("gmial.com")).toBe("onbekend");
  });

  it("netwerkfout → onbekend", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));
    expect(await controleerDomein("gmail.com")).toBe("onbekend");
  });

  it("HTTP-fout → onbekend", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("kapot", { status: 500 })));
    expect(await controleerDomein("gmail.com")).toBe("onbekend");
  });

  it("geen JSON → onbekend", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("<html>", { status: 200 })));
    expect(await controleerDomein("gmail.com")).toBe("onbekend");
  });

  it("A-vraag faalt na een lege MX → onbekend, geen vals oordeel", async () => {
    vi.stubGlobal("fetch", nepDns({ "half.nl MX": { Status: 0 }, "half.nl AAAA": { Status: 0 } }));
    expect(await controleerDomein("half.nl")).toBe("onbekend");
  });

  it(`geeft na ${DOH_WACHT_MS} ms op → onbekend`, async () => {
    vi.useFakeTimers();
    // Een DNS-server die nooit antwoordt, tot de controle zelf afbreekt.
    vi.stubGlobal(
      "fetch",
      vi.fn(
        (_invoer: RequestInfo | URL, opties?: RequestInit) =>
          new Promise<Response>((_, mislukt) => {
            opties?.signal?.addEventListener("abort", () => mislukt(new DOMException("afgebroken", "AbortError")));
          }),
      ),
    );
    const uitkomst = controleerDomein("traag.nl");
    await vi.advanceTimersByTimeAsync(DOH_WACHT_MS);
    expect(await uitkomst).toBe("onbekend");
  });

  it("vraagt Cloudflare om JSON en stuurt alleen het domein mee", async () => {
    const fetchMock = nepDns({ "gmail.com MX": { Status: 0, Answer: [MX("5 mx.")] } });
    vi.stubGlobal("fetch", fetchMock);
    await controleerDomein("gmail.com");

    const [url, opties] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url.startsWith(`${DOH_URL}?`)).toBe(true);
    expect(new URL(url).searchParams.get("name")).toBe("gmail.com");
    expect(new Headers(opties.headers).get("accept")).toBe("application/dns-json");
  });

  it("vraagt een IDN-domein op als punycode", async () => {
    const fetchMock = nepDns({ "xn--caf-dma.nl MX": { Status: 0, Answer: [MX("10 mail.xn--caf-dma.nl.")] } });
    vi.stubGlobal("fetch", fetchMock);
    expect(await controleerDomein("café.nl")).toBe("bestaat");
  });

  it("onthoudt een definitief oordeel per domein", async () => {
    const fetchMock = nepDns({ "gmail.con MX": { Status: 3 } });
    vi.stubGlobal("fetch", fetchMock);
    await controleerDomein("gmail.con");
    await controleerDomein("GMAIL.CON");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("deelt één lopende vraag (veld verlaten en meteen versturen)", async () => {
    const fetchMock = nepDns({ "gmail.com MX": { Status: 0, Answer: [MX("5 mx.")] } });
    vi.stubGlobal("fetch", fetchMock);
    const [een, twee] = await Promise.all([controleerDomein("gmail.com"), controleerDomein("gmail.com")]);
    expect([een, twee]).toEqual(["bestaat", "bestaat"]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("onthoudt 'onbekend' niet: een volgende poging vraagt opnieuw", async () => {
    const fetchMock = vi.fn().mockRejectedValueOnce(new TypeError("offline"));
    fetchMock.mockImplementation(nepDns({ "gmail.com MX": { Status: 0, Answer: [MX("5 mx.")] } }));
    vi.stubGlobal("fetch", fetchMock);
    expect(await controleerDomein("gmail.com")).toBe("onbekend");
    expect(await controleerDomein("gmail.com")).toBe("bestaat");
  });
});

describe("echte domeinen zonder valse suggestie (review 12-11-2026)", () => {
  it.each(["hccnet.nl", "caiway.net", "hotmail.be", "mail.com"])("%s krijgt geen suggestie", (domein) => {
    expect(ECHT_ZONDER_SUGGESTIE).toContain(domein);
    expect(domeinSuggestie(`jan@${domein}`)).toBeNull();
  });

  it("een echte vertyping blijft een suggestie krijgen", () => {
    expect(domeinSuggestie("jan@gmial.com")).toBe("jan@gmail.com");
    expect(domeinSuggestie("jan@hotmial.nl")).toBe("jan@hotmail.nl");
  });
});
