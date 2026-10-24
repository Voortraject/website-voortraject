import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Herkomst (utm-tags, fbclid) en het event-id van een lead uit de subsidiecheck.
//
// Twee lagen controleren dezelfde waarden: de site (src/lib/herkomst.ts) en de
// edge function (beveiliging.ts). De function is de laag die telt, want de
// request is door iedereen te verzinnen. Deze test faalt zodra de twee uit elkaar
// lopen, zodat de site nooit iets bewaart dat de server weggooit, of andersom.

import * as server from "../../supabase/functions/subsidiecheck-mail/beveiliging";
import * as client from "@/lib/herkomst";

beforeEach(() => {
  sessionStorage.clear();
  window.history.replaceState(null, "", "/");
});

afterEach(() => {
  vi.unstubAllGlobals();
  window.history.replaceState(null, "", "/");
});

describe("de regels voor herkomst", () => {
  it("zijn in de site en de function letterlijk gelijk", () => {
    expect([...client.HERKOMST_VELDEN]).toEqual([...server.HERKOMST_VELDEN]);
    expect(client.HERKOMST_RE.source).toBe(server.HERKOMST_RE.source);
    expect(client.HERKOMST_RE.flags).toBe(server.HERKOMST_RE.flags);
    expect(client.HERKOMST_MAX).toBe(server.HERKOMST_MAX);
    expect(client.FBCLID_MAX).toBe(server.FBCLID_MAX);
  });

  // Per geval: wat de site ervan maakt, moet precies zijn wat de function ervan maakt.
  const gevallen: [string, Record<string, string>][] = [
    ["gewone Meta-tags", { utm_source: "meta", utm_medium: "paid_social", utm_campaign: "sc_groningen_okt" }],
    ["Meta-macro's", { utm_content: "{{ad.id}}", utm_term: "set:1|a.b-c" }],
    ["een spatie", { utm_campaign: "sc groningen" }],
    ["html", { utm_source: "<script>" }],
    ["procent en schuine streep", { utm_source: "a%20b", utm_medium: "a/b" }],
    ["een plus en een is-teken", { utm_source: "a+b", utm_medium: "a=b" }],
    ["leeg en alleen spaties", { utm_source: "", utm_medium: "   " }],
    ["precies 150 tekens", { utm_campaign: "a".repeat(150) }],
    ["151 tekens", { utm_campaign: "a".repeat(151) }],
    ["fbclid van 500 tekens", { fbclid: "IwAR" + "x".repeat(496) }],
    ["fbclid van 501 tekens", { fbclid: "IwAR" + "x".repeat(497) }],
    ["fbclid met _aem_", { fbclid: "IwZXh0bgNhZW0BMABhZGlkAasfdsf_aem_AbCdEf-123" }],
    ["onbekend veld", { utm_id: "123", gclid: "abc" }],
  ];

  it.each(gevallen)("behandelen %s in site en function hetzelfde", (_naam, invoer) => {
    const viaSite = client.herkomstUitParams(new URLSearchParams(invoer));
    const viaServer = server.schoonHerkomst(invoer);
    expect(viaSite).toEqual(viaServer);
  });

  it("laten goede waarden door en gooien foute weg", () => {
    expect(client.schoonHerkomstWaarde("utm_source", "  meta ")).toBe("meta");
    expect(client.schoonHerkomstWaarde("utm_campaign", "sc groningen")).toBeUndefined();
    expect(client.schoonHerkomstWaarde("utm_source", "<b>")).toBeUndefined();
    expect(client.schoonHerkomstWaarde("utm_campaign", "a".repeat(151))).toBeUndefined();
    expect(client.schoonHerkomstWaarde("fbclid", "a".repeat(500))).toBe("a".repeat(500));
    expect(client.schoonHerkomstWaarde("fbclid", "a".repeat(501))).toBeUndefined();
    expect(client.schoonHerkomstWaarde("utm_source", 42)).toBeUndefined();
  });

  it("laat de function geen andere vormen dan een gewoon object toe", () => {
    expect(server.schoonHerkomst(null)).toEqual({});
    expect(server.schoonHerkomst("utm_source=meta")).toEqual({});
    expect(server.schoonHerkomst(["meta"])).toEqual({});
    expect(server.schoonHerkomst({ utm_source: 5, utm_medium: ["a"] })).toEqual({});
    // Geen waarden uit het prototype.
    const metPrototype = Object.create({ utm_source: "meta" });
    expect(server.schoonHerkomst(metPrototype)).toEqual({});
  });
});

