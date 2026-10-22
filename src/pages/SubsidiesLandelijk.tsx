import { useEffect, useState } from "react";
import {
  Globe,
  Coins,
  TrendingUp,
  User,
  Calendar,
  Thermometer,
  Sun,
  Home,
  Wind,
  Info,
  Lightbulb,
  Calculator,
  Leaf,
  X as XIcon,
  LifeBuoy,
  FileCheck,
  Scale,
} from "lucide-react";
import { Header } from "@/components/Header";
import { Seo } from "@/components/Seo";
import { Footer } from "@/components/Footer";
import { CtaButton } from "@/components/CtaButton";
import {
  Accent,
  HeroLijst,
  KruisRegel,
  Kop2,
  LogoPaar,
  LosseUitklap,
  PijlLink,
  Rondje,
  Sectie,
  SlotCta,
  Stappen,
  SubsidieFaq,
  SubsidieHero,
  TussenCta,
  Vink,
  VinkRegel,
  WaaromTegels,
} from "@/components/subsidies/SubsidiePagina";

const LAATST_BIJGEWERKT = "mei 2026";

// Editable ISDE constants (jaarlijks updatebaar)
const ISDE = {
  budget2026: "€500 miljoen",
  warmtenetBedrag: "€3.775",
  ventilatieBedrag: "€400",
  zonneboilerMin: "€300",
  warmtepompMin: "€500",
  warmtepompMax: "€13.000",
  isolatie: [
    { naam: "Spouwmuurisolatie", een: "€5,25 / m²", twee: "€10,50 / m²" },
    { naam: "Dakisolatie", een: "€16,25 / m²", twee: "€32,50 / m²" },
    { naam: "Gevelisolatie (binnen of buiten)", een: "€20,25 / m²", twee: "€40,50 / m²" },
    { naam: "Vloerisolatie", een: "€5,50 / m²", twee: "€11,00 / m²" },
    { naam: "Bodemisolatie", een: "€3,00 / m²", twee: "€6,00 / m²" },
    { naam: "Zolder- en vlieringisolatie", een: "€4,00 / m²", twee: "€8,00 / m²" },
  ],
};

const faqs: { q: string; a: string }[] = [
  {
    q: "Kan ik ISDE combineren met Nij Begun?",
    a: "Voor warmtepomp en zonneboiler kan dat. Voor isolatie zit ISDE al verwerkt in Nij Begun, dus dan vraag je het niet apart aan. Wij regelen beide aanvragen waar dat van toepassing is.",
  },
  {
    q: "Vraag ik vooraf of achteraf aan?",
    a: "Achteraf. Eerst laat je de maatregel uitvoeren door een erkend bedrijf, daarna dien je binnen 24 maanden de aanvraag in. Wij doen de aanvraag voor je zodra de uitvoering klaar is.",
  },
  {
    q: "Wat als de subsidiepot leeg raakt?",
    a: "Dat is jaarlijks een aandachtspunt. Het budget voor 2026 is €500 miljoen, maar in populaire jaren is er sneller op. Daarom adviseren we om niet te lang te wachten, vooral als je een grotere combinatie plant.",
  },
  {
    q: "Krijg ik subsidie als ik zelf isoleer?",
    a: "Nee. Doe-het-zelf werk komt niet in aanmerking voor ISDE. Het werk moet door een erkend bedrijf worden uitgevoerd, met een geldige meldcode op de factuur.",
  },
  {
    q: "Hoe lang duurt het voor ik mijn subsidie krijg?",
    a: "RVO beslist meestal binnen 8 weken na een complete aanvraag. Bij goedkeuring wordt het bedrag rechtstreeks op je rekening gestort.",
  },
  {
    q: "Wat kost jullie hulp?",
    a: "Niets. Ons huisbezoek en de begeleiding zijn gratis voor bewoners. Wij worden betaald door de installatiebedrijven die met ons samenwerken.",
  },
];

