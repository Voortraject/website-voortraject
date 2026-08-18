import { Battery } from "lucide-react";
import { MaatregelPagina } from "@/components/MaatregelPagina";
import { LoontHetBijJou } from "@/components/maatregel/thuisbatterij/LoontHetBijJou";
import { AlsJeErTochEenNeemt } from "@/components/maatregel/thuisbatterij/AlsJeErTochEenNeemt";
import { CAPACITEITEN, OORDEEL } from "@/data/thuisbatterij";
import thuisbatterijImage from "@/assets/maatregel-thuisbatterij.jpg";

/**
 * Vijf inhoudelijke secties plus de FAQ. Korter dan de andere pagina's, en dat
 * is hier terecht: een batterij loont nu bij een deel van de huishoudens, en
 * daar hoort een helder antwoord bij, geen uitgebreide verkoopfolder.
 *
 *   1 loont een thuisbatterij bij jou   (eigen)
 *   2 past dit bij jouw woning          (template)
 *   3 waar dit staat in de route        (template)
 *   4 wat het kost                      (template)
 *     subsidiecheck
 *   5 als je er toch een neemt          (eigen)
 *
 * De oude tekst zei dat de salderingsregeling "stapsgewijs wordt afgebouwd".
 * Die stopt in één keer op 1 januari 2027; hier staat het goed.
 */

const Thuisbatterij = () => (
  <MaatregelPagina
    slug="thuisbatterij"
    icon={Battery}
    badge="Meestal latere stap"
    seoTitle="Thuisbatterij & opslag | Voortraject"
    seoDescription="Loont een thuisbatterij? Bij noodstroom, een dynamisch contract of een vol net kan dat nu al. We rekenen eerlijk voor wanneer, en waar je dan op let."
    eigenSecties={[
      { na: "hero", bg: "wit", id: "loont-het", inhoud: <LoontHetBijJou /> },
      { na: "subsidies", bg: "warm", id: "waar-op-letten", inhoud: <AlsJeErTochEenNeemt /> },
    ]}
    heroTitle="Thuisbatterij, je stroom [[slim]] opslaan"
    heroSub="Opslaan wat je overdag opwekt en het 's avonds gebruiken wordt aantrekkelijker nu salderen stopt. Bij welke huishoudens dat nu al uit kan, rekenen we eerlijk voor."
    heroIntro=""
    heroImageSrc={thuisbatterijImage}
    heroImageAlt="Thuisbatterij aan een muur in een bijkeuken"
    pastBij={[
      "Je een dynamisch energiecontract hebt of wilt, en je systeem daar zelf op kan sturen",
      "Je stroom wilt houden als het net uitvalt, en dat je die noodstroom een investering waard vindt",
      "Je woont waar teruglevering beperkt is door drukte op het net",
      "Je al zonnepanelen hebt en je verbruik overdag niet verder kunt verschuiven",
    ]}
    minderUrgent={[
      "Je nog geen zonnepanelen hebt; zonder eigen opwek valt er weinig op te slaan",
      "Je vooral op de terugverdientijd let; die hangt sterk af van je contract en verbruik, en die rekenen we liever eerst met je door",
      "Je je verbruik nog naar de zonuren kunt verschuiven, want dat kost niets",
      "Je woning nog niet goed geïsoleerd is; daar zit je geld beter",
    ]}
    routeStep="slim"
    routeTekst="Een thuisbatterij is de laatste stap, niet de eerste. Hij doet pas iets als je al zonnepanelen hebt en je verbruik niet verder kunt verschuiven naar de uren dat de zon schijnt. Beperk dus eerst je verbruik, wek daarna zelf op, en kijk pas daarna naar opslag. In die volgorde haalt een batterij er ook echt uit wat erin zit."
    kostenItems={CAPACITEITEN.map((maat) => ({
      title: `${maat.label}: ${maat.kwh}`,
      body: maat.waarvoor,
    }))}
    kostenFooter={`Een gangbare thuisbatterij van 6 kWh kost inclusief omvormer en installatie een paar duizend euro. ${OORDEEL.kern} Milieu Centraal noemt geen terugverdientijd in jaren, en wij verzinnen er geen. Wat het bij jou zou doen, rekenen we in een gesprek door met jouw verbruik en contract.`}
    faqs={[
      {
        q: "Verdien ik een thuisbatterij terug?",
        a: "Met wat hij je op je stroomrekening bespaart waarschijnlijk niet, en dat is de conclusie van Milieu Centraal die wij overnemen. Er zijn wel goede redenen om er nu al een te nemen: noodstroom, handelen met een dynamisch contract, of een plek waar je nauwelijks kunt terugleveren. Dan koop je hem voor wat hij doet, niet om hem terug te verdienen.",
      },
      {
        q: "Verandert dat als salderen stopt?",
        a: "Het helpt, maar het kantelt de rekensom niet vanzelf. Vanaf 1 januari 2027 levert teruggeleverde stroom minder op, dus is zelf gebruiken meer waard. Alleen: je verbruik verschuiven naar de zonuren, elektrisch verwarmen of slim laden doen hetzelfde en kosten geen duizenden euro's.",
      },
      {
        q: "Welke capaciteit heb ik nodig?",
        a: "Reken vanaf wat je 's avonds en 's nachts gebruikt, niet vanaf je totale verbruik. Een kleine accu slaat ongeveer 2 kWh op, een gangbare 6 kWh en een grote rond de 20 kWh. Een batterij die je nooit leeg krijgt kost geld zonder iets te doen, dus groter is niet beter.",
      },
      {
        q: "Werkt een thuisbatterij ook bij stroomuitval?",
        a: "Niet automatisch. Daar is een aparte voorziening voor nodig en lang niet elk systeem heeft die. Wil je noodstroom, zeg dat dan vooraf, want achteraf inbouwen kost een stuk meer werk.",
      },
      {
        q: "Zijn losse batterijen die je in het stopcontact prikt veilig?",
        a: "Die raden we af. Er kan dan meer stroom over de bedrading achter een groep gaan zonder dat de zekering uitschakelt, en die bedrading kan te heet worden. Laat een batterij vast aansluiten door een vakman.",
      },
      {
        q: "Hoe zit het met de milieu-impact?",
        a: "Het maken van een batterij kost veel energie en kritieke grondstoffen. Bij een keuze die je maakt om te verduurzamen hoort dat in de weging mee, naast wat de batterij je oplevert.",
      },
    ]}
    finalCtaKop="Benieuwd of het bij jou anders [[uitpakt]]?"
    finalCtaTekst="In een gratis gesprek rekenen we het door met jouw verbruik, je panelen en je contract, zodat je weet of een batterij bij jou nu al uit kan. Zo niet, dan zeggen we dat gewoon en kijken we wat wél helpt. Wij verkopen geen batterijen."
  />
);

export default Thuisbatterij;
