import { Sun } from "lucide-react";
import { MaatregelTemplate } from "@/components/MaatregelTemplate";

const Zonnepanelen = () => (
  <MaatregelTemplate
    slug="zonnepanelen"
    title="Zonnepanelen"
    icon={Sun}
    badge="Vaak vervolgstap"
    seoTitle="Zonnepanelen | Voortraject"
    seoDescription="Zelf stroom opwekken met zonnepanelen. Wanneer is het slim, waar moet je op letten en welke regelingen zijn er rond salderen en terugleveren?"
    intro="Zonnepanelen verlagen je energierekening direct en maken je minder afhankelijk van netstroom. Het rendement is het hoogst in een al goed geïsoleerde woning — dan verbruik je minder dan je opwekt, in plaats van andersom."
    watValtEronder={[
      "Zonnepanelen op dak of bijgebouw",
      "Omvormer en monitoring",
      "Eventueel optimizers bij schaduw",
      "Aansluiting op de meterkast en netaansluiting",
    ]}
    voorWie="Geschikt voor bewoners met een eigen dak of bijgebouw waar voldoende zon op valt. Pas extra interessant zodra je woning redelijk geïsoleerd is, anders blijf je per saldo nog steeds veel netstroom inkopen."
    wanneerSlim="Pas nadat je hebt geïsoleerd. In een slecht geïsoleerde woning verbruik je meer dan je opwekt en betaal je voor panelen die je energieprobleem niet oplossen. Na isolatie is de businesscase vrijwel altijd sterk."
    terugverdientijd="Doorgaans 7 tot 10 jaar, afhankelijk van dakrichting, helling, schaduw en je verbruikspatroon. De afbouw van de salderingsregeling vanaf 2027 maakt slim verbruik (en eventueel opslag) belangrijker."
    waarOpLetten="Laat de opstelling goed doorrekenen op dakrichting, hellingshoek en schaduw. Controleer of je netaansluiting toereikend is — bij grotere installaties is soms verzwaring nodig. Houd rekening met terugleverkosten van je energieleverancier."
    subsidies={[
      { href: "/subsidies/nij-begun", label: "Nij Begun — Groningen en Noord-Drenthe" },
      { href: "/subsidies/regionaal", label: "Regionale en gemeentelijke regelingen" },
    ]}
  />
);

export default Zonnepanelen;
