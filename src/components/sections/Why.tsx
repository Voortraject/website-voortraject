import whyPhoto from "@/assets/christian-bellen2.webp";

const points = [
  "Bewoners blijven bellen voor uitleg",
  "Offertes worden steeds vooruitgeschoven",
  "Dossiers raken versnipperd over mails en appjes",
  "Na uitvoering blijven acties en stukken openstaan",
  "Facturen blijven na uitvoering te lang op de plank liggen",
  "Vervolgafspraken voor onderhoud of nieuwe maatregelen worden vergeten",
  "De kans op een 5-sterren review wordt niet benut door gebrek aan opvolging",
];

export const Why = () => (
  <section className="section-pad bg-primary-foreground" style={{ backgroundColor: "#FFFFFF" }}>
    <div className="container-content">
      <div className="text-center mb-16">
        <h2 className="h2-section">
          Wat blijft er bij jullie liggen als{" "}
          <span style={{ color: "#E8B547" }}>niemand</span> dit oppakt?
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 items-center">
        <div>
          <img
            src={whyPhoto}
            alt="Adviseur van Voortraject staat bewoners telefonisch te woord met een headset"
            loading="lazy"
            className="w-full h-64 md:h-[440px] object-cover rounded-2xl"
            style={{ boxShadow: "0 4px 24px rgba(21,44,78,0.06)", objectPosition: "center 32%" }}
          />
        </div>

        <div>
          <ul className="space-y-5">
            {points.map((p) => (
              <li key={p} className="flex items-start gap-4">
                <span
                  aria-hidden="true"
                  className="shrink-0 rounded-full"
                  style={{
                    width: 6,
                    height: 6,
                    backgroundColor: "#E8B547",
                    marginTop: 12,
                  }}
                />
                <p
                  className="text-primary"
                  style={{
                    fontSize: 17,
                    fontWeight: 400,
                    lineHeight: 1.7,
                    margin: 0,
                  }}
                >
                  {p}
                </p>
              </li>
            ))}
          </ul>
          <p
            className="mt-10 italic"
            style={{ fontSize: 15, lineHeight: 1.6, color: "#8A8A8A" }}
          >
            Tijd, aandacht en overzicht lekken weg zonder dat iemand het direct ziet.
          </p>
        </div>
      </div>
    </div>
  </section>
);
