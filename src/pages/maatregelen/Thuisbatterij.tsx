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
      "Je meer stroom gaat gebruiken, bijvoorbeeld door een warmtepomp of elektrisch rijden",
      "Je minder afhankelijk wilt zijn van teruglevering aan het net",
    ]}
    minderUrgent={[
      "Je nog geen zonnepanelen hebt; begin daar dan eerst mee",
      "Je verbruik laag is, waardoor de terugverdientijd lang wordt",
      "Je vooral op een korte terugverdientijd let; die is op dit moment nog onzeker",
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
        q: "Heeft een thuisbatterij in mijn situatie zin?",
        a: "Dat hangt sterk af van je verbruik, je zonnepanelen en je energiecontract. Voor de ene woning is het een slimme stap, voor de andere nog niet, en daar zijn we eerlijk over.",
      },
      {
        q: "Verdien ik mijn thuisbatterij snel terug?",
        a: "Voor veel huishoudens is de terugverdientijd op dit moment nog lang en sterk afhankelijk van de situatie. Door de afbouw van de saldering wordt zelf verbruiken interessanter, maar we rekenen het liever eerlijk voor je door dan je iets aan te praten.",
      },
      {
        q: "Kan ik mijn zonnepanelen koppelen aan een thuisbatterij?",
        a: "Ja, dat is juist de meest logische combinatie. Je slaat overdag opgewekte stroom op en gebruikt die 's avonds, in plaats van terug te leveren.",
      },
      {
        q: "Werkt een thuisbatterij ook bij stroomuitval?",
        a: "Niet elke thuisbatterij doet dat automatisch, daarvoor is een speciale voorziening nodig. Als noodstroom voor jou belangrijk is, houden we daar rekening mee in het advies.",
      },
      {
        q: "Kan ik later uitbreiden in capaciteit?",
        a: "Bij veel systemen kan dat. Het is verstandig vooraf te bepalen welke capaciteit bij je verbruik past, zodat je niet te klein of onnodig groot koopt.",
      },
      {
        q: "Is een thuisbatterij veilig in huis?",
        a: "Moderne thuisbatterijen voldoen aan strenge veiligheidseisen en worden door een gecertificeerde uitvoerder geïnstalleerd. Met de juiste plaatsing is het veilig.",
      },
    ]}
    finalCtaKop="Benieuwd of een thuisbatterij voor jou [[loont]]?"
    finalCtaTekst="In een gratis gesprek rekenen we eerlijk voor je door of een thuisbatterij in jouw situatie zinvol is, of dat je beter eerst andere stappen zet. Wij verkopen geen batterijen en hebben er dus geen belang bij om je iets aan te praten."
  />
);

export default Thuisbatterij;
