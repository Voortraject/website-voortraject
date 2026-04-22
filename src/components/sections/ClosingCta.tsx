import { Button } from "../Button";
import { SectionLabel } from "../SectionLabel";

export const ClosingCta = () => (
  <section className="bg-background section-pad border-t border-border">
    <div className="container-content text-center flex flex-col items-center">
      <SectionLabel number="05" label="CONTACT" />
      <h2 className="mt-12 h2-section text-foreground max-w-[900px]">
        Zoek je extra capaciteit in het voortraject?
      </h2>
      <div className="mt-12 flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
        <Button href="/contact" variant="primary" className="w-full sm:w-auto sm:min-w-[260px]">
          Bespreek samenwerking
        </Button>
        <Button href="/contact" variant="secondary" className="w-full sm:w-auto sm:min-w-[260px]">
          Plan een kennismaking
        </Button>
      </div>
    </div>
  </section>
);
