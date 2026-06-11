import { Snowflake } from "lucide-react";
import { MaatregelTemplate } from "@/components/MaatregelTemplate";

const Airco = () => (
  <MaatregelTemplate
    slug="airco"
    title="Airco"
    icon={Snowflake}
    seoTitle="Airco | Voortraject"
    seoDescription="Een airco (lucht-lucht warmtepomp) kan koelen in de zomer en bijverwarmen in de tussenseizoenen. Wanneer is dat slim en waar moet je op letten?"
    intro="Een airco is in feite een lucht-lucht warmtepomp: hij kan koelen in de zomer en in voor- en najaar efficiënt bijverwarmen. Een nuttige aanvulling, maar zelden de eerste stap in een verduurzamingstraject."
    watValtEronder={[
      "Split- of multi-split airco-units",
      "Buitenunit met één of meerdere binnenunits",
      "Mogelijkheid tot koelen en (bij)verwarmen",
      "Aansluiting op meterkast en eventueel zonne-energie",
    ]}
    voorWie="Voor bewoners die in de zomer last hebben van oververhitting, of die ruimtes goedkoop willen kunnen bijverwarmen in de tussenseizoenen. Vaak een goede combinatie met zonnepanelen, omdat het verbruik vooral overdag ligt."
    wanneerSlim="Niet als vervanging van je cv of warmtepomp, maar als comfortmaatregel. Werk eerst aan isolatie en zonwering — dan heb je vaak veel minder koelvermogen nodig."
    terugverdientijd="Een airco verdient zichzelf zelden volledig terug op energiebesparing. De waarde zit vooral in comfort en in het kunnen bijverwarmen met een hoge efficiëntie (COP)."
    waarOpLetten="Let op geluid (binnen- en buitenunit), plaatsing in verband met buren en eventuele vergunningseisen. Kies een unit met een goede SEER (koelen) en SCOP (verwarmen). Een te zwaar gedimensioneerd systeem verbruikt onnodig veel."
    subsidies={[]}
  />
);

export default Airco;
