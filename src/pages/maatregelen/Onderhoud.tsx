import { Wrench } from "lucide-react";
import { MaatregelPagina } from "@/components/MaatregelPagina";
import { Onderhoudskalender } from "@/components/maatregel/onderhoud/Onderhoudskalender";
import { VerplichtOfGarantie } from "@/components/maatregel/onderhoud/VerplichtOfGarantie";
import { Storingssignalen } from "@/components/maatregel/onderhoud/Storingssignalen";
import { OPBRENGST } from "@/data/onderhoud";
import onderhoudImage from "@/assets/maatregel-onderhoud.webp";

/**
 * De zevende pagina, en de laatste die nog eigen opmaak had: een eigen
 * `Section`, andere paddings en een andere hero-typografie. Daardoor oogde hij
 * als een andere website, en zat er bovendien een zichtbare fout in: de eigen
 * donkere slotsectie stond direct boven de footer, die zijn eigen donkere
 * paneel met afgeronde bovenhoeken in een witte wikkel rendert. Precies in die
 * hoeken piepte het wit door. Door de slot-CTA via het template door te geven
 * (de `cta`-prop van `Footer`) zitten CTA en footer weer in één donker vlak.
 *
 * Zes inhoudelijke secties plus de FAQ:
 *
 *   1 de onderhoudskalender          (eigen)
 *   2 waar onderhoud echt uitmaakt   (template)
 *   3 waar dit staat in de route     (template)
 *   4 verplicht of alleen garantie   (eigen)
 *   5 wat onderhoud oplevert         (template)
 *     subsidiecheck
 *   6 waar je het aan merkt          (eigen)
 *
 * Inhoudelijk is dit een informatiepagina en verder niets. De belofte "wij
 * houden overzicht op het onderhoud van je installaties en koppelen je aan
 * vakkundige uitvoerders" is eraf: Voortraject doet niets met onderhoud. Wat
 * blijft is kennis, en een doorverwijzing naar het gesprek over de
 * verduurzamingsstappen zelf.
 *
 * "Zelf doen of uitbesteden" heeft geen eigen sectie meer. Dat is een
 * eigenschap van elke beurt en staat nu als merkteken in de kalender, waar je
 * het nodig hebt.
 */

