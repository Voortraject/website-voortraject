import { useEffect, useRef, useState } from "react";
import {
  Home,
  Coins,
  Euro,
  Building2,
  Trees,
  X as XIcon,
  Info,
  LifeBuoy,
  FileCheck,
  Scale,
  Lightbulb,
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
import logoVoortrajectBlauw from "@/assets/logo-voortraject-blauw.png";
import logoNijBegun from "@/assets/logo-nij-begun.png";

// Editable constants
const LAATST_BIJGEWERKT = "mei 2026";
const INKOMEN_ALLEEN = "€28.063";
const INKOMEN_SAMEN = "€40.088";

const IMG = "/images/nij-begun";
const imgKaart = `${IMG}/Afbeelding_50-100_Groningen.webp`;
const imgHuis = `${IMG}/Isolatie_huis_afbeelding.webp`;

const faqs: { q: string; a: string }[] = [
  {
    q: "Tot wanneer kan ik subsidie aanvragen?",
    a: "Tot 3 juni 2035. Sinds eind augustus 2026 zijn alle postcodes geopend.",
  },
  {
    q: "Krijg ik 50% of 100% subsidie?",
    a: "Je krijgt 100% subsidie als je in het versterkingsgebied woont, óf als je inkomen onder 140% sociaal minimum valt. Eén van die twee is genoeg. Voldoe je aan geen van beide, dan krijg je 50%. Tijdens het huisbezoek checken we precies waar je staat. De €1.000 advies- en afwerkbijdrage hoort overigens alleen bij de 100%-categorie.",
  },
  {
    q: "Heb ik een isolatieplan nodig?",
    a: "Alleen als je maatregelen meer dan €10.000 inclusief btw kosten. Het plan is gratis en wordt door een Nij Begun-adviseur gemaakt.",
  },
  {
    q: "Mag ik Nij Begun stapelen met ISDE?",
    a: "Voor isolatie en ventilatie zit ISDE al verwerkt in Nij Begun. Voor warmtepomp of zonneboiler is ISDE wel een aparte aanvraag bij RVO.",
  },
  {
    q: "Hoe lang duurt het voor ik subsidie ontvang?",
    a: "SNN beslist binnen 13 weken (verlengbaar met 8 weken). Daarna heb je 2 jaar om de werkzaamheden te laten uitvoeren.",
  },
  {
    q: "Wat kost jullie hulp?",
    a: "Niets. Ons huisbezoek en de begeleiding zijn gratis voor bewoners.",
  },
];

const Illustration = ({ src, alt }: { src: string; alt: string }) => (
  <div className="hs-foto overflow-hidden" style={{ aspectRatio: "5 / 3", width: "100%" }}>
    <img src={src} alt={alt} loading="lazy" decoding="async" className="h-full w-full object-cover object-center" />
  </div>
);

const MeasureLi = ({ label, info }: { label: string; info: string }) => {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);
  return (
    <li className="flex items-start gap-2.5 py-1">
      <Vink />
      <span className="flex-1 text-[15px] leading-[1.5] text-foreground">
        {label}{" "}
        <span ref={wrapRef} className="relative inline-block align-middle">
          <button
            type="button"
            aria-label={`Meer informatie over ${label}`}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
            onFocus={() => setOpen(true)}
            onBlur={() => setOpen(false)}
            className="-my-1 inline-grid h-6 w-6 place-items-center rounded-full bg-[hsl(var(--rs-hoofd-midden))] align-middle text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <Info size={14} aria-hidden />
          </button>
          {open && (
            <span
              role="tooltip"
              className="sp-ballon absolute bottom-[calc(100%+8px)] left-1/2 z-30 w-max max-w-[min(320px,80vw)] -translate-x-1/2 whitespace-normal text-left"
            >
              {info}
            </span>
          )}
        </span>
      </span>
    </li>
  );
};

/** Een bedragkaart: groot groen percentage, het plafond ernaast. */
const Bedrag = ({ pct, children }: { pct: string; children: React.ReactNode }) => (
  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
    <span className="font-display text-[44px] font-bold leading-none tracking-[-0.03em] text-[hsl(var(--subsidie))] md:text-[52px]">{pct}</span>
    <span className="hs-tekst text-[15px] leading-[1.45] [&_strong]:text-primary">{children}</span>
  </div>
);

