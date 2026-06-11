import { Battery } from "lucide-react";
import { MaatregelPagina } from "@/components/MaatregelPagina";
import thuisbatterijImage from "@/assets/maatregel-thuisbatterij.jpg";

const Thuisbatterij = () => (
  <MaatregelPagina
    slug="thuisbatterij"
    icon={Battery}
    badge="Meestal latere stap"
    seoTitle="Thuisbatterij & opslag | Voortraject"
    seoDescription="Een thuisbatterij slaat je eigen stroom op voor later gebruik. Wanneer is het slim, wat kost het en waar moet je op letten?"
    heroTitle="Thuisbatterij, je stroom [[slim]] opslaan"
    heroSub="Gebruik je eigen stroom wanneer het jou uitkomt in plaats van terug te leveren, handig met het oog op de afbouw van de saldering. Of het loont hangt sterk af van je situatie, en daar zijn wij eerlijk over."
    heroIntro=""
    heroImageSrc={thuisbatterijImage}
    heroImageAlt="Thuisbatterij aan een muur in een bijkeuken"
    pastBij={[
      "Je al zonnepanelen hebt en meer wilt halen uit je eigen opwek",
      "Je een dynamisch energiecontract hebt of overweegt",
      "Je verwacht meer stroom te gaan gebruiken, bijvoorbeeld door een warmtepomp of elektrisch rijden",
      "Je minder afhankelijk wilt zijn van teruglevering aan het net",
    ]}
    minderUrgent={[
      "Je nog geen zonnepanelen hebt, begin daar dan eerst mee",
      "Je verbruik laag is, dan is de terugverdientijd vaak lang",
    ]}
    watValtEronder={[
      "Thuisbatterij of accu voor opslag van eigen stroom",
      "Slim energiemanagement dat laden en ontladen optimaliseert",
      "Modulaire systemen die je later kunt uitbreiden",
      "Optioneel een back-upfunctie bij stroomuitval",
    ]}
    routeStep="slim"
    routeTekst="Een thuisbatterij is meestal een latere stap. Hij rendeert pas als je al zonnepanelen hebt en meer wilt halen uit wat je opwekt. Zonder zonnepanelen is een batterij zelden zinvol. Daarom komt opslag in de route na het opwekken. Het is de stap waarmee je je eigen energie slim gebruikt in plaats van terug te leveren."
    kostenMode="single"
    kostenItems={[
      {
        title: "Thuisbatterij",
        body: "Een batterij wordt vooral interessant in combinatie met zonnepanelen, dynamische contracten of terugleverkosten. De winst zit in meer eigen verbruik en minder afhankelijkheid van het net.",
      },
    ]}
    kostenSinglePills={[
      { dim: "Investering", value: "Hoog" },
      { dim: "Terugverdientijd", value: "Lang" },
      { dim: "Onafhankelijkheid", value: "Hoog" },
    ]}
    kostenFooter="De businesscase voor een thuisbatterij is voor veel huishoudens op dit moment nog beperkt. Wij rekenen het eerlijk voor je door, ook als blijkt dat wachten of een andere maatregel nu slimmer is."
    zachteCtaTekst="Benieuwd of een thuisbatterij voor jou loont? Plan een gesprek"
    aandachtspunten={[
      "Een thuisbatterij loont vooral met zonnepanelen, niet zonder",
      "Een grotere batterij is niet automatisch beter, het gaat om de juiste maat",
      "Niet elke batterij werkt bij stroomuitval, vraag hier vooraf naar",
      "Kies een vakkundige installateur voor een veilige aansluiting op de meterkast en behoud van garantie",
    ]}
    extraInfo={{
      kop: "Waarom een thuisbatterij nu in opkomst is",
      items: [
        "De salderingsregeling wordt stapsgewijs afgebouwd",
        "Energieleveranciers rekenen vaker terugleverkosten",
        "Het elektriciteitsnet raakt voller, wat netcongestie heet",
        "Dynamische energiecontracten maken slim opslaan interessanter",
      ],
      voetregel: "Deze ontwikkelingen maken zelf gebruiken aantrekkelijker dan terugleveren, maar of het voor jou al loont blijft maatwerk.",
    }}
    subsidiesPosition="below"
    subsidiesIntro="Voor thuisbatterijen zijn de landelijke regelingen op dit moment beperkt en sterk in beweging. Soms gelden gemeentelijke regelingen. Wij houden bij wat er actueel is voor jouw adres."
    subsidiesItems={[]}
    subsidiesLinkHref="/subsidies"
    subsidiesLinkLabel="Bekijk hoe je subsidies stapelt"
    faqs={[
      {
        q: "Kan ik mijn zonnepanelen koppelen aan een thuisbatterij?",
        a: "Ja, dat is juist de kern. Stroom die je overdag opwekt en niet direct gebruikt, sla je op om later te gebruiken in plaats van terug te leveren aan het net.",
      },
      {
        q: "Is een thuisbatterij rendabel?",
        a: "Dat verschilt sterk per situatie en is voor veel huishoudens op dit moment nog beperkt. Het hangt af van je verbruik, je zonnepanelen, je energiecontract en de terugleverkosten. Wij rekenen het eerlijk voor je door, ook als de uitkomst is dat het nu nog niet loont.",
      },
      {
        q: "Hoe groot moet mijn thuisbatterij zijn?",
        a: "Dat hangt af van je jaarverbruik, je dagverbruik, de opbrengst van je panelen en je toekomstplannen zoals een warmtepomp of elektrisch rijden. Een grotere batterij is niet automatisch beter, het gaat om de juiste maat voor jouw situatie.",
      },
      {
        q: "Werkt een thuisbatterij bij stroomuitval?",
        a: "Niet elke batterij doet dit. Sommige systemen hebben een back-upfunctie waarmee je bij stroomuitval bepaalde groepen kunt blijven voeden, andere niet. Wil je dit, geef het dan vooraf aan.",
      },
      {
        q: "Hoe lang gaat een thuisbatterij mee?",
        a: "De meeste systemen gaan zo'n tien tot vijftien jaar mee, afhankelijk van het type en het gebruik. Moderne batterijen worden continu gemonitord en zijn onderhoudsarm.",
      },
    ]}
    finalCtaKop="Benieuwd of een thuisbatterij voor jou [[loont]]?"
    finalCtaTekst="In een gratis gesprek rekenen we eerlijk voor je door of een thuisbatterij in jouw situatie zinvol is, of dat je beter eerst andere stappen zet. Wij verkopen geen batterijen en hebben er dus geen belang bij om je iets aan te praten."
  />
);

export default Thuisbatterij;
