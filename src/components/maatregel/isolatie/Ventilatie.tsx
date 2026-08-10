import { AlertTriangle, ArrowLeftRight, ArrowRight, Fan, Wind } from "lucide-react";

import { euro, ISDE_BRON, ISDE_VENTILATIE_BEDRAG } from "@/data/isde";
import { Accent, SectieKop } from "@/components/maatregel/primitieven";
import { KLEUR } from "@/components/maatregel/stijl";

/**
 * Ventilatie krijgt een eigen blok in plaats van één regel in een opsomming.
 *
 * Dit is het onderdeel waar de meeste bewoners de mist in gaan: hoe beter je
 * isoleert, hoe luchtdichter de woning, en zonder bewuste luchtverversing komt
 * daar vocht en schimmel van. Sinds 2026 zit er ook een ISDE-bedrag op.
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
    let: "De duurste optie en hij vraagt kanalen door de woning. Levert de meeste warmte terug.",
  },
];

export const Ventilatie = () => (
  <>
    <div className="text-center">
      <SectieKop center>
        <Accent tekst="Goed isoleren vraagt om goed [[ventileren]]" />
      </SectieKop>
      <p
        className="mt-4 mx-auto text-base leading-relaxed"
        style={{ color: KLEUR.navy, opacity: 0.75, maxWidth: 700 }}
      >
        Hoe beter je isoleert, hoe luchtdichter je woning wordt. De vochtige lucht van douchen,
        koken en ademen moet er dan bewust uit. Gebeurt dat niet, dan slaat het neer op de
        koudste plek en krijg je vocht en schimmel. Dit is de stap die het vaakst wordt
        overgeslagen.
      </p>
    </div>

    <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
      {SOORTEN.map((s) => (
        <div
          key={s.naam}
          className="rounded-2xl p-6 flex flex-col"
          style={{ backgroundColor: KLEUR.wit, border: `1px solid ${KLEUR.rand}` }}
        >
          <span
            className="inline-flex items-center justify-center rounded-full shrink-0"
            style={{ width: 40, height: 40, backgroundColor: "hsl(var(--accent) / 0.2)" }}
          >
            <s.Icon size={20} color={KLEUR.navy} aria-hidden="true" />
          </span>
          <h3
            className="mt-4 text-[18px] font-semibold"
            style={{ color: KLEUR.navy, margin: "16px 0 0 0" }}
          >
            {s.naam}
          </h3>
          <p
            className="mt-2.5 text-[15px] leading-relaxed"
            style={{ color: KLEUR.navy, opacity: 0.8, margin: "10px 0 0 0" }}
          >
            {s.hoe}
          </p>
          <dl className="mt-4 flex flex-col gap-2.5" style={{ margin: "16px 0 0 0" }}>
            <div>
              <dt
                className="text-[11px] font-bold uppercase tracking-wider"
                style={{ color: KLEUR.navy, opacity: 0.5 }}
              >
                Past bij
              </dt>
              <dd
                className="text-[14px] leading-snug"
                style={{ color: KLEUR.navy, opacity: 0.8, margin: "2px 0 0 0" }}
              >
                {s.past}
              </dd>
            </div>
            <div>
              <dt
                className="text-[11px] font-bold uppercase tracking-wider"
                style={{ color: KLEUR.navy, opacity: 0.5 }}
              >
                Let op
              </dt>
              <dd
                className="text-[14px] leading-snug"
                style={{ color: KLEUR.navy, opacity: 0.8, margin: "2px 0 0 0" }}
              >
                {s.let}
              </dd>
            </div>
          </dl>
        </div>
      ))}
    </div>

    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
      <div
        className="rounded-2xl p-5 flex items-start gap-4"
        style={{
          backgroundColor: "hsl(var(--accent) / 0.12)",
          border: `1px solid hsl(var(--accent) / 0.4)`,
        }}
      >
        <span
          className="inline-flex items-center justify-center rounded-full shrink-0"
          style={{ width: 34, height: 34, backgroundColor: "hsl(var(--accent) / 0.35)" }}
        >
          <ArrowRight size={18} color={KLEUR.navy} aria-hidden="true" />
        </span>
        <p className="text-[15px] leading-relaxed" style={{ color: KLEUR.navy, margin: 0 }}>
          <strong>Nieuw in 2026:</strong> voor een energiezuinig ventilatiesysteem geldt een
          vast ISDE-bedrag van {euro(ISDE_VENTILATIE_BEDRAG)}, mits je het combineert met
          isolatie. Bron: {ISDE_BRON.naam}, gecontroleerd op {ISDE_BRON.gecontroleerd}.
        </p>
      </div>
      <div
        className="rounded-2xl p-5 flex items-start gap-4"
        style={{ backgroundColor: "#FEF7F7", border: "1px solid #F5D9D9" }}
      >
        <span
          className="inline-flex items-center justify-center rounded-full shrink-0"
          style={{ width: 34, height: 34, backgroundColor: "#F8E5E5" }}
        >
          <AlertTriangle size={18} color="#C0392B" aria-hidden="true" />
        </span>
        <p className="text-[15px] leading-relaxed" style={{ color: KLEUR.navy, margin: 0 }}>
          <strong>Let op de valkuil:</strong> ventilatie telt niet mee als tweede
          isolatiemaatregel. Combineer je isolatie alléén met ventilatie, dan verdubbelt je
          bedrag per m² niet.
        </p>
      </div>
    </div>
  </>
);
