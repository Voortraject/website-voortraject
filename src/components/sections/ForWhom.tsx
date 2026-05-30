const cards = [
  {
    label: "BEWONERS",
    title: "Duidelijkheid zonder wachtrijen",
    body: "Breng rust in de chaos van tegenstrijdige adviezen en complexe regelingen. Wij bieden onafhankelijk advies en een praktische route naar uitvoering, zonder dat je maanden op een wachtlijst staat.",
    href: "/bewoners",
  },
  {
    label: "UITVOERDERS",
    title: "Groeien zonder extra kantoorlast",
    body: "Voorkom dat dossiers versnipperd raken en offertes blijven liggen. Wij vangen de kantoorlast aan de voorkant en de nazorg aan de achterkant op, zodat jij je kunt focussen op wat je het liefste doet: bouwen en uitvoeren.",
    href: "/uitvoerders",
  },
];

export const ForWhom = () => (
  <section className="py-16 md:py-24" style={{ backgroundColor: "#F5F2EC" }}>
    <div className="container-content">
      <h2 className="h2-section mb-12">
        Voor <span style={{ color: "hsl(var(--accent))" }}>wie</span> wij werken
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cards.map((c) => (
          <article
            key={c.label}
            className="group bg-white rounded-2xl p-10 transition-all duration-200 ease-out hover:-translate-y-0.5"
            style={{
              border: "1px solid #E5E2DB",
              boxShadow: "0 4px 24px rgba(21,44,78,0.06)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#E8B547";
              e.currentTarget.style.boxShadow = "0 8px 32px rgba(21,44,78,0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#E5E2DB";
              e.currentTarget.style.boxShadow = "0 4px 24px rgba(21,44,78,0.06)";
            }}
          >
            <span
              className="font-sans uppercase"
              style={{ fontSize: 15, letterSpacing: "0.14em", color: "#E8B547", fontWeight: 700 }}
            >
              {c.label}
            </span>
            <h3
              className="font-display font-semibold mt-4"
              style={{ fontSize: 24, color: "#152C4E", letterSpacing: "-0.02em", lineHeight: 1.2 }}
            >
              {c.title}
            </h3>
            <p
              className="mt-3"
              style={{ fontSize: 16, color: "#6B6B6B", lineHeight: 1.6 }}
            >
              {c.body}
            </p>
            <a
              href={c.href}
              className="inline-flex items-center font-sans font-semibold group/link"
              style={{
                marginTop: 24,
                fontSize: 15,
                color: "#E8B547",
                textDecoration: "none",
                transition: "color 200ms",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#D9A538")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#E8B547")}
            >
              Meer weten{" "}
              <span
                style={{
                  display: "inline-block",
                  marginLeft: 6,
                  transition: "transform 200ms",
                }}
                className="group-hover/link:translate-x-1"
              >
                →
              </span>
            </a>
          </article>
        ))}
      </div>
    </div>
  </section>
);
