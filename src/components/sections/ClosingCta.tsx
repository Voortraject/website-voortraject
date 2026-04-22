import { Button } from "../Button";

export const ClosingCta = () => (
  <section className="bg-background py-[72px] md:py-[96px] border-t border-border">
    <div className="container-content">
      <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
        <h2 className="h2-section text-foreground">
          Zoek je extra capaciteit in het voortraject?
        </h2>
        <div className="flex flex-col gap-4 md:items-end">
          <Button href="/contact" variant="primary">
            Bespreek samenwerking
          </Button>
          <Button href="/contact" variant="secondary">
            Plan een kennismaking
          </Button>
        </div>
      </div>
    </div>
  </section>
);
