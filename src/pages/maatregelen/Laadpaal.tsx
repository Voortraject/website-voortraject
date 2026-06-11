import { Plug } from "lucide-react";
import { MaatregelTemplate } from "@/components/MaatregelTemplate";

const Laadpaal = () => (
  <MaatregelTemplate
    slug="laadpaal"
    title="Laadpaal"
    icon={Plug}
    seoTitle="Laadpaal | Voortraject"
    seoDescription="Een eigen laadpaal is vaak goedkoper en handiger dan publiek laden. Waar moet je op letten en hoe combineer je hem met zonnepanelen?"
    intro="Een laadpaal thuis is in de meeste gevallen goedkoper en comfortabeler dan publiek laden. Gekoppeld aan je zonnepanelen kun je goedkope, duurzame stroom in je auto laden."
    watValtEronder={[
      "Wallbox of paal met type 2-aansluiting",
      "Eventueel load balancing met huisaansluiting",
      "Slim laden op basis van zon of dynamisch tarief",
      "Aansluiting op de meterkast en zekeringen",
    ]}
    voorWie="Voor bewoners met een eigen oprit of carport en een (toekomstige) elektrische auto. Vooral aantrekkelijk in combinatie met zonnepanelen en/of een dynamisch energiecontract."
    wanneerSlim="Direct interessant zodra je elektrisch gaat rijden, ook als je nog geen zonnepanelen hebt. Vergelijk de kosten met publiek laden — thuisladen is bijna altijd voordeliger."
    terugverdientijd="Vaak binnen 2 tot 5 jaar terugverdiend ten opzichte van publiek laden, afhankelijk van hoeveel kilometers je rijdt en je stroomtarief."
    waarOpLetten="Controleer de capaciteit van je huisaansluiting; soms is load balancing of verzwaring nodig. Let op compatibiliteit met je auto, op de mogelijkheid van slim laden, en op of de laadpaal toekomstbestendig is (bv. bidirectioneel laden)."
    subsidies={[
      { href: "/subsidies/regionaal", label: "Regionale en gemeentelijke regelingen" },
    ]}
  />
);

export default Laadpaal;