describe("herkomst bewaren bij binnenkomst", () => {
  it("bewaart utm-tags en fbclid uit de URL", () => {
    window.history.replaceState(null, "", "/?utm_source=meta&utm_campaign=sc_okt&fbclid=IwAR1&pc=9711AB&x=1");
    client.bewaarHerkomstUitUrl();
    expect(client.leesHerkomst()).toEqual({ utm_source: "meta", utm_campaign: "sc_okt", fbclid: "IwAR1" });
  });

  it("overschrijft de eerste herkomst in dit tabblad niet (first touch)", () => {
    window.history.replaceState(null, "", "/?utm_source=meta&utm_campaign=eerste");
    client.bewaarHerkomstUitUrl();
    window.history.replaceState(null, "", "/zakelijk?utm_source=google&utm_campaign=tweede");
    client.bewaarHerkomstUitUrl();
    expect(client.leesHerkomst()).toEqual({ utm_source: "meta", utm_campaign: "eerste" });
  });

  it("bewaart niets zonder bruikbare herkomst, en laat een latere campagne dan wel toe", () => {
    window.history.replaceState(null, "", "/?utm_source=met%20spatie");
    client.bewaarHerkomstUitUrl();
    expect(sessionStorage.getItem("sc_herkomst")).toBeNull();

    window.history.replaceState(null, "", "/?utm_source=meta");
    client.bewaarHerkomstUitUrl();
    expect(client.leesHerkomst()).toEqual({ utm_source: "meta" });
  });

  it("controleert wat er in sessionStorage staat opnieuw", () => {
    sessionStorage.setItem("sc_herkomst", JSON.stringify({ utm_source: "<script>", utm_medium: "cpc", extra: "x" }));
    expect(client.leesHerkomst()).toEqual({ utm_medium: "cpc" });
    sessionStorage.setItem("sc_herkomst", "geen json");
    expect(client.leesHerkomst()).toEqual({});
  });
});

describe("event-id", () => {
  const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

  it("is een uuid die de function accepteert", () => {
    const id = client.maakEventId();
    expect(id).toMatch(UUID);
    expect(server.schoonEventId(id)).toBe(id);
    expect(client.maakEventId()).not.toBe(id);
  });

  it("valt zonder crypto.randomUUID terug op dezelfde vorm", () => {
    vi.stubGlobal("crypto", {});
    const id = client.maakEventId();
    expect(id).toMatch(UUID);
    expect(server.schoonEventId(id)).toBe(id);
  });

  it("weigert in de function alles wat geen uuid is", () => {
    expect(server.schoonEventId("abc")).toBeUndefined();
    expect(server.schoonEventId(123)).toBeUndefined();
    expect(server.schoonEventId("6F9619FF-8B86-D011-B42D-00C04FC964FF")).toBe("6f9619ff-8b86-d011-b42d-00c04fc964ff");
    expect(server.schoonEventId("6f9619ff-8b86-d011-b42d-00c04fc964ff<x>")).toBeUndefined();
  });
});

describe("herkomst in een mail", () => {
  it("komt nooit in de overzichtsmail, ook niet als de request hem meestuurt", async () => {
    const { maakOverzichtMail } = await import("../../supabase/functions/subsidiecheck-mail/overzichtMail");
    const mail = await maakOverzichtMail({
      payload: {
        input: { postcode: "9711AA", huisnummer: "12", bewonertype: "woningeigenaar", maatregelen: ["isolatie"] },
        overzichtUrl: "https://voortraject.nl/subsidiecheck?pc=9711AA&hn=12&type=woningeigenaar",
        herkomst: { utm_source: "metabron", utm_campaign: "geheimecampagne", fbclid: "IwARgeheimeklik" },
        eventId: "6f9619ff-8b86-4011-b42d-00c04fc964ff",
      } as Parameters<typeof maakOverzichtMail>[0]["payload"],
      aanhef: "Hallo Jan",
      haalRegelingen: async () => [
        { titel: "ISDE", niveau: "rijk", type: "subsidie", omschrijving: "Voor isolatie", bronUrl: "https://www.rvo.nl/isde" },
      ],
      haalBagAdres: async () => null,
    });

    expect(mail).not.toBeNull();
    // Niet zoeken op "utm_": de deel-link in de mail heeft zijn eigen utm_source=deel.
    for (const geheim of ["metabron", "geheimecampagne", "IwARgeheimeklik", "6f9619ff", "fbclid"]) {
      expect(mail!.html, geheim).not.toContain(geheim);
      expect(mail!.onderwerp, geheim).not.toContain(geheim);
    }
  });
});
