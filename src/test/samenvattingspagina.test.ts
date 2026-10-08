import { readFileSync } from "node:fs";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  BEL_GELUKT,
  LOGO_URL,
  STAND_TEKST,
  TEAM,
  bouwInhoud,
  handtekeningHtml,
  kiesSamenvatting,
  knopHtml,
  rondeHaakjes,
  saneerHtml,
  samenvattingHtml,
  splitsAfzenderBlok,
  voorbeeldHtml,
} from "../../functions/_lib/samenvattingspagina.js";
import { onRequest } from "../../functions/adviesgesprek/[token].js";

const TOKEN = "0123456789abcdef0123456789abcdef";
const LINK_A = "https://app-eu.boldsign.com/document/sign/?documentId=a";
const LINK_B = "https://app.boldsign.com/document/sign/?documentId=b";

// Een verzonnen samenvatting met de vorm die samenvattingMail.ts (CRM) opslaat.
const vraag1 = "<div>Ga je akkoord met de offerte? Dan onderteken je hem digitaal met de knop hieronder.</div>";
const terugval1 = '<div style="font-size:13px;color:#6B7280;">Werkt de knop niet? Gebruik dan deze {{ONDERTEKENLINK_TEKST}}.</div>';
const TEKST =
  "<div>Beste Annie,</div><div><br></div><div>Bedankt voor het gesprek.</div><div><br></div>" +
  '<table width="100%" cellpadding="6" cellspacing="0" border="0"><tbody><tr><td width="70%">Totaal</td><td width="30%" align="right">€ 6.840,00</td></tr></tbody></table>' +
  "<div><br></div>" +
  vraag1 +
  "<div><br></div><div>{{ONDERTEKENLINK}}</div><div><br></div>" +
  terugval1 +
  "<div><br></div><div>Daarna nemen wij het over.</div><div><br></div>" +
  "<div>We houden het traject verder zo eenvoudig mogelijk voor je.</div><div><br></div>" +
  "<div>Met vriendelijke groet,</div><div>Michael Kruizenga</div><div>06 43420895</div>";

const samenvatting = (extra = {}) => ({
  mailTekst: TEKST,
  term: "offerte",
  stand: "open",
  knoppen: [{ link: LINK_A, uitvoerder: "Isolatie Noord" }],
  ...extra,
});

