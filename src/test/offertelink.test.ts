import { afterEach, describe, expect, it, vi } from "vitest";

import { SUPABASE_EXTERNAL_ANON_KEY, SUPABASE_EXTERNAL_URL } from "../integrations/supabase/external-client";
import {
  BOLDSIGN_LINK,
  CRM_ANON_KEY_FALLBACK,
  CRM_SUPABASE_URL,
  contactHtml,
  isLinkvoorbeeld,
  kiesUitkomst,
  knopTekst,
  lijstHtml,
  normaliseerToken,
} from "../../functions/_lib/offertelink.js";
import { onRequest } from "../../functions/offerte/[token].js";

const TOKEN = "0123456789abcdef0123456789abcdef";
const LINK_A = "https://app-eu.boldsign.com/document/sign/?documentId=a";
const LINK_B = "https://app.boldsign.com/document/sign/?documentId=b";

describe("kiesUitkomst", () => {
  it("stuurt bij precies één offerte door naar de link", () => {
    expect(kiesUitkomst({ offertes: [{ label: "Offerte 2026-0001", uitvoerder: "X", link: LINK_A }] })).toEqual({
      soort: "door",
      link: LINK_A,
    });
  });

  it("toont bij meer dan één offerte een lijst", () => {
    const u = kiesUitkomst({
      offertes: [
        { label: "Offerte 1", uitvoerder: "A", link: LINK_A },
        { label: "Offerte 2", uitvoerder: null, link: LINK_B },
      ],
    });
    expect(u.soort).toBe("lijst");
    expect(u.offertes).toHaveLength(2);
  });

  it("valt terug op contact bij geen offertes, een fout of een vreemde vorm", () => {
    for (const data of [{ offertes: [] }, null, undefined, {}, { offertes: "x" }, [], "fout"]) {
      expect(kiesUitkomst(data)).toEqual({ soort: "contact" });
    }
  });

  it("negeert links buiten de BoldSign-allowlist", () => {
    const vreemd = [
      "https://evil.example/boldsign.com/",
      "http://app.boldsign.com/x",
      "https://app.boldsign.com.evil.example/x",
      "javascript:alert(1)",
      'https://app.boldsign.com/x"><script>',
      "",
    ];
    for (const link of vreemd) {
      expect(kiesUitkomst({ offertes: [{ label: "Offerte", uitvoerder: "A", link }] })).toEqual({ soort: "contact" });
    }
    // Eén goede en één foute: de foute valt weg, dus direct door naar de goede.
    expect(
      kiesUitkomst({ offertes: [{ label: "a", link: LINK_A }, { label: "b", link: "https://evil.example/" }] }),
    ).toEqual({ soort: "door", link: LINK_A });
  });

  it("gebruikt dezelfde allowlist als de opvolgmails in n8n", () => {
    expect(BOLDSIGN_LINK.source).toBe("^https:\\/\\/(app|app-eu)\\.boldsign\\.com\\/[^\\s\"'<>]*$");
    expect(BOLDSIGN_LINK.flags).toBe("i");
  });
});

describe("token en linkvoorbeelden", () => {
  it("accepteert alleen 32 hex-tekens", () => {
    expect(normaliseerToken(TOKEN)).toBe(TOKEN);
    expect(normaliseerToken(TOKEN.toUpperCase())).toBe(TOKEN);
    for (const fout of ["", "abc", TOKEN + "0", TOKEN.slice(1) + "g", "' or 1=1 --", null, undefined]) {
      expect(normaliseerToken(fout)).toBeNull();
    }
  });

  it("telt HEAD en crawlers niet als klik, een gewone browser wel", () => {
    expect(isLinkvoorbeeld("HEAD", "Mozilla/5.0")).toBe(true);
    expect(isLinkvoorbeeld("GET", "WhatsApp/2.23.20.0 A")).toBe(true);
    expect(isLinkvoorbeeld("GET", "facebookexternalhit/1.1")).toBe(true);
    expect(
      isLinkvoorbeeld("GET", "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148"),
    ).toBe(false);
  });
});

describe("de pagina's", () => {
  it("contactpagina noemt telefoon en mail, in je-vorm en zonder techniek", () => {
    const h = contactHtml();
    expect(h).toContain("Deze link werkt niet meer");
    expect(h).toContain("Bel ons op");
    expect(h).toContain("050 211 26 89");
    expect(h).toContain("info@voortraject.nl");
    expect(h).toContain("dan helpen we je verder");
    expect(h).toContain('name="robots" content="noindex');
    expect(h).not.toMatch(/token|error|fout|rpc/i);
  });

  it("lijstpagina geeft per offerte een knop en escapet vrije tekst", () => {
    const h = lijstHtml([
      { label: "Offerte 2026-0001", uitvoerder: "Isolatie <B.V.>", link: LINK_A },
      { label: "Prijsindicatie 2026-0002", uitvoerder: null, link: LINK_B },
    ]);
    expect(h).toContain("Offerte van Isolatie &lt;B.V.&gt; bekijken");
    expect(h).toContain("Prijsindicatie 2026-0002 bekijken");
    expect(h).toContain(`href="${LINK_A}"`);
    expect(h).not.toContain("<B.V.>");
  });

  it("knoptekst volgt het documenttype", () => {
    expect(knopTekst({ label: "Prijsindicatie 2026-0003", uitvoerder: "Wijk Isolatie" })).toBe(
      "Prijsindicatie van Wijk Isolatie bekijken",
    );
    expect(knopTekst({ label: "Offerte 2026-0004", uitvoerder: "Wijk Isolatie" })).toBe(
      "Offerte van Wijk Isolatie bekijken",
    );
  });
});

