import { AlertTriangle, ArrowLeftRight, Fan, Wind } from "lucide-react";

import { Accent, IconCirkel, SectieKop } from "@/components/maatregel/primitieven";

/**
 * Ventilatie krijgt een eigen blok in plaats van één regel in een opsomming.
 *
 * Dit is het onderdeel waar de meeste bewoners de mist in gaan: hoe beter je
 * isoleert, hoe luchtdichter de woning, en zonder bewuste luchtverversing komt
 * daar vocht en schimmel van.
 */

const SOORTEN = [
  {
    Icon: Wind,
    naam: "Natuurlijke ventilatie",
    hoe: "Roosters, ramen en een afvoerkanaal. Lucht komt binnen op windkracht en temperatuurverschil.",
    past: "Woningen die nog niet erg luchtdicht zijn.",
    let: "Werkt niet meer betrouwbaar zodra de woning goed geïsoleerd en kierdicht is.",
  },
  {
    Icon: Fan,
    naam: "Mechanische afzuiging",
    hoe: "Een ventilator zuigt vochtige lucht af bij keuken, badkamer en toilet. Verse lucht komt via roosters binnen.",
    past: "De meest voorkomende oplossing bij een geïsoleerde bestaande woning.",
    let: "Je zuigt wel warme lucht naar buiten. Filters en kanalen vragen onderhoud.",
  },
  {
    Icon: ArrowLeftRight,
    naam: "Balansventilatie met WTW",
    hoe: "Aan- en afvoer zijn in balans, en een warmtewisselaar haalt de warmte uit de afgevoerde lucht.",
    past: "Goed geïsoleerde, luchtdichte woningen en ingrijpende verbouwingen.",
    let: "Vraagt de grootste investering en kanalen door de woning. Levert daarvoor de meeste warmte terug.",
  },
];

export const Ventilatie = () => (
  <>
    <div className="text-center">
      <SectieKop center>
        <Accent tekst="Goed isoleren vraagt om goed [[ventileren]]" />
      </SectieKop>
      <p className="vd-lead mx-auto mt-3 max-w-[700px]">
        Hoe beter je isoleert, hoe luchtdichter je woning wordt. De vochtige lucht van douchen,
        koken en ademen moet er dan bewust uit. Gebeurt dat niet, dan slaat het neer op de
        koudste plek en krijg je vocht en schimmel. Dit is de stap die het vaakst wordt
        overgeslagen.
      </p>
    </div>

    <div className="mt-7 grid grid-cols-1 gap-3 md:mt-10 md:grid-cols-3 md:gap-5">
      {SOORTEN.map((s) => (
        <div key={s.naam} className="hs-tegel hs-blauw-zacht flex flex-col p-5 md:p-6" data-veer>
          <div className="flex items-center justify-between gap-3">
            <h3 className="hs-h3 m-0">{s.naam}</h3>
            <IconCirkel Icon={s.Icon} />
          </div>
          <p className="vd-tekst mb-0 mt-2.5">{s.hoe}</p>
          <dl className="vd-inzet mx-0 mb-0 mt-4 flex flex-col gap-2.5 px-4 py-3">
            <div>
              <dt className="vd-label text-[12px]">Past bij</dt>
              <dd className="m-0 mt-0.5 text-[14.5px] leading-snug text-foreground">{s.past}</dd>
            </div>
            <div>
              <dt className="vd-label text-[12px]">Let op</dt>
              <dd className="m-0 mt-0.5 text-[14.5px] leading-snug text-foreground">{s.let}</dd>
            </div>
          </dl>
        </div>
      ))}
    </div>

    <div className="hs-tegel vd-let-op mt-4 flex items-start gap-4 p-5 md:mt-6" data-veer>
      <IconCirkel Icon={AlertTriangle} kleur="let-op" size={36} />
      <p className="m-0 text-[15px] leading-relaxed text-foreground">
        <strong className="text-primary">De valkuil:</strong> ventilatie wordt vaak pas bedacht als de woning al dicht
        zit en de eerste vochtplekken verschijnen. Neem het mee in hetzelfde plan als de
        isolatie, niet als los klusje achteraf. Voor ventilatie bestaan bovendien eigen
        regelingen, die per adres verschillen.
      </p>
    </div>
  </>
);