describe("kopie van de mail uit WF3 (n8n kf351AN7RUXX4kzf, node 'E-mail opmaken (Resend)')", () => {
  // Deze letterlijke stukken komen uit de live node van 08-10-2026. Faalt dit, dan is óf deze
  // kopie veranderd, óf moet hij mee met WF3 (en met src/lib/mailShell.ts in de CRM-repo).
  it("bouwt de ondertekenknop letterlijk zoals WF3", () => {
    expect(knopHtml("https://x", "Tekst")).toBe(
      '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>' +
        '<td align="center" bgcolor="#E8B547" style="border-radius:999px;padding:18px 24px;">' +
        '<a href="https://x" target="_blank" style="color:#152C4E;font-weight:700;font-size:16px;text-decoration:none;display:block;">' +
        "Tekst</a></td></tr></table>",
    );
  });

  it("bouwt de handtekening zoals WF3", () => {
    const h = handtekeningHtml(TEAM[0]);
    expect(h).toContain(
      '<img src="https://voortraject.nl/mail/michael-foto.png" width="110" height="110" alt="Michael Kruizenga" style="display:block;width:110px;height:110px;border:0;border-radius:55px;margin:0 auto;">',
    );
    expect(h).toContain("border-left:2px solid #E8B547;");
    expect(h).toContain(
      '<tr><td width="62" style="width:62px;font-size:12px;line-height:20px;color:#8A94A3;padding:0;">Kantoor</td>' +
        '<td style="font-size:13px;line-height:20px;padding:0;"><a href="tel:+31502112689" style="color:#152C4E;text-decoration:none;">050 211 26 89</a></td></tr>',
    );
    expect(TEAM.map((l) => l.naam)).toEqual([
      "Michael Kruizenga",
      "Tim Niemeijer",
      "Wouter Niemeijer",
      "Christian Moltmaker",
    ]);
  });

  it("haalt het afzenderblok eraf en kiest de handtekening op naam", () => {
    const { tekst, lid } = splitsAfzenderBlok("<div>Groet,</div><div>Tim Niemeijer</div><div>06 12070215</div><div><br></div>");
    expect(tekst).toBe("<div>Groet,</div>");
    expect(lid?.naam).toBe("Tim Niemeijer");
    expect(splitsAfzenderBlok("<div>Groet,</div><div>Voortraject</div><div>050 2112689</div>").lid).toBeNull();
  });

  it("heeft de omslag van WF3: logo, kaart van 640, inhoudscel en voettekst", () => {
    const pagina = samenvattingHtml(samenvatting(), `/adviesgesprek/${TOKEN}`);
    expect(LOGO_URL).toBe("https://voortraject.nl/mail/voortraject-logo-mail.png?v=1");
    expect(pagina).toContain(`<img src="${LOGO_URL}" alt="voortraject" width="216" height="60"`);
    expect(pagina).toContain("max-width: 640px; background-color: #FFFFFF; border-radius: 12px; overflow: hidden;");
    expect(pagina).toContain("padding: 40px 32px; color: #152C4E; line-height: 1.6; font-size: 16px;");
    expect(pagina).toContain('<strong style="color: #152C4E;">Voortraject</strong><br> info@voortraject.nl<br>');
    expect(pagina).toContain("background-color: #152C4E; background-image: linear-gradient(#152C4E,#152C4E);");
  });

  it("saneert de mailtekst zoals WF3", () => {
    const vies = '<div onclick="x()">a</div><script>alert(1)</script><img src=x onerror=alert(1)><a href="javascript:alert(1)">b</a><a href="https://ok.nl">c</a>';
    expect(saneerHtml(vies)).toBe('<div>a</div><a>b</a><a href="https://ok.nl" target="_blank" rel="noopener noreferrer">c</a>');
    expect(saneerHtml("<ul><li>x</li></ul>")).toBe('<ul style="margin:0;padding-left:24px"><li>x</li></ul>');
  });
});