describe("de publieke CRM-sleutel", () => {
  it("is dezelfde anon-key en URL als de rest van de site gebruikt", () => {
    expect(CRM_ANON_KEY_FALLBACK).toBe(SUPABASE_EXTERNAL_ANON_KEY);
    expect(CRM_SUPABASE_URL).toBe(SUPABASE_EXTERNAL_URL);
    const payload = JSON.parse(Buffer.from(CRM_ANON_KEY_FALLBACK.split(".")[1], "base64url").toString("utf8"));
    expect(payload.role).toBe("anon");
  });
});

describe("onRequest", () => {
  afterEach(() => vi.unstubAllGlobals());

  function verzoek(methode = "GET", ua = "Mozilla/5.0 (iPhone)") {
    return new Request(`https://voortraject.nl/offerte/${TOKEN}`, { method: methode, headers: { "user-agent": ua } });
  }
  function rpcGeeft(body: unknown, status = 200) {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify(body), { status }));
    vi.stubGlobal("fetch", fetchMock);
    return fetchMock;
  }

  it("stuurt door bij één offerte, telt de klik en zet de privacyheaders", async () => {
    const fetchMock = rpcGeeft({ offertes: [{ label: "Offerte 1", uitvoerder: "A", link: LINK_A }] });
    const res = await onRequest({ request: verzoek(), params: { token: TOKEN }, env: {} });
    expect(res.status).toBe(302);
    expect(res.headers.get("location")).toBe(LINK_A);
    expect(res.headers.get("cache-control")).toBe("no-store");
    expect(res.headers.get("x-robots-tag")).toContain("noindex");
    expect(res.headers.get("referrer-policy")).toBe("no-referrer");
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://lfelnfukbrxznkevnevr.supabase.co/rest/v1/rpc/offertelink_openen");
    expect(JSON.parse(String(init.body))).toEqual({ p_token: TOKEN, p_tellen: true });
    expect((init.headers as Record<string, string>).apikey).toBe(CRM_ANON_KEY_FALLBACK);
  });

  it("gebruikt de key uit de omgeving als die er is", async () => {
    const fetchMock = rpcGeeft({ offertes: [] });
    await onRequest({ request: verzoek(), params: { token: TOKEN }, env: { CRM_SUPABASE_ANON_KEY: "uit-env" } });
    const [, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect((init.headers as Record<string, string>).apikey).toBe("uit-env");
  });

  it("telt HEAD niet en geeft geen body", async () => {
    const fetchMock = rpcGeeft({ offertes: [] });
    const res = await onRequest({ request: verzoek("HEAD"), params: { token: TOKEN }, env: {} });
    const [, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(JSON.parse(String(init.body)).p_tellen).toBe(false);
    expect(res.status).toBe(200);
    expect(await res.text()).toBe("");
  });

  it("toont een lijst bij meerdere offertes", async () => {
    rpcGeeft({
      offertes: [
        { label: "Offerte 1", uitvoerder: "A", link: LINK_A },
        { label: "Offerte 2", uitvoerder: "B", link: LINK_B },
      ],
    });
    const res = await onRequest({ request: verzoek(), params: { token: TOKEN }, env: {} });
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("text/html");
    const tekst = await res.text();
    expect(tekst).toContain("Offerte van A bekijken");
    expect(tekst).toContain("Offerte van B bekijken");
  });

  it("valt bij een RPC-fout, een netwerkfout of een ongeldig token terug op de contactpagina", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    rpcGeeft({ message: "boom" }, 500);
    let res = await onRequest({ request: verzoek(), params: { token: TOKEN }, env: {} });
    expect(res.status).toBe(200);
    expect(await res.text()).toContain("Deze link werkt niet meer");

    vi.stubGlobal("fetch", vi.fn(async () => { throw new TypeError("netwerk"); }));
    res = await onRequest({ request: verzoek(), params: { token: TOKEN }, env: {} });
    expect(await res.text()).toContain("Deze link werkt niet meer");

    const fetchMock = rpcGeeft({ offertes: [] });
    res = await onRequest({ request: verzoek(), params: { token: "geen-token" }, env: {} });
    expect(await res.text()).toContain("Deze link werkt niet meer");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("weigert andere methodes dan GET en HEAD", async () => {
    rpcGeeft({ offertes: [] });
    const res = await onRequest({ request: verzoek("POST"), params: { token: TOKEN }, env: {} });
    expect(res.status).toBe(405);
  });
});
