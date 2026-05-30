export const ClosingCta = () => (
  <section className="py-[64px] text-primary-foreground bg-primary" style={{ backgroundColor: "#1B2A3B" }}>
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
        Wil je sneller verder zonder gedoe en wachttijd?
      </h2>
      <p
        style={{
          color: "#FFFFFF",
          opacity: 0.8,
          fontSize: 17,
          lineHeight: 1.6,
          maxWidth: 760,
          marginBottom: 32,
        }}
      >
        Of je nu een bewoner bent met een grote verbouwwens of een uitvoerder die focus zoekt op de bouwplaats; wij staan voor je klaar.
      </p>
      <a
        href="/contact"
        className="font-sans font-semibold transition-colors text-center w-full sm:w-auto"
        style={{
          backgroundColor: "#E8B547",
          color: "#2B2B2B",
          padding: "14px 32px",
          borderRadius: 8,
          fontSize: 15,
          minHeight: 44,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#D9A538")}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#E8B547")}
      >
        Plan een kennismaking
      </a>
    </div>
  </section>
);
