export const ClosingCta = () => (
  <section className="py-18 md:py-24" style={{ backgroundColor: "#152C4E", paddingTop: undefined }}>
    <div className="container-content text-center flex flex-col items-center" style={{ paddingTop: 0 }}>
      <h2
        className="font-display"
        style={{
          fontWeight: 600,
          fontSize: "clamp(32px, 5vw, 44px)",
          color: "#FFFFFF",
          letterSpacing: "-0.02em",
          lineHeight: 1.2,
          maxWidth: 720,
          marginBottom: 24,
        }}
      >
        Zoek je extra capaciteit in het voortraject?
      </h2>
      <p
        className="font-sans"
        style={{
          fontSize: 18,
          color: "rgba(255,255,255,0.7)",
          maxWidth: 560,
          marginBottom: 40,
          lineHeight: 1.5,
        }}
      >
        Laten we kennismaken en kijken hoe we jullie trajecten rustiger en professioneler kunnen maken.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto items-center justify-center">
        <a
          href="/contact"
          className="font-sans font-semibold transition-colors text-center w-full sm:w-auto"
          style={{
            backgroundColor: "#E8B547",
            color: "#2B2B2B",
            padding: "14px 32px",
            borderRadius: 8,
            fontSize: 15,
            minWidth: 220,
            maxWidth: 320,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#D9A538")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#E8B547")}
        >
          Bespreek samenwerking
        </a>
        <a
          href="/contact"
          className="font-sans font-semibold transition-colors text-center w-full sm:w-auto"
          style={{
            backgroundColor: "transparent",
            color: "#FFFFFF",
            padding: "14px 32px",
            borderRadius: 8,
            fontSize: 15,
            border: "1px solid #FFFFFF",
            minWidth: 220,
            maxWidth: 320,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.08)")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
        >
          Plan een kennismaking
        </a>
      </div>
    </div>
  </section>
);
