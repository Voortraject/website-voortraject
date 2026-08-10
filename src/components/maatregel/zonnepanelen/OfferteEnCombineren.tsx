import { ArrowRight, Check } from "lucide-react";

import { BRONNEN, PANEEL, SALDERING } from "@/data/zonnepanelen";
import { Accent, SectieKop } from "@/components/maatregel/primitieven";
import { KLEUR } from "@/components/maatregel/stijl";

/**
 * Onafhankelijk advies bij het aanvragen van offertes, plus de doorverwijzing
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
      <p
        className="mt-4 mx-auto text-base leading-relaxed"
        style={{ color: KLEUR.navy, opacity: 0.75, maxWidth: 640 }}
      >
        Offertes voor zonnepanelen lijken sterk op elkaar. Deze vier punten zijn waar ze echt van
        elkaar verschillen.
      </p>
    </div>

    <div
      className="mt-10 rounded-2xl p-6 md:p-8"
      style={{ backgroundColor: KLEUR.wit, border: `1px solid ${KLEUR.rand}` }}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
        {LETTEN.map((punt) => (
          <div key={punt.kop} className="flex items-start gap-3">
            <Check
              size={17}
              className="mt-[4px] shrink-0"
              style={{ color: KLEUR.goud }}
              strokeWidth={2.5}
              aria-hidden="true"
            />
            <div>
              <span className="block text-[16px] font-semibold" style={{ color: KLEUR.navy }}>
                {punt.kop}
              </span>
              <span
                className="mt-1 block text-[14.5px] leading-relaxed"
                style={{ color: KLEUR.navy, opacity: 0.7 }}
              >
                {punt.tekst}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>

    <div
      className="mt-6 rounded-2xl p-6 md:p-8"
      style={{ backgroundColor: KLEUR.wit, border: `1px solid ${KLEUR.rand}` }}
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8">
        <span className="label-eyebrow">Meer zelf gebruiken</span>
        <span
          className="text-[14px] leading-relaxed"
          style={{ color: KLEUR.navy, opacity: 0.65, maxWidth: 560 }}
        >
          Zodra salderen op {SALDERING.stopt} stopt, verdien je je panelen vooral terug met de
          stroom die je zelf gebruikt. Deze drie helpen daarbij.
        </span>
      </div>
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
        {COMBINEERT.map((item) => (
          <div key={item.href}>
            <a
              href={item.href}
              className="inline-flex items-center gap-2 text-[16px] font-semibold underline-offset-4 transition-colors hover:underline"
              style={{ color: KLEUR.navy }}
            >
              {item.label}
              <ArrowRight size={15} aria-hidden="true" />
            </a>
            <span
              className="mt-1 block text-[14px] leading-relaxed"
              style={{ color: KLEUR.navy, opacity: 0.65 }}
            >
              {item.tekst}
            </span>
          </div>
        ))}
      </div>
    </div>

    <p className="mt-5 text-[13px] leading-relaxed" style={{ color: KLEUR.navy, opacity: 0.55 }}>
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
