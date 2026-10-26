// ⚠️ KOPIE — bron van waarheid is src/lib/subsidies/postcodegebieden.ts.
// Gegenereerd, niet met de hand bewerken: zie de kop van tekst.ts hiernaast.

// Waar een regeling écht geldt, als het kleiner is dan wat Milieu Centraal
// aangeeft. Puur data, met opzet zonder imports: de site (Vite), de edge
// function (Deno, als kopie) en de wekelijkse controle (Node) lezen dit bestand
// alle drie rechtstreeks.
//
// Waarom dit nodig is. Milieu Centraal koppelt een regeling aan hele gemeenten
// of een hele provincie, ook als de aanbieder hem beperkt tot een lijst
// postcodes. VVG € 10.000 stond zo bij 116 postcodegebieden die niet op de lijst
// van SNN staan, waaronder 9367 (De Wilp). Gemeten op 2026-10-26 over alle 988
// postcodegebieden in Groningen, Drenthe en Friesland; zie tasks/todo.md.
//
// De correcties kunnen alleen wéghalen of een voorwaarde toevoegen, nooit iets
// bijzetten. Zet Milieu Centraal de koppeling ooit zelf goed, dan doet de regel
// hier gewoon niets meer.
//
// POSTCODELIJST BIJWERKEN (SNN publiceert een nieuwe PDF):
//  1. De wekelijkse controle (scripts/controleer-gebiedscorrecties.mjs) faalt
//     dan met "nieuwe postcodelijst". Je kunt hem ook zelf draaien:
//     `node scripts/controleer-gebiedscorrecties.mjs`.
//  2. Open de nieuwe PDF via `bronPagina` en neem de postcodes over in
//     `postcodes`, precies zoals ze in de PDF staan ("9461", "7741 AG" of
//     "7741 AA t/m AE").
//  3. Zet `bron`, `versie`, `vastgesteld` en `sha256` (`sha256sum <pdf>`) op de
//     nieuwe waarden.
//  4. Pas het verwachte aantal aan in src/test/gebiedscorrecties.test.tsx.
//  5. Maak de kopie voor de edge function, test, en deploy:
//     `node scripts/kopieer-gebiedscorrecties.mjs` (niet met de hand kopiëren:
//     de kopie heeft een eigen kop en `.ts`-imports), dan `bun run test`, dan
//     `bunx supabase functions deploy subsidiecheck --project-ref lfelnfukbrxznkevnevr`.
//     De site past de correcties ook zelf toe, maar de mail en het CRM lezen
//     alleen de function, dus die deploy is nodig.

export type Postcodegebied = {
  /** Voor wie dit leest: welk gebied dit is. */
  naam: string;
  /** Het document waar de postcodes uit komen. */
  bron: string;
  /** De pagina die naar `bron` linkt. De controle kijkt of die link nog dezelfde is. */
  bronPagina?: string;
  /** Versie zoals de bron hem noemt, of hoe wij hem herkennen. */
  versie: string;
  /** Wanneer wij de lijst hebben overgenomen en gecontroleerd. */
  vastgesteld: string;
  /** Vingerafdruk van de PDF, zodat de controle ook een stille vervanging ziet. */
  sha256?: string;
  /** "9461" (een heel gebied), "7741 AG" (één postcode) of "7741 AA t/m AE" (een reeks). */
  postcodes: string[];
};

export type Gebiedscorrectie = {
  /** Onze id's, de slug uit de Url van Milieu Centraal. */
  regelingen: string[];
  /** Alleen tonen in dit gebied. */
  alleenIn?: Postcodegebied;
  /** Niet tonen in dit gebied. */
  nietIn?: Postcodegebied;
  /**
   * Een voorwaarde die we niet uit het adres kunnen halen. Komt op de kaart als
   * "Alleen als …", en de regeling telt niet mee in de bedrag-teaser.
   */
  alleenAls?: string;
  /** Waarom, met de bron. */
  waarom: string;
};

