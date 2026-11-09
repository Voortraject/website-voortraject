// Op formulieren met zowel verplichte als optionele velden markeren we alleen
// wat verplicht is. Het sterretje neemt de kleur van het label over: in oker
// concurreerde het met de CTA. Voor schermlezers is het verborgen, want die
// krijgen `aria-required` al van het veld zelf.
export const Ster = () => (
  <span aria-hidden="true" className="ml-0.5">
    *
  </span>
);

export const VerplichtUitleg = () => (
  <p aria-hidden="true" className="mt-1 text-[13px] font-medium text-[hsl(var(--rs-tekst-zacht))]">
    * verplicht
  </p>
);