describe("bouwInhoud: de mail, met de afwijkingen van de webpagina", () => {
  it("zet één knop op de plek van de plaatshouder, zonder uitvoerder in de tekst", () => {
    const h = bouwInhoud(samenvatting());
    expect(h).toContain(knopHtml(LINK_A, "Bekijk of onderteken je offerte"));
    expect(h).not.toContain("{{ONDERTEKENLINK");
    expect(h).toContain(vraag1);
    expect(h).toContain("<div>Daarna nemen wij het over.</div>");
  });

  it("zet bij meer knoppen de uitvoerder erachter, ge-escaped", () => {
    const h = bouwInhoud(
      samenvatting({
        knoppen: [
          { link: LINK_A, uitvoerder: "Isolatie <Noord>" },
          { link: LINK_B, uitvoerder: "" },
        ],
      }),
    );
    expect(h).toContain("Bekijk of onderteken je offerte - Isolatie &lt;Noord&gt;</a>");
    expect(h).toContain(knopHtml(LINK_B, "Bekijk of onderteken je offerte"));
    expect(h).toContain('</table><div style="line-height:12px">&nbsp;</div><table');
  });

  it("gebruikt de term prijsindicatie", () => {
    expect(bouwInhoud(samenvatting({ term: "prijsindicatie" }))).toContain("Bekijk of onderteken je prijsindicatie</a>");
  });

  it("laat de regel 'Werkt de knop niet?' weg, met de lege regel ervoor", () => {
    const h = bouwInhoud(samenvatting());
    expect(h).not.toMatch(/Werkt de knop niet/);
    expect(h).toContain("</table></div><div><br></div><div>Daarna nemen wij het over.</div>");
    const meervoud = TEKST.replace(terugval1, '<div style="font-size:13px;color:#6B7280;">Werken de knoppen niet? Gebruik dan deze links: {{ONDERTEKENLINK_TEKST}}</div>');
    expect(bouwInhoud(samenvatting({ mailTekst: meervoud }))).not.toMatch(/Werken de knoppen niet/);
  });

  it("zet de handtekening eronder in plaats van naam en nummer", () => {
    const h = bouwInhoud(samenvatting());
    expect(h).toMatch(/<div>Met vriendelijke groet,<\/div><div style="line-height:24px">&nbsp;<\/div><table/);
    expect(h).not.toContain("06 43420895");
    expect(h).toContain("michael@voortraject.nl");
  });

  it("vervangt vraag, knop en 'Daarna nemen wij het over' door één regel als alles getekend is", () => {
    const h = bouwInhoud(samenvatting({ knoppen: [], stand: "getekend" }));
    expect(h).toContain(`<div>${STAND_TEKST.getekend}</div>`);
    expect(h).not.toMatch(/Ga je akkoord/);
    expect(h).not.toMatch(/Daarna nemen wij het over/);
    expect(h).not.toContain("{{ONDERTEKENLINK");
    expect(h).not.toContain("#E8B547;padding");
    // De lege regels eromheen blijven zoals in de mail: tekst, lege regel, melding, lege regel.
    expect(h).toContain(`</table><div><br></div><div>${STAND_TEKST.getekend}</div><div><br></div><div>We houden`);
  });

  it("noemt bij een verlopen link het telefoonnummer, en kiest 'geen' bij een onbekende stand", () => {
    expect(bouwInhoud(samenvatting({ knoppen: [], stand: "verlopen" }))).toContain(STAND_TEKST.verlopen);
    expect(STAND_TEKST.verlopen).toContain('href="tel:+31502112689"');
    expect(bouwInhoud(samenvatting({ knoppen: [], stand: "raar" }))).toContain(STAND_TEKST.geen);
  });

  it("laat een vraag zonder 'akkoord' staan", () => {
    const anders = TEKST.replace(vraag1, "<div>Onderteken hieronder.</div>");
    expect(bouwInhoud(samenvatting({ mailTekst: anders, knoppen: [], stand: "getekend" }))).toContain(
      "<div>Onderteken hieronder.</div>",
    );
  });

  it("zet bij een oude tekst zonder plaatshouder de knoppen onderaan, zoals WF3", () => {
    const oud = "<div>Beste Jan,</div><div>Tekst.</div><div>Met vriendelijke groet,</div><div>Tim Niemeijer</div><div>0612070215</div>";
    const h = bouwInhoud(samenvatting({ mailTekst: oud }));
    expect(h).toContain(`<div>Tekst.</div><div>Met vriendelijke groet,</div><p style="margin:32px 0 0;">${knopHtml(LINK_A, "Bekijk of onderteken je offerte")}</p>`);
    expect(bouwInhoud(samenvatting({ mailTekst: oud, knoppen: [], stand: "getekend" }))).not.toContain(STAND_TEKST.getekend);
  });
});

