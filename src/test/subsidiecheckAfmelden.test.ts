import { afterEach, describe, expect, it, vi } from "vitest";

// Afmelden voor herinneringen onder het subsidieoverzicht (CRM-plan afmelden, 3.2 en 3.3).
// De delen leven in de edge function (Deno), maar zijn puur en dus hier testbaar,
// net als subsidiecheckMailBeveiliging.test.ts. Resend wordt nagebootst: hier gaat
// nooit een echte mail de deur uit.
import {
  AFMELD_FUNCTIE,
  afmeldKoppen,
  haalAfmeldlinks,
  leesAfmeldlinks,
  type AfmeldClient,
} from "../../supabase/functions/subsidiecheck-mail/afmelden";
import { maakOverzichtMail } from "../../supabase/functions/subsidiecheck-mail/overzichtMail";
import { AFZENDER, RESEND_ENDPOINT, verstuurMail } from "../../supabase/functions/subsidiecheck-mail/resend";
import { readFileSync } from "node:fs";

const TENANT = "00000000-0000-0000-0000-000000000001";
const EMAIL = "sanne@example.nl";
const TOKEN = "Ab3_-defghijklmnopqrstuvwxyz0123";
const KOP = `https://lfelnfukbrxznkevnevr.supabase.co/functions/v1/mail-uitschrijven?t=${TOKEN}`;
const PAGINA = `https://mijn.voortraject.nl/afmelden/${TOKEN}`;
const ANTWOORD = { token: TOKEN, kop: KOP, pagina: PAGINA };

const client = (antwoord: () => PromiseLike<{ data: unknown; error: { code?: string; message?: string } | null }>) => {
  const rpc = vi.fn(antwoord);
  return { rpc, client: { rpc } as AfmeldClient };
};

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("het antwoord van mail_uitschrijflinks", () => {
  it("neemt de twee links over als ze precies het afgesproken contract volgen", () => {
    expect(leesAfmeldlinks(ANTWOORD)).toEqual({ kop: KOP, pagina: PAGINA });
  });

  it("weigert alles wat afwijkt, zodat er nooit een vreemde link in de mail komt", () => {
    for (const data of [
      null,
      "tekst",
      {},
      { ...ANTWOORD, kop: `https://evil.example/mail-uitschrijven?t=${TOKEN}` },
      { ...ANTWOORD, pagina: `http://mijn.voortraject.nl/afmelden/${TOKEN}` },
      { ...ANTWOORD, pagina: "https://mijn.voortraject.nl/afmelden/AnderToken0123456789" },
      { token: "<script>", kop: `${KOP.replace(TOKEN, "<script>")}`, pagina: `${PAGINA.replace(TOKEN, "<script>")}` },
      { token: "kort", kop: KOP.replace(TOKEN, "kort"), pagina: PAGINA.replace(TOKEN, "kort") },
    ]) {
      expect(leesAfmeldlinks(data), JSON.stringify(data)).toBeNull();
    }
  });
});

describe("afmeldlinks ophalen", () => {
  it("vraagt de links op voor deze tenant en dit adres", async () => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    const { rpc, client: c } = client(async () => ({ data: ANTWOORD, error: null }));
    expect(await haalAfmeldlinks(c, TENANT, EMAIL)).toEqual({ kop: KOP, pagina: PAGINA });
    expect(rpc).toHaveBeenCalledWith(AFMELD_FUNCTIE, { p_tenant: TENANT, p_email: EMAIL });
    expect(AFMELD_FUNCTIE).toBe("mail_uitschrijflinks");
  });

  it("geeft null bij een fout, een uitzondering, geen link of een onverwacht antwoord", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const gevallen = [
      async () => ({ data: null, error: { code: "42883", message: `functie bestaat niet voor ${EMAIL}` } }),
      async () => {
        throw new Error(`netwerk weg bij ${EMAIL}`);
      },
      async () => ({ data: null, error: null }),
      async () => ({ data: { token: TOKEN }, error: null }),
    ];
    for (const antwoord of gevallen) {
      expect(await haalAfmeldlinks(client(antwoord).client, TENANT, EMAIL)).toBeNull();
    }
  });

  it("wacht niet langer dan de grens op een trage database", async () => {
    vi.useFakeTimers();
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const { client: c } = client(() => new Promise(() => {}));
    const uitkomst = haalAfmeldlinks(c, TENANT, EMAIL, 3000);
    await vi.advanceTimersByTimeAsync(3000);
    expect(await uitkomst).toBeNull();
  });

  it("logt alleen de uitkomst: nooit het adres of het token", async () => {
    const regels: string[] = [];
    const vang = (...args: unknown[]) => {
      regels.push(args.map((a) => (a instanceof Error ? a.message : String(a))).join(" "));
    };
    for (const soort of ["log", "warn", "error", "info"] as const) vi.spyOn(console, soort).mockImplementation(vang);

    await haalAfmeldlinks(client(async () => ({ data: ANTWOORD, error: null })).client, TENANT, EMAIL);
    await haalAfmeldlinks(client(async () => ({ data: null, error: { code: "P0001", message: EMAIL } })).client, TENANT, EMAIL);
    await haalAfmeldlinks(
      client(async () => {
        throw new Error(EMAIL);
      }).client,
      TENANT,
      EMAIL,
    );
    await haalAfmeldlinks(client(async () => ({ data: { ...ANTWOORD, kop: "x" }, error: null })).client, TENANT, EMAIL);

    expect(regels.length).toBeGreaterThanOrEqual(4);
    for (const regel of regels) {
      expect(regel).not.toContain(EMAIL);
      expect(regel).not.toContain(TOKEN);
    }
  });
});