// Een bedrag als "€10,50 / m²" mag op een smal scherm alleen vóór "/ m²" breken.
const Bedrag = ({ tekst }: { tekst: string }) => {
  const [getal, ...rest] = tekst.split(" / ");
  return rest.length ? (
    <>
      <span className="sp-heel">{getal}</span> <span className="sp-heel">/ {rest.join(" / ")}</span>
    </>
  ) : (
    <span className="sp-heel">{tekst}</span>
  );
};

// Tooltip-toegankelijke maatregel
const MeasureLi = ({ label, tip }: { label: string; tip: string }) => {
  const [open, setOpen] = useState(false);
  return (
    <li className="flex items-start gap-2.5 py-1.5">
      <Vink />
      <span className="flex-1 text-[15px] leading-[1.5] text-foreground">{label}</span>
      <span className="relative inline-flex">
        <button
          type="button"
          aria-label={`Meer info over ${label}`}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          onBlur={() => setOpen(false)}
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
          className="-my-0.5 inline-grid h-7 w-7 place-items-center rounded-full bg-[hsl(var(--rs-hoofd-midden))] text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <Info size={15} aria-hidden />
        </button>
        {open && (
          <span role="tooltip" className="sp-ballon absolute right-0 top-full z-20 mt-2 w-[280px] max-w-[80vw]">
            {tip}
          </span>
        )}
      </span>
    </li>
  );
};