describe("rondeHaakjes: oude samenvattingen krijgen de huidige haakjes boven de stappenbalk", () => {
  // De fixtures zijn de uitvoer van stappenbalk() uit src/lib/samenvattingMail.ts (CRM-repo),
  // vóór en na #989, met labels Jij/Voortraject. De rij "Jij"/"Voortraject" daarvan is byte voor
  // byte gelijk aan wat er in verstuurde samenvattingen staat (vergeleken op 08-10-2026).
  const fixture = (naam: string) =>
    readFileSync(`src/test/fixtures/stappenbalk-haakjes-${naam}.html`, "utf8").trim();
  const OUD = fixture("oud");
  const NIEUW = fixture("nieuw");
  const tekst = (balk: string) =>
    "<div>Beste Annie,</div><div><br></div><div>Zo gaat het verder:</div>" + balk +
    "<div><br></div><div>{{ONDERTEKENLINK}}</div><div><br></div>" +
    "<div>Met vriendelijke groet,</div><div>Michael Kruizenga</div><div>06 43420895</div>";

  it("maakt van de oude balk precies de nieuwe", () => {
    expect(OUD).not.toBe(NIEUW);
    expect(rondeHaakjes(OUD)).toBe(NIEUW);
  });

  it("laat de nieuwe balk en de rest van de tekst letterlijk staan", () => {
    expect(rondeHaakjes(NIEUW)).toBe(NIEUW);
    expect(rondeHaakjes(tekst(OUD))).toBe(tekst(NIEUW));
    expect(rondeHaakjes(TEKST)).toBe(TEKST);
  });

  it("verandert de stappen en de woorden eronder niet", () => {
    const vanafStappen = (h: string) => h.slice(h.indexOf('<tr><td width="25%" bgcolor'));
    expect(vanafStappen(rondeHaakjes(OUD))).toBe(vanafStappen(OUD));
  });

  it("neemt labels en kleuren over uit de oude rij", () => {
    const anders = OUD.split(">Jij<").join(">Jullie<").split("#E8B547").join("#ABCDEF");
    const uit = rondeHaakjes(anders);
    expect(uit).toContain(">Jullie<");
    expect(uit).toContain('bgcolor="#ABCDEF" style="padding:3px 0 0 3px;border-radius:8px 0 0 0;"');
    expect(uit).not.toContain("line-height:2px");
  });

  it("vervangt niets als het patroon niet exact klopt", () => {
    const varianten = [
      OUD.replace('style="padding:0 0 2px;"', 'style="padding:0 0 3px;"'),
      OUD.replace("line-height:5px;", "line-height:6px;"),
      OUD.replace("></td><td width=\"40%\"", ">\n</td><td width=\"40%\""),
      // Twee kleuren in één haakje: geen oude haakje.
      OUD.replace('bgcolor="#152C4E" style="font-size:1px;line-height:5px;"', 'bgcolor="#000000" style="font-size:1px;line-height:5px;"'),
    ];
    for (const v of varianten) {
      expect(v).not.toBe(OUD);
      expect(rondeHaakjes(v)).toBe(v);
    }
  });

  it("toont de ronde haakjes op de pagina, door het saneren heen", () => {
    const h = bouwInhoud(samenvatting({ mailTekst: tekst(OUD) }));
    expect(h).toContain(saneerHtml(NIEUW));
    expect(h).toContain("border-radius:8px 0 0 0");
    expect(h).not.toContain("line-height:2px");
    expect(bouwInhoud(samenvatting({ mailTekst: tekst(OUD) }))).toBe(bouwInhoud(samenvatting({ mailTekst: tekst(NIEUW) })));
  });
});

describe("kiesSamenvatting", () => {
  it("geeft null bij geen of een rare samenvatting", () => {
    for (const data of [null, undefined, {}, { samenvatting: null }, { samenvatting: { mail_tekst: "" } }, "x"]) {
      expect(kiesSamenvatting(data)).toBeNull();
    }
  });

  it("laat alleen BoldSign-links door en zet stand op open als er een knop is", () => {
    const s = kiesSamenvatting({
      samenvatting: {
        mail_tekst: "<div>x</div>",
        term: "offerte",
        stand: "getekend",
        knoppen: [
          { uitvoerder: "A", link: LINK_A },
          { uitvoerder: "B", link: "https://evil.example/boldsign.com/" },
          { uitvoerder: "C", link: "javascript:alert(1)" },
        ],
      },
    });
    expect(s?.knoppen).toEqual([{ link: LINK_A, uitvoerder: "A" }]);
    expect(s?.stand).toBe("open");
    expect(kiesSamenvatting({ samenvatting: { mail_tekst: "x", stand: "verlopen", knoppen: [] } })?.stand).toBe("verlopen");
    expect(kiesSamenvatting({ samenvatting: { mail_tekst: "x", term: "raar" } })?.term).toBe("offerte");
  });
});

