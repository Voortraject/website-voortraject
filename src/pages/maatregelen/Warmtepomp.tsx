import { Thermometer } from "lucide-react";
import { MaatregelPagina } from "@/components/MaatregelPagina";
import { HybrideOfElektrisch } from "@/components/maatregel/warmtepomp/HybrideOfElektrisch";
import { KlaarVoorWarmtepomp } from "@/components/maatregel/warmtepomp/KlaarVoorWarmtepomp";
import { GeluidPlaatsingVakmanschap } from "@/components/maatregel/warmtepomp/GeluidPlaatsingVakmanschap";
import { euro, getal, PRIJSPEIL, SYSTEMEN, type Systeem } from "@/data/warmtepomp";
import warmtepompImage from "@/assets/maatregel-warmtepomp.webp";

/**
 * Zes inhoudelijke secties plus de FAQ, zoals afgesproken voor alle pagina's
 * onder /verduurzamen:
 *
 *   1 hybride of volledig elektrisch   (eigen)
 *   2 past dit bij jouw woning         (template)
 *   3 waar dit staat in de route       (template)
 *   4 is jouw woning er klaar voor     (eigen)
 *   5 wat het kost en oplevert         (template)
 *     subsidiecheck
 *   6 geluid, plaatsing en vakmanschap (eigen)
 *
 * De achtergronden lopen daarmee zand, wit, warm, navy, wit, zand, warm, zand.
 * src/test/maatregelPagina.test.tsx bewaakt zowel het aantal secties als dat er
 * nooit twee dezelfde achtergronden naast elkaar komen.
 *
 * Wat er bewust níét meer op staat: ISDE. Die regeling geldt niet in Groningen
 * en Noord-Drenthe, dus een groot deel van de bezoekers heeft er niets aan. De
 * pagina rekent daarom vóór subsidie en laat de vraag "wat krijg ik" naar het
 * adres lopen, via de subsidiecheck.
 */

/** De rekensom van Milieu Centraal, in woorden, uit de datamodule. */
const rekenvoorbeeld = (s: Systeem) => {
  const { voor, na } = s.referentie;
  const verschil = voor.kosten - na.kosten;
  const naVerbruik = na.gas > 0 ? `${getal(na.gas)} m³ gas en ${getal(na.stroom)} kWh stroom` : `${getal(na.stroom)} kWh stroom`;

  return [
    `Nu ${getal(voor.gas)} m³ gas en ${getal(voor.stroom)} kWh stroom, samen ${euro(voor.kosten)} per jaar.`,
    `Daarna ${naVerbruik}, samen ${euro(na.kosten)}.`,
    `Dat scheelt ongeveer ${euro(verschil)} per jaar, tegenover een aanschaf van ${euro(s.aanschaf)} vóór subsidie.`,
    s.referentie.noot,
  ]
    .filter(Boolean)
    .join(" ");
};

