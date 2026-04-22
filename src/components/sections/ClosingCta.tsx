import { Button } from "../Button";

export const ClosingCta = () => (
  <section className="bg-background section-pad border-t border-border">
    <div className="container-content">
      <h2 className="h2-section max-w-[900px]">
        Zoek je extra capaciteit in het voortraject?
      </h2>
      <div className="mt-10">
        <Button href="/contact" variant="primary">
          Plan een kennismaking
        </Button>
      </div>
    </div>
  </section>
);
