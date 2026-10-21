import { forwardRef, useId, type ReactNode } from "react";
import { Check, House, Loader2, MapPin } from "lucide-react";

import { type Bewonertype, formatEuro, type Samenvatting as SamenvattingData, type TopBedrag } from "@/lib/subsidies";

import { TelOp } from "./TelOp";
import { UITZOEK_GERUSTSTELLING } from "./uitzoekAanvraag";
import type { UitzoekStatus } from "./useUitzoek";

// Woordkeuze per bewonertype, zodat de samenvatting terugkoppelt wat je hebt
// ingevuld ("voor jouw koopwoning"): endowment, dit is jóuw overzicht.
const WONINGWOORD: Record<Bewonertype, string> = {
  woningeigenaar: "koopwoning",
  huurder: "huurwoning",
  vve: "VvE",
  verhuurder: "woning",
};

// Zet een uitgelicht bedrag om in leesbare copy. Subsidie bij voorkeur als
// percentage ("tot 100% subsidie"), lening als bedrag ("een lening tot € X").
const subsidieTekst = (b: TopBedrag) =>
  b.soort === "pct" ? `tot ${b.waarde}% subsidie` : `subsidie tot € ${formatEuro(b.waarde)}`;
const leningTekst = (b: TopBedrag) =>
  b.soort === "euro" ? `een lening tot € ${formatEuro(b.waarde)}` : `een lening tot ${b.waarde}% van de kosten`;

interface SamenvattingProps {
  data: SamenvattingData;
  bewonertype: Bewonertype;
  /** Gemeente, of anders provincie: voor de situatie-terugkoppeling. */
  plaats?: string;
  /** "Verlengde Hereweg 12, Groningen". */
  adresRegel: string;
  onAdresWijzigen?: () => void;
  onSituatieAanpassen?: () => void;
  /** Sterkste concrete bedragen om als teaser uit te lichten (topBedragen()). */
  bedragen: { subsidie?: TopBedrag; lening?: TopBedrag };
  /** De eerste stap: de zin over het bouwjaar met een vraag eronder (desktop). */
  voet?: ReactNode;
  /** De tellers als mini-rij, in de tegel zelf (telefoon). */
  tellers?: ReactNode;
  /** De oker knop en wat er na de klik gebeurt. */
  aanvraag: { status: UitzoekStatus; fout: string | null; start: () => void };
  /** Komt in de bevestiging na de klik, bijvoorbeeld een vervolgvraag. */
  naAanvraag?: ReactNode;
}

const linkKnop =
  "rounded-sm text-[13.5px] font-semibold text-primary underline underline-offset-[3px] transition-opacity hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

