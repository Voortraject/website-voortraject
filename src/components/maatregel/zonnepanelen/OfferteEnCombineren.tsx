import { ArrowRight } from "lucide-react";

import { BRONNEN, PANEEL, SALDERING } from "@/data/zonnepanelen";
import { Accent, NummerRondje, SectieKop } from "@/components/maatregel/primitieven";

/**
 * Advies bij het aanvragen van offertes, plus de doorverwijzing
 * naar de maatregelen die je zelfverbruik verhogen. Dat laatste is geen
 * verkooptruc maar het directe gevolg van het stoppen van de saldering: alleen
 * wat je zelf gebruikt is nog echt geld waard.
 */

const LETTEN = [
  {
    kop: "Welke omvormer",
    tekst:
      "Eén string-omvormer voor alle panelen is goedkoper. Micro-omvormers of optimizers per paneel zijn duurder, maar nodig zodra er schaduw is of de panelen over meerdere dakvlakken liggen.",
  },
  {
    kop: "Eerst het dak, dan de panelen",
    tekst: `Panelen gaan ongeveer ${PANEEL.levensduur} jaar mee. Moet je dak binnen die termijn eraf, laat dat dan voorgaan, anders betaal je twee keer voor demonteren en terugplaatsen.`,
  },
  {
    kop: "Garantie per onderdeel",
    tekst:
      "Vraag de termijnen apart uit voor de panelen, de omvormer en het montagewerk. Die lopen uiteen, en het is een van de weinige punten waarop offertes echt verschillen.",
  },
  {
    kop: "Let op de terugleverkosten",
    tekst:
      "Leveranciers mogen kosten rekenen voor het verwerken van teruggeleverde stroom. Die verschillen per contract en gaan vanaf 2027 zwaarder wegen, dus vergelijk ze voordat je tekent.",
  },
];

const COMBINEERT = [
  {
    label: "Thuisbatterij",
    href: "/verduurzamen/thuisbatterij",
    tekst: "Bewaart de opwek van overdag voor de avond.",
  },
  {
    label: "Warmtepomp",
    href: "/verduurzamen/warmtepomp",
    tekst: "Verbruikt het hele jaar door stroom, ook als de zon schijnt.",
  },
  {
    label: "Laadpaal",
    href: "/verduurzamen/laadpaal",
    tekst: "Slim laden schuift het laden naar de zonuren.",
  },
];

export const OfferteEnCombineren = () => (
  <>
    <div className="text-center">
      <SectieKop center>
        <Accent tekst="Waar je op let bij een [[offerte]]" />
      </SectieKop>
      <p className="vd-lead mx-auto mt-3 max-w-[640px]">
        Offertes voor zonnepanelen lijken sterk op elkaar. Deze vier punten zijn waar ze echt van
        elkaar verschillen.
      </p>
    </div>

    <div className="hs-tegel hs-blauw-zacht mt-7 p-5 md:mt-10 md:p-8" data-veer>
      <div className="grid grid-cols-1 gap-x-10 gap-y-5 md:grid-cols-2 md:gap-y-6">
        {LETTEN.map((punt, i) => (
          <div key={punt.kop} className="flex items-start gap-3.5">
            <NummerRondje n={i + 1} size={32} />
            <div className="min-w-0">
              <span className="hs-h3 block pt-1">{punt.kop}</span>
              <span className="vd-tekst mt-1 block">{punt.tekst}</span>
            </div>
          </div>
        ))}
      </div>
    </div>

    <div className="hs-tegel hs-zand mt-4 p-5 md:mt-6 md:p-8" data-veer>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8">
        <span className="vd-label">Meer zelf gebruiken</span>
        <span className="vd-tekst max-w-[560px] text-[14px]">
          Zodra salderen op {SALDERING.stopt} stopt, verdien je je panelen vooral terug met de
          stroom die je zelf gebruikt. Deze drie helpen daarbij.
        </span>
      </div>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:mt-6 sm:grid-cols-3 sm:gap-6">
        {COMBINEERT.map((item) => (
          <div key={item.href}>
            <a href={item.href} className="hs-pijl-link text-[16px]">
              {item.label}
              <ArrowRight size={17} strokeWidth={2.2} className="hs-pijl" aria-hidden="true" />
            </a>
            <span className="vd-tekst block text-[14px]">{item.tekst}</span>
          </div>
        ))}
      </div>
    </div>

    <p className="vd-tekst mb-0 mt-4 text-[13.5px] md:mt-5">
      Dat leveranciers alleen de kosten mogen doorrekenen die zij zelf maken om teruggeleverde
      stroom te verwerken, staat bij de{" "}
      <a
        href={BRONNEN.saldering.url}
        target="_blank"
        rel="noopener noreferrer"
        className="underline underline-offset-2"
      >
        {BRONNEN.saldering.naam}
      </a>
      , gecontroleerd op {BRONNEN.saldering.gecontroleerd}.
    </p>
  </>
);
