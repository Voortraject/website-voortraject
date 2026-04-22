import { Button } from "../Button";

export const ClosingCta = () => (
  <section className="bg-secondary section-pad">
    <div className="container-content text-center">
      <h2 className="heading-serif text-4xl md:text-5xl text-foreground max-w-3xl mx-auto">
        Zoek je extra capaciteit in het voortraject?
      </h2>
      <p className="mt-6 text-lg text-muted-foreground max-w-[560px] mx-auto leading-relaxed">
        Laten we kennismaken en kijken hoe we jullie trajecten rustiger en
        professioneler kunnen maken.
      </p>
      <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
        <Button href="/contact" variant="primary">
          Bespreek samenwerking
        </Button>
        <Button href="/contact" variant="secondary">
          Plan een kennismaking
        </Button>
      </div>
    </div>
  </section>
);
