import { Button } from "../Button";
import { SectionLabel } from "../SectionLabel";

export const ClosingCta = () => (
  <section className="bg-background py-[96px] border-t border-border">
    <div className="container-content">
      <SectionLabel number="05" label="CONTACT" />
      <div className="mt-12 grid md:grid-cols-2 gap-10 md:gap-16 items-center">
        <h2 className="h2-section text-foreground">
          Zoek je extra capaciteit in het voortraject?
        </h2>
        <div className="flex flex-col gap-4 md:items-end">
          <div className="flex flex-col gap-4 w-full md:w-auto md:min-w-[280px]">
            <Button href="/contact" variant="primary" className="w-full">
              Bespreek samenwerking
            </Button>
            <Button href="/contact" variant="secondary" className="w-full">
              Plan een kennismaking
            </Button>
          </div>
        </div>
      </div>
    </div>
  </section>
);