// 170 postcodes, versie "VVG 3 - 26-02". Op 2026-10-26 regel voor regel
// vergeleken met de PDF. Let op: 9474, 9479 (Tynaarlo) en 9512 (Aa en Hunze)
// liggen in Drenthe. Dezelfde lijst geldt voor de zakelijke variant: de pagina
// van SNN linkt naar dezelfde PDF.
export const VVG_10000: Postcodegebied = {
  naam: "Aangewezen postcodegebied Verduurzaming en Verbetering Groningen € 10.000",
  bron:
    "https://www.snn.nl/sites/default/files/documents/Postcodelijst%20Verbetering%20en%20Verduurzaming%20Groningen%2010.000%20%28VVG%203%20-%2026-02%29.pdf",
  bronPagina:
    "https://www.snn.nl/subsidies-voor-particulieren/subsidie-verduurzaming-en-verbetering-groningen-eur-10000",
  versie: "VVG 3 - 26-02",
  vastgesteld: "2026-10-26",
  sha256: "cd4994f007bab715688b711510f91863685bd678852ac9b1ccf16f374025188b",
  postcodes: [
    "9474", "9479", "9512",
    "9601", "9602", "9603", "9605", "9606", "9607", "9608", "9609",
    "9611", "9613", "9614", "9615", "9616", "9617", "9618", "9619",
    "9621", "9622", "9623", "9624", "9625", "9626", "9627", "9628", "9629",
    "9631", "9632", "9633", "9635", "9636",
    "9641", "9642", "9644", "9645", "9646", "9648", "9649",
    "9651", "9654", "9655", "9656", "9657", "9659",
    "9672", "9675", "9677", "9678", "9679",
    "9681", "9682", "9684", "9685",
    "9723",
    "9731", "9732", "9733", "9734", "9735", "9736", "9737", "9738",
    "9746", "9747",
    "9771", "9773", "9774",
    "9781", "9784", "9785",
    "9791", "9792", "9793", "9794", "9795", "9796", "9797", "9798",
    "9833",
    "9881", "9882", "9883", "9884", "9885", "9886",
    "9891", "9892", "9893",
    "9901", "9902", "9903", "9904", "9905", "9906", "9907", "9908", "9909",
    "9911", "9912", "9913", "9914", "9915", "9917", "9918", "9919",
    "9921", "9922", "9923", "9924", "9925",
    "9931", "9932", "9933", "9934", "9936", "9937", "9939",
    "9942", "9943", "9944", "9945", "9946", "9947", "9948", "9949",
    "9951", "9953", "9954", "9955", "9956", "9957", "9959",
    "9961", "9962", "9963", "9964", "9965", "9966", "9967", "9968", "9969",
    "9971", "9972", "9973", "9974", "9975", "9976", "9977", "9978", "9979",
    "9981", "9982", "9983", "9984", "9985", "9986", "9987", "9988", "9989",
    "9991", "9992", "9993", "9994", "9995", "9996", "9997", "9998", "9999",
  ],
};

// Gieten, 2e Exloërmond, drie wijken in Emmen en Veenoord als heel gebied. In
// Coevorden (De Loo, Poppenhare, Lootuinen) en Schoonoord alleen losse straten,
// vandaar de zescijferige reeksen. De PDF heeft geen versienummer; de hash
// vangt een nieuwe versie onder dezelfde naam.
export const VOLKSHUISVESTING_DRENTHE: Postcodegebied = {
  naam: "Aangewezen postcodegebieden Subsidieregeling verduurzaming Volkshuisvesting Drenthe",
  bron: "https://www.snn.nl/sites/default/files/documents/Postcodelijst%20verduurzaming%20volkshuisvesting%20Drenthe.pdf",
  bronPagina: "https://www.snn.nl/subsidies-voor-particulieren/subsidieregeling-verduurzaming-volkshuisvesting-drenthe",
  versie: "zonder versienummer, gedownload 2026-10-26",
  vastgesteld: "2026-10-26",
  sha256: "97ef53f6bead48eef55cce3c5a18460d63bf429db45f2e3d2cb73077ad53e129",
  postcodes: [
    // Aa en Hunze: Gieten
    "9461",
    // Borger-Odoorn: 2e Exloërmond
    "9571",
    // Emmen: Bargeres, Emmerhout, Angelslo, Veenoord
    "7812", "7823", "7824", "7844",
    // Coevorden: De Loo, Poppenhare en Lootuinen
    "7741 AA t/m AE", "7741 AG", "7741 AH", "7741 AJ t/m AN", "7741 AP", "7741 AR t/m AT",
    "7741 AV t/m AX", "7741 AZ", "7741 BA t/m BD", "7741 BK t/m BN", "7741 BP", "7741 BR t/m BT",
    "7741 BV", "7741 BW", "7741 CA t/m CE", "7741 CG", "7741 CH", "7741 CJ t/m CN", "7741 CP",
    "7741 CR t/m CT", "7741 CW", "7741 CX", "7741 DA t/m DC", "7741 DJ t/m DN", "7741 EE",
    "7741 EG", "7741 EH", "7741 EJ", "7741 KA", "7741 SB", "7741 SE", "7741 SG", "7741 SH",
    "7741 SJ", "7741 SL t/m SN", "7741 SP", "7741 SR", "7741 ST", "7741 SV t/m SX", "7741 SZ",
    "7741 TD", "7741 TE", "7741 TG", "7741 TH", "7741 TJ t/m TN", "7741 TP", "7741 TR", "7741 TT",
    "7741 TV t/m TX", "7741 TZ", "7741 VD", "7741 VE", "7741 VG", "7741 VH", "7741 VJ t/m VN",
    "7741 VP", "7741 VR t/m VT", "7741 VV", "7741 VW", "7741 VZ", "7741 XA t/m XE", "7741 XG",
    "7741 XH", "7741 XJ", "7741 XK t/m XN", "7741 XP", "7741 XR t/m XT",
    // Coevorden: de kern van Schoonoord
    "7848 AA t/m AE", "7848 AH", "7848 AJ", "7848 AN", "7848 AP", "7848 AR t/m AT",
    "7848 AV t/m AX", "7848 BA t/m BE", "7848 BG", "7848 BH", "7848 BJ t/m BN", "7848 BP",
    "7848 BR t/m BT", "7848 BV t/m BX", "7848 CA t/m CE", "7848 CG", "7848 CH", "7848 CJ t/m CN",
    "7848 CP", "7848 CR t/m CT", "7848 CX", "7848 CZ", "7848 EA", "7848 EB",
  ],
};

