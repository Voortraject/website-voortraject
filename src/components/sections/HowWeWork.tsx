import { Check, X } from "lucide-react";

const nietItems = [
  "Een adviseur die ook toevallig iets te verkopen heeft",
  "Elke keer een ander aan de telefoon",
  "Beloften die na de handtekening verdwijnen",
  'Druk omdat "het aanbod tijdelijk is"',
];

const welItems = [
  "Eén vaste adviseur die jouw dossier kent",
  "Onafhankelijk advies, wij verdienen niks aan de installatie zelf",
  "Realistisch beeld van kosten, subsidie en tijdlijn voor jouw woning",
  "Jij bepaalt het tempo, wij houden het overzicht",
];

const ACCENT = "#E8B547";
const RED = "#C0392B";
const RED_LABEL = "#C0392B";
const OKER_LABEL = "#A07C1E";

export const HowWeWork = () => {
  return (
    <section className="section-pad" style={{ backgroundColor: "#F5F2EC" }}>
      <div className="container-content">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="h2-section">
            Gewoon <span style={{ color: ACCENT }}>eerlijk</span> over hoe wij werken
          </h2>
          <p
            className="mx-auto mt-6 mb-12 md:mb-16"
            style={{
              fontSize: 17,
              color: "#6B6B6B",
              lineHeight: 1.6,
              maxWidth: 560,
            }}
          >
            Veel bewoners die ons bellen, zijn ergens anders vastgelopen. Wij
            zijn transparant over wat we wel en niet doen, zodat je precies
            weet waar je aan toe bent.
          </p>
        </div>

        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* NIET BIJ ONS */}
          <div
            className="rounded-2xl p-8 shadow-sm border border-red-100"
            style={{ backgroundColor: "#FEF7F7" }}
          >
            <div
              className="mb-6"
              style={{
                fontSize: 12,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                color: RED_LABEL,
                fontWeight: 700,
              }}
            >
              Niet bij ons
            </div>
            <ul className="flex flex-col gap-4">
              {nietItems.map((t, i) => (
                <li key={i} className="flex items-start gap-3">
                  <X
                    size={18}
                    className="mt-1 shrink-0"
                    style={{ color: RED }}
                    aria-hidden="true"
                  />
                  <span style={{ fontSize: 16, lineHeight: 1.5, color: "#2B2B2B", fontWeight: 400 }}>
                    {t}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* WEL BIJ ONS */}
          <div
            className="rounded-2xl p-8 shadow-sm md:border-l"
            style={{
              backgroundColor: "#FDF9EE",
              border: "1px solid rgba(232, 181, 71, 0.3)",
            }}
          >
            <div
              className="mb-6"
              style={{
                fontSize: 12,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                color: OKER_LABEL,
                fontWeight: 700,
              }}
            >
              Wel bij ons
            </div>
            <ul className="flex flex-col gap-4">
              {welItems.map((t, i) => (
                <li key={i} className="flex items-start gap-3">
                  <Check
                    size={18}
                    className="mt-1 shrink-0"
                    style={{ color: ACCENT }}
                    aria-hidden="true"
                  />
                  <span style={{ fontSize: 16, lineHeight: 1.5, color: "#2B2B2B", fontWeight: 500 }}>
                    {t}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};
