import { Button } from "../Button";

export const Hero = () => (
  <section className="bg-background pt-20 pb-24 md:py-32" aria-labelledby="hero-title">
    <div className="container-content">
      <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        <div className="lg:col-span-7 text-center lg:text-left">
          <h1
            id="hero-title"
            className="heading-serif text-[40px] md:text-[56px] leading-[1.05] text-foreground"
          >
            Extra slagkracht voor groeiende verduurzamingsbedrijven
          </h1>
          <p className="mt-6 text-lg md:text-xl text-muted-foreground leading-relaxed max-w-[640px] mx-auto lg:mx-0">
            Wij ondersteunen uitvoerders met bewonersbegeleiding, regelinguitleg,
            offertevoorbereiding en akkoordtrajecten — zodat jullie kunnen groeien
            zonder extra intern personeel.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <Button href="#voor-uitvoerders" variant="primary">
              Voor uitvoerders →
            </Button>
            <Button href="#voor-bewoners" variant="secondary">
              Voor bewoners
            </Button>
          </div>
        </div>

        <div className="lg:col-span-5">
          <div
            role="img"
            aria-label="Foto volgt: sfeerbeeld van het team in gesprek met een bewoner"
            className="aspect-[4/5] w-full rounded-lg bg-muted border border-border flex items-center justify-center text-muted-foreground text-sm"
          >
            Foto volgt
          </div>
        </div>
      </div>
    </div>
  </section>
);
