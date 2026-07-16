import { Mail } from "lucide-react";

import type { SubsidieRegeling } from "@/lib/subsidies";

import { RegelingGroep } from "./RegelingGroep";

// Titel van het afgeschermde blok — gedeeld met StapResultaat, zodat de kop na
// het versturen van de mail exact hetzelfde is als eronder in de wazige staat.
export const AFGESCHERMD_TITEL = "Regionale en lokale regelingen";

// Zet het `inert`-attribuut (React 18 kent het niet als prop): haalt de wazige
// kaarten uit de tab-volgorde én verbergt ze voor screenreaders, zodat niemand in
// onleesbare content belandt. Modulescope = stabiele ref-identiteit.
const zetInert = (el: HTMLDivElement | null) => {
  if (el) el.setAttribute("inert", "");
};

interface AfgeschermdeRegelingenProps {
  /** De niet-landelijke regelingen (provinciaal, gemeentelijk, regionaal). */
  regelingen: SubsidieRegeling[];
  /** Aantal afgeschermde regelingen (voor de kop van de CTA). */
  aantal: number;
  /** Scrollt naar en focust het mailformulier onderaan. */
  onOntgrendel: () => void;
}

// Het niet-landelijke deel van het resultaat: wazig zichtbaar, met een
// uitnodiging eroverheen. Bewust géén slotje of "ontgrendel"-taal (dat leest als
// een betaalmuur à la de digitale krant): de toon is een gratis service — we
// stúren je deze regelingen, vrijblijvend — niet iets dat we achterhouden. De
// waas is licht genoeg om te zien dat er echte, complete kaarten staan, en net
// te zwaar om ze te lezen.
export const AfgeschermdeRegelingen = ({ regelingen, aantal, onOntgrendel }: AfgeschermdeRegelingenProps) => (
  <div className="relative mt-8">
    {/* De wazige regelingen: niet-interactief en buiten de leesvolgorde. */}
    <div ref={zetInert} aria-hidden="true" className="pointer-events-none select-none blur-[5px]">
      <RegelingGroep titel={AFGESCHERMD_TITEL} regelingen={regelingen} animatie={false} />
    </div>

    {/* Lichte scrim over het hele wazige blok. */}
    <div
      className="absolute inset-0 bg-gradient-to-b from-background/15 via-background/50 to-background/75"
      aria-hidden="true"
    />

    {/* Uitnodiging als brede banner, over de eerste rij wazige kaarten: in beeld
        zodra de bezoeker voorbij de landelijke regelingen scrolt, vóór het
        wegklik-moment. Op mobiel bijna volle breedte en iets kleinere letters,
        zodat de kop en de knoptekst elk op één regel passen. */}
    <div className="absolute inset-x-0 top-12 flex justify-center px-2 md:top-20 md:px-4">
      <div
        className="w-full max-w-3xl rounded-2xl border-2 bg-card p-4 shadow-card md:p-6"
        style={{ borderColor: "hsl(var(--accent) / 0.8)" }}
      >
        <div className="flex flex-col items-center gap-3.5 text-center md:flex-row md:gap-5 md:text-left">
          <span
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
            style={{ backgroundColor: "hsl(var(--accent) / 0.15)" }}
            aria-hidden="true"
          >
            <Mail size={20} strokeWidth={2} className="text-primary" />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="font-display text-[16.5px] font-semibold leading-snug text-primary md:text-[20px]">
              Nog {aantal} {aantal === 1 ? "regeling" : "regelingen"} voor jouw adres
            </h3>
            <p className="mt-1 text-[14px] leading-relaxed text-foreground/80 md:text-[14.5px]">
              Regionaal, provinciaal en gemeentelijk. We mailen ze je gratis en vrijblijvend, geen nieuwsbrief.
            </p>
          </div>
          <button
            type="button"
            onClick={onOntgrendel}
            className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-full bg-accent px-4 py-3 text-[14px] font-semibold text-primary transition-colors hover:bg-accent-hover min-h-[48px] sm:w-auto md:px-6 md:text-[15px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <Mail size={16} strokeWidth={2} aria-hidden="true" />
            Mail mij de overige regelingen
          </button>
        </div>
      </div>
    </div>
  </div>
);
