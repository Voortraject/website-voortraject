import { readdirSync, readFileSync } from "fs";
import { join } from "path";
import { describe, expect, it } from "vitest";

// Bewaakt dat de GTM-container en de code niet uit elkaar lopen.
//
// Dat is precies wat er eerder gebeurde: de site veranderde (/uitvoerders werd
// /zakelijk, "Maatregelen" werd "Verduurzamen") terwijl de container bleef
// zoeken op de oude labels, en events die de code al pushte hadden nooit een
// trigger gekregen. Niemand merkte het, want een tag die niet vuurt geeft geen
// foutmelding — je ziet alleen een leeg rapport in GA4.
//
// Deze test faalt zodra iemand een pushGtmEvent toevoegt zonder de container bij
// te werken, of andersom. Werk bij een wijziging ook docs/tracking.md bij.

const CONTAINER = "docs/gtm/GTM-P6W5MNN4_v10.json";
// De laatste export zoals hij uit GTM kwam. v9 en v10 voegen alleen Meta-items
// toe; de tests onderaan bewaken dat er aan de bestaande items niets veranderd is.
const VORIGE = "docs/gtm/GTM-P6W5MNN4_v8.json";
// De versie vóór deze, met de Meta-pixel. v10 voegt alleen de Lead van het
// contactformulier toe; zie de test "v10 ten opzichte van v9".
const V9 = "docs/gtm/GTM-P6W5MNN4_v9.json";

interface Parameter {
  key: string;
  value?: string;
  list?: { map: Parameter[] }[];
  map?: Parameter[];
}
interface Entity {
  name: string;
  type: string;
  parameter?: Parameter[];
  tagId?: string;
  triggerId?: string;
  variableId?: string;
  firingTriggerId?: string[];
  setupTag?: { tagName: string; stopOnSetupFailure?: boolean }[];
  customEventFilter?: { type: string; parameter: Parameter[] }[];
  filter?: { type: string; parameter: Parameter[] }[];
}
interface Container {
  tag: Entity[];
  trigger: Entity[];
  variable: Entity[];
  builtInVariable: { name: string }[];
}

const lees = (pad: string) => JSON.parse(readFileSync(pad, "utf8")).containerVersion as Container;
const container = lees(CONTAINER);
const vorige = lees(VORIGE);
const v9 = lees(V9);

const bronbestanden = (map: string): string[] =>
  readdirSync(map, { withFileTypes: true }).flatMap((item) => {
    const pad = join(map, item.name);
    if (item.isDirectory()) return item.name === "test" ? [] : bronbestanden(pad);
    return /\.tsx?$/.test(item.name) ? [pad] : [];
  });

