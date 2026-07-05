import planKeukentafel from "@/assets/bewoners-keukentafel.webp";

const stappen = [
  {
    nummer: "01",
    title: "Gratis gesprek",
    body: "Bij jou thuis of telefonisch. We kijken naar jouw woning, situatie en wensen. Duurt 30 tot 45 minuten.",
  },
  {
    nummer: "02",
    title: "Helder plan",
    body: "Je hoort welke maatregelen slim zijn, in welke volgorde, en welke subsidies erbij horen. Alles op papier.",
  },
  {
    nummer: "03",
    title: "Uitvoering geregeld",
    body: "Wij koppelen je aan een getoetste uitvoerder uit de regio en blijven betrokken tot het klaar is.",
  },
];

export const HelderPlan = () => (
  <section className="section-pad-home" style={{ backgroundColor: "#FFFFFF" }} aria-labelledby="helder-plan-title">
    <div className="container-home">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
        <div>
          <img
            src={planKeukentafel}
            alt="Adviseur van Voortraject in gesprek met een bewoner aan de keukentafel"
            loading="lazy"
            decoding="async"
            className="w-full h-64 sm:h-96 lg:h-[520px] rounded-2xl object-cover"
            style={{ boxShadow: "0 4px 20px hsl(var(--primary) / 0.08)" }}
          />
        </div>

        <div>
          <h2 id="helder-plan-title" className="h2-section">
            Van twijfel naar een <span className="text-accent">compleet</span> plan
          </h2>

          <ol className="mt-8 space-y-0">
            {stappen.map(({ nummer, title, body }, i) => (
              <li key={nummer} className="relative flex gap-5 md:gap-6">
                {/* Tijdlijn: nummer + verticale lijn naar de volgende stap */}
                <div className="flex flex-col items-center w-12 md:w-16 shrink-0">
                  <span
                    className="font-display font-bold text-accent text-[32px] md:text-[42px] leading-none tracking-[-0.03em]"
                    aria-hidden="true"
                  >
                    {nummer}
                  </span>
                  {i < stappen.length - 1 && (
                    <span className="w-px flex-1 my-3 bg-border" aria-hidden="true" />
                  )}
                </div>
                <div className={i < stappen.length - 1 ? "pb-8 pt-1 md:pt-1.5" : "pt-1 md:pt-1.5"}>
                  <h3 className="font-display font-semibold text-primary text-[19px] md:text-[22px] leading-[1.2] tracking-[-0.01em]">
                    {title}
                  </h3>
                  <p className="mt-2 text-[15px] md:text-[16px] leading-[1.6] text-muted-foreground">
                    {body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  </section>
);
