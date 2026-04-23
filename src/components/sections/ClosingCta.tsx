export const ClosingCta = () => (
  <section className="py-[40px] text-primary-foreground bg-primary" style={{ backgroundColor: "#152C4E" }}>
    <div className="container-content text-center flex flex-col items-center">
      <h2
        className="font-display"
        style={{
          fontWeight: 600,
          fontSize: "clamp(32px, 5vw, 44px)",
          color: "#FFFFFF",
          letterSpacing: "-0.02em",
          lineHeight: 1.2,
          maxWidth: "100%",
          whiteSpace: "nowrap",
          marginBottom: 40,
        }}
      >
        Zoek je extra capaciteit in het voortraject?
      </h2>
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
