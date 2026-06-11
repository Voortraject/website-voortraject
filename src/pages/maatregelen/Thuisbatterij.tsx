import { Battery } from "lucide-react";
import { MaatregelTemplate } from "@/components/MaatregelTemplate";

const Thuisbatterij = () => (
  <MaatregelTemplate
    slug="thuisbatterij"
    title="Thuisbatterij & opslag"
    icon={Battery}
    badge="Meestal latere stap"
    seoTitle="Thuisbatterij & opslag | Voortraject"
    seoDescription="Een thuisbatterij maakt je minder afhankelijk van het net en helpt zelf opgewekte stroom beter te benutten. Wanneer is het rendabel?"
    intro="Met opslag kun je overdag opgewekte stroom 's avonds gebruiken. Dat wordt relevanter naarmate de salderingsregeling wordt afgebouwd en terugleveren minder oplevert."
    watValtEronder={[
      "Thuisbatterij (DC- of AC-gekoppeld)",
      "Slim energiemanagementsysteem",
      "Aansluiting op zonnepanelen en eventueel warmtepomp/laadpaal",
      "Monitoring van laad- en ontlaadgedrag",
    ]}
    voorWie="Vooral interessant als je al zonnepanelen hebt, een fors stroomverbruik en/of last hebt van terugleverkosten. Zonder zonnepanelen is een batterij zelden zinvol."
    wanneerSlim="Na isolatie en zonnepanelen. Eerst zorgen dat je verbruik laag en je opwek hoog is — pas dan rendeert opslag echt. Slim energiemanagement (apparaten draaien als de zon schijnt) levert vaak al veel op zonder batterij."
    terugverdientijd="Voor de meeste huishoudens op dit moment nog 10 tot 15 jaar of langer. Door afbouw saldering, dynamische tarieven en terugleverkosten verandert deze rekensom de komende jaren snel."
    waarOpLetten="Let op capaciteit (kWh), vermogen (kW), garantie en aantal cycli. Veiligheid en plaatsing (brandwerend, geventileerd) zijn belangrijk. Reken meerdere scenario's door voor je kiest — een te grote batterij verdient zichzelf nooit terug."
    subsidies={[
      { href: "/subsidies/regionaal", label: "Regionale en gemeentelijke regelingen" },
    ]}
  />
);

export default Thuisbatterij;