const Warmtepomp = () => (
  <MaatregelPagina
    slug="warmtepomp"
    icon={Thermometer}
    seoTitle="Warmtepomp | Voortraject"
    seoDescription="Hybride of volledig elektrisch: wat past bij jouw woning? Met de eisen per systeem, de test waarmee je zelf checkt of je huis er klaar voor is, en de geluidsnorm voor de buitenunit."
    eigenSecties={[
      { na: "hero", bg: "wit", id: "keuze", inhoud: <HybrideOfElektrisch /> },
      { na: "route", bg: "wit", id: "klaar-voor", inhoud: <KlaarVoorWarmtepomp /> },
      { na: "subsidies", bg: "warm", id: "geluid", inhoud: <GeluidPlaatsingVakmanschap /> },
    ]}
    heroTitle="Warmtepomp, [[comfort]] zonder gas"
    heroSub="Verwarmen zonder gas, mits je woning er klaar voor is. In een goed geïsoleerde woning is een warmtepomp een efficiënte stap, en de keuze tussen hybride en volledig elektrisch hangt af van je woning en einddoel."
    heroIntro=""
    heroImageSrc={warmtepompImage}
    heroImageAlt="Adviseur van Voortraject bekijkt de installatie en instellingen binnenshuis"
    heroImagePosition="center 30%"
    pastBij={[
      "Je van het gas af wilt, stap voor stap met een hybride of in één keer volledig elektrisch",
      "Je woning al redelijk geïsoleerd is, of je nog isoleert en met een hybride wilt starten",
      "Je lagetemperatuurverwarming hebt of wilt, zoals vloerverwarming; vooral van belang bij volledig elektrisch",
      "Je cv-ketel binnenkort aan vervanging toe is",
    ]}
    minderUrgent={[
      "Je geen ruimte hebt voor een buitenunit binnen de geluidsnormen",
      "Je woning nog slecht geïsoleerd is en je in één keer volledig elektrisch wilt; isoleer dan eerst of begin met een hybride",
      "Je oude radiatoren met hoge aanvoertemperaturen niet wilt aanpassen; volledig elektrisch past dan niet, een hybride vaak wel",
      "Je op zeer korte termijn verhuist",
    ]}
    routeStep="slim"
    routeTekst="Een warmtepomp rendeert pas goed als de eerdere stappen zijn gezet. In een goed geïsoleerde woning werkt een warmtepomp efficiënt en betaalbaar. In een slecht geïsoleerde woning verbruikt hij veel en vallen de kosten tegen. Daarom is isolatie bijna altijd de eerste stap en komt slim verwarmen daarna. Een hybride warmtepomp kan een goede tussenstap zijn als volledig elektrisch nog niet haalbaar is."
    kostenItems={SYSTEMEN.map((s) => ({
      title: `${s.naam} in een ${s.referentie.woning}`,
      body: rekenvoorbeeld(s),
    }))}
    kostenFooter={`Deze twee sommen gaan over twee verschillende woningen: Milieu Centraal rekent de hybride door in een matig geïsoleerde hoekwoning en de volledig elektrische in een goed geïsoleerde. Dat is geen slordigheid maar precies waar de keuze aan hangt. Gerekend met ${PRIJSPEIL}, en vóór subsidie: wat jij krijgt hangt van je adres af.`}
    faqs={[
      {
        q: "Is mijn woning geschikt voor een warmtepomp?",
        a: "Dat hangt vooral af van je isolatie en je type verwarming. In een goed geïsoleerde woning met lagetemperatuurverwarming werkt een warmtepomp het best; is je woning daar nog niet klaar voor, dan kan een hybride een logische tussenstap zijn. Je kunt het zelf uitproberen door je cv-ketel een winter lang op 50 graden te zetten en te kijken of het comfortabel blijft.",
      },
      {
        q: "Wat is het verschil tussen een hybride en een volledig elektrische warmtepomp?",
        a: "Een hybride werkt samen met je cv-ketel en vervangt 60 tot 70 procent van je gasverbruik voor verwarmen. Een volledig elektrische warmtepomp doet de verwarming en het warme water in zijn eentje, waardoor de gasaansluiting eruit kan. Die vraagt wel een redelijk tot goed geïsoleerde woning en een verwarming die uit de voeten kan met water van maximaal 45 tot 55 graden.",
      },
      {
        q: "Maken warmtepompen veel geluid?",
        a: "Er geldt een harde norm: op de perceelgrens mag een buitenunit in de avond en de nacht niet meer dan 40 dB laten horen, en onder voorwaarden overdag 45 dB. Dat staat in het Besluit bouwwerken leefomgeving. De afstand tot de grens is dus niet het criterium, wat telt is hoeveel geluid daar overblijft. Van de mensen met een warmtepomp heeft 72 procent er nooit last van; klachten komen vrijwel altijd door de plek waar de unit staat.",
      },
      {
        q: "Heb ik een vergunning nodig voor de buitenunit?",
        a: "Meestal niet, maar de geluidseis op de perceelgrens geldt altijd en gemeenten kunnen aanvullende regels hebben over plaatsing en aanzicht. We zorgen dat de uitvoerder daar rekening mee houdt en checken het bij twijfel voor jouw situatie.",
      },
      {
        q: "Kom ik in aanmerking voor subsidie of Nij Begun?",
        a: "Vaak wel, maar welke regeling voor jou geldt hangt van je adres af. In Groningen en Noord-Drenthe loopt dat anders dan in de rest van het land, en gemeenten hebben er geregeld nog een eigen regeling naast. Alle bedragen op deze pagina staan daarom vóór subsidie. Doe de subsidiecheck met je postcode, dan zie je wat er voor jouw woning is.",
      },
      {
        q: "Zit ik vast aan een bepaald merk?",
        a: "Nee. Wij zijn onafhankelijk en niet gebonden aan één merk of leverancier. We kijken puur naar wat het beste bij jouw woning en budget past.",
      },
    ]}
    finalCtaKop="Is jouw woning klaar voor een [[warmtepomp]]?"
    finalCtaTekst="In een gratis gesprek kijken we naar je isolatie, je verwarming en je woning, en vertellen we eerlijk of een warmtepomp nu logisch is of dat andere stappen eerst slimmer zijn. Wij verkopen geen installaties en koppelen je alleen aan gecertificeerde uitvoerders."
  />
);

export default Warmtepomp;
