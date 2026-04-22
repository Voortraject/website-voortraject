import { Button } from "../Button";

export const ClosingCta = () => (
  <section className="bg-background section-pad border-t border-border">
    <div className="container-content">
      <div
        className="bg-white rounded-[20px] px-8 md:px-16 py-14 md:py-14"
        style={{ boxShadow: "0 4px 24px rgba(21,44,78,0.06)" }}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10 items-center">
          <div className="md:col-span-2">
            <h2 className="h2-section">
              Zoek je extra capaciteit in het voortraject?
            </h2>
          </div>
          <div className="md:col-span-1 flex md:justify-end">
            <Button href="/contact" variant="primary" className="w-full md:w-auto">
              Plan een kennismaking
            </Button>
          </div>
        </div>
      </div>
    </div>
  </section>
);
