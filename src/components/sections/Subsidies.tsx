import subsidiesUitzoeken from "@/assets/subsidies-uitzoeken.webp";

export const Subsidies = () => {
  return (
    <section className="section-pad bg-secondary">
      <div className="container-content">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          <div className="order-2 lg:order-1">
            <img
              src={subsidiesUitzoeken}
              alt="Twee adviseurs van Voortraject zoeken achter hun laptops uit welke subsidies voor een woning gelden"
              loading="lazy"
              decoding="async"
              className="w-full h-64 sm:h-96 lg:h-[480px] rounded-2xl object-cover"
              style={{ boxShadow: "0 4px 20px hsl(var(--primary) / 0.08)" }}
            />
          </div>

          <div className="order-1 lg:order-2">
            <h2 className="h2-section">
              Welke subsidies gelden er voor{" "}
              <span style={{ color: "hsl(var(--accent))" }}>jouw woning?</span>
            </h2>
            <p
              className="mt-5"
              style={{ fontSize: 18, color: "hsl(var(--primary) / 0.8)", lineHeight: 1.6 }}
            >
              Landelijk, provinciaal én gemeentelijk: er zijn meer regelingen dan de meeste
              mensen weten, en vaak zijn ze te combineren. Wij kennen het hele landschap,
              bewaken de termijnen en zoeken gratis voor je uit wat er voor jouw adres kan.
              Jij hoeft geen subsidie-expert te zijn.
            </p>

            <div
              className="mt-6 flex items-start gap-3 rounded-xl p-4"
              style={{ backgroundColor: "#FFFFFF", border: "1px solid rgba(229, 201, 103, 0.5)" }}
            >
              <span
                className="mt-0.5 shrink-0 font-semibold"
                style={{ color: "hsl(var(--accent))" }}
                aria-hidden="true"
              >
                +
              </span>
              <p style={{ fontSize: 15, color: "hsl(var(--primary))", lineHeight: 1.55 }}>
                <strong className="font-semibold">Subsidies zijn vaak stapelbaar.</strong>{" "}
                Landelijk, regionaal en gemeentelijk samen vergoeden soms een groot deel van
                je investering. Wij zoeken uit hoe je ze combineert zonder er één te missen.
              </p>
            </div>

            <a
              href="/contact"
              className="mt-7 inline-flex items-center justify-center rounded-full px-7 py-3.5 font-sans font-semibold transition-all duration-150 hover:scale-[1.02]"
              style={{
                backgroundColor: "hsl(var(--accent))",
                color: "hsl(var(--primary))",
                fontSize: 15,
              }}
            >
              Plan een gratis gesprek
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