// De hoofdtegel bovenaan het resultaat: de piek van de flow (peak-end).
// Eerst de conclusie (het aantal, groot), dan wat het voor dít huis betekent
// (het bouwjaar), en dan één volgende stap: de oker knop. Een licht verloop van
// blauwgrijs naar bijna wit, zoals de kaarten in het CRM-dashboard.
//
// Het ref wijst naar de knopzone. De mobiele actiebalk kijkt daarnaar en
// verschijnt pas als die uit beeld is, zodat dezelfde knop nooit twee keer
// tegelijk in beeld staat.
export const Samenvatting = forwardRef<HTMLDivElement, SamenvattingProps>(function Samenvatting(
  {
    data,
    bewonertype,
    plaats,
    adresRegel,
    onAdresWijzigen,
    onSituatieAanpassen,
    bedragen,
    voet,
    tellers,
    aanvraag,
    naAanvraag,
  },
  knopZone,
) {
  const titelId = useId();
  const { totaal } = data;
  const meervoud = totaal === 1 ? "regeling" : "regelingen";

  return (
    <section aria-labelledby={titelId} className="rs-hoofd px-5 pb-6 pt-5 sm:px-8 sm:pb-7 sm:pt-6 md:px-9 md:pb-8 md:pt-8">
      {/* Kop en huisicoon op één regel; daaronder het adres op één regel. */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {/* De pagina zelf heeft de h1 (voor schermlezers en de focus bij een
              stapwissel); hier staat dezelfde titel zichtbaar, dus niet twee keer
              voorlezen. */}
          <p id={titelId} aria-hidden="true" className="whitespace-nowrap font-display text-[21px] font-bold leading-tight tracking-[-0.015em] text-primary sm:text-[26px] md:text-[30px]">
            Jouw subsidieoverzicht
          </p>
          <div className="mt-1.5 flex items-center gap-x-4 text-[13.5px] text-[hsl(var(--rs-tekst-zacht))] sm:mt-2 sm:flex-wrap sm:gap-y-1.5 sm:text-[14px]">
            <span className="inline-flex min-w-0 items-center gap-1.5">
              <MapPin size={15} strokeWidth={2} aria-hidden="true" className="shrink-0" />
              <span className="truncate">{adresRegel}</span>
            </span>
            {onAdresWijzigen && (
              <button type="button" onClick={onAdresWijzigen} className={`hidden sm:inline ${linkKnop}`}>
                adres wijzigen
              </button>
            )}
            {onSituatieAanpassen && (
              <button type="button" onClick={onSituatieAanpassen} className={`hidden sm:inline ${linkKnop}`}>
                situatie aanpassen
              </button>
            )}
          </div>
        </div>
        <span className="rs-badge rs-badge-ink rs-badge-kop" aria-hidden="true">
          <House size={18} strokeWidth={2.1} />
        </span>
      </div>

      {/* Het getal groot, de rest ernaast: één oogopslag. */}
      <div className="mt-4 flex items-center gap-4 sm:mt-5 md:gap-5">
        <TelOp
          waarde={totaal}
          className="font-display font-extrabold leading-none tracking-[-0.03em] text-[hsl(var(--rs-getal))] [font-size:clamp(52px,8vw,76px)]"
        />
        <p className="max-w-[30ch] font-display text-[16px] font-bold leading-snug text-primary sm:text-[17px] md:text-[20px]">
          {meervoud} voor jouw {WONINGWOORD[bewonertype]}
          {plaats ? ` in ${plaats}` : ""}
        </p>
      </div>

      {(bedragen.subsidie || bedragen.lening) && (
        <p className="mt-3 text-[15px] leading-snug text-foreground sm:text-[16px]">
          Waaronder{" "}
          {bedragen.subsidie && (
            <span className="font-semibold text-[hsl(var(--subsidie))]">{subsidieTekst(bedragen.subsidie)}</span>
          )}
          {bedragen.subsidie && bedragen.lening ? " en " : null}
          {bedragen.lening && <span className="font-semibold text-[hsl(var(--lening))]">{leningTekst(bedragen.lening)}</span>}
          .
        </p>
      )}

      {tellers && <div className="mt-4">{tellers}</div>}

      {voet && <div className="mt-5 max-w-[64ch]">{voet}</div>}

      <div ref={knopZone} className="mt-5 sm:mt-6">
        {aanvraag.status === "binnen" ? (
          // Na de klik: de knop maakt plaats voor de bevestiging. Geen termijn:
          // het team belt wel alle leads, maar we beloven geen moment.
          <div role="status" className="flex items-start gap-3.5">
            <span className="rs-badge rs-badge-subsidie rs-badge-groot rs-pop" aria-hidden="true">
              <Check size={22} strokeWidth={3} />
            </span>
            <div className="min-w-0">
              <p className="font-display text-[21px] font-bold leading-tight text-primary md:text-[23px]">
                Je aanvraag is binnen
              </p>
              <p className="mt-1.5 max-w-[52ch] text-[15.5px] leading-relaxed text-[hsl(var(--rs-tekst-zacht))]">
                We nemen contact met je op en zoeken uit wat er voor jouw huis echt in zit.
              </p>
              {naAanvraag && <div className="mt-5">{naAanvraag}</div>}
            </div>
          </div>
        ) : (
          <>
            <button
              type="button"
              onClick={aanvraag.start}
              disabled={aanvraag.status === "bezig"}
              aria-busy={aanvraag.status === "bezig"}
              className="rs-knop rs-knop-oker w-full px-6 py-4 text-[15.5px] sm:w-auto"
            >
              {aanvraag.status === "bezig" && <Loader2 size={17} className="animate-spin" aria-hidden="true" />}
              Laat gratis uitzoeken wat ik krijg
            </button>
            <p className="mt-2.5 max-w-[56ch] text-[13.5px] leading-relaxed text-[hsl(var(--rs-tekst-zacht))] sm:text-[14px]">
              {UITZOEK_GERUSTSTELLING}
            </p>
            {aanvraag.fout && (
              <p role="alert" className="mt-3 text-[14px] font-semibold text-destructive">
                {aanvraag.fout}
              </p>
            )}
          </>
        )}
      </div>
    </section>
  );
});
