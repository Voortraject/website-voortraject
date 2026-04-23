const cards = [
  {
    label: "VOOR UITVOERDERS",
    title: "Groeien zonder extra personeel",
    body: "Wij helpen kleine en middelgrote uitvoerders om sneller en professioneler te werken in verduurzamingstrajecten.",
    href: "/uitvoerders",
  },
  {
    label: "VOOR BEWONERS",
    title: "Helder advies en begeleiding",
    body: "Wij bieden helder advies over isolatie, installaties en regelingen, met begeleiding richting een betrouwbare uitvoerder.",
    href: "/bewoners",
  },
];

export const ForWhom = () => (
  <section className="py-16 md:py-24" style={{ backgroundColor: "#F0E4D0" }}>
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
              style={{ fontSize: 12, letterSpacing: "0.1em", color: "#E8B547", fontWeight: 600 }}
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