describe("de pagina", () => {
  it("heeft de belknop als formulier, in de vorm van de ondertekenknop maar donkerblauw", () => {
    const p = samenvattingHtml(samenvatting(), `/adviesgesprek/${TOKEN}`);
    expect(p).toContain(`<form id="belform" method="post" action="/adviesgesprek/${TOKEN}"`);
    expect(p).toContain('<td align="center" bgcolor="#152C4E" style="border-radius:999px;padding:18px 24px;');
    expect(p).toContain("Bel me terug</button>");
    expect(p).toContain("Liever even overleggen?");
    expect(p).toContain('Of bel zelf: <a href="tel:+31502112689"');
    expect(p).toContain("<script>");
    // De belrij staat tussen de inhoud en de voettekst.
    expect(p.indexOf("Liever even overleggen?")).toBeGreaterThan(p.indexOf("michael@voortraject.nl"));
    expect(p.indexOf("Liever even overleggen?")).toBeLessThan(p.indexOf("info@voortraject.nl<br>"));
  });

  it("toont na een POST zonder JavaScript de groene pil", () => {
    const p = samenvattingHtml(samenvatting(), `/adviesgesprek/${TOKEN}`, "gelukt");
    expect(p).toContain(BEL_GELUKT);
    expect(BEL_GELUKT).toContain('bgcolor="#E3F1E8"');
    expect(BEL_GELUKT).toContain("color:#1B6B3F;");
    expect(p).not.toContain("<form");
    expect(p).not.toContain("<script>");
  });

  it("heeft de telefoonregels: geen rand, rechte hoeken, 20px zijruimte, bedragen in één regel", () => {
    const p = samenvattingHtml(samenvatting(), `/adviesgesprek/${TOKEN}`);
    expect(p).toContain("@media (max-width:600px)");
    expect(p).toContain(".shell{padding:0 !important}");
    expect(p).toContain(".kaart{border-radius:0 !important}");
    expect(p).toContain("padding-left:20px !important;padding-right:20px !important");
    expect(p).toContain('.inhoud td[align="right"]{white-space:nowrap}');
    expect(p).toContain('.inhoud td[width="62"]{padding-right:8px !important}');
  });

  it("geeft linkvoorbeelden geen persoonsgegevens", () => {
    expect(voorbeeldHtml()).not.toMatch(/Beste|€|Kruizenga/);
  });
});

describe("robots.txt", () => {
  it("sluit /adviesgesprek/ uit in elke groep", () => {
    const robots = readFileSync("public/robots.txt", "utf8");
    const groepen = robots.split(/\n(?=User-agent:)/).filter((g) => g.startsWith("User-agent:"));
    expect(groepen.length).toBeGreaterThan(0);
    for (const g of groepen) expect(g).toContain("Disallow: /adviesgesprek/");
  });
});

