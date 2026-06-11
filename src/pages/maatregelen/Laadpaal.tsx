import { Plug } from "lucide-react";
import { MaatregelPagina } from "@/components/MaatregelPagina";
import laadpaalImage from "@/assets/maatregel-laadpaal.jpg";

const Laadpaal = () => (
  <MaatregelPagina
    slug="laadpaal"
    icon={Plug}
    seoTitle="Laadpaal | Voortraject"
    seoDescription="Een eigen laadpaal thuis is voordeliger en veiliger dan openbaar laden. Welke past bij jouw situatie en hoe combineer je hem met zonnepanelen?"
    heroTitle="Laadpaal, thuis laden op je [[eigen]] terrein"
    heroSub="Voordeliger en veiliger dan een openbaar laadpunt, zeker in combinatie met zonnepanelen."
    heroIntro="Met een eigen laadpaal laad je je elektrische auto thuis tegen je eigen stroomtarief, wat meestal goedkoper is dan openbaar laden. Heb je zonnepanelen, dan kun je voor een deel op je eigen opgewekte stroom laden. Een vaste laadpaal is bovendien veiliger dan een gewoon stopcontact."
    heroImageSrc={laadpaalImage}
    heroImageAlt="Laadpaal naast een elektrische auto op een oprit"
    pastBij={[
      "Je een elektrische auto hebt of binnenkort gaat rijden",
      "Je een eigen oprit, garage of parkeerplek hebt",
      "Je goedkoper en veiliger wilt laden dan bij een openbaar punt",
      "Je je laden wilt combineren met je eigen zonne-energie",
    ]}
    minderUrgent={[
      "Je geen eigen parkeerplek op eigen terrein hebt",
      "Je nauwelijks rijdt en openbaar laden voor jou volstaat",
    ]}
    watValtEronder={[
      "1-fase laadpaal voor een eenvoudige aansluiting",
      "3-fase laadpaal voor sneller laden bij hoger vermogen",
      "Slim laden, met voorrang voor je eigen zonne-energie",
      "Load balancing, dat het vermogen veilig verdeelt over je huis en de laadpaal",
    ]}
    wanneerKop="Wanneer is dit relevant?"
    routeTekst="Een laadpaal is relevant zodra je elektrisch gaat rijden en een eigen plek hebt om te laden. Hij staat los van de verduurzamingsroute van je woning, maar werkt er wel goed mee samen. Heb je zonnepanelen, dan kun je je auto deels op eigen opwek laden. Heb je ook een thuisbatterij, dan kun je laden en opslag slim op elkaar afstemmen. Zo haal je meer uit je eigen energie."
    kostenItems={[
      {
        title: "Het type laadpaal",
        body: "1-fase is geschikt voor een eenvoudige aansluiting, 3-fase laadt sneller en vraagt meer vermogen.",
      },
      {
        title: "De afstand tussen meterkast en laadplek",
        body: "Een grotere afstand betekent meer kabel en arbeid. Soms is een andere route door de tuin of langs de gevel mogelijk.",
      },
      {
        title: "Eventuele aanpassingen in de meterkast",
        body: "Bij 3-fase of load balancing kan je meterkast extra ruimte of een zwaardere aansluiting nodig hebben.",
      },
      {
        title: "Slim laden of load balancing",
        body: "Slim laden koppelt je laadpaal aan je zonnepanelen. Load balancing verdeelt het vermogen veilig over huis en auto.",
      },
    ]}
    kostenFooter="Thuisladen tegen je eigen tarief is meestal goedkoper dan openbaar laden, en met zonnepanelen laad je een deel op je eigen stroom."
    zachteCtaTekst="Benieuwd welke laadpaal bij jouw situatie past? Plan een gesprek"
    aandachtspunten={[
      "Kies tussen 1-fase en 3-fase op basis van je meterkast en je auto",
      "Load balancing voorkomt dat je boven de capaciteit van je aansluiting komt",
      "Een vaste laadpaal is veiliger dan laden via een stopcontact",
      "De installatie moet volgens de NEN-normen worden uitgevoerd",
    ]}
    keurmerken={{
      kop: "Let op [[normen]] en certificeringen",
      intro:
        "Een laadpaal wordt vast aangesloten op je elektrische installatie. Werk daarom alleen met vakkundige installateurs:",
      items: [
        "Installatie volgens de geldende NEN-normen",
        "STEK-gecertificeerde of erkende monteurs",
      ],
      voetregel:
        "Wij koppelen je alleen aan uitvoerders die dit op orde hebben.",
    }}
    combineren={{
      kop: "Combineren met andere maatregelen",
      tekst: "Een laadpaal werkt het beste samen met zonnepanelen en eventueel een thuisbatterij. Met slim laden gebruik je je eigen opgewekte stroom voor je auto.",
      links: [
        { label: "Bekijk zonnepanelen", href: "/verduurzamen/zonnepanelen" },
        { label: "Bekijk thuisbatterij", href: "/verduurzamen/thuisbatterij" },
      ],
    }}
    faqs={[
      {
        q: "Is thuisladen voordeliger dan een openbare laadpaal?",
        a: "Meestal wel. Thuis laad je tegen je eigen stroomtarief, wat doorgaans goedkoper is dan een openbaar laadpunt. Heb je zonnepanelen, dan kun je voor een deel op je eigen opgewekte stroom laden, wat het nog gunstiger maakt.",
      },
      {
        q: "Kan ik mijn laadpaal koppelen aan zonnepanelen?",
        a: "Ja. Met slim laden kan de laadpaal voorrang geven aan je eigen zonne-energie, zodat je de auto zoveel mogelijk op eigen opwek laadt in plaats van op stroom van het net.",
      },
      {
        q: "Wat is het verschil tussen een 1-fase en een 3-fase laadpaal?",
        a: "Een 1-fase laadpaal laadt langzamer en past bij een eenvoudige aansluiting. Een 3-fase laadpaal laadt sneller en is geschikter bij hoger vermogen of als je de auto snel vol wilt hebben. Wat past, hangt af van je meterkast en je auto.",
      },
      {
        q: "Is een laadpaal veilig?",
        a: "Ja. Een vaste laadpaal is veiliger dan een gewoon stopcontact, omdat hij de belasting bewaakt en bij oververhitting automatisch stopt. Belangrijk is een installatie volgens de NEN-normen door een gecertificeerde monteur.",
      },
      {
        q: "Wat is load balancing?",
        a: "Load balancing verdeelt het beschikbare vermogen slim over je huis en de laadpaal, zodat je niet boven de capaciteit van je aansluiting komt. Zo voorkom je dat de zekeringen eruit vliegen als er veel tegelijk aan staat.",
      },
    ]}
    finalCtaKop="Benieuwd welke laadpaal bij jou [[past]]?"
    finalCtaTekst="In een gratis gesprek kijken we naar je auto, je meterkast en je wensen, en vertellen we eerlijk welke laadpaal logisch is en hoe je hem slim combineert met zonnepanelen. Wij verkopen geen laadpalen en koppelen je alleen aan vakkundige uitvoerders."
  />
);

export default Laadpaal;
