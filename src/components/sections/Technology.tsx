export const Technology = () => (
  <section className="bg-primary py-[96px] md:py-[160px] relative overflow-hidden" aria-labelledby="tech-title">
    <div className="container-content relative">
      <div className="max-w-[960px]">
        <h2
          id="tech-title"
          className="font-display font-semibold text-white text-[40px] md:text-[64px] leading-[1.1] tracking-[-0.03em]"
        >
          Menselijke begeleiding, ondersteund door slimme automatisering
        </h2>
        <p className="mt-8 body-lg text-white/80 max-w-[640px]">
          Wij combineren persoonlijke begeleiding met slimme systemen voor intake,
          offerte-opbouw, communicatie en dossiercontrole. Daardoor werken we sneller,
          leveren we consistenter en kunnen we opschalen, zonder dat de bewoner het
          gevoel krijgt dat hij met een systeem praat.
        </p>
      </div>

      {/* Subtle accent dot, right side */}
      <span
        aria-hidden="true"
        className="hidden md:block absolute right-12 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-accent"
      />
      <span
        aria-hidden="true"
        className="hidden md:block absolute right-12 top-1/2 translate-y-8 h-px w-16 bg-accent/60"
      />
    </div>
  </section>
);
