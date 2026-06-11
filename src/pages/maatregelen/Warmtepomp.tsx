import { Thermometer } from "lucide-react";
import { MaatregelTemplate } from "@/components/MaatregelTemplate";

const Warmtepomp = () => (
  <MaatregelTemplate
    slug="warmtepomp"
    title="Warmtepomp"
    icon={Thermometer}
    badge="Alleen in passende situatie"
    seoTitle="Warmtepomp | Voortraject"
    seoDescription="Hybride of volledig elektrische warmtepomp: voor wie is het slim, wat zijn de aandachtspunten en welke ISDE-subsidies horen erbij?"
    intro="Een warmtepomp vervangt geheel of gedeeltelijk je cv-ketel en haalt warmte uit lucht, bodem of water. In een goed geïsoleerde woning is het een logische stap naar gasloos verwarmen."
    watValtEronder={[
      "Hybride warmtepomp (samen met cv-ketel)",
      "Volledig elektrische lucht-water warmtepomp",
      "Bodem- of grondwarmtepomp",
      "Lage-temperatuurafgifte: vloerverwarming of grotere radiatoren",
      "Eventueel buffervat en aanpassingen aan meterkast",
    ]}
    voorWie="Geschikt voor woningen die al redelijk goed geïsoleerd zijn. Een hybride pomp is vaak een goede tussenstap als volledig elektrisch (nog) niet haalbaar is. Bij slechte isolatie en kleine radiatoren werkt een warmtepomp inefficiënt."
    wanneerSlim="Pas serieus overwegen als de woning voldoende geïsoleerd is. Anders krijg je hogere energiekosten en een warmtepomp die hard moet werken. Vaak komt deze stap na isolatie en zonnepanelen."
    terugverdientijd="Sterk afhankelijk van uitgangssituatie, gasprijs en stroomprijs. Met ISDE-subsidie is een hybride pomp vaak binnen 7 tot 12 jaar terugverdiend; volledig elektrisch heeft een langere horizon maar grotere CO₂-winst."
    waarOpLetten="Laat altijd een warmteverliesberekening maken voordat je kiest. Volledig elektrisch werkt het beste met lage-temperatuurverwarming. Let op geluid (binnen- en buitenunit) en plaatsing in verband met buren en bouwregels."
    subsidies={[
      { href: "/subsidies/landelijk", label: "ISDE — landelijke subsidie warmtepomp" },
      { href: "/subsidies/nij-begun", label: "Nij Begun — Groningen en Noord-Drenthe" },
      { href: "/subsidies/regionaal", label: "Regionale en gemeentelijke regelingen" },
    ]}
  />
);

export default Warmtepomp;