describe("onRequest", () => {
  afterEach(() => vi.unstubAllGlobals());

  const rpcAntwoord = {
    samenvatting: { mail_tekst: TEKST, term: "offerte", stand: "open", knoppen: [{ uitvoerder: "A", link: LINK_A }] },
  };

  const vraag = (methode: string, opties: { ua?: string; accept?: string; origin?: string; pad?: string; token?: string } = {}) => {
    const headers: Record<string, string> = { "user-agent": opties.ua ?? "Mozilla/5.0 (iPhone)" };
    if (opties.accept) headers.accept = opties.accept;
    if (opties.origin) headers.origin = opties.origin;
    return onRequest({
      request: new Request(`https://voortraject.nl/adviesgesprek/${opties.token ?? TOKEN}${opties.pad ?? ""}`, { method: methode, headers }),
      params: { token: opties.token ?? TOKEN },
      env: {},
    });
  };

  const stubFetch = (antwoord: unknown, status = 200) => {
    const f = vi.fn().mockResolvedValue(new Response(JSON.stringify(antwoord), { status }));
    vi.stubGlobal("fetch", f);
    return f;
  };

  it("toont de samenvatting en telt het bezoek", async () => {
    const f = stubFetch(rpcAntwoord);
    const res = await vraag("GET");
    expect(res.status).toBe(200);
    expect(res.headers.get("Cache-Control")).toBe("no-store");
    expect(res.headers.get("X-Robots-Tag")).toBe("noindex, nofollow");
    expect(res.headers.get("Referrer-Policy")).toBe("no-referrer");
    const body = await res.text();
    expect(body).toContain("Beste Annie,");
    expect(body).toContain("Bekijk of onderteken je offerte</a>");
    expect(f.mock.calls[0][0]).toMatch(/\/rpc\/samenvatting_openen$/);
    expect(JSON.parse(f.mock.calls[0][1].body)).toEqual({ p_token: TOKEN, p_tellen: true });
  });

  it("vraagt de database niets bij HEAD of een linkvoorbeeld, en toont dan niets persoonlijks", async () => {
    const f = stubFetch(rpcAntwoord);
    const head = await vraag("HEAD");
    expect(head.status).toBe(200);
    expect(await head.text()).toBe("");
    const wa = await vraag("GET", { ua: "WhatsApp/2.23.20.0 A" });
    const body = await wa.text();
    expect(body).not.toContain("Beste Annie");
    expect(body).toContain("Je adviesgesprek");
    expect(f).not.toHaveBeenCalled();
  });

  it("toont de contactpagina bij een ongeldig token, zonder databasevraag", async () => {
    const f = stubFetch(rpcAntwoord);
    const res = await vraag("GET", { token: "niet-geldig" });
    expect(res.status).toBe(200);
    expect(await res.text()).toContain("Deze link werkt niet meer");
    expect(f).not.toHaveBeenCalled();
  });

  it("toont de contactpagina bij geen samenvatting of een fout", async () => {
    stubFetch({ samenvatting: null });
    expect(await (await vraag("GET")).text()).toContain("Deze link werkt niet meer");
    stubFetch({ message: "not found" }, 404);
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(await (await vraag("GET")).text()).toContain("Deze link werkt niet meer");
  });

  it("logt het token niet", async () => {
    stubFetch({}, 500);
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    await vraag("GET");
    for (const regel of log.mock.calls.flat()) expect(String(regel)).not.toContain(TOKEN);
  });

  it("maakt met JavaScript een terugbelverzoek en antwoordt met JSON", async () => {
    const f = stubFetch({ ok: true, nieuw: true });
    const res = await vraag("POST", { accept: "application/json", origin: "https://voortraject.nl" });
    expect(await res.json()).toEqual({ ok: true });
    expect(f.mock.calls[0][0]).toMatch(/\/rpc\/terugbelverzoek$/);
    expect(JSON.parse(f.mock.calls[0][1].body)).toEqual({ p_token: TOKEN });
  });

  it("stuurt zonder JavaScript terug naar de pagina met de uitkomst", async () => {
    stubFetch({ ok: true, nieuw: false });
    const res = await vraag("POST");
    expect(res.status).toBe(303);
    expect(res.headers.get("Location")).toBe(`/adviesgesprek/${TOKEN}?teruggebeld=ja`);
    stubFetch({ ok: false });
    expect((await vraag("POST")).headers.get("Location")).toBe(`/adviesgesprek/${TOKEN}?teruggebeld=nee`);
  });

  it("weigert een POST van een andere site", async () => {
    const f = stubFetch({ ok: true });
    const res = await vraag("POST", { accept: "application/json", origin: "https://evil.example" });
    expect(res.status).toBe(400);
    expect(f).not.toHaveBeenCalled();
  });

  it("toont na de redirect de groene pil", async () => {
    stubFetch(rpcAntwoord);
    const body = await (await vraag("GET", { pad: "?teruggebeld=ja" })).text();
    expect(body).toContain(BEL_GELUKT);
  });

  it("weigert andere methodes", async () => {
    expect((await vraag("PUT")).status).toBe(405);
  });
});
