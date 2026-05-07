import { Check, X } from "lucide-react";

const nietItems = [
  "Adviseurs met een verborgen verkoopbelang",
  "Elke keer een ander aanspreekpunt",
  "Subsidiebeloften die achteraf niet blijken te kloppen",
  "Onduidelijkheid over wie wat regelt en wanneer",
];

const welItems = [
  "Één vast aanspreekpunt die jouw dossier kent, van begin tot eind",
  "Wij stoppen niet na de handtekening. Opvolging en nazorg horen bij het traject",
  "Vooraf duidelijk wat wij regelen en wanneer je iets van ons hoort",
  "Jij houdt de regie, wij houden het overzicht",
];

const ACCENT = "#E8B547";
const RED = "#C0392B";

export const HowWeWork = () => {
  return (
    <section className="section-pad" style={{ backgroundColor: "#FFFFFF" }}>
      <div className="container-content">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="h2-section">
            Hoe wij te <span style={{ color: ACCENT }}>werk</span> gaan
          </h2>
          <p
            className="mx-auto mt-6 mb-12 md:mb-16"
            style={{
              fontSize: 17,
              color: "#6B6B6B",
              lineHeight: 1.6,
              maxWidth: 580,
              fontWeight: 400,
            }}
          >
            Geen mooie beloften vooraf en teleurstellingen achteraf. Wij zijn
            duidelijk over wat je van ons kunt verwachten, voor bewoners en
            uitvoerders.
          </p>
        </div>

        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* HOE HET VAAK GAAT */}
          <div
            className="rounded-2xl p-8 shadow-sm border border-red-100"
            style={{ backgroundColor: "#FEF7F7" }}
          >
            <div
              className="mb-6 text-sm font-bold uppercase tracking-wider"
              style={{ color: RED }}
            >
              Hoe het vaak gaat
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

          {/* HOE WIJ HET DOEN */}
          <div
            className="rounded-2xl p-8 shadow-sm md:border-l md:border-l-[#E5E2DB]"
            style={{
              backgroundColor: "#FDF9EE",
              border: "1px solid rgba(232, 181, 71, 0.3)",
            }}
          >
            <div
              className="mb-6 text-sm font-bold uppercase tracking-wider"
              style={{ color: "#A07C1E" }}
            >
              Hoe wij het doen
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
