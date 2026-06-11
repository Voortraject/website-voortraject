import { Home } from "lucide-react";
import { MaatregelTemplate } from "@/components/MaatregelTemplate";

const Isolatie = () => (
  <MaatregelTemplate
    slug="isolatie"
    title="Isolatie & ventilatie"
    icon={Home}
    badge="Vaak eerste stap"
    seoTitle="Isolatie & ventilatie | Voortraject"
    seoDescription="Isolatie en ventilatie zijn de basis van elk verduurzamingstraject. Wat valt eronder, wanneer is het slim en welke subsidies horen erbij?"
    intro="Een goed geïsoleerde woning is bijna altijd de eerste stap. Het verlaagt je energieverbruik direct en maakt elke volgende maatregel — opwek, warmtepomp, batterij — effectiever en goedkoper."
    watValtEronder={[
      "Dakisolatie",
      "Vloer- en bodemisolatie",
      "Spouwmuur- of binnenisolatie",
      "HR++ of triple glas en goede kozijnen",
      "Kierdichting",
      "Mechanische of balansventilatie met warmteterugwinning (WTW)",
    ]}
    voorWie="Vrijwel elke bewoner van een woning gebouwd vóór 2000 heeft hier nog winst te halen. Ook nieuwere woningen zijn niet altijd optimaal geïsoleerd of geventileerd."
    wanneerSlim="Bijna altijd als eerste stap. Isolatie verlaagt direct je verbruik en bepaalt of latere maatregelen (zoals een warmtepomp of zonnepanelen) hun rendement halen. Goed isoleren zonder goed ventileren geeft vocht- en gezondheidsproblemen, dus die twee horen bij elkaar."
    terugverdientijd="Dakisolatie en spouwmuurisolatie verdienen zich vaak binnen 5 tot 10 jaar terug. Vloerisolatie en glasvervanging hebben een langere terugverdientijd, maar leveren veel comfort op."
    waarOpLetten="Controleer eerst wat er al aanwezig is voor je opnieuw investeert. Laat ook de staat van de kozijnen meenemen. Een geïsoleerde woning is luchtdicht en heeft bewuste ventilatie nodig — zorg dat een WTW-systeem ook goed wordt ingeregeld na installatie."
    subsidies={[
      { href: "/subsidies/landelijk", label: "ISDE — landelijke subsidie isolatiemaatregelen" },
      { href: "/subsidies/nij-begun", label: "Nij Begun — Groningen en Noord-Drenthe" },
      { href: "/subsidies/regionaal", label: "Regionale en gemeentelijke regelingen" },
    ]}
  />
);

export default Isolatie;
