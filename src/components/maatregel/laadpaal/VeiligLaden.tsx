import { AlertTriangle, ShieldCheck } from "lucide-react";

import { BALANCERING, BRONNEN, INSTALLATIE, VOORRANGSSCHAKELAAR } from "@/data/laadpaal";
import { Accent, SectieKop } from "@/components/maatregel/primitieven";
import { KLEUR } from "@/components/maatregel/stijl";

/**
 * Load balancing is onzichtbaar, technisch, en precies waar mensen mee de mist
 * in gaan. Een balk maakt in één oogopslag duidelijk wat er gebeurt: je
 * aansluiting is een plafond, alles in huis deelt dat plafond, en de laadpaal
 * is het enige apparaat dat zichzelf kan afknijpen.
 *
 * De rode strook is bewust géén "de laadpaal is te zwaar" maar "samen passen ze
 * er niet door". Dat is ook wat er in het echt misgaat: niet de laadpaal alleen
 * maar de optelsom, en dan gaat de hoofdzekering van het hele huis.
 */

/**
 * Breedte van de tekening in eenheden. Het plafond ligt op 100, dus wat daar
 * overheen gaat past nog net binnen het kader en is zichtbaar als overschot.
 */
const SCHAAL = 120;
const PLAFOND = (100 / SCHAAL) * 100;

const breedte = (waarde: number) => `${(waarde / SCHAAL) * 100}%`;

/** Zelfde rood als de "Niet"-kolom in het template; er is geen rode token. */
const ROOD = "#C0392B";

const Balk = ({
  huis,
  laadpaal,
  overschrijding,
}: {
  huis: number;
  laadpaal: number;
  overschrijding: number;
}) => (
  <div className="relative" aria-hidden="true">
    <div
      className="flex h-9 w-full overflow-hidden rounded-md"
      style={{ backgroundColor: "hsl(var(--primary) / 0.06)" }}
    >
      <div style={{ width: breedte(huis), backgroundColor: "hsl(var(--primary) / 0.3)" }} />
      <div
        style={{
          width: breedte(laadpaal - overschrijding),
          backgroundColor: KLEUR.goud,
        }}
      />
      {overschrijding > 0 && (
        <div style={{ width: breedte(overschrijding), backgroundColor: ROOD }} />
      )}
    </div>
    {/* Het plafond: wat je aansluiting aankan. */}
    <div
      className="absolute top-[-6px] bottom-[-6px]"
      style={{ left: `${PLAFOND}%`, width: 2, backgroundColor: KLEUR.navy }}
    />
  </div>
);

