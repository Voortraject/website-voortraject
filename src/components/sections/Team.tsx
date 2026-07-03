import teamPolos from "@/assets/subsidies-uitzoeken.webp";

export const Team = () => (
  <section className="section-pad" style={{ backgroundColor: "#F5F3ED" }} aria-labelledby="team-title">
    <div className="container-home">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
        <div>
          <img
            src={teamPolos}
            alt="Twee teamleden van Voortraject werken samen achter hun laptops"
            loading="lazy"
            decoding="async"
            className="w-full h-64 sm:h-80 lg:h-[400px] rounded-2xl object-cover"
            style={{ boxShadow: "0 4px 20px hsl(var(--primary) / 0.08)" }}
          />
        </div>

        <div>
          <h2 id="team-title" className="h2-section">
            Een adviesteam uit het <span className="text-accent">Noorden</span>
          </h2>
          <p className="mt-5 text-[16px] md:text-[18px] leading-[1.65] text-muted-foreground">
            Voortraject is een nuchter adviesteam uit Noord-Nederland. Je spreekt bij ons geen
            callcenter maar gewoon Michael, Wouter, Tim of Christian, en diegene blijft jouw
            aanspreekpunt van het eerste gesprek tot de oplevering. We werken in Groningen,
            Drenthe en Friesland.
          </p>
        </div>
      </div>
    </div>
  </section>
);
