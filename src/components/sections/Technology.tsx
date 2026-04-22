export const Technology = () => (
  <section className="bg-background section-pad border-t border-border" aria-labelledby="tech-title">
    <div className="container-content text-center">
      <p
        className="font-sans font-medium uppercase text-accent text-[13px]"
        style={{ letterSpacing: "0.1em" }}
      >
        04 / TECHNOLOGIE
      </p>
      <h2
        id="tech-title"
        className="mt-12 mx-auto font-display font-bold text-primary text-[56px] md:text-[96px] max-w-[1200px]"
        style={{ letterSpacing: "-0.04em", lineHeight: 1.0 }}
      >
        Menselijke begeleiding, ondersteund door{" "}
        <span className="text-accent">slimme</span> automatisering
      </h2>
      <p className="mt-10 mx-auto body-lg text-muted-foreground max-w-[640px]">
        Wij combineren persoonlijke begeleiding met slimme systemen voor intake,
        offerte-opbouw, communicatie en dossiercontrole. Daardoor werken we sneller,
        leveren we consistenter en kunnen we opschalen.
      </p>
    </div>
  </section>
);
