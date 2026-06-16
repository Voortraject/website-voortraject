export const AboutTeam = () => {
  return (
    <section style={{ backgroundColor: "#FBFAF7", padding: "80px 0" }}>
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "0 24px",
        }}
      >
        <div className="flex flex-col md:flex-row items-center gap-10 md:gap-14">
          {/* Left: image */}
          <div className="w-full md:w-1/2">
            <img
              src="/team.jpg"
              alt="Team Voortraject"
              className="w-full"
              style={{
                borderRadius: 12,
                display: "block",
              }}
            />
          </div>

          {/* Right: text */}
          <div className="w-full md:w-1/2">
            <span
              className="font-sans uppercase"
              style={{
                fontSize: 13,
                letterSpacing: "0.14em",
                color: "#E8B547",
                fontWeight: 700,
                display: "block",
              }}
            >
              OVER ONS
            </span>

            <h2
              className="font-display mt-5"
              style={{
                fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
                fontWeight: 700,
                lineHeight: 1.15,
                letterSpacing: "-0.02em",
              }}
            >
              <span style={{ color: "#152C4E" }}>Vier Groningers,</span>
              <br />
              <span style={{ color: "#E8B547" }}>één missie</span>
            </h2>

            <p
              className="font-sans mt-5"
              style={{
                fontSize: 16,
                color: "#4B5563",
                lineHeight: 1.65,
              }}
            >
              Wij zijn Michael, Tim, Wouter en Christian. Vier Groningers die
              zagen dat bewoners duizenden euro's aan subsidie mislopen,
              simpelweg omdat niemand ze de weg wees. Geen stapels papierwerk,
              geen onduidelijke beloftes. Gewoon eerlijk advies en een helder
              traject, van eerste gesprek tot opgeleverd werk.
            </p>

            <a
              href="/over-ons"
              className="inline-flex items-center justify-center rounded-full font-sans font-bold transition-all duration-150 hover:scale-[1.02]"
              style={{
                marginTop: 28,
                backgroundColor: "#E8B547",
                color: "#152C4E",
                fontSize: 15,
                padding: "12px 28px",
                textDecoration: "none",
              }}
            >
              Leer ons kennen →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
