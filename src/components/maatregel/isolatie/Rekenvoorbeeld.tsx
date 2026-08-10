import { euro, ISDE_ISOLATIE } from "@/data/isde";
import { Accent, SectieKop } from "@/components/maatregel/primitieven";
import { KLEUR } from "@/components/maatregel/stijl";

/**
 * Eén doorgerekend voorbeeld, want de verdubbelingsregel wordt pas concreet
 * als je er getallen bij ziet.
 *
 * De oppervlaktes zijn een expliciet gekozen voorbeeld, geen gemiddelde: dat
 * verschilt te veel per woning om als feit te presenteren. De bedragen komen
 * uit src/data/isde.ts, zodat het voorbeeld niet uit de pas kan gaan lopen met
 * de tabel erboven.
 */

const SPOUW_M2 = 50;
const DAK_M2 = 40;

const spouw = ISDE_ISOLATIE.find((m) => m.deel === "spouw")!;
const dak = ISDE_ISOLATIE.find((m) => m.deel === "dak")!;

const losSpouw = SPOUW_M2 * spouw.perM2;
const losDak = DAK_M2 * dak.perM2;
const samenSpouw = SPOUW_M2 * spouw.perM2Dubbel;
const samenDak = DAK_M2 * dak.perM2Dubbel;
const los = losSpouw + losDak;
const samen = samenSpouw + samenDak;

export const Rekenvoorbeeld = () => (
  <>
    <div className="text-center">
      <SectieKop center>
        <Accent tekst="Wat de verdubbeling concreet [[scheelt]]" />
      </SectieKop>
      <p
        className="mt-4 mx-auto text-base leading-relaxed"
        style={{ color: KLEUR.navy, opacity: 0.75, maxWidth: 660 }}
      >
        Stel: je isoleert {SPOUW_M2} m² spouwmuur en {DAK_M2} m² dak. Doe je dat als twee
        losse trajecten, dan geldt twee keer het enkele tarief. Voer je ze samen uit, dan
        verdubbelt het bedrag per vierkante meter voor allebei.
      </p>
    </div>

    <div className="mt-10 mx-auto max-w-[860px] grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
      <Kolom
        label="Los uitgevoerd"
        regels={[
          [`${SPOUW_M2} m² spouwmuur × ${euro(spouw.perM2)}`, euro(losSpouw)],
          [`${DAK_M2} m² dak × ${euro(dak.perM2)}`, euro(losDak)],
        ]}
        totaal={euro(los)}
      />
      <Kolom
        label="Samen uitgevoerd"
        uitgelicht
        regels={[
          [`${SPOUW_M2} m² spouwmuur × ${euro(spouw.perM2Dubbel)}`, euro(samenSpouw)],
          [`${DAK_M2} m² dak × ${euro(dak.perM2Dubbel)}`, euro(samenDak)],
        ]}
        totaal={euro(samen)}
      />
    </div>

    <p
      className="mt-7 text-center text-base leading-relaxed mx-auto"
      style={{ color: KLEUR.navy, maxWidth: 660 }}
    >
      Dezelfde vierkante meters, {euro(samen - los)} meer subsidie. Daarom kijken we altijd eerst
      of je maatregelen kunt bundelen voordat er iemand aan de slag gaat.
    </p>
    <p
      className="mt-3 text-center text-[13px] mx-auto"
      style={{ color: KLEUR.navy, opacity: 0.55, maxWidth: 660 }}
    >
      Rekenvoorbeeld met gekozen oppervlaktes. Hoeveel vierkante meter jouw woning heeft,
      bepaalt het werkelijke bedrag.
    </p>
  </>
);

const Kolom = ({
  label,
  regels,
  totaal,
  uitgelicht = false,
}: {
  label: string;
  regels: [string, string][];
  totaal: string;
  uitgelicht?: boolean;
}) => (
  <div
    className="rounded-2xl p-6 flex flex-col"
    style={{
      backgroundColor: uitgelicht ? "hsl(var(--accent) / 0.12)" : KLEUR.wit,
      border: `1px solid ${uitgelicht ? "hsl(var(--accent) / 0.45)" : KLEUR.rand}`,
    }}
  >
    <span
      className="text-[12px] font-bold uppercase tracking-wider"
      style={{ color: KLEUR.navy, opacity: uitgelicht ? 0.85 : 0.5 }}
    >
      {label}
    </span>
    <dl className="mt-4 flex flex-col gap-2.5" style={{ margin: "16px 0 0 0" }}>
      {regels.map(([omschrijving, bedrag]) => (
        <div key={omschrijving} className="flex items-baseline justify-between gap-4">
          <dt className="text-[14px]" style={{ color: KLEUR.navy, opacity: 0.75 }}>
            {omschrijving}
          </dt>
          <dd
            className="text-[14px] tabular-nums shrink-0"
            style={{ color: KLEUR.navy, opacity: 0.75, margin: 0 }}
          >
            {bedrag}
          </dd>
        </div>
      ))}
    </dl>
    <div
      className="mt-4 pt-4 flex items-baseline justify-between gap-4"
      style={{ borderTop: `1px solid ${KLEUR.rand}` }}
    >
      <span className="text-[14px] font-semibold" style={{ color: KLEUR.navy }}>
        Totaal ISDE
      </span>
      <span
        className="font-display tabular-nums"
        style={{ color: KLEUR.navy, fontWeight: 700, fontSize: 24 }}
      >
        {totaal}
      </span>
    </div>
  </div>
);