export const VeiligLaden = () => (
  <>
    <div className="text-center">
      <SectieKop center>
        <Accent tekst="Veilig laden, en wat load balancing [[doet]]" />
      </SectieKop>
      <p
        className="mt-4 mx-auto text-base leading-relaxed"
        style={{ color: KLEUR.navy, opacity: 0.75, maxWidth: 660 }}
      >
        Een laadpaal is het zwaarste apparaat dat je aan je woning hangt. Alles daarachter moet
        kloppen, want dit is het deel dat je niet ziet en waar het in de praktijk misgaat.
      </p>
    </div>

    <div
      className="mt-10 rounded-2xl overflow-hidden"
      style={{ backgroundColor: KLEUR.wit, border: `1px solid ${KLEUR.rand}` }}
    >
      <div
        className="px-6 py-4 md:px-8 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
        style={{ backgroundColor: KLEUR.zand, borderBottom: `1px solid ${KLEUR.rand}` }}
      >
        <span className="label-eyebrow">Wat er door je aansluiting past</span>
        <span className="text-[14px]" style={{ color: KLEUR.navy, opacity: 0.6 }}>
          De streep is wat je aansluiting aankan
        </span>
      </div>

      {BALANCERING.map((stand, i) => (
        <div
          key={stand.id}
          className="px-6 py-6 md:px-8 grid grid-cols-1 md:grid-cols-[1fr_320px] gap-4 md:gap-10 md:items-center"
          style={{ borderTop: i === 0 ? "none" : `1px solid ${KLEUR.rand}` }}
        >
          <div>
            <span
              className="block text-[15.5px] font-semibold"
              style={{ color: KLEUR.navy, lineHeight: 1.4 }}
            >
              {stand.situatie}
            </span>
            <div className="mt-4">
              <Balk
                huis={stand.huis}
                laadpaal={stand.laadpaal}
                overschrijding={stand.overschrijding}
              />
            </div>
          </div>
          <p
            className="text-[15px] leading-relaxed"
            style={{
              color: stand.toon === "fout" ? ROOD : KLEUR.navy,
              opacity: stand.toon === "fout" ? 1 : 0.75,
              margin: 0,
              fontWeight: stand.toon === "fout" ? 600 : 400,
            }}
          >
            {stand.gevolg}
          </p>
        </div>
      ))}

      {/* Legenda onderaan, want boven de balken zou hij de vergelijking breken. */}
      <div
        className="px-6 py-4 md:px-8 flex flex-wrap gap-x-6 gap-y-2"
        style={{ backgroundColor: KLEUR.zand, borderTop: `1px solid ${KLEUR.rand}` }}
      >
        {[
          { kleur: "hsl(var(--primary) / 0.3)", label: "De rest van je huis" },
          { kleur: KLEUR.goud, label: "De laadpaal" },
          { kleur: ROOD, label: "Meer dan je aansluiting aankan" },
        ].map((item) => (
          <span key={item.label} className="inline-flex items-center gap-2">
            <span
              className="inline-block rounded-sm"
              style={{ width: 14, height: 14, backgroundColor: item.kleur }}
              aria-hidden="true"
            />
            <span className="text-[13.5px]" style={{ color: KLEUR.navy, opacity: 0.7 }}>
              {item.label}
            </span>
          </span>
        ))}
      </div>
    </div>

    <p
      className="mt-5 text-[15px] leading-relaxed mx-auto text-center"
      style={{ color: KLEUR.navy, opacity: 0.7, maxWidth: 760 }}
    >
      {VOORRANGSSCHAKELAAR}
    </p>

    <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
      {INSTALLATIE.eisen.map((eis) => (
        <div
          key={eis.kop}
          className="rounded-2xl p-5 flex items-start gap-4"
          style={{ backgroundColor: KLEUR.wit, border: `1px solid ${KLEUR.rand}` }}
        >
          <span
            className="flex items-center justify-center rounded-full shrink-0"
            style={{ width: 34, height: 34, backgroundColor: "hsl(var(--accent) / 0.2)" }}
          >
            <ShieldCheck size={18} color={KLEUR.navy} aria-hidden="true" />
          </span>
          <span className="min-w-0">
            <span
              className="block text-[16px] font-semibold"
              style={{ color: KLEUR.navy, lineHeight: 1.4 }}
            >
              {eis.kop}
            </span>
            <span
              className="mt-1 block text-[14.5px] leading-relaxed"
              style={{ color: KLEUR.navy, opacity: 0.7 }}
            >
              {eis.tekst}
            </span>
          </span>
        </div>
      ))}
    </div>

    <div
      className="mt-5 rounded-2xl p-5 md:p-6 flex items-start gap-4"
      style={{ backgroundColor: "#FEF7F7", border: "1px solid #F3D6D2" }}
    >
      <AlertTriangle size={20} className="mt-[2px] shrink-0" color={ROOD} aria-hidden="true" />
      <p
        className="text-[15.5px] leading-relaxed"
        style={{ color: KLEUR.navy, opacity: 0.9, margin: 0 }}
      >
        {INSTALLATIE.stopcontact}
      </p>
    </div>

    <p className="mt-5 text-[13px] leading-relaxed" style={{ color: KLEUR.navy, opacity: 0.55 }}>
      Eisen aan de installatie en het advies over het stopcontact van{" "}
      <a
        href={BRONNEN.laadpunt.url}
        target="_blank"
        rel="noopener noreferrer"
        className="underline underline-offset-2"
      >
        {BRONNEN.laadpunt.naam}
      </a>{" "}
      en{" "}
      <a
        href={BRONNEN.opladen.url}
        target="_blank"
        rel="noopener noreferrer"
        className="underline underline-offset-2"
      >
        {BRONNEN.opladen.naam}
      </a>
      , de voorrangsschakelaar van{" "}
      <a
        href={BRONNEN.eenFase.url}
        target="_blank"
        rel="noopener noreferrer"
        className="underline underline-offset-2"
      >
        {BRONNEN.eenFase.naam}
      </a>
      . Gecontroleerd op {BRONNEN.laadpunt.gecontroleerd}.
    </p>
  </>
);
