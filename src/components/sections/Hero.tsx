import { Button } from "../Button";

export const Hero = () => (
  <section className="bg-background pt-20 pb-24 md:pt-32 md:pb-32" aria-labelledby="hero-title">
    <div className="container-content">
      <div className="grid lg:grid-cols-5 gap-12 lg:gap-16 items-center">
        <div className="lg:col-span-3 text-left">
          <h1 id="hero-title" className="h1-hero text-foreground">
            Extra slagkracht voor groeiende verduurzamingsbedrijven
          </h1>
          <p className="mt-8 body-lg text-muted-foreground max-w-[640px]">
            Wij ondersteunen uitvoerders met bewonersbegeleiding, regelinguitleg,
            offertevoorbereiding en akkoordtrajecten, zodat jullie kunnen groeien
            zonder extra intern personeel.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <Button href="#voor-uitvoerders" variant="primary">
              Voor uitvoerders →
            </Button>
            <Button href="#voor-bewoners" variant="secondary">
              Voor bewoners
            </Button>
          </div>
        </div>

        <div className="lg:col-span-2 hidden md:block">
          <div
            role="img"
            aria-label="Foto volgt: sfeerbeeld van het team in gesprek met een bewoner"
            className="aspect-[4/5] w-full rounded-2xl bg-border flex items-center justify-center text-muted-foreground text-sm"
          >
            Foto volgt
          </div>
        </div>
      </div>
    </div>
  </section>
);
