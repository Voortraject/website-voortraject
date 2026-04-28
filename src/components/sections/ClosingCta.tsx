export const ClosingCta = () => (
  <section className="py-[64px] text-primary-foreground bg-primary" style={{ backgroundColor: "#152C4E" }}>
    <div className="container-content text-center flex flex-col items-center">
      <h2
        className="font-display"
        style={{
          fontWeight: 600,
          fontSize: "clamp(28px, 4.5vw, 44px)",
          color: "#FFFFFF",
          letterSpacing: "-0.02em",
          lineHeight: 1.2,
          maxWidth: 900,
          marginBottom: 20,
        }}
      >
        Zoek je extra capaciteit zonder extra kantoorlast?
      </h2>
      <p
        style={{
          color: "rgba(255,255,255,0.85)",
          fontSize: 17,
          lineHeight: 1.6,
          maxWidth: 760,
          marginBottom: 32,
        }}
      >
        Wij helpen uitvoerders sneller schakelen in bewonerscontact, offerte-opbouw,
        opvolging en dossiervorming, zodat jullie meer focus houden op uitvoering.
      </p>
      <a
        href="/contact"
        className="font-sans font-semibold transition-colors text-center"
        style={{
          backgroundColor: "#E8B547",
          color: "#2B2B2B",
          padding: "14px 32px",
          borderRadius: 8,
          fontSize: 15,
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#D9A538")}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#E8B547")}
      >
        Plan een kennismaking
      </a>
    </div>
  </section>
);
