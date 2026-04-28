import { AlertCircle } from "lucide-react";
import whyPhoto from "@/assets/why-photo.jpg";

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
  <section className="section-pad" style={{ backgroundColor: "#F5F2EC" }}>
    <div className="container-content">
      <div className="text-center mb-16">
        <h2 className="h2-section">
          Wat blijft er bij jullie liggen als niemand dit{" "}
          <span style={{ color: "#E8B547" }}>oppakt?</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 items-stretch">
        <div className="hidden md:block">
          <img
            src={whyPhoto}
            alt="Adviseur in gesprek met bewoners aan tafel"
            loading="lazy"
            className="w-full h-full object-cover rounded-2xl"
            style={{ boxShadow: "0 4px 24px rgba(21,44,78,0.06)" }}
          />
        </div>

        <div>
          <ul className="space-y-6">
            {points.map((p) => (
              <li key={p} className="flex items-start gap-5">
                <AlertCircle
                  size={24}
                  strokeWidth={2.5}
                  className="text-accent shrink-0 mt-1"
                  aria-hidden="true"
                />
                <p className="font-display font-semibold text-[18px] tracking-[-0.02em] text-primary leading-snug">
                  {p}
                </p>
              </li>
            ))}
          </ul>
          <p className="mt-10 text-[16px] leading-[1.6] text-muted-foreground italic">
            Tijd, aandacht en overzicht lekken weg zonder dat iemand het direct ziet.
          </p>
        </div>
      </div>
    </div>
  </section>
);
