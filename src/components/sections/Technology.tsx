export const Technology = () => (
  <section className="bg-background section-pad border-t border-border" aria-labelledby="tech-title">
    <div className="container-content">
      <div className="grid grid-cols-1 lg:grid-cols-[55fr_45fr] gap-12 lg:gap-16 items-center">
        <div>
          <h2 id="tech-title" className="h2-section">
            Menselijke begeleiding, ondersteund door slimme automatisering
          </h2>
          <p className="mt-8 body-lg text-muted-foreground max-w-[640px]">
            Wij combineren persoonlijke begeleiding met slimme systemen voor intake,
            offerte-opbouw, communicatie en dossiercontrole. Daardoor werken we sneller,
            leveren we consistenter en kunnen we opschalen.
          </p>
        </div>

        {/* Concentric rings visualization */}
        <div
          className="relative mx-auto"
          style={{ width: 240, height: 240 }}
          aria-hidden="true"
        >
          <span
            className="absolute rounded-full border animate-tech-pulse"
            style={{
              width: 240,
              height: 240,
              top: 0,
              left: 0,
              borderColor: "#E5E2DB",
              animationDelay: "0s",
            }}
          />
          <span
            className="absolute rounded-full border animate-tech-pulse"
            style={{
              width: 180,
              height: 180,
              top: 30,
              left: 30,
              borderColor: "hsl(var(--accent) / 0.3)",
              animationDelay: "1s",
            }}
          />
          <span
            className="absolute rounded-full border animate-tech-pulse"
            style={{
              width: 120,
              height: 120,
              top: 60,
              left: 60,
              borderColor: "hsl(var(--accent) / 0.6)",
              animationDelay: "2s",
            }}
          />
          <span
            className="absolute rounded-full bg-primary"
            style={{
              width: 32,
              height: 32,
              top: 104,
              left: 104,
            }}
          />
        </div>
      </div>
    </div>
  </section>
);
