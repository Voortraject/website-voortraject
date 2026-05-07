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
const OKER_LABEL = "#A07C1E";

export const HowWeWork = () => {
  return (
    <section className="section-pad" style={{ backgroundColor: "#FFFFFF" }}>
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
          {/* WAT BEWONERS VAAK MEEMAKEN */}
          <div
            className="rounded-2xl p-8 shadow-sm border border-red-100"
            style={{ backgroundColor: "#FEF7F7" }}
          >
            <div
              className="mb-6 text-xs font-semibold uppercase tracking-widest"
              style={{ color: RED }}
            >
              Wat bewoners vaak meemaken
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

          {/* HOE WIJ HET AANPAKKEN */}
          <div
            className="rounded-2xl p-8 shadow-sm md:border-l md:border-l-[#E5E2DB]"
            style={{
              backgroundColor: "#FDF9EE",
              border: "1px solid rgba(232, 181, 71, 0.3)",
            }}
          >
            <div
              className="mb-6 text-xs font-semibold uppercase tracking-widest"
              style={{ color: OKER_LABEL }}
            >
              Hoe wij het aanpakken
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
