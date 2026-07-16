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

    {/* Overlay: een lichte scrim met de uitnodigingskaart erin. */}
    <div className="absolute inset-0 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-gradient-to-b from-background/15 via-background/50 to-background/75"
        aria-hidden="true"
      />
      <div
        className="relative z-10 w-full max-w-md rounded-2xl border-2 bg-card p-6 text-center shadow-card md:p-8"
        style={{ borderColor: "hsl(var(--accent) / 0.8)" }}
      >
        <span
          className="mx-auto flex h-12 w-12 items-center justify-center rounded-full"
          style={{ backgroundColor: "hsl(var(--accent) / 0.15)" }}
          aria-hidden="true"
        >
          <Mail size={22} strokeWidth={2} className="text-primary" />
        </span>
        <h3 className="mt-4 font-display text-[19px] font-semibold text-primary md:text-[21px]">
          Nog {aantal} {aantal === 1 ? "regeling" : "regelingen"} voor jouw adres
        </h3>
        <p className="mx-auto mt-2 max-w-sm text-[15px] leading-relaxed text-foreground/80">
          Het gaat om regionale, provinciale en gemeentelijke regelingen. We mailen je het volledige overzicht gratis
          en vrijblijvend, en daarna zie je ze ook meteen hier op de pagina.
        </p>
        <button
          type="button"
          onClick={onOntgrendel}
          className="mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 text-[15px] font-semibold text-primary transition-colors hover:bg-accent-hover min-h-[48px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <Mail size={16} strokeWidth={2} aria-hidden="true" />
          Mail mij de overige regelingen
        </button>
        <p className="mt-3 text-[12.5px] text-muted-foreground">
          Gratis, geen nieuwsbrief. Je gegevens gebruiken we alleen voor dit overzicht en om vrijblijvend mee te
          denken.
        </p>
      </div>
    </div>
  </div>
);