const codeEvents = new Set(
  bronbestanden("src")
    .flatMap((pad) => [...readFileSync(pad, "utf8").matchAll(/pushGtmEvent\("([a-z_]+)"/g)])
    .map((m) => m[1]),
);

// Axeptio pusht zijn eigen events (axeptio_activate_<service>, axeptio_update);
// die komen niet uit onze code en vallen dus buiten de vergelijking hieronder.
const eventVanTrigger = (t: Entity) => t.customEventFilter![0].parameter[1].value!;
const isAxeptioTrigger = (t: Entity) => eventVanTrigger(t).startsWith("^axeptio_");

// Eén event kan meerdere triggers hebben (GA4 en Meta), dus per event een lijst.
const customEventTriggers = new Map<string, string[]>();
for (const t of container.trigger.filter((t) => t.type === "CUSTOM_EVENT" && !isAxeptioTrigger(t))) {
  const event = eventVanTrigger(t);
  customEventTriggers.set(event, [...(customEventTriggers.get(event) ?? []), t.triggerId!]);
}

describe("GTM-container", () => {
  it("heeft voor elk event dat de code pusht een trigger én een tag", () => {
    const getriggerd = new Set(container.tag.flatMap((t) => t.firingTriggerId ?? []));

    for (const event of [...codeEvents].sort()) {
      const triggerIds = customEventTriggers.get(event);
      expect(triggerIds, `de code pusht "${event}" maar de container heeft er geen trigger voor`).toBeDefined();
      for (const triggerId of triggerIds!) {
        expect(getriggerd.has(triggerId), `trigger ${triggerId} voor "${event}" wordt door geen enkele tag gebruikt`).toBe(
          true,
        );
      }
    }
  });

  it("heeft geen triggers voor events die de code nooit pusht", () => {
    // virtual_page_view hoort hier ook bij: die komt uit RouteTracker.
    for (const [event] of customEventTriggers) {
      expect(codeEvents.has(event), `de container luistert naar "${event}" maar de code pusht dat nergens`).toBe(true);
    }
  });

  it("verwijst alleen naar variabelen die bestaan", () => {
    const bestaand = new Set([
      ...container.variable.map((v) => v.name),
      ...container.builtInVariable.map((v) => v.name),
      "_event",
    ]);

    const gebruikt = [...JSON.stringify(container).matchAll(/\{\{([^}]+)\}\}/g)].map((m) => m[1]);
    for (const naam of new Set(gebruikt)) {
      expect(bestaand.has(naam), `{{${naam}}} wordt gebruikt maar bestaat niet als variabele`).toBe(true);
    }
  });

  it("zet geen {{variabele}} in een opmerking", () => {
    // GTM weigert dan Voorbeeld en Publiceren ("Variabele in opmerking"); bij v9 gebeurde dat
    // pas na de import, in de tag Meta - Pixel basis.
    for (const item of [...container.tag, ...container.variable]) {
      for (const p of item.parameter ?? []) {
        for (const regel of (p.value ?? "").split("\n")) {
          expect(regel, `${item.name}: {{…}} in een opmerking`).not.toMatch(/(\/\/|\/\*|<!--|^\s*\*).*\{\{/);
        }
      }
    }
  });

  it("heeft geen ongebruikte variabelen", () => {
    const gebruikt = new Set([...JSON.stringify(container).matchAll(/\{\{([^}]+)\}\}/g)].map((m) => m[1]));
    for (const variabele of container.variable) {
      expect(gebruikt.has(variabele.name), `${variabele.name} wordt nergens gebruikt`).toBe(true);
    }
  });

  it("laat elke tag naar een bestaande trigger wijzen", () => {
    const bestaand = new Set(container.trigger.map((t) => t.triggerId));

    for (const tag of container.tag) {
      for (const id of tag.firingTriggerId ?? []) {
        // 21474795xx zijn de ingebouwde triggers (All Pages, Initialization).
        if (id.startsWith("21474795")) continue;
        expect(bestaand.has(id), `tag "${tag.name}" wijst naar trigger ${id} die niet bestaat`).toBe(true);
      }
    }
  });

  it("stuurt geen adresgegevens naar GA4", () => {
    // De subsidiecheck zet postcode en huisnummer in de URL. De GA4-tags mogen
    // page_location daarom alleen via de opschoon-variabele meesturen, nooit
    // via de kale {{Page URL}}.
    const paginaTags = container.tag.filter((t) => JSON.stringify(t).includes("page_location"));
    expect(paginaTags.length).toBeGreaterThan(0);

    for (const tag of paginaTags) {
      expect(
        JSON.stringify(tag).includes("{{js - page_location zonder adres}}"),
        `tag "${tag.name}" stuurt page_location zonder de opschoon-variabele`,
      ).toBe(true);
    }
  });
});

describe("GTM-container: v10 laat v8 ongemoeid", () => {
  const soorten = [
    ["tag", "tagId"],
    ["trigger", "triggerId"],
    ["variable", "variableId"],
  ] as const;

  for (const [soort, idVeld] of soorten) {
    it(`bevat elke ${soort} uit v8 ongewijzigd`, () => {
      for (const oud of vorige[soort]) {
        const nieuw = container[soort].find((x) => x[idVeld] === oud[idVeld]);
        expect(nieuw, `${soort} ${oud[idVeld]} "${oud.name}" ontbreekt in v10`).toBeDefined();
        expect(nieuw, `${soort} "${oud.name}" is veranderd ten opzichte van v8`).toEqual(oud);
      }
    });

    it(`voegt alleen ${soort}s toe die met "Meta - " beginnen, met unieke ids en namen`, () => {
      const oudeIds = new Set(vorige[soort].map((x) => x[idVeld]));
      for (const x of container[soort].filter((x) => !oudeIds.has(x[idVeld]))) {
        expect(x.name.startsWith("Meta - "), `nieuw ${soort} "${x.name}" hoort met "Meta - " te beginnen`).toBe(true);
      }
      const ids = container[soort].map((x) => x[idVeld]);
      expect(new Set(ids).size).toBe(ids.length);
      const namen = container[soort].map((x) => x.name);
      expect(new Set(namen).size).toBe(namen.length);
    });
  }

  it("gebruikt geen id twee keer, ook niet tussen tags, triggers en variabelen", () => {
    // GTM nummert alle drie uit één teller; de export volgt dat.
    const ids = [
      ...container.tag.map((x) => x.tagId),
      ...container.trigger.map((x) => x.triggerId),
      ...container.variable.map((x) => x.variableId),
    ];
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("GTM-container: v10 ten opzichte van v9", () => {
  // v10 is met Samenvoegen te importeren over een live v9. Daarom precies dit en
  // niets meer: één nieuwe trigger, en twee bestaande Meta-items die hem kennen.
  const GEWIJZIGD = ["Meta - Lead", "Meta - content_name"];
  const zonderVingerafdruk = (x: Entity & { fingerprint?: string }) => {
    const { fingerprint: _fp, ...rest } = x;
    return rest;
  };

  it("voegt alleen de trigger Meta - Event | bewoner_lead toe", () => {
    const oudeIds = new Set(v9.trigger.map((t) => t.triggerId));
    expect(container.trigger.filter((t) => !oudeIds.has(t.triggerId)).map((t) => t.name)).toEqual([
      "Meta - Event | bewoner_lead",
    ]);
    expect(container.tag.length).toBe(v9.tag.length);
    expect(container.variable.length).toBe(v9.variable.length);
  });

  for (const soort of ["tag", "trigger", "variable"] as const) {
    it(`laat elke ${soort} uit v9 ongewijzigd, op Meta - Lead en Meta - content_name na`, () => {
      for (const oud of v9[soort]) {
        const nieuw = container[soort].find((x) => x.name === oud.name);
        expect(nieuw, `${soort} "${oud.name}" ontbreekt in v10`).toBeDefined();
        if (GEWIJZIGD.includes(oud.name)) continue;
        expect(nieuw, `${soort} "${oud.name}" is veranderd ten opzichte van v9`).toEqual(oud);
      }
    });
  }

  it("verandert aan Meta - Lead alleen de triggers", () => {
    const oud = v9.tag.find((t) => t.name === "Meta - Lead")!;
    const nieuw = container.tag.find((t) => t.name === "Meta - Lead")!;
    expect({ ...zonderVingerafdruk(nieuw), firingTriggerId: oud.firingTriggerId }).toEqual(zonderVingerafdruk(oud));
  });
});

describe("GTM-container: Meta-pixel", () => {
  const metaTags = container.tag.filter((t) => t.name.startsWith("Meta - "));
  const trigger = (id: string) => container.trigger.find((t) => t.triggerId === id)!;
  const tagNaam = (naam: string) => container.tag.find((t) => t.name === naam)!;
  const variabele = (naam: string) => container.variable.find((v) => v.name === naam)!;
  const html = (t: Entity) => t.parameter!.find((p) => p.key === "html")!.value!;
  const eventsVan = (t: Entity) => t.firingTriggerId!.map((id) => eventVanTrigger(trigger(id)));
  const basis = tagNaam("Meta - Pixel basis");

  it("heeft de basistag, ViewContent en Lead", () => {
    expect(metaTags.map((t) => t.name).sort()).toEqual(["Meta - Lead", "Meta - Pixel basis", "Meta - ViewContent"]);
  });

  it("laat geen enkele Meta-tag vuren zonder toestemming in Axeptio", () => {
    for (const tag of metaTags) {
      expect(tag.firingTriggerId!.length).toBeGreaterThan(0);
      for (const id of tag.firingTriggerId!) {
        // Geen ingebouwde trigger (All Pages, Initialization): daar zit geen voorwaarde op.
        expect(id.startsWith("21474795"), `tag "${tag.name}" hangt aan een ingebouwde trigger`).toBe(false);
        const t = trigger(id);
        expect(t.type).toBe("CUSTOM_EVENT");
        const voorwaarden = (t.filter ?? []).map((f) => [f.type, f.parameter[0].value, f.parameter[1].value]);
        expect(voorwaarden, `trigger "${t.name}" van "${tag.name}" vraagt geen toestemming`).toContainEqual([
          "EQUALS",
          "{{Meta - Toestemming}}",
          "true",
        ]);
      }
    }
  });

  it("leest de toestemming af aan de Axeptio-service, die op één plek staat", () => {
    const service = variabele("Meta - Axeptio service");
    expect(service.type).toBe("c");
    const js = variabele("Meta - Toestemming").parameter![0].value!;
    expect(js).toContain("{{Meta - Axeptio service}}");
    expect(js).toContain("axeptio_authorized_vendors");
    // Nergens anders de servicenaam hardgecodeerd.
    const rest = JSON.stringify(container).replace(JSON.stringify(service), "");
    expect(rest).not.toContain(service.parameter![0].value!);
  });

  it("haalt het pixel-ID uit één Constant-variabele", () => {
    const pixel = container.variable.filter((v) => v.name === "Meta - Pixel ID");
    expect(pixel).toHaveLength(1);
    expect(pixel[0].type).toBe("c");
    // De dataset "Voortraject website", niet de WhatsApp-dataset 4241724042749562.
    expect(pixel[0].parameter![0].value).toBe("1138129071891178");
    expect(html(basis)).toContain("String({{Meta - Pixel ID}})");
    expect(html(basis)).toContain("fbq('init', pixelId)");
    // Geen los pixel-ID (een lang getal) in de tags zelf.
    for (const tag of metaTags) expect(html(tag)).not.toMatch(/\d{8,}/);
  });

  it("vuurt ViewContent en Lead pas nadat de basistag geladen is", () => {
    for (const naam of ["Meta - ViewContent", "Meta - Lead"]) {
      const tag = tagNaam(naam);
      expect(tag.setupTag).toEqual([{ tagName: "Meta - Pixel basis", stopOnSetupFailure: true }]);
      expect(html(tag)).toContain(`fbq('track', '${naam.slice("Meta - ".length)}'`);
      expect(html(tag)).toContain("{{Meta - content_name}}");
      expect(html(tag)).toContain("{ eventID: String(eventId) }");
    }
  });

  it("koppelt ViewContent aan subsidiecheck_start en Lead aan subsidiecheck_lead en bewoner_lead, met de juiste content_name", () => {
    expect(eventsVan(tagNaam("Meta - ViewContent"))).toEqual(["subsidiecheck_start"]);
    expect(eventsVan(tagNaam("Meta - Lead"))).toEqual(["subsidiecheck_lead", "bewoner_lead"]);
    for (const event of ["subsidiecheck_start", "subsidiecheck_lead", "bewoner_lead"]) {
      expect(codeEvents.has(event), `de code pusht "${event}" niet meer`).toBe(true);
    }

    const rijen = variabele("Meta - content_name")
      .parameter!.find((p) => p.key === "map")!
      .list!.map((r) => [r.map[0].value, r.map[1].value]);
    expect(rijen).toEqual([
      ["subsidiecheck_start", "subsidiecheck"],
      ["subsidiecheck_lead", "subsidiecheck"],
      // Het contactformulier op /contact, ook als de bezoeker er via "Liever even
      // bellen?" in de check kwam.
      ["bewoner_lead", "contact"],
    ]);
    // Een funnel-event in de opzoektabel zonder trigger (of andersom) meet niets.
    const metaEvents = [...eventsVan(tagNaam("Meta - ViewContent")), ...eventsVan(tagNaam("Meta - Lead"))].sort();
    expect(rijen.map(([event]) => event).sort()).toEqual(metaEvents);
  });

  it("stuurt PageView op dezelfde momenten als GA4: na de toestemming en bij virtual_page_view", () => {
    const events = eventsVan(basis);
    expect(events).toContain("virtual_page_view");
    expect(events.some((e) => e.startsWith("^axeptio_"))).toBe(true);
    expect(html(basis)).toContain("fbq('track', 'PageView')");
    // De SPA-weergaves sturen we zelf, dus de automatische pushState-telling van de pixel moet uit.
    expect(html(basis)).toContain("fbq.disablePushState = true");
  });
});
