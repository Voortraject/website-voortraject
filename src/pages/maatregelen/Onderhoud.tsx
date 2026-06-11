import { Wrench } from "lucide-react";
import { MaatregelTemplate } from "@/components/MaatregelTemplate";

const Onderhoud = () => (
  <MaatregelTemplate
    slug="onderhoud"
    title="Onderhoud"
    icon={Wrench}
    seoTitle="Onderhoud | Voortraject"
    seoDescription="Verduurzamingsinstallaties presteren alleen blijvend goed met periodiek onderhoud. Wat hoort daar in de praktijk bij?"
    intro="Een verduurzamingstraject stopt niet bij oplevering. Installaties leveren alleen blijvend wat ze beloven als ze periodiek worden gecontroleerd en bijgesteld."
    watValtEronder={[
      "Onderhoud aan warmtepomp en cv-ketel",
      "Controle van zonnepanelen en omvormer",
      "Inregelen en filterwissels van ventilatie-/WTW-systeem",
      "Check op werking van thuisbatterij en energiemanagement",
      "Controle van isolatie en kierdichting na verbouwingen",
    ]}
    voorWie="Voor iedereen die heeft geïnvesteerd in verduurzaming en die investering ook over 10 of 15 jaar nog wil terugzien in lagere energiekosten en comfort."
    wanneerSlim="Vanaf het moment dat installaties zijn geplaatst. Veel garanties vervallen zonder periodiek onderhoud. Plan onderhoud bij voorkeur via één partij die het overzicht houdt."
    terugverdientijd="Onderhoud is geen investering met een directe terugverdientijd, maar voorkomt grotere kosten: een slecht ingeregelde warmtepomp of vervuilde WTW kan je honderden euro's per jaar extra kosten."
    waarOpLetten="Houd het onderhoudslogboek bij (belangrijk voor garantie en bij verkoop). Kies bij voorkeur een partij die meerdere installaties tegelijk kan bedienen, zodat afstemming geen probleem is."
    subsidies={[]}
  />
);

export default Onderhoud;