const VoorWie = () => (
  <h4 className="mb-1.5 mt-4 text-[13.5px] font-extrabold uppercase tracking-[0.06em] text-primary">Voor wie?</h4>
);

const SubsidiesNijBegun = () => {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = "Subsidie Nij Begun aanvragen in Groningen en Noord-Drenthe | Voortraject";

    const setMeta = (name: string, content: string, attr: "name" | "property" = "name") => {
      let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
      return el;
    };
    setMeta(
      "description",
      "Tot €40.000 subsidie voor isolatie via Nij Begun (Maatregel 29). Wij regelen het hele traject voor bewoners in Groningen en Noord-Drenthe."
    );

    let canon = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    const created = !canon;
    if (!canon) {
      canon = document.createElement("link");
      canon.rel = "canonical";
      document.head.appendChild(canon);
    }
    canon.href = `${window.location.origin}/subsidies/nij-begun`;

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
      document.title = prevTitle;
      if (ld.parentNode) ld.parentNode.removeChild(ld);
      if (created && canon && canon.parentNode) canon.parentNode.removeChild(canon);
    };
  }, []);

  const stappen = [
    {
      n: "01",
      t: "Vrijblijvend telefoongesprek",
      d: "We bespreken kort jouw situatie en woning. Is er een match? Dan plannen we een huisbezoek in. Het gesprek duurt 15 minuten en is volledig vrijblijvend.",
    },
    {
      n: "02",
      t: "Huisbezoek",
      d: "Een lokale adviseur uit Groningen of Drenthe komt bij je langs en bekijkt samen met jou welke mogelijkheden er zijn voor jouw woning. Vrijblijvend en gratis.",
    },
    {
      n: "03",
      t: "Samen bepalen wat haalbaar is",
      d: "Tijdens het bezoek bekijken we wat er mogelijk is voor jouw woning. Heb je al een isolatieplan? Dan kijken we welke maatregelen we als eerste oppakken. Heb je nog geen plan? Dan kijkt de adviseur waar je alvast mee kunt beginnen.",
    },
    {
      n: "04",
      t: "Wij dienen de aanvraag in",
      d: "Geen DigiD-gedoe, geen formulieren in pdf. Wij dienen de aanvraag in bij SNN en bewaken de 13 wekentermijn voor je.",
    },
    {
      n: "05",
      t: "Uitvoering door een getoetste uitvoerder",
      d: "Wij zoeken een passende uitvoerder die is aangesloten bij Nij Begun. Deze uitvoerders zijn door ons getoetst op diverse kwaliteitscriteria. Wij begeleiden tijdens de uitvoering en bewaken kwaliteit en planning.",
    },
    {
      n: "06",
      t: "Vervolgmaatregelen en natraject",
      d: "Wil je daarna meer doen? Samen met het isolatieplan kijken we welke aanvullende stappen logisch zijn. Wij blijven jouw aanspreekpunt voor vragen over onderhoud, garantie of vervolgmaatregelen zoals warmtepomp of zonnepanelen.",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Seo
        title="Subsidie Nij Begun | Voortraject"
        description="Alles over de Nij Begun-regeling voor woningverduurzaming in het Groningse aardbevingsgebied: voorwaarden, bedragen en aanvraag."
        path="/subsidies/nij-begun"
      />
      <Header ctaNaElement="subsidie-hero-knop" />

      {/* 1. HERO: regionaal, dus de provinciekleur */}
      <SubsidieHero
        titel={
          <>
            Laat je woning isoleren met <Accent>subsidie</Accent> via Nij Begun
          </>
        }
        intro="Woon je in Groningen of Noord-Drenthe? Dan kun je je woning laten isoleren tot de isolatiestandaard met subsidie via Nij Begun. Hoeveel je krijgt hangt af van je woning en je gemeente, en dat zoeken wij voor je uit."
        knop={<CtaButton href="/contact">Ja ik wil gratis advies</CtaButton>}
        tweede={<PijlLink href="#bedragen">Bekijk wat jij krijgt</PijlLink>}
        naast={
          <>
            {/* Partnership-marker: twee logo's */}
            <LogoPaar>
              <img src={logoVoortrajectBlauw} alt="Voortraject" className="max-h-8 w-auto object-contain md:max-h-10" />
              <span aria-hidden className="inline-block h-8 w-px bg-primary/25 md:h-10" />
              <img src={logoNijBegun} alt="Nij Begun Groningen Noord-Drenthe" className="max-h-8 w-auto object-contain md:max-h-10" />
            </LogoPaar>
            <HeroLijst
              vlak="hs-tint-provincie"
              kleur="provincie"
              items={[
                { Icon: Home, tekst: <><strong>300.000+</strong> woningen komen in aanmerking</> },
                { Icon: Coins, tekst: <><strong>€1,65 miljard</strong> beschikbaar tot 2035</> },
                { Icon: Euro, tekst: <><strong>20.000+</strong> woningen gingen je voor</> },
              ]}
            />
          </>
        }
      />

      {/* 2. WAT IS NIJ BEGUN */}
      <Sectie>
        <Kop2 midden>
          Wat is de <Accent>Isolatieaanpak</Accent> Nij Begun?
        </Kop2>
        <div className="hs-tekst mx-auto mt-4 max-w-3xl space-y-3 text-center text-[16px] leading-[1.65] md:mt-5 md:text-[17px]" data-veer>
          <p>
            Nij Begun is Gronings voor "nieuw begin". Het is de manier waarop de overheid bewoners in Groningen en Noord-Drenthe compenseert voor de schade van de gaswinning. Een groot deel van het pakket gaat naar Maatregel 29: subsidie om je woning te isoleren en ventileren.
          </p>
          <p>
            Voor deze aanpak staat <strong className="text-primary">€1,65 miljard</strong> klaar. De regeling loopt tot <strong className="text-primary">3 juni 2035</strong>.
          </p>
        </div>
      </Sectie>

      {/* 3. HOEVEEL */}
      <Sectie id="bedragen" band>
        <Kop2
          midden
          lead={
            <>
              Het bedrag hangt af van <strong className="text-primary">waar precies in het gebied</strong> je woont en van <strong className="text-primary">je inkomen</strong>. Er zijn twee categorieën.
            </>
          }
        >
          Hoeveel <Accent>subsidie</Accent> krijg je precies?
        </Kop2>

        <div className="mx-auto mt-7 grid max-w-6xl grid-cols-1 items-center gap-6 md:mt-10 lg:grid-cols-2 lg:gap-12">
          <div data-veer>
            <Illustration src={imgKaart} alt="Kaart van Groningen met 50% en 100% subsidiegebieden" />
            <div className="hs-tekst mt-3 flex items-start gap-2 text-[14px] leading-[1.5]">
              <Info size={16} className="mt-0.5 flex-none text-[hsl(var(--niveau-provincie))]" aria-hidden />
              <span>Ook buiten het versterkingsgebied kun je 100% subsidie krijgen als je inkomen onder de grens valt. Niet zeker in welke categorie je valt? Wij checken het vrijblijvend voor je.</span>
            </div>
          </div>

          <div className="grid gap-3 md:gap-5">
            {/* Kaart 50% */}
            <div className="hs-tegel hs-groen p-[18px] md:p-7" data-veer>
              <Bedrag pct="50%">
                tot <strong>€20.000</strong> per woning
              </Bedrag>
              <VoorWie />
              <ul>
                <VinkRegel>Woningeigenaar in het Nij Begun-gebied</VinkRegel>
                <VinkRegel>Niet in het versterkingsgebied én inkomen boven 140% sociaal minimum</VinkRegel>
              </ul>
            </div>

            {/* Kaart 100% */}
            <div className="hs-tegel hs-groen p-[18px] md:p-7" data-veer>
              <Bedrag pct="100%">
                tot <strong>€40.000</strong> per woning, plus €1.000 advies- en afwerkbijdrage
              </Bedrag>
              <VoorWie />
              <p className="hs-tekst mb-1 text-[14px]">Eén van deze voorwaarden volstaat:</p>
              <ul>
                <VinkRegel>Je woont in het versterkingsgebied (NCG)</VinkRegel>
                <VinkRegel>Of je inkomen valt onder 140% sociaal minimum</VinkRegel>
                <VinkRegel>Of je bent VvE of kleine verhuurder in het versterkingsgebied</VinkRegel>
              </ul>
            </div>
          </div>
        </div>
      </Sectie>

      {/* 4. WAT WORDT VERGOED */}
      <Sectie>
        <Kop2 midden>
          Welke isolatie wordt <Accent>vergoed</Accent>?
        </Kop2>

        <div className="mx-auto mt-7 grid max-w-6xl grid-cols-1 items-start gap-6 md:mt-10 lg:grid-cols-2 lg:gap-12">
          <div className="space-y-4 md:space-y-6" data-veer>
            <Illustration src={imgHuis} alt="Doorsnede van een huis met de vergoede isolatiemaatregelen" />

            {/* Standaard voor woningisolatie (uitklapbaar) */}
            <LosseUitklap kop="span" Icon={Lightbulb} icoonKleur="oker" vraag="Niet alle maatregelen passen bij elke woning">
              <p>
                Het doel van Nij Begun is jouw woning naar de Standaard voor woningisolatie te brengen. Een adviseur kijkt naar wat jouw huis écht nodig heeft. Soms wijkt dat advies af van wat je had verwacht. Vloerisolatie of nieuwe deuren zijn niet altijd de eerste stap. De adviseur is daarin eerlijk, want het doel is een warm en zuinig huis, niet zoveel mogelijk maatregelen.
              </p>
            </LosseUitklap>
          </div>

          <div className="space-y-6 md:space-y-8">
            <div className="hs-tegel p-[18px] md:p-7" data-veer>
              <h3 className="hs-h3 mb-2">Vergoede maatregelen</h3>
              <ul>
                <MeasureLi
                  label="Spouwmuurisolatie"
                  info="Voor woningen met spouwmuren (bouwjaar na 1920) is dit vaak de eerste en meest gebruikelijke stap. Goed rendement voor relatief lage kosten."
                />
                <MeasureLi
                  label="Dak- en vloerisolatie"
                  info="Dakisolatie levert vaak het hoogste rendement op, omdat warmte vooral via het dak ontsnapt. Vloerisolatie is een logische volgende stap."
                />
                <MeasureLi
                  label="Gevelisolatie (binnen of buiten)"
                  info="Voor woningen zonder spouwmuren. Buitenisolatie is duurder maar effectiever, binnenisolatie verkleint de leefruimte iets."
                />
                <MeasureLi
                  label="HR++ glas of vacuümglas"
                  info="Vervangt enkel of dubbel glas. Vacuümglas is dunner en past vaak in bestaande kozijnen."
                />
                <MeasureLi
                  label="Triple glas met nieuwe kozijnen (30% subsidie)"
                  info="De hoogste isolatiewaarde voor ramen. Hier geldt een aparte 30%-regeling, los van het €20.000 of €40.000-plafond."
                />
                <MeasureLi
                  label="Mechanische ventilatie of balansventilatie"
                  info="Na goede isolatie verplicht. Voorkomt vocht en schimmel, houdt de lucht gezond."
                />
                <MeasureLi
                  label="Diervriendelijk isoleren"
                  info="Wettelijk verplicht als er vleermuizen, mussen of gierzwaluwen in of aan je woning leven."
                />
              </ul>
            </div>

            <div data-veer>
              <h3 className="hs-h3 mb-2">Niet vergoed</h3>
              <ul>
                <KruisRegel Icon={XIcon}>Zonnepanelen, warmtepomp, zonneboiler (wel via ISDE)</KruisRegel>
                <KruisRegel Icon={XIcon}>Schilderwerk, behang, esthetische afwerking</KruisRegel>
                <KruisRegel Icon={XIcon}>Aanbouwen of nieuwbouw na 1 juli 2012</KruisRegel>
              </ul>
            </div>
          </div>
        </div>
      </Sectie>

      {/* 5. AANMERKING: het Nij Begun-gebied, in de provinciekleur */}
      <Sectie band>
        <Kop2
          midden
          lead={
            <>
              De subsidie geldt voor woningeigenaren in <strong className="text-primary">de hele provincie Groningen</strong> en in <strong className="text-primary">drie Drentse gemeenten</strong>.
            </>
          }
        >
          Komt jouw woning in <Accent>aanmerking</Accent>?
        </Kop2>

        <div className="mx-auto mt-7 grid max-w-5xl grid-cols-1 gap-3 md:mt-10 md:grid-cols-2 md:gap-5">
          <div className="hs-tegel hs-tint-provincie p-[18px] md:p-7" data-veer>
            <div className="flex items-center justify-between gap-3">
              <h3 className="hs-h3">Provincie Groningen, alle 10 gemeenten</h3>
              <Rondje Icon={Building2} kleur="provincie" />
            </div>
            <ul className="mt-3 grid grid-cols-2 gap-x-2">
              {[
                "Eemsdelta", "Groningen",
                "Het Hogeland", "Midden-Groningen",
                "Oldambt", "Pekela",
                "Stadskanaal", "Veendam",
                "Westerkwartier", "Westerwolde",
              ].map((g) => (
                <VinkRegel key={g} klein>{g}</VinkRegel>
              ))}
            </ul>
          </div>

          <div className="hs-tegel hs-tint-provincie p-[18px] md:p-7" data-veer>
            <div className="flex items-center justify-between gap-3">
              <h3 className="hs-h3">Noord-Drenthe, drie gemeenten</h3>
              <Rondje Icon={Trees} kleur="provincie" />
            </div>
            <ul className="mt-3">
              <VinkRegel>Aa en Hunze</VinkRegel>
              <VinkRegel>Noordenveld</VinkRegel>
              <VinkRegel>Tynaarlo</VinkRegel>
            </ul>
          </div>
        </div>

        <p className="hs-tekst mx-auto mt-4 max-w-3xl text-center text-[13.5px] leading-[1.5] md:mt-6">
          Andere Drentse gemeenten zoals Assen, Emmen en Coevorden vallen niet onder Nij Begun. Voor hen gelden andere subsidies.
        </p>
      </Sectie>

      {/* 6. ZO VERLOOPT JOUW TRAJECT */}
      <Sectie>
        <Kop2 lead="Zo werkt het bij ons. Geen telefooncentrale, geen wachtrij, geen formulieren in pdf. Wij doen het zware werk, jij houdt de regie.">
          Zo verloopt jouw <Accent>traject</Accent>
        </Kop2>
        <Stappen stappen={stappen} />
        <TussenCta
          kop="Wil je sneller door zonder gedoe?"
          tekst="Neem contact op. Een lokale adviseur uit jouw regio belt of komt langs binnen een week."
          knop={<CtaButton href="/contact">Ik wil gebeld worden</CtaButton>}
        />
      </Sectie>

      {/* 7. FAQ */}
      <SubsidieFaq faqs={faqs} band />

      {/* 8. WAAROM VOORTRAJECT */}
      <Sectie>
        <Kop2 lead="Wat ons anders maakt dan een gemeenteloket of een ingehuurde callcenter-helpdesk.">
          Waarom bewoners voor Voortraject <Accent>kiezen</Accent>
        </Kop2>
        <WaaromTegels
          redenen={[
            {
              Icon: Home,
              t: "Persoonlijk huisbezoek",
              d: "Geen wachtrij, geen formulier-eerst. Een lokale adviseur uit jouw regio belt of komt langs binnen een week.",
            },
            {
              Icon: FileCheck,
              t: "Wij regelen de papierwinkel",
              d: "Geen DigiD-gedoe, geen termijnen die je zelf moet bewaken. Wij dienen in, bewaken de procedure en houden je op de hoogte.",
            },
            {
              Icon: Scale,
              t: "Eerlijk advies",
              d: "Wij hebben geen voorkeur voor bepaalde uitvoerders. We brengen je in contact met aangesloten Nij Begun-bedrijven die bij jouw woning passen.",
            },
            {
              Icon: LifeBuoy,
              t: "Nazorg en natraject",
              d: "Na de oplevering blijven we beschikbaar. Voor garantie, onderhoud of een vervolgvraag over warmtepomp of zonnepanelen.",
            },
          ]}
        />
      </Sectie>

      <Footer cta={<SlotCta laatstBijgewerkt={LAATST_BIJGEWERKT} />} />
    </div>
  );
};

export default SubsidiesNijBegun;