const Onderhoud = () => (
  <MaatregelPagina
    slug="onderhoud"
    icon={Wrench}
    seoTitle="Onderhoud | Voortraject"
    seoDescription="Wat moet er wanneer gebeuren aan je ventilatie, zonnepanelen, warmtepomp en meterkast? Een onderhoudskalender met termijnen uit publieke bronnen, en het verschil tussen een wettelijke eis en je garantie."
    eigenSecties={[
      { na: "hero", bg: "wit", id: "kalender", inhoud: <Onderhoudskalender /> },
      { na: "route", bg: "wit", id: "verplicht", inhoud: <VerplichtOfGarantie /> },
      { na: "subsidies", bg: "warm", id: "signalen", inhoud: <Storingssignalen /> },
    ]}
    heroTitle="Onderhoud, zodat alles blijft [[presteren]]"
    heroSub="Verduurzamen stopt niet bij de oplevering. Ventilatie, zonnepanelen en alles met koudemiddel vragen periodiek aandacht, en een deel daarvan kun je prima zelf."
    heroIntro="Hieronder staat per installatie wat er wanneer moet gebeuren, met de termijnen die publieke bronnen ook echt noemen."
    heroImageSrc={onderhoudImage}
    heroImageAlt="Adviseur van Voortraject controleert de leidingen en ventilatie binnenshuis"
    heroImagePosition="center 35%"
    voorWieKop="Waar onderhoud echt [[uitmaakt]]"
    voorWieIntro="Niet elke installatie vraagt evenveel. We zijn er eerlijk over waar je aandacht loont en waar er weinig te doen valt."
    pastBij={[
      "Je hebt balansventilatie of mechanische afvoer: filters en kanalen vragen het meest van alle installaties",
      "Je hebt een warmtepomp of airco: alles met koudemiddel hoort bij een gecertificeerde monteur",
      "Je zonnepanelen liggen (bijna) plat, want dan spoelt de regen ze niet schoon",
      "Je centrale omvormer loopt tegen de twaalf jaar",
    ]}
    minderUrgent={[
      "Je zonnepanelen liggen steiler dan 20 graden: de regen doet het schoonmaakwerk",
      "Je hebt een thuisbatterij, want daar publiceert geen enkele bron een onderhoudsschema voor",
      "Je laadpaal doet het gewoon; verder dan de testknop van je aardlekschakelaar gaat het niet",
      "Je installatie is net opgeleverd en de eerste termijn is nog niet in zicht",
    ]}
    wanneerKop="Waar dit hoort in de route"
    routeTekst="Onderhoud is geen stap in de route maar de voorwaarde eronder. Een woning die je isoleert, van zonnepanelen voorziet en slim laat verwarmen, levert alleen jaren achtereen op wat je ervan verwacht als de installaties blijven doen waarvoor ze zijn neergezet. Vervuilde ventilatiefilters kosten je stroom terwijl je minder frisse lucht krijgt, en een omvormer die stilletjes achteruitgaat merk je pas op de jaarafrekening. Onderhoud is dus geen extra stap; het is het beschermen van de stappen die je al hebt gezet."
    kostenKop="Wat onderhoud [[oplevert]]"
    kostenItems={OPBRENGST.map((punt) => ({ title: punt.kop, body: punt.tekst }))}
    kostenFooter="Wij doen zelf geen onderhoud en verkopen geen onderhoudscontracten. Deze pagina staat er om je te laten zien wat er speelt, zodat je bij je eigen installateur de goede vragen stelt."
    faqs={[
      {
        q: "Hoe vaak moet mijn warmtepomp of airco onderhouden worden?",
        a: "Daar is geen algemeen antwoord op. Milieu Centraal zegt \"regelmatig\" en noemt bewust geen termijn, omdat het per toestel en per koudemiddel verschilt. Wat er wel staat: laat de binnen- en buitenunit schoonmaken en laat controleren of er koudemiddel lekt. De termijn die voor jouw toestel telt, staat in je eigen garantievoorwaarden.",
      },
      {
        q: "Is onderhoud wettelijk verplicht?",
        a: "Voor een woning schrijft de wet geen onderhoudstermijn voor. Wat de wet wel regelt is wie het werk mag doen: aan het koudemiddel van een warmtepomp of airco mag alleen iemand met een F-gassendiploma werken, en het installatiebedrijf heeft een BRL 100-certificaat nodig. Wordt er ook aan een cv-ketel gewerkt, dan komt CO-vrij erbij, en bij bodemwarmte BRL 6000-21 met SIKB 11000.",
      },
      {
        q: "Wat kan ik zelf doen en wat laat ik over aan een specialist?",
        a: "Zelf kun je de ventilatiefilters schoonmaken en vervangen, de roosters en ventielen schoonhouden, de omvormer stofvrij houden, de opbrengst van je zonnepanelen volgen en elk half jaar de testknop van je aardlekschakelaar indrukken. Naar een specialist gaat alles met koudemiddel, de ventilatiemotor en de kanalen, het inregelen van het ventilatiesysteem en het vervangen van de omvormer.",
      },
      {
        q: "Hoe vaak moet ik mijn ventilatiefilters vervangen?",
        a: "Bij balansventilatie met warmteterugwinning twee keer per jaar, en tussendoor minstens één keer schoonmaken met de stofzuiger. Vervuilde filters geven weerstand, waardoor de motor harder werkt en meer stroom verbruikt, en er kunnen schimmels en bacteriën worden meegeblazen. Heb je mechanische afvoer, maak dan minstens één keer per jaar de roosters en ventielen goed schoon.",
      },
      {
        q: "Moet ik mijn zonnepanelen schoonmaken?",
        a: "Meestal niet. Liggen ze onder een hoek van meer dan 20 graden, dan spoelt de regen ze vanzelf schoon. Bij een dak dat bijna plat ligt is het aan te raden ze minstens één keer per jaar schoon te maken. Belangrijker is dat je de opbrengst volgt: zakt die met meer dan 10 procent, laat panelen en omvormer dan nakijken.",
      },
      {
        q: "Regelt Voortraject het onderhoud voor mij?",
        a: "Nee. Wij begeleiden je door het verduurzamingstraject en houden ons niet bezig met onderhoud daarna. Deze pagina is er om je op weg te helpen. Zit je nog aan het begin en wil je weten welke stappen voor jouw woning logisch zijn, dan denken we in een gratis gesprek graag mee.",
      },
    ]}
    finalCtaKop="Nog aan het begin van je [[traject]]?"
    finalCtaTekst="Wij doen geen onderhoud, maar wel alles daarvoor: welke maatregelen bij jouw woning passen, in welke volgorde, en welke regelingen er voor jouw adres zijn. In een gratis gesprek zetten we dat op een rij."
  />
);

export default Onderhoud;
