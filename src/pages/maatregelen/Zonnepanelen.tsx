import { Sun } from "lucide-react";
import { MaatregelPagina } from "@/components/MaatregelPagina";
import zonnepanelenImage from "@/assets/maatregel-zonnepanelen.jpg";

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
    heroImageAlt="Zonnepanelen op een schuin dak"
    pastBij={[
      "Je een geschikt dak hebt met voldoende ruimte",
      "Je je energierekening structureel wilt verlagen",
      "Je nu of straks meer elektriciteit gaat gebruiken, bijvoorbeeld door een warmtepomp of elektrisch rijden",
      "Je woning al redelijk geisoleerd is",
    ]}
    minderUrgent={[
      "Je woning slecht geisoleerd is, isoleer dan eerst zodat je verbruik niet onnodig hoog is",
      "Je dak veel schaduw heeft of ongunstig ligt",
    ]}
    watValtEronder={[
      "Zonnepanelen op het dak of op een bijgebouw",
      "Omvormer en montagesysteem",
      "Optioneel slim gebruik door combinatie met een thuisbatterij of energiemanagement",
    ]}
    routeStep="opwekken"
    routeTekst="Zonnepanelen werken het beste in een al goed geisoleerde woning. Dan verbruik je minder dan je opwekt, in plaats van andersom. Daarom komt opwekken in de route na het beperken van je verbruik. Wil je nog meer uit je panelen halen, dan volgt slim gebruik, bijvoorbeeld met een thuisbatterij of door je verbruik te verschuiven naar momenten dat de zon schijnt."
    kostenItems={[
      {
        title: "Dakrichting en hellingshoek",
        body: "Een dak op het zuiden met een hellingshoek van ongeveer 30 graden levert het meeste op. Oost en west werken vaak ook prima, maar noord is minder gunstig. De exacte opbrengst hangt af van jouw situatie.",
      },
      {
        title: "Schaduw van bomen of schoorstenen",
        body: "Schaduw kan de opbrengst flink verminderen. Met optimizers of micro-omvormers kun je dit deels opvangen, maar volledig schaduwvrij is altijd beter. Wij kijken mee of jouw dak geschikt is.",
      },
      {
        title: "Je eigen verbruik en hoeveel je zelf gebruikt",
        body: "Hoe meer van je eigen opwek je zelf gebruikt, hoe sneller de panelen zich terugverdienen. Zelf verbruiken wordt steeds belangrijker door de afbouw van de salderingsregeling.",
      },
      {
        title: "Het aantal panelen en de kwaliteit",
        body: "Meer panelen en betere kwaliteit geven meer opbrengst. Het is verstandig om niet alleen naar nu te kijken, maar ook naar je verwachte verbruik over een paar jaar.",
      },
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
        q: "Zijn zonnepanelen nu nog wel rendabel?",
        a: "Ja. De prijzen zijn de afgelopen jaren flink gedaald en de opbrengst per paneel is juist gestegen. Voor de meeste woningen blijven zonnepanelen een verstandige investering, zeker als je ze combineert met de juiste isolatie en je verbruik.",
      },
      {
        q: "Wat gebeurt er met de salderingsregeling?",
        a: "Met saldering mag je de stroom die je teruglevert verrekenen met je verbruik. Deze regeling verandert in de komende jaren stapsgewijs. Daarom wordt het slimmer om opgewekte stroom zoveel mogelijk zelf te gebruiken, bijvoorbeeld met een thuisbatterij of door je verbruik te verschuiven.",
      },
      {
        q: "Hoeveel panelen heb ik nodig?",
        a: "Dat hangt af van je jaarverbruik, je dak en je toekomstplannen zoals een warmtepomp of elektrisch rijden. Het is verstandig niet alleen naar nu te kijken, maar ook naar je verwachte verbruik over een paar jaar.",
      },
      {
        q: "Werkt mijn dak voor zonnepanelen?",
        a: "De opbrengst hangt af van de richting, de hellingshoek en schaduw van bomen of schoorstenen. Een dak op het zuiden levert het meeste op, maar oost en west werken vaak ook prima. Wij kijken mee of jouw dak geschikt is.",
      },
    ]}
    finalCtaKop="Benieuwd wat jouw dak kan [[opleveren]]?"
    finalCtaTekst="In een gratis gesprek kijken we naar je dak, je verbruik en je toekomstplannen, en vertellen we eerlijk wat zonnepanelen voor jou opleveren en hoe je ze slim combineert. Wij verkopen geen panelen en koppelen je alleen aan vakkundige uitvoerders."
  />
);

export default Zonnepanelen;