// De gemeente Groningen beperkt deze regeling tot Ten Post, Kröddeburen en
// Wittewierum. Milieu Centraal zegt dat ook in de eigen tekst, maar koppelt hem
// aan de hele gemeente (48 postcodegebieden).
export const TEN_POST: Postcodegebied = {
  naam: "Ten Post, Kröddeburen en Wittewierum",
  bron: "https://gemeente.groningen.nl/subsidie-energieneutraal-ten-post",
  versie: "voorwaarden op de pagina van de gemeente",
  vastgesteld: "2026-10-26",
  postcodes: ["9792"],
};

// Milieu Centraal zet Hoogeveen in het werkgebied van de Isolatieaanpak. SNN en
// Milieu Centraal zelf noemen voor Drenthe alleen Aa en Hunze, Noordenveld en
// Tynaarlo. Dit zijn de postcodegebieden van de gemeente Hoogeveen volgens PDOK.
// Geen van de buurgemeenten valt onder Nij Begun, dus een gebied dat over de
// gemeentegrens loopt kost niemand een regeling waar hij recht op heeft.
export const HOOGEVEEN: Postcodegebied = {
  naam: "Gemeente Hoogeveen",
  bron: "https://api.pdok.nl/bzk/locatieserver/search/v3_1/free (gemeentenaam Hoogeveen)",
  versie: "afgeleid uit PDOK",
  vastgesteld: "2026-10-26",
  postcodes: [
    "7901", "7902", "7903", "7904", "7905", "7906", "7907", "7908", "7909",
    "7911", "7912", "7913", "7914", "7915", "7916", "7918",
    "7931", "7933", "7934", "7936",
  ],
};

const NCG = "het versterkingsprogramma van de NCG";

export const GEBIEDSCORRECTIES: Gebiedscorrectie[] = [
  {
    regelingen: [
      "subsidie-verduurzaming-en-verbetering-groningen-10-000",
      "subsidie-verduurzaming-en-verbetering-groningen-10-000-zakelijk",
    ],
    alleenIn: VVG_10000,
    alleenAls: `je woning niet in ${NCG} zit`,
    waarom:
      "SNN: alleen in het aangewezen postcodegebied, en alleen als de woning niet in het NCG-programma zit. Milieu Centraal koppelt hem aan negen hele gemeenten (particulier) of de hele provincie (zakelijk).",
  },
  {
    regelingen: ["subsidie-verduurzaming-en-verbetering-groningen-17-000"],
    // Niet "alleen als je in het programma zit": wie volgens een oud advies
    // (NPR 9998 2018 of eerder) versterkt wordt, krijgt de € 7.000 en niet deze.
    // Kiest hij voor herbeoordeling, dan krijgt hij een nieuw advies en valt hij
    // hier weer onder. De € 7.000 zelf staat niet in de feed van Milieu Centraal.
    alleenAls: `je woning in ${NCG} zit en niet volgens een oud advies wordt versterkt`,
    waarom:
      "SNN: alleen voor woningen in het NCG-programma met een beoordeling met nieuwe inzichten, of een oude beoordeling waaruit blijkt dat versterking niet nodig is. Dat staat niet in een postcode, dat weet alleen de bewoner.",
  },
  {
    regelingen: ["subsidie-verduurzaming-volkshuisvesting-drenthe"],
    alleenIn: VOLKSHUISVESTING_DRENTHE,
    waarom: "SNN: alleen in de aangewezen postcodegebieden. Milieu Centraal koppelt hem aan vier hele gemeenten.",
  },
  {
    regelingen: ["subsidie-energiemaatregelen-groningen"],
    alleenIn: TEN_POST,
    alleenAls: "je de subsidie van € 7.000 van SNN al hebt aangevraagd",
    waarom:
      "Gemeente Groningen: alleen postcodegebied 9792, en alleen als je de VVG € 7.000 van SNN al hebt aangevraagd en gebruikt.",
  },
  {
    regelingen: ["isolatieaanpak-groningen-en-noord-drenthe"],
    nietIn: HOOGEVEEN,
    waarom: "SNN: in Drenthe alleen Aa en Hunze, Noordenveld en Tynaarlo. Hoogeveen staat er bij Milieu Centraal ten onrechte bij.",
  },
];
