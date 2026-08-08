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

const CONTAINER = "docs/gtm/GTM-P6W5MNN4_v6.json";

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
  triggerId?: string;
  firingTriggerId?: string[];
  customEventFilter?: { parameter: Parameter[] }[];
}

const container = JSON.parse(readFileSync(CONTAINER, "utf8")).containerVersion as {
  tag: Entity[];
  trigger: Entity[];
  variable: Entity[];
  builtInVariable: { name: string }[];
};

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

const customEventTriggers = new Map(
  container.trigger
    .filter((t) => t.type === "CUSTOM_EVENT")
    .map((t) => [t.customEventFilter![0].parameter[1].value!, t.triggerId!]),
);

describe("GTM-container", () => {
  it("heeft voor elk event dat de code pusht een trigger én een tag", () => {
    const getriggerd = new Set(container.tag.flatMap((t) => t.firingTriggerId ?? []));

    for (const event of [...codeEvents].sort()) {
      const triggerId = customEventTriggers.get(event);
      expect(triggerId, `de code pusht "${event}" maar de container heeft er geen trigger voor`).toBeDefined();
      expect(getriggerd.has(triggerId!), `trigger voor "${event}" bestaat maar geen enkele tag gebruikt hem`).toBe(
        true,
      );
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
