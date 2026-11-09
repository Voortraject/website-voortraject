// Op formulieren met zowel verplichte als optionele velden markeren we alleen
// wat verplicht is. Het sterretje neemt de kleur van het label over: in oker
// concurreerde het met de CTA. Voor schermlezers is het verborgen, want die
// krijgen `aria-required` al van het veld zelf.
export const Ster = () => (
  <span aria-hidden="true" className="ml-0.5">
    *
  </span>
);

// Staat op de regel van de groepskop, rechts tegen het rondje aan: ml-auto duwt
// hem weg van de koptekst. Een eigen regel kostte alleen maar hoogte. De
// fontklasse is nodig omdat een kop de koppenletter doorgeeft.
export const VerplichtUitleg = () => (
  <span
    aria-hidden="true"
    className="ml-auto whitespace-nowrap font-sans text-[13px] font-medium text-[hsl(var(--rs-tekst-zacht))]"
  >
    * verplicht
  </span>
);
