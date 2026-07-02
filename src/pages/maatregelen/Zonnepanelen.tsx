import { Sun } from "lucide-react";
import { MaatregelPagina } from "@/components/MaatregelPagina";
import zonnepanelenImage from "@/assets/maatregel-zonnepanelen.webp";

const Zonnepanelen = () => (
  <MaatregelPagina
    slug="zonnepanelen"
    icon={Sun}
    badge="Vaak vervolgstap"
    seoTitle="Zonnepanelen | Voortraject"
    seoDescription="Zelf stroom opwekken met zonnepanelen. Wanneer is het slim, waar moet je op letten en welke regelingen zijn er rond salderen en terugleveren?"
    heroTitle="Zonnepanelen, stroom die [[loont]]"
    heroSub="Ook nu nog een rendabele keuze voor de meeste woningen, zeker in de juiste volgorde. Je haalt er het meeste uit na isolatie en in slimme combinatie met opslag of een warmtepomp."
    heroIntro=""
    heroImageSrc={zonnepanelenImage}
    heroImageAlt="Adviseur van Voortraject controleert de zonnepanelen op het dak van een woning"
    heroImagePosition="center"
    pastBij={[
      "Je een geschikt dak hebt met voldoende ruimte",
      "Je je energierekening structureel wilt verlagen",
      "Je nu of straks meer elektriciteit gaat gebruiken, bijvoorbeeld door een warmtepomp of elektrisch rijden",
      "Je woning al redelijk geisoleerd is",
    ]}
    minderUrgent={[
      "Je dak binnen enkele jaren vervangen moet worden; combineer de plaatsing dan met die vervanging",
      "Je dak veel schaduw heeft of ongunstig ligt",
      "Je binnenkort verhuist en de panelen niet meeneemt",
    ]}
    watValtEronder={[
      "Zonnepanelen op het dak of op een bijgebouw",
      "Omvormer en montagesysteem",
      "Optioneel slim gebruik door combinatie met een thuisbatterij of energiemanagement",
    ]}
    routeStep="opwekken"
    routeTekst="Zonnepanelen werken het beste in een al goed geisoleerde woning. Dan verbruik je minder dan je opwekt, in plaats van andersom. Daarom komt opwekken in de route na het beperken van je verbruik. Wil je nog meer uit je panelen halen, dan volgt slim gebruik, bijvoorbeeld met een thuisbatterij of door je verbruik te verschuiven naar momenten dat de zon schijnt."
    kostenMode="single"
    kostenItems={[
      {
        title: "Zonnepanelen",
        body: "De opbrengst hangt af van dakrichting, hellingshoek, schaduw en hoeveel van je opwek je zelf gebruikt. Voor de meeste woningen blijft het, in de juiste volgorde, een rendabele keuze.",
      },
    ]}
    kostenSinglePills={[
      { dim: "Investering", value: "Gemiddeld" },
      { dim: "Terugverdientijd", value: "Gemiddeld" },
      { dim: "Besparing", value: "Hoog" },
    ]}
    kostenFooter="Hoe meer van je eigen opwek je zelf gebruikt, hoe sneller de panelen zich terugverdienen. De terugverdientijd ligt gebruikelijk enkele jaren tot rond de zeven jaar, afhankelijk van je situatie."
    zachteCtaTekst="Benieuwd wat jouw dak kan opleveren? Plan een gesprek"
    zachteCtaLabel="Plan een gesprek"
    aandachtspunten={[
      "De terugverdientijd hangt sterk af van dakrichting, hellingshoek en schaduw",
      "Kijk niet alleen naar je huidige verbruik, maar ook naar je verwachte verbruik over een paar jaar",
      "De salderingsregeling verandert stapsgewijs, zelf verbruiken wordt daardoor steeds belangrijker",
      "Kies een vakkundige installateur voor een veilige en nette montage",
    ]}
    subsidiesIntro="Met saldering mag je teruggeleverde stroom verrekenen met je verbruik. Deze regeling wordt de komende jaren stapsgewijs afgebouwd. Daardoor wordt het slimmer om opgewekte stroom zoveel mogelijk zelf te gebruiken, bijvoorbeeld met een thuisbatterij of door je verbruik te verschuiven. Wij rekenen voor jouw situatie uit wat verstandig is. Daarnaast gelden de volgende regelingen:"
    subsidiesItems={[
      "Zonnepanelen zijn op dit moment vrijgesteld van btw voor particulieren, je betaalt geen btw over aanschaf en installatie",
      "In sommige gemeenten gelden aanvullende regelingen",
    ]}
    faqs={[
      {
        q: "Is mijn dak geschikt voor zonnepanelen?",
        a: "Richting, hellingshoek, schaduw en ruimte bepalen of en hoeveel panelen er kunnen. Een dak op het zuiden is ideaal, maar ook oost-west levert prima op. We beoordelen het voor jouw dak.",
      },
      {
        q: "Wat brengen zonnepanelen gemiddeld op?",
        a: "Dat verschilt per woning, dak en verbruik. Voor de meeste woningen blijven ze een rendabele keuze; in een gratis gesprek rekenen we het voor jouw situatie door.",
      },
      {
        q: "Wat betekent de afbouw van de salderingsregeling voor mij?",
        a: "Saldering wordt de komende jaren afgebouwd, waardoor terugleveren minder oplevert. Daardoor wordt het slimmer om je eigen stroom direct te gebruiken, bijvoorbeeld met een thuisbatterij of warmtepomp.",
      },
      {
        q: "Wat is het verschil tussen een string-omvormer en micro-omvormers?",
        a: "Een string-omvormer zet de stroom van meerdere panelen samen om, micro-omvormers doen dat per paneel. Micro-omvormers presteren beter bij schaduw of een verdeeld dak; wat in jouw situatie het slimst is, bekijken we samen.",
      },
      {
        q: "Heb ik een vergunning nodig voor zonnepanelen?",
        a: "Voor de meeste woningen niet. Bij monumenten of een beschermd stadsgezicht gelden soms uitzonderingen; dat checken we voor je.",
      },
    ]}
    finalCtaKop="Benieuwd wat jouw dak kan [[opleveren]]?"
    finalCtaTekst="In een gratis gesprek kijken we naar je dak, je verbruik en je toekomstplannen, en vertellen we eerlijk wat zonnepanelen voor jou opleveren en hoe je ze slim combineert. Wij verkopen geen panelen en koppelen je alleen aan vakkundige uitvoerders."
  />
);

export default Zonnepanelen;
