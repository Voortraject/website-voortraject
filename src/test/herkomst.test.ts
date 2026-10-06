import { readFileSync } from "fs";
import { afterEach, describe, expect, it } from "vitest";

import { deelUrl } from "@/components/subsidiecheck/delen";
import {
  HERKOMST_CODES,
  herkomstCode,
  herkomstUitQuery,
  leadBron,
  onthoudHerkomst,
  onthoudenHerkomst,
} from "@/lib/herkomst";

// `?via=` bepaalt `leads_bewoners.bron`. De kern: een bekende code gaat mee, en
// niets anders. Een bezoeker mag met een verzonnen waarde geen bron aanmaken.

afterEach(() => {
  sessionStorage.clear();
});

describe("herkomstCode", () => {
  it("kent de codes van de lijst", () => {
    expect(herkomstCode("flyer")).toBe("flyer");
    expect(herkomstCode("050energielabels")).toBe("050energielabels");
  });

  it("is vergevingsgezind in de vorm: hoofdletters, spaties, streepjes", () => {
    expect(herkomstCode(" Flyer ")).toBe("flyer");
    expect(herkomstCode("Duurzaam-Aankopen")).toBe("duurzaam_aankopen");
  });

  it("weigert alles wat niet op de lijst staat", () => {
    for (const ruw of ["", "  ", "voortraject", "website", "ingekochte_lead", "flyer-paddepoel", "<script>", "flyer;drop"]) {
      expect(herkomstCode(ruw)).toBeNull();
    }
    expect(herkomstCode(null)).toBeNull();
    expect(herkomstCode(undefined)).toBeNull();
  });
});

describe("herkomstUitQuery", () => {
  it("leest via", () => {
    expect(herkomstUitQuery("?via=bord")).toBe("bord");
  });

  it("laat via winnen van utm_source", () => {
    expect(herkomstUitQuery("?via=flyer&utm_source=deel")).toBe("flyer");
  });

  it("telt utm_source als die een bekende code is (de bestaande deellinks)", () => {
    expect(herkomstUitQuery("?utm_source=deel&utm_medium=link")).toBe("deel");
    expect(herkomstUitQuery("?utm_source=google&utm_medium=cpc")).toBeNull();
  });

  it("valt bij een onbekende via terug op een bekende utm_source", () => {
    expect(herkomstUitQuery("?via=onzin&utm_source=deel")).toBe("deel");
  });
});

describe("de deelknop", () => {
  it("levert de herkomst 'deel' op, zonder de link langer te maken", () => {
    for (const kanaal of ["link", "mail"] as const) {
      expect(herkomstUitQuery(new URL(deelUrl(kanaal)).search)).toBe("deel");
    }
  });
});

describe("onthouden binnen de sessie", () => {
  it("geeft 'Voortraject' zonder herkomst", () => {
    expect(leadBron()).toBe("Voortraject");
    expect(onthoudenHerkomst()).toBeNull();
  });

  it("bewaart een bekende code, ook als de URL hem niet meer heeft", () => {
    onthoudHerkomst("?via=flyer");
    expect(leadBron()).toBe("flyer");
  });

  it("negeert een onbekende code en overschrijft een eerdere niet", () => {
    onthoudHerkomst("?via=onzin");
    expect(leadBron()).toBe("Voortraject");
    onthoudHerkomst("?via=enerma");
    onthoudHerkomst("?via=onzin");
    expect(leadBron()).toBe("enerma");
  });

  it("houdt een opgeslagen waarde opnieuw tegen de lijst", () => {
    // Iemand die met de devtools iets anders in sessionStorage zet, of een code
    // die intussen van de lijst is gehaald.
    sessionStorage.setItem("vt_herkomst", "ingekochte_lead");
    expect(leadBron()).toBe("Voortraject");
  });
});

// De edge function draait op Deno en kan src/ niet importeren; ze heeft een
// eigen kopie van de lijst. Loopt die weg, dan krijgt een subsidiechecklead met
// een geldige code toch "Voortraject" (of erger: de function laat iets door dat
// de site weigert).
describe("de kopie in de edge function subsidiecheck-mail", () => {
  const bron = readFileSync("supabase/functions/subsidiecheck-mail/index.ts", "utf8");

  it("is dezelfde lijst", () => {
    const blok = bron.match(/const HERKOMST_CODES = \[([\s\S]*?)\] as const;/);
    expect(blok).not.toBeNull();
    const codes = [...blok![1].matchAll(/"([^"]+)"/g)].map((m) => m[1]);
    expect(codes).toEqual([...HERKOMST_CODES]);
  });

  it("gebruikt alleen een code van die lijst als bron, anders 'Voortraject'", () => {
    expect(bron).toContain('HERKOMST_CODES.find((c) => c === payload.herkomst) ?? "Voortraject"');
    expect(bron).not.toMatch(/bron: "Voortraject"/);
  });
});
