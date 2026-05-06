const cards = [
  {
    tag: "GRONINGEN & NOORD-DRENTHE",
    naam: "Nij Begun",
    feit: "Tot 100% vergoed voor isolatie",
    duiding:
      "Niet alleen voor het versterkingsgebied. Ook met een lager inkomen kun je 100% krijgen, in tien Groningse en drie Drentse gemeenten.",
    linkTekst: "Lees meer over Nij Begun",
    href: "/subsidies/nij-begun",
  },
  {
    tag: "HEEL NEDERLAND",
    naam: "ISDE",
    feit: "Combineren verdubbelt je subsidie",
    duiding:
      "Eén maatregel levert ongeveer 15% van de kosten op. Twee maatregelen tegelijk verdubbelen het bedrag per vierkante meter.",
    linkTekst: "Lees meer over ISDE",
    href: "/subsidies/landelijk",
  },
  {
    tag: "PER GEMEENTE",
    naam: "Regionale subsidies",
    feit: "Stapelbaar met ISDE en Nij Begun",
    duiding:
      "Veel gemeenten bieden eigen regelingen bovenop de landelijke. Maar de bedragen wisselen, dus we houden bij wat er nu actueel is.",
    linkTekst: "Lees meer over regionale subsidies",
    href: "/subsidies/regionaal",
  },
];

export const Subsidies = () => (
  <section className="section-pad" style={{ backgroundColor: "#F5F2EC" }}>
    <div className="container-content">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="h2-section">
          Drie potten, vaak{" "}
          <span style={{ color: "hsl(var(--accent))" }}>stapelbaar</span>
        </h2>
        <p
          className="mx-auto mt-6 mb-12 md:mb-16 max-w-2xl"
          style={{
            fontSize: 18,
            color: "hsl(var(--primary) / 0.8)",
            lineHeight: 1.6,
          }}
        >
          Veel bewoners weten niet welke subsidies bij hun woning passen, of dat
          ze gestapeld kunnen worden. Daardoor laat een groot deel honderden tot
          duizenden euro's liggen.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((c) => (
          <article
            key={c.naam}
            className="rounded-2xl p-6 md:p-8 transition-shadow duration-200 hover:shadow-md"
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid rgba(229, 201, 103, 0.4)",
              boxShadow: "0 1px 3px rgba(21,44,78,0.04)",
            }}
          >
            <span
              className="font-sans uppercase"
              style={{
                fontSize: 12,
                letterSpacing: "0.05em",
                color: "hsl(var(--accent))",
                fontWeight: 600,
              }}
            >
              {c.tag}
            </span>
            <h3
              className="font-display mt-3"
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: "hsl(var(--primary))",
                letterSpacing: "-0.02em",
                lineHeight: 1.25,
              }}
            >
              {c.naam}
            </h3>
            <p
              className="mt-3"
              style={{
                fontSize: 19,
                fontWeight: 700,
                color: "hsl(var(--accent))",
                lineHeight: 1.35,
              }}
            >
              {c.feit}
            </p>
            <p
              className="mt-3"
              style={{
                fontSize: 15,
                color: "hsl(var(--primary) / 0.8)",
                lineHeight: 1.6,
              }}
            >
              {c.duiding}
            </p>
            <a
              href={c.href}
              className="inline-flex items-center mt-4 font-sans font-semibold hover:underline"
              style={{ fontSize: 15, color: "hsl(var(--accent))" }}
            >
              {c.linkTekst}
              <span style={{ marginLeft: 6 }} aria-hidden="true">
                →
              </span>
            </a>
          </article>
        ))}
      </div>

      <div className="mt-12 text-center flex flex-col items-center">
        <p
          className="mx-auto max-w-2xl"
          style={{
            fontSize: 16,
            color: "hsl(var(--primary) / 0.8)",
            lineHeight: 1.6,
          }}
        >
          Wil je weten welke combinatie voor jouw woning werkt? Dat rekenen we
          tijdens een gratis gesprek voor je uit.
        </p>
        <a
          href="/contact"
          className="mt-6 inline-flex items-center justify-center rounded-full px-7 py-3.5 font-sans font-semibold transition-all duration-150 hover:scale-[1.02]"
          style={{
            backgroundColor: "hsl(var(--accent))",
            color: "hsl(var(--primary))",
            fontSize: 15,
          }}
        >
          Plan een gesprek
        </a>
      </div>
    </div>
  </section>
);
