import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import type { ReactElement } from "react";
import { describe, expect, it, vi } from "vitest";

/**
 * Bewaakt de toon van de pagina's onder /verduurzamen.
 *
 * Deze pagina's zijn er om een bewoner op weg te helpen, niet om hem af te
 * remmen. Toch sloop er van alles in dat precies dat deed: "de duurste optie",
 * "een dure pleister", "dan vallen de kosten tegen". Bijna altijd ging het over
 * één situatie (een woning zonder isolatie, een dak vol schaduw) terwijl het
 * als oordeel over de maatregel zelf op de pagina stond. Wie het las, las een
 * afrader.
 *
 * Feiten mogen hier blijven staan, ook ongemakkelijke: dat een thuisbatterij
 * zich op je stroomrekening niet terugverdient is de conclusie van Milieu
 * Centraal en die hoort erbij. Wat niet meer mag is het prijsoordeel als
 * eindoordeel. Vandaar twee soorten bewaking:
 *
 *   1 de woordenlijst hieronder komt niet meer voor in de opgebouwde pagina;
 *   2 het sjabloon kleurt een hoge investering of een lange terugverdientijd
 *     niet rood, en de kolom "nu even niet" is geen rode afkeuringskaart meer.
 */

vi.mock("@/components/Header", () => ({ Header: () => null }));
vi.mock("@/components/Footer", () => ({
  Footer: ({ cta }: { cta?: ReactElement }) => <footer>{cta}</footer>,
}));
vi.mock("@/components/Seo", () => ({ Seo: () => null }));

import { Plug } from "lucide-react";
import { MaatregelPagina } from "@/components/MaatregelPagina";
import Isolatie from "@/pages/maatregelen/Isolatie";
import Warmtepomp from "@/pages/maatregelen/Warmtepomp";
import Zonnepanelen from "@/pages/maatregelen/Zonnepanelen";
import Laadpaal from "@/pages/maatregelen/Laadpaal";
import Thuisbatterij from "@/pages/maatregelen/Thuisbatterij";
import Airco from "@/pages/maatregelen/Airco";
import Onderhoud from "@/pages/maatregelen/Onderhoud";

const PAGINAS: [string, ReactElement][] = [
  ["isolatie", <Isolatie />],
  ["warmtepomp", <Warmtepomp />],
  ["zonnepanelen", <Zonnepanelen />],
  ["laadpaal", <Laadpaal />],
  ["thuisbatterij", <Thuisbatterij />],
  ["airco", <Airco />],
  ["onderhoud", <Onderhoud />],
];

/** Prijsoordelen die van een maatregel een afrader maken. */
const AFRADERS: [RegExp, string][] = [
  [/\bduurste\b/i, "een maatregel als de duurste wegzetten"],
  [/\bte duur\b/i, "te duur"],
  [/\bzo duur\b/i, "zo duur dat"],
  [/\b(is|zijn|was|waren) duur\b/i, "is duur"],
  [/\bdure\b/i, "een dure ..."],
  [/vallen de kosten tegen/i, "dan vallen de kosten tegen"],
  [/het meeste voor het minste/i, "het meeste betalen voor het minste"],
];

describe("toon op de maatregelpagina's", () => {
  it.each(PAGINAS)("%s zet geen enkele maatregel weg als te duur", (_naam, pagina) => {
    const { container } = render(<MemoryRouter>{pagina}</MemoryRouter>);
    const tekst = container.textContent ?? "";

    for (const [patroon, wat] of AFRADERS) {
      expect(tekst, `deze pagina zegt "${wat}"`).not.toMatch(patroon);
    }
  });
});

/** Pillen die een eigenschap van de woning als minpunt op de maatregel plakken. */
const MINPUNT_PILLEN: [RegExp, string][] = [
  [/Investering\s*Hoog/i, "Investering: Hoog"],
  [/Terugverdientijd\s*Lang/i, "Terugverdientijd: Lang"],
];

describe("de pillen benoemen wat een maatregel oplevert", () => {
  it.each(PAGINAS)("%s draagt geen minpunt-pil", (_naam, pagina) => {
    const { container } = render(<MemoryRouter>{pagina}</MemoryRouter>);
    const tekst = container.textContent ?? "";

    for (const [patroon, wat] of MINPUNT_PILLEN) {
      expect(tekst, `deze pagina toont de pil "${wat}"`).not.toMatch(patroon);
    }
  });
});

/** Het kale sjabloon, om losse onderdelen zonder paginatekst te bekijken. */
const Sjabloon = () => (
  <MaatregelPagina
    slug="laadpaal"
    icon={Plug}
    seoTitle=""
    seoDescription=""
    heroTitle=""
    heroSub=""
    heroIntro=""
    pastBij={["Je een eigen oprit hebt"]}
    minderUrgent={["Je binnenkort verhuist"]}
    routeStep="slim"
    kostenItems={[
      {
        title: "Een maatregel die een grotere investering vraagt",
        body: "",
        pills: [
          { dim: "Investering", value: "Hoog" },
          { dim: "Terugverdientijd", value: "Lang" },
          { dim: "Comfortwinst", value: "Hoog" },
        ],
      },
    ]}
    faqs={[]}
    finalCtaKop=""
    finalCtaTekst=""
  />
);

/** De rode tinten die het sjabloon gebruikte om iets af te keuren. */
const ROOD = ["#B91C1C", "#FEF2F2", "#FECACA", "#C0392B", "#FEF7F7", "border-red-"];

describe("het sjabloon keurt niets af", () => {
  it("kleurt een hoge investering en een lange terugverdientijd niet rood", () => {
    const { container } = render(
      <MemoryRouter>
        <Sjabloon />
      </MemoryRouter>,
    );

    const html = container.innerHTML;
    for (const tint of ROOD) {
      expect(html, `${tint} staat nog in de pagina`).not.toContain(tint);
    }
  });

  it("noemt de tweede kolom niet kaal 'Niet'", () => {
    const { container } = render(
      <MemoryRouter>
        <Sjabloon />
      </MemoryRouter>,
    );

    const koppen = [...container.querySelectorAll("div")].map((el) => el.textContent?.trim());
    expect(koppen).not.toContain("Niet");
    expect(container.textContent).toContain("Nu even niet");
  });
});