const SubsidiesLandelijk = () => {
  useEffect(() => {
    document.title = "ISDE-subsidie aanvragen voor isolatie, warmtepomp en meer | Voortraject";
    const meta = document.querySelector('meta[name="description"]') || (() => {
      const m = document.createElement("meta");
      m.setAttribute("name", "description");
      document.head.appendChild(m);
      return m;
    })();
    meta.setAttribute(
      "content",
      "Tot duizenden euro's ISDE-subsidie voor warmtepomp, isolatie, zonneboiler en meer. Wij regelen de aanvraag voor je, in heel Nederland."
    );

    // FAQ JSON-LD
    const ld = document.createElement("script");
    ld.type = "application/ld+json";
    ld.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    });
    document.head.appendChild(ld);
    return () => {
      if (ld.parentNode) ld.parentNode.removeChild(ld);
    };
  }, []);

  const scrollToBedragen = () => {
    document.getElementById("bedragen")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const steps = [
    { n: "01", t: "Vrijblijvend telefoongesprek", d: "We bespreken kort jouw woning, situatie en wens. Aan het eind van het gesprek weet je grofweg welke ISDE-bedragen voor jou interessant zijn en of een huisbezoek de volgende stap is. Het gesprek duurt 15 minuten en is volledig vrijblijvend." },
    { n: "02", t: "Huisbezoek", d: "Een lokale adviseur uit jouw regio komt bij je langs en bekijkt samen met jou welke maatregelen slim zijn en in welke volgorde. Geen verplichtingen, geen verkooppraatje." },
    { n: "03", t: "Plan op maat met optimale combinatie", d: "Wij kennen de regeling. Tijdens het bezoek rekenen we uit welke maatregelen voor jouw woning slim zijn én in welke volgorde. Vaak levert combineren duizenden euro's extra op. Jij hoeft niet zelf in regelingen te duiken." },
    { n: "04", t: "Erkende uitvoerder kiezen", d: "Werkt een niet-erkend bedrijf voor je, dan vervalt je subsidie volledig. Wij brengen je in contact met installateurs die voldoen aan de ISDE-eisen en bij jouw woning passen. Geen vooringenomen keuze, gewoon wat werkt." },
    { n: "05", t: "Uitvoering en aanvraag indienen", d: "Wij bewaken de uitvoering, de meldcodes en de fotodocumentatie. Tegelijkertijd dienen wij de aanvraag in bij RVO via mijnRVO.nl. RVO beslist doorgaans binnen 8 weken en stort het bedrag op jouw rekening." },
    { n: "06", t: "Vervolgmaatregelen en natraject", d: "Wil je daarna nog meer doen? Combineren binnen 24 maanden levert verdubbelde subsidie op. Wij blijven jouw aanspreekpunt voor vervolgmaatregelen, vragen over onderhoud, of advies over warmtepomp of warmtenet." },
  ];

  const categories = [
    { icon: Thermometer, t: "Warmtepomp", b: `tot ${ISDE.warmtepompMax} (water-water), vanaf ${ISDE.warmtepompMin} (kleinere pompen)`, d: "Hybride, lucht-water of water-water. Lucht-water start op €1.025 plus €225 per kW vermogen." },
    { icon: Sun, t: "Zonneboiler", b: `vanaf ${ISDE.zonneboilerMin}`, d: "Voor zonneboilers met collector, boilervat en circulatiepomp. Het exacte bedrag staat per apparaat op de meldcodelijst." },
    { icon: Home, t: "Isolatie", b: "per m², verdubbeld bij 2+ maatregelen", d: "Spouwmuur, dak, vloer, gevel, glas. Combineer voor maximale subsidie. Bedragen staan in het overzicht hieronder." },
    { icon: Wind, t: "Warmtenet & ventilatie", b: `${ISDE.warmtenetBedrag} (warmtenet) of ${ISDE.ventilatieBedrag} (ventilatie)`, d: "Warmtenetaansluiting is een vast bedrag. Ventilatie (nieuw in 2026) krijg je alleen in combinatie met een isolatiemaatregel." },
  ];

  const measures = [
    { l: "Warmtepomp (hybride, lucht-water, water-water)", tip: "Moet op de RVO-meldcodelijst staan en minimaal energielabel A++ hebben. Maximaal eens per 3 jaar aanvragen. Bonus van €200 voor A+++ pompen." },
    { l: "Zonneboiler", tip: "Bestaat uit collector, boilervat en circulatiepomp. Moet op de Apparatenlijst Zonneboilers staan. Minimumbedrag €300." },
    { l: "Spouwmuurisolatie", tip: "Minimaal 10 m². Rd-waarde minimaal 1,1 m²K/W. Voor woningen met spouwmuren (bouwjaar na 1920). Vaak de goedkoopste maatregel met direct effect." },
    { l: "Dakisolatie", tip: "Minimaal 20 m², maximaal 200 m² per aanvraag. Rd-waarde minimaal 3,5 m²K/W. Levert vaak de hoogste subsidie per m² op." },
    { l: "Gevelisolatie (binnen of buiten)", tip: "Voor woningen zonder spouwmuren. Minimaal 10 m², Rd-waarde minimaal 3,5. Buitenisolatie is duurder maar effectiever." },
    { l: "Vloer- en bodemisolatie", tip: "Minimaal 20 m². Vloer: Rd-waarde minimaal 3,5. Bodem: Rd of Rbf-waarde minimaal 3,5 (sinds 2026 mag je kiezen)." },
    { l: "HR++ glas, triple glas of vacuümglas", tip: "Aparte bedragen per type glas. Sinds 2026 is de Uf-waarde-eis voor kozijnen vervallen, alleen de Ug-waarde van het glas telt nog." },
    { l: "Aansluiting op warmtenet", tip: "Vast bedrag van €3.775. Sinds 2026 volstaat een bevestiging van de netbeheerder, geen aansluitcontract meer nodig." },
    { l: "Energiezuinige ventilatie (nieuw in 2026)", tip: "€400 vast bedrag. Alleen in combinatie met een isolatiemaatregel. Mechanische ventilatie type C met 2 CO2-sensoren, of balansventilatie met WTW-unit." },
  ];

  const niet = [
    "Zonnepanelen (vallen onder de 0% btw-regeling, niet ISDE)",
    "Doe-het-zelf werkzaamheden",
    "Tussenvloerisolatie (alleen vloeren boven onverwarmde ruimte tellen)",
    "Nieuwbouwwoningen in de bouwfase",
    "Vakantiewoningen, tweede woningen, verhuurde panden (zie SVOH)",
    "Esthetische afwerking, schilderwerk",
  ];

  const why = [
    { Icon: Home, t: "Persoonlijk huisbezoek", d: "Geen wachtrij, geen formulier-eerst. Een lokale adviseur komt persoonlijk bij je langs binnen een week." },
    { Icon: FileCheck, t: "Wij regelen de aanvraag", d: "Geen DigiD-gedoe, geen termijnen die je zelf moet bewaken. Wij dienen de ISDE-aanvraag in bij RVO en bewaken het proces." },
    { Icon: Scale, t: "Eerlijk advies", d: "Wij hebben geen voorkeur voor bepaalde uitvoerders. We brengen je in contact met erkende installateurs die bij jouw woning passen." },
    { Icon: LifeBuoy, t: "Nazorg en natraject", d: "Na de uitvoering blijven we beschikbaar. Voor vervolgmaatregelen, garantie, of advies over warmtepomp of warmtenet." },
  ];

  // Half-and-half splitter for 2-column lists
  const half = <T,>(arr: T[]): [T[], T[]] => {
    const mid = Math.ceil(arr.length / 2);
    return [arr.slice(0, mid), arr.slice(mid)];
  };
  const [measuresLeft, measuresRight] = half(measures);
  const [nietLeft, nietRight] = half(niet);

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Landelijke subsidies verduurzaming | Voortraject"
        description="Overzicht van landelijke subsidies en regelingen voor woningverduurzaming, waaronder ISDE en het Nationaal Warmtefonds."
        path="/subsidies/landelijk"
      />
      <Header ctaNaElement="subsidie-hero-knop" />
      <main className="text-foreground">
        {/* SECTIE 1: HERO */}
        <SubsidieHero
          titel={
            <>
              Subsidie voor jouw <Accent>verduurzaming</Accent>, in heel Nederland.
            </>
          }
          intro="Via ISDE krijg je honderden tot duizenden euro's terug op je verduurzaming. Maar je vraagt achteraf aan met meldcodes, foto's en de juiste timing. Eén foutje kost geld of vertraging. Wij regelen het van advies tot aanvraag bij RVO. Jij krijgt het bedrag op je rekening."
          knop={<CtaButton href="/contact">Ja ik wil gratis advies</CtaButton>}
          tweede={<PijlLink onClick={scrollToBedragen}>Bekijk wat je kunt krijgen</PijlLink>}
          naast={
            <>
              {/* Logos, in balans */}
              <LogoPaar>
                <img
                  src="/images/landelijk/logo-voortraject-blauw.png"
                  alt="Voortraject"
                  className="h-auto max-h-10 w-auto object-contain md:max-h-14"
                />
                <span aria-hidden className="hidden h-14 w-px bg-primary/25 sm:inline-block" />
                <img
                  src="/images/landelijk/rijksoverheid_logo.svg"
                  alt="Rijksoverheid"
                  className="h-auto max-h-12 w-auto object-contain md:max-h-14"
                />
              </LogoPaar>
              <HeroLijst
                vlak="hs-blauw-zacht"
                kleur="ink"
                items={[
                  { Icon: Globe, tekst: <>Heel Nederland komt in aanmerking</> },
                  { Icon: Coins, tekst: <><strong>{ISDE.budget2026}</strong> budget in 2026</> },
                  { Icon: TrendingUp, tekst: <>Verdubbel bij <strong>2 of meer</strong> maatregelen</> },
                ]}
              />
            </>
          }
        />

        {/* SECTIE 2: WAT IS ISDE */}
        <Sectie>
          <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2 md:gap-14">
            <div className="min-w-0">
              <Kop2>
                Wat is <Accent>ISDE</Accent> precies?
              </Kop2>
              <div className="hs-tekst mt-4 space-y-4 text-[16px] leading-[1.65] md:mt-5 md:text-[17px]" data-veer>
                <p>
                  ISDE staat voor Investeringssubsidie duurzame energie en energiebesparing. Het is de landelijke subsidie van de Rijksoverheid voor woningeigenaren die hun huis verduurzamen. De regeling wordt uitgevoerd door RVO en loopt door tot 2031.
                </p>
                <p>
                  Anders dan Nij Begun werkt ISDE met vaste bedragen per maatregel. Voor isolatie krijg je een bedrag per vierkante meter. Voor een warmtepomp of zonneboiler een vast bedrag per apparaat. En als je twee of meer maatregelen combineert, verdubbelt de subsidie per vierkante meter voor isolatie.
                </p>
              </div>
            </div>
            <div className="hs-tegel p-3 md:p-4" data-veer>
              <div style={{ aspectRatio: "5 / 3", width: "100%" }}>
                <img
                  src="/images/landelijk/isde-subsidie.jpg"
                  alt="Schematische illustratie van een woning met groen blad en energielabels A tot G, symbool voor verduurzaming via de ISDE-subsidie"
                  loading="lazy"
                  className="h-full w-full rounded-[16px] object-contain"
                />
              </div>
            </div>
          </div>
        </Sectie>

        {/* SECTIE 3: HOEVEEL SUBSIDIE */}
        <Sectie id="bedragen" band>
          <Kop2
            lead={
              <>
                De bedragen verschillen per maatregel, maar één regel maakt het écht interessant: combineer je twee of meer maatregelen binnen 24 maanden, dan <strong className="text-primary">verdubbelt</strong> het isolatiebedrag per vierkante meter. Wij rekenen voor jouw woning uit hoe je daar het maximale uit haalt.
              </>
            }
            className="max-w-[820px]"
          >
            Hoeveel <Accent>subsidie</Accent> krijg je?
          </Kop2>

          {/* 3.1 Categoriekaarten: landelijk, dus inktblauw */}
          <div className="mt-7 grid grid-cols-1 gap-3 md:mt-10 md:grid-cols-2 md:gap-5">
            {categories.map((c) => (
              <div key={c.t} className="hs-tegel hs-blauw grid grid-cols-[1fr_auto] items-start gap-x-3.5 p-[18px] md:p-6" data-veer>
                <div className="min-w-0">
                  <h3 className="hs-h3">{c.t}</h3>
                  <p className="mt-1 font-display text-[19px] font-bold leading-[1.25] tracking-[-0.01em] text-[hsl(var(--rs-getal))] md:text-[22px]">
                    {c.b}
                  </p>
                </div>
                <Rondje Icon={c.icon} kleur="ink" />
                <p className="hs-tekst col-span-2 mt-2.5 text-[15px] leading-[1.55]">{c.d}</p>
              </div>
            ))}
          </div>

          {/* 3.2a Combineren: uitklapbaar */}
          <div className="mt-5 md:mt-8" data-veer>
            <LosseUitklap kop="h4" Icon={Lightbulb} icoonKleur="oker" vraag="Combineren is waar de winst zit">
              <p>
                Eén isolatiemaatregel levert ongeveer 15% van je investering aan subsidie op. Twee maatregelen, of één maatregel plus een warmtepomp of zonneboiler, brengt dat naar ongeveer 30%. Dat is letterlijk verdubbelen.
              </p>
            </LosseUitklap>
          </div>

          {/* 3.2 Tabel */}
          <div className="hs-tegel mt-5 p-[18px] md:mt-8 md:p-7" data-veer>
            <h3 className="hs-h3">Isolatie per vierkante meter</h3>
            <div className="-mx-3 mt-3 overflow-x-auto min-[381px]:-mx-2 md:mx-0 md:mt-4">
              <table className="sp-tabel">
                <thead>
                  <tr>
                    <th>Maatregel</th>
                    <th>1 maatregel</th>
                    <th className="text-[hsl(var(--subsidie))]">2+ maatregelen</th>
                  </tr>
                </thead>
                <tbody>
                  {ISDE.isolatie.map((row) => (
                    <tr key={row.naam}>
                      <td>{row.naam}</td>
                      <td className="sp-enkel"><Bedrag tekst={row.een} /></td>
                      <td className="sp-dubbel"><Bedrag tekst={row.twee} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="hs-tekst mt-3 flex items-start gap-2 text-[13.5px] leading-[1.5]">
              <Info size={16} className="mt-0.5 flex-none" aria-hidden />
              <span>Voor glas (HR++ of triple) gelden aparte bedragen. Bedragen kunnen jaarlijks wijzigen, check rvo.nl voor de actuele tarieven.</span>
            </div>
          </div>

          {/* 3.3 Voorbeeld: uitklapbaar */}
          <div className="mt-5 md:mt-8" data-veer>
            <LosseUitklap kop="h4" Icon={Calculator} icoonKleur="groen" vraag="Voorbeeld: dak en vloer combineren">
              <p>
                Stel: je laat 80 m² dakisolatie en 60 m² vloerisolatie tegelijk uitvoeren. Door de combinatie verdubbelen beide bedragen.
              </p>
              <ul className="mt-3 space-y-1">
                <li>Dakisolatie: 80 × €32,50 = <strong className="text-primary">€2.600</strong></li>
                <li>Vloerisolatie: 60 × €11,00 = <strong className="text-primary">€660</strong></li>
              </ul>
              <p className="mt-2.5">
                Totaal: <strong className="text-primary">€3.260</strong> subsidie. Zonder combineren: €1.630. Verschil: <strong className="text-[hsl(var(--subsidie))]">€1.630 extra</strong> door slim te combineren.
              </p>
            </LosseUitklap>
          </div>

          {/* 3.4 Mini-CTA */}
          <div className="mt-9 text-center md:mt-12" data-veer>
            <p className="font-display text-[18px] font-bold text-primary">Bang dat je geld laat liggen?</p>
            <p className="hs-tekst mx-auto mt-1.5 max-w-[560px] text-[15px] leading-[1.55]">
              Tijdens het huisbezoek rekenen we voor jouw woning uit welke combinatie het slimst is. Vrijblijvend en gratis.
            </p>
            <div className="mt-2">
              <PijlLink href="/contact">Neem contact op</PijlLink>
            </div>
          </div>
        </Sectie>

        {/* SECTIE 4: VOOR WIE */}
        <Sectie>
          <Kop2 lead="De ISDE-subsidie is er voor woningeigenaren die hun bestaande woning verduurzamen. Heel Nederland, geen inkomenstoets, geen postcode-check.">
            Voor wie is ISDE <Accent>bedoeld</Accent>?
          </Kop2>
          <div className="mt-7 grid grid-cols-1 gap-3 md:mt-10 md:grid-cols-2 md:gap-5">
            {[
              {
                icon: User,
                t: "Wie kan aanvragen?",
                items: [
                  "Eigenaar én bewoner van de woning",
                  "Woning staat in Nederland",
                  "Bestaande woning (geen nieuwbouw in de bouwfase)",
                  "Geen inkomenstoets, geen postcodebeperking",
                ],
              },
              {
                icon: Calendar,
                t: "Wanneer aanvragen?",
                items: [
                  "Eerst de maatregel laten uitvoeren door een erkend bedrijf",
                  "Aanvraag indienen binnen 24 maanden na uitvoering",
                  "Doe-het-zelf telt niet mee voor subsidie",
                  "Foto's en factuur zijn verplicht bij de aanvraag",
                ],
              },
            ].map((card) => (
              <div key={card.t} className="hs-tegel hs-blauw-zacht p-[18px] md:p-6" data-veer>
                <div className="flex items-center justify-between gap-3">
                  <h3 className="hs-h3">{card.t}</h3>
                  <Rondje Icon={card.icon} kleur="ink" />
                </div>
                <ul className="mt-3">
                  {card.items.map((it) => (
                    <VinkRegel key={it}>{it}</VinkRegel>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="hs-tekst mt-4 text-[13.5px] leading-[1.5] md:mt-5">
            Verhuurders en VvE's hebben een aparte regeling (SVOH). Voor hen geldt ISDE niet.
          </p>
        </Sectie>

        {/* SECTIE 5: WELKE MAATREGELEN */}
        <Sectie band>
          <Kop2
            className="max-w-[820px]"
            lead="ISDE vergoedt isolatie, warmtepomp, zonneboiler, warmtenet en (sinds 2026) ventilatie. Per maatregel gelden eisen aan de installatie, het materiaal en het oppervlak."
          >
            Welke maatregelen worden <Accent>vergoed</Accent>?
          </Kop2>

          {/* 5.1 Hoofdlijst maatregelen */}
          <div className="hs-tegel mt-7 p-[18px] md:mt-10 md:p-7" data-veer>
            <div className="grid grid-cols-1 md:grid-cols-2 md:gap-x-10">
              <ul>
                {measuresLeft.map((m) => (
                  <MeasureLi key={m.l} label={m.l} tip={m.tip} />
                ))}
              </ul>
              <ul>
                {measuresRight.map((m) => (
                  <MeasureLi key={m.l} label={m.l} tip={m.tip} />
                ))}
              </ul>
            </div>
          </div>

          {/* 5.2 Biobased: uitklapbaar */}
          <div className="mt-5 md:mt-6" data-veer>
            <LosseUitklap kop="h4" Icon={Leaf} icoonKleur="groen" vraag="Bonus voor biobased isolatie">
              <p>
                Kies je voor isolatiemateriaal uit hernieuwbare bronnen (zoals hennep, vlas, houtvezel of cellulose), dan krijg je een extra bedrag per vierkante meter. Deze bonus wordt niet verdubbeld bij combineren, maar telt wel op bij het standaardbedrag. Wij weten welke materialen kwalificeren en bespreken het tijdens het huisbezoek.
              </p>
            </LosseUitklap>
          </div>

          {/* 5.3 Niet vergoed */}
          <div className="mt-8 md:mt-10" data-veer>
            <h3 className="hs-h3">Niet vergoed via ISDE</h3>
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 md:gap-x-10">
              <ul>
                {nietLeft.map((n) => (
                  <KruisRegel key={n} Icon={XIcon}>{n}</KruisRegel>
                ))}
              </ul>
              <ul>
                {nietRight.map((n) => (
                  <KruisRegel key={n} Icon={XIcon}>{n}</KruisRegel>
                ))}
              </ul>
            </div>
          </div>
        </Sectie>

        {/* SECTIE 6: STAPPENPLAN */}
        <Sectie>
          <Kop2 lead="Geen formulieren, geen DigiD-gedoe, geen termijnen die je zelf moet bewaken. Wij doen het zware werk, jij houdt de regie.">
            Zo verloopt jouw <Accent>traject</Accent>
          </Kop2>
          <Stappen stappen={steps} />
          <TussenCta kop="Wil je sneller verder zonder gedoe?" knop={<CtaButton href="/contact">Neem contact op</CtaButton>} />
        </Sectie>

        {/* SECTIE 7: FAQ */}
        <SubsidieFaq faqs={faqs} band />

        {/* SECTIE 8: WAAROM VOORTRAJECT */}
        <Sectie>
          <Kop2 lead="Wat ons anders maakt dan een algemene subsidie-website of een ingehuurde callcenter-helpdesk.">
            Waarom bewoners voor Voortraject <Accent>kiezen</Accent>
          </Kop2>
          <WaaromTegels redenen={why} />
        </Sectie>
      </main>
      <Footer cta={<SlotCta laatstBijgewerkt={LAATST_BIJGEWERKT} />} />
    </div>
  );
};

export default SubsidiesLandelijk;
