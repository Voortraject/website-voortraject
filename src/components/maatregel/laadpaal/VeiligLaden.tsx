import { AlertTriangle, ShieldCheck } from "lucide-react";

import { BALANCERING, BRONNEN, INSTALLATIE, VOORRANGSSCHAKELAAR } from "@/data/laadpaal";
import { Accent, IconCirkel, SectieKop } from "@/components/maatregel/primitieven";

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

/** Het rood van de waarschuwingen: de destructive-token, geen losse hexcode. */
const ROOD = "hsl(var(--destructive))";
const OKER = "hsl(var(--accent))";

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
      className="flex h-9 w-full overflow-hidden rounded-full"
      style={{ backgroundColor: "hsl(var(--primary) / 0.07)" }}
    >
      <div style={{ width: breedte(huis), backgroundColor: "hsl(var(--primary) / 0.3)" }} />
      <div
        style={{
          width: breedte(laadpaal - overschrijding),
          backgroundColor: OKER,
        }}
      />
      {overschrijding > 0 && (
        <div style={{ width: breedte(overschrijding), backgroundColor: ROOD }} />
      )}
    </div>
    {/* Het plafond: wat je aansluiting aankan. */}
    <div
      className="absolute top-[-6px] bottom-[-6px]"
      style={{ left: `${PLAFOND}%`, width: 2, backgroundColor: "hsl(var(--primary))" }}
    />
  </div>
);

export const VeiligLaden = () => (
  <>
    <div className="text-center">
      <SectieKop center>
        <Accent tekst="Veilig laden, en wat load balancing [[doet]]" />
      </SectieKop>
      <p className="vd-lead mx-auto mt-3 max-w-[660px]">
        Een laadpaal is het zwaarste apparaat dat je aan je woning hangt. Alles daarachter moet
        kloppen, want dit is het deel dat je niet ziet en waar het in de praktijk misgaat.
      </p>
    </div>

    <div className="hs-tegel hs-blauw-zacht mt-7 p-3 md:mt-10 md:p-4" data-veer>
      <div className="flex flex-col gap-1 px-3 pb-3 pt-2 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6 md:px-5">
        <span className="vd-label">Wat er door je aansluiting past</span>
        <span className="vd-tekst text-[14px]">De streep is wat je aansluiting aankan</span>
      </div>

      <div className="vd-zebra flex flex-col gap-1">
      {BALANCERING.map((stand) => (
        <div
          key={stand.id}
          className="grid grid-cols-1 gap-3 px-3 py-5 md:grid-cols-[1fr_320px] md:items-center md:gap-10 md:px-5"
        >
          <div>
            <span className="block text-[15.5px] font-bold leading-[1.4] text-primary">
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
            className={
              stand.toon === "fout"
                ? "m-0 text-[15px] font-semibold leading-relaxed text-destructive"
                : "vd-tekst m-0"
            }
          >
            {stand.gevolg}
          </p>
        </div>
      ))}
      </div>

      {/* Legenda onderaan, want boven de balken zou hij de vergelijking breken. */}
      <div className="flex flex-wrap gap-x-6 gap-y-2 px-3 pb-2 pt-3 md:px-5">
        {[
          { kleur: "hsl(var(--primary) / 0.3)", label: "De rest van je huis" },
          { kleur: OKER, label: "De laadpaal" },
          { kleur: ROOD, label: "Meer dan je aansluiting aankan" },
        ].map((item) => (
          <span key={item.label} className="inline-flex items-center gap-2">
            <span
              className="inline-block rounded-full"
              style={{ width: 14, height: 14, backgroundColor: item.kleur }}
              aria-hidden="true"
            />
            <span className="vd-tekst text-[13.5px]">{item.label}</span>
          </span>
        ))}
      </div>
    </div>

    <p className="vd-tekst mx-auto mt-5 max-w-[760px] text-center">
      {VOORRANGSSCHAKELAAR}
    </p>

    <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 md:mt-12 md:gap-5">
      {INSTALLATIE.eisen.map((eis) => (
        <div key={eis.kop} className="hs-tegel hs-blauw-zacht flex items-start gap-4 p-5" data-veer>
          <IconCirkel Icon={ShieldCheck} size={36} />
          <span className="min-w-0">
            <span className="block text-[16px] font-bold leading-[1.4] text-primary">{eis.kop}</span>
            <span className="vd-tekst mt-1 block text-[14.5px]">{eis.tekst}</span>
          </span>
        </div>
      ))}
    </div>

    <div className="hs-tegel vd-let-op mt-4 flex items-start gap-4 p-5 md:mt-5 md:p-6" data-veer>
      <IconCirkel Icon={AlertTriangle} kleur="let-op" size={36} />
      <p className="m-0 pt-1 text-[15.5px] leading-relaxed text-foreground">
        {INSTALLATIE.stopcontact}
      </p>
    </div>

    <p className="vd-tekst mt-5 text-[13.5px]">
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
