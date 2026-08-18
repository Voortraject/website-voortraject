/**
 * Cijfers voor de thuisbatterijpagina.
 *
 * Dit is de eerlijkste pagina van de zeven, want de bron is ongewoon stellig:
 * Milieu Centraal schrijft dat een thuisbatterij op dit moment niet helpt als
 * je geld wilt besparen of het klimaat wilt helpen. Dat verzwijgen zou precies
 * de verkoperij zijn waar Voortraject niet aan doet, dus het staat bovenaan de
 * pagina in plaats van in een voetnoot.
 *
 * Let op wat er níét staat: een terugverdientijd in jaren. De bron geeft die
 * niet en een eigen berekening zou een verzonnen getal zijn.
 */

export interface Bron {
  naam: string;
  url: string;
  gecontroleerd: string;
}

const GECONTROLEERD = "10 augustus 2026";

export const BRONNEN = {
  batterij: {
    naam: "Milieu Centraal",
    url: "https://www.milieucentraal.nl/energie-besparen/zonnepanelen/thuisbatterij-zonne-energie-opslaan/",
    gecontroleerd: GECONTROLEERD,
  },
  analyse: {
    naam: "Milieu Centraal",
    url: "https://www.milieucentraal.nl/persberichten/thuisbatterijen-hoeveel-voordeel-is-er-echt-te-behalen/",
    gecontroleerd: GECONTROLEERD,
  },
  saldering: {
    naam: "Rijksoverheid",
    url: "https://www.rijksoverheid.nl/themas/klimaat-milieu-en-natuur/energie-thuis/salderingsregeling",
    gecontroleerd: GECONTROLEERD,
  },
} as const satisfies Record<string, Bron>;

/**
 * Het antwoord op "loont het?": eerst waarvoor een batterij nu al zinvol is, dan
 * wat de bron over terugverdienen zegt. De kern blijft het oordeel van Milieu
 * Centraal, alleen niet meer als afrader geformuleerd: dezelfde batterij is bij
 * netcongestie of noodstroom juist wel een verstandige keuze.
 */
export const OORDEEL = {
  kop: "Nu al zinvol bij noodstroom, een dynamisch contract of een vol net",
  kern: "Puur op je stroomrekening verdien je een thuisbatterij op dit moment hoogstwaarschijnlijk niet terug, dus wie er nu een neemt doet dat om wat hij verder oplevert.",
  bron: "Milieu Centraal",
} as const;

/** Capaciteiten die je in de praktijk tegenkomt. */
export const CAPACITEITEN = [
  { label: "Klein", kwh: "2 kWh", waarvoor: "Een deel van je avondverbruik overbruggen." },
  { label: "Gangbaar", kwh: "6 kWh", waarvoor: "Ongeveer de opwek van een zonnige dag opslaan voor 's avonds." },
  { label: "Groot", kwh: "20 kWh", waarvoor: "Meerdere dagen overbruggen of handelen op de stroommarkt." },
] as const;

/** Wat er wél verandert, en waarom je er toch over hoort. */
export const ONTWIKKELINGEN = [
  {
    kop: "Salderen stopt",
    tekst: "Vanaf 1 januari 2027 kun je teruggeleverde stroom niet meer wegstrepen tegen je verbruik.",
  },
  {
    kop: "Terugleverkosten",
    tekst: "Leveranciers rekenen kosten voor het verwerken van stroom die je teruglevert.",
  },
  {
    kop: "Het net raakt vol",
    tekst: "Netcongestie maakt terugleveren op drukke momenten minder vanzelfsprekend.",
  },
  {
    kop: "Dynamische contracten",
    tekst: "Met een uurprijs kun je laden als stroom goedkoop is en gebruiken als hij duur is.",
  },
] as const;

/** Wat op dit moment meer oplevert dan opslaan. */
export const EERST_DIT = [
  {
    label: "Isolatie",
    href: "/verduurzamen/isolatie",
    tekst: "Verlaagt je verbruik direct, en dat is elke euro waard.",
  },
  {
    label: "Warmtepomp",
    href: "/verduurzamen/warmtepomp",
    tekst: "Verhoogt je zelfverbruik het hele jaar door.",
  },
  {
    label: "Slim laden",
    href: "/verduurzamen/laadpaal",
    tekst: "Rijd je elektrisch, dan is je auto de goedkoopste accu die je hebt.",
  },
] as const;

/** Situaties waarin de rekensom er anders uitziet. */
export const UITZONDERINGEN = [
  {
    kop: "Je handelt op de stroommarkt",
    tekst: "Met een dynamisch contract koop je in als de prijs laag is en gebruik je als hij hoog is. Dat vraagt wel een contract met uurprijzen en een systeem dat er zelf op stuurt.",
  },
  {
    kop: "Je wilt stroom houden bij een storing",
    tekst: "Als noodstroom voor jou de reden is, is dat een andere afweging dan terugverdienen. Let op: lang niet elke batterij kan het, daar is een aparte voorziening voor nodig.",
  },
  {
    kop: "Je kunt niet of nauwelijks terugleveren",
    tekst: "Op plekken met netcongestie is teruglevering soms beperkt. Dan is opslaan geen besparing maar de enige manier om je opwek te gebruiken.",
  },
] as const;

/** Waar je op let als je er toch een neemt. */
export const LETTEN = [
  {
    kop: "Geen stekkerbatterij",
    tekst:
      "Een batterij die je in het stopcontact prikt kan meer stroom over de bedrading achter een groep sturen zonder dat de zekering uitschakelt. De bedrading kan dan te heet worden. Laat hem vast aansluiten.",
  },
  {
    kop: "Kies de maat op je avondverbruik",
    tekst:
      "Groter is niet beter. Een batterij die je nooit leeg krijgt, kost geld zonder iets te doen. Reken vanaf wat je 's avonds en 's nachts gebruikt.",
  },
  {
    kop: "Vraag naar de back-upfunctie",
    tekst:
      "Werken bij stroomuitval is geen standaardeigenschap. Wil je dat, zeg het dan vooraf, want achteraf inbouwen kost een stuk meer werk.",
  },
  {
    kop: "Laat het aansluiten door een vakman",
    tekst:
      "De aansluiting op je meterkast bepaalt de veiligheid en je garantie. Vraag om de papieren van de installateur.",
  },
] as const;

/** De milieukant, want die telt bij een verduurzamingsvraag ook mee. */
export const MILIEU =
  "Het maken van de batterij is erg milieubelastend: het kost veel energie en kritieke grondstoffen. Bij een keuze die je maakt om te verduurzamen hoort dat in de weging mee.";