describe("de koppen voor afmelden met één klik", () => {
  it("zet List-Unsubscribe met de HTTPS-link en List-Unsubscribe-Post (RFC 8058)", () => {
    expect(afmeldKoppen({ kop: KOP, pagina: PAGINA })).toEqual({
      "List-Unsubscribe": `<${KOP}>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    });
  });

  it("zonder links geen koppen", () => {
    expect(afmeldKoppen(null)).toBeUndefined();
  });
});

describe("de afmeldregel en het tekstdeel van het overzicht", () => {
  const lijst = [
    { titel: "ISDE", niveau: "rijk", type: "subsidie", omschrijving: "Voor isolatie. Tweede zin die weg moet.", bronUrl: "https://www.rvo.nl/isde" },
    { titel: "Isolatieaanpak", niveau: "provincie", type: "subsidie", bedragIndicatie: "tot € 2.000", alleenAls: "je in Groningen woont" },
    { titel: "Energiebespaarlening", niveau: "rijk", type: "lening", letOp: "Vraag eerst offertes aan." },
  ];
  const maak = (regelingen: typeof lijst | null, afmeldPagina?: string) =>
    maakOverzichtMail({
      payload: {
        input: { postcode: "9722AB", huisnummer: "12", bewonertype: "woningeigenaar" },
        overzichtUrl: "https://voortraject.nl/subsidiecheck?pc=9722AB&hn=12",
      },
      aanhef: "Hallo Sanne",
      bouwjaar: 1960,
      beoordeling: { score: "4,9", aantal: 87 },
      haalRegelingen: async () => regelingen,
      haalBagAdres: async () => ({ straat: "Verlengde Hereweg", plaats: "Groningen" }),
      afmeldPagina,
    });

  it("zet onderaan de afgesproken zin, met 'hier afmelden' als link naar de pagina", async () => {
    const { html } = (await maak(lijst, PAGINA))!;
    expect(html).toContain(
      `Liever geen herinneringen meer van ons? Je kunt je <a href="${PAGINA}" style="color:#152C4E;font-weight:700;">hier afmelden</a>.`,
    );
    // Onder de disclaimer: de laatste regel van de mail.
    expect(html.indexOf("hier afmelden")).toBeGreaterThan(html.indexOf("je zit nergens aan vast."));
  });

  it("zonder link geen afmeldregel, in de HTML en in het tekstdeel", async () => {
    for (const mail of [await maak(lijst), await maak(null)]) {
      expect(mail!.html).not.toContain("afmelden");
      expect(mail!.text).not.toContain("afmelden");
    }
  });

  it("het tekstdeel heeft dezelfde inhoud, met de links voluit", async () => {
    const { text } = (await maak(lijst, PAGINA))!;
    expect(text.startsWith("Hallo Sanne,\n\n3 regelingen voor het verduurzamen van Verlengde Hereweg 12, Groningen.")).toBe(true);
    for (const stuk of [
      "Jouw huis is uit 1960.",
      "Van de Rijksoverheid (2)",
      "Van de provincie (1)",
      "- Subsidie: ISDE",
      "  Voor isolatie.",
      "  Meer info: https://www.rvo.nl/isde",
      "- Lening: Energiebespaarlening",
      "  Let op: Vraag eerst offertes aan.",
      "  tot € 2.000",
      "  Alleen als je in Groningen woont",
      "Laat gratis uitzoeken wat ik krijg:\nmailto:info@voortraject.nl?subject=",
      "Bekijk of deel je overzicht online:\nhttps://voortraject.nl/subsidiecheck?pc=9722AB&hn=12",
      "WhatsApp: https://wa.me/31502112689?text=",
      "Bel ons: 050 211 26 89",
      "4,9 op Google",
      "https://voortraject.nl/subsidiecheck?utm_source=deel&utm_medium=mail",
      "Met vriendelijke groet,\nTeam Voortraject",
      "je zit nergens aan vast.",
      `Liever geen herinneringen meer van ons? Je kunt je hier afmelden:\n${PAGINA}\n`,
    ]) {
      expect(text, stuk).toContain(stuk);
    }
    expect(text).not.toContain("Tweede zin die weg moet");
    expect(text.trimEnd().endsWith(PAGINA)).toBe(true);
  });

  it("het tekstdeel is echte tekst: geen tags, geen entiteiten, geen gedachtestreepjes", async () => {
    for (const mail of [await maak(lijst, PAGINA), await maak(null, PAGINA)]) {
      expect(mail!.text).not.toMatch(/<[a-z!/]/i);
      expect(mail!.text).not.toMatch(/&[a-z#0-9]+;/i);
      expect(mail!.text).not.toMatch(/[—–]/);
    }
  });

  it("zonder lijst wijst het tekstdeel naar het overzicht online", async () => {
    const { text } = (await maak(null, PAGINA))!;
    expect(text).toContain("staat online voor je klaar");
    expect(text).toContain("Bekijk je overzicht online:\nhttps://voortraject.nl/subsidiecheck?pc=9722AB&hn=12");
    expect(text).not.toContain("Laat gratis uitzoeken");
  });
});

describe("wat er naar Resend gaat", () => {
  const basis = {
    apiKey: "re_test",
    from: AFZENDER,
    to: EMAIL,
    replyTo: "info@voortraject.nl",
    subject: "Subsidieoverzicht voor Verlengde Hereweg 12",
    html: "<p>html</p>",
  };
  const resendNagebootst = (status = 200) => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ id: "nep" }), { status }));
    vi.stubGlobal("fetch", fetchMock);
    return fetchMock;
  };
  const verzonden = (fetchMock: ReturnType<typeof resendNagebootst>) => {
    const [url, opties] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    return { url, body: JSON.parse(String(opties.body)) as Record<string, unknown> };
  };

  it("stuurt html, tekst en de afmeldkoppen mee", async () => {
    const fetchMock = resendNagebootst();
    const ok = await verstuurMail({ ...basis, text: "tekst", headers: afmeldKoppen({ kop: KOP, pagina: PAGINA }) });
    expect(ok).toBe(true);
    const { url, body } = verzonden(fetchMock);
    expect(url).toBe(RESEND_ENDPOINT);
    expect(body).toMatchObject({ to: [EMAIL], html: "<p>html</p>", text: "tekst" });
    expect(body.headers).toEqual({ "List-Unsubscribe": `<${KOP}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" });
  });

  it("zonder links en tekst blijft het verzoek zoals het was", async () => {
    const fetchMock = resendNagebootst();
    await verstuurMail({ ...basis, headers: afmeldKoppen(null) });
    const { body } = verzonden(fetchMock);
    expect(Object.keys(body).sort()).toEqual(["from", "html", "reply_to", "subject", "to"]);
  });

  // Besluit eigenaar 26-11-2026 (afzender-plan.md in de CRM-repo): een teamadres voor alle teammail, zoals het CRM en n8n.
  it("komt van team@, niet van noreply@, en niet meer uit het geheim MAIL_FROM", async () => {
    expect(AFZENDER).toBe("Voortraject <team@mail.voortraject.nl>");
    const fetchMock = resendNagebootst();
    await verstuurMail(basis);
    expect(verzonden(fetchMock).body).toMatchObject({ from: "Voortraject <team@mail.voortraject.nl>", reply_to: "info@voortraject.nl" });
    const bron = readFileSync("supabase/functions/subsidiecheck-mail/index.ts", "utf8");
    expect(bron).not.toContain("noreply@");
    expect(bron).not.toContain('Deno.env.get("MAIL_FROM")');
    expect(bron.match(/from: AFZENDER,/g)).toHaveLength(2);
  });

  it("meldt een weigering van Resend als niet verstuurd", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    resendNagebootst(422);
    expect(await verstuurMail(basis)).toBe(false);
  });
});
