import { Check } from "lucide-react";

type StepStatus = "done" | "active" | "pending";

const steps: {
  status: StepStatus;
  title: string;
  sub: string;
  time: string;
}[] = [
  { status: "done", title: "Intake voltooid", sub: "Bewoner · Groningen", time: "2 min geleden" },
  { status: "done", title: "Subsidies gecontroleerd", sub: "ISDE + SPUK gematched", time: "Net nu" },
  { status: "active", title: "Offerte wordt opgesteld", sub: "Automatische opmaak", time: "Bezig..." },
  { status: "pending", title: "Akkoord van bewoner", sub: "Klaar voor verzending", time: "—" },
];

const Indicator = ({ status }: { status: StepStatus }) => {
  if (status === "done") {
    return (
      <div
        className="flex items-center justify-center rounded-full shrink-0"
        style={{ width: 16, height: 16, backgroundColor: "#E8B547" }}
      >
        <Check size={10} strokeWidth={3} color="#FFFFFF" />
      </div>
    );
  }
  if (status === "active") {
    return (
      <div className="relative shrink-0" style={{ width: 16, height: 16 }}>
        <span
          className="absolute inset-0 rounded-full animate-ping"
          style={{ backgroundColor: "#E8B547", opacity: 0.5 }}
        />
        <span
          className="absolute inset-0 rounded-full"
          style={{ backgroundColor: "#E8B547" }}
        />
      </div>
    );
  }
  return (
    <div
      className="rounded-full shrink-0"
      style={{
        width: 16,
        height: 16,
        border: "1.5px solid #E5E2DB",
        backgroundColor: "transparent",
      }}
    />
  );
};

const Dashboard = () => (
  <div
    className="w-full max-w-[480px] rounded-[16px]"
    style={{
      backgroundColor: "#FFFFFF",
      border: "1px solid #E5E2DB",
      boxShadow: "0 4px 24px rgba(21,44,78,0.06)",
      padding: 28,
    }}
  >
    <div className="flex items-center justify-between">
      <span
        className="font-sans font-medium uppercase"
        style={{ fontSize: 11, letterSpacing: "0.1em", color: "#6B6B6B" }}
      >
        LIVE PROCES
      </span>
      <span className="relative inline-block" style={{ width: 8, height: 8 }}>
        <span
          className="absolute inset-0 rounded-full animate-ping"
          style={{ backgroundColor: "#E8B547", opacity: 0.6 }}
        />
        <span
          className="absolute inset-0 rounded-full"
          style={{ backgroundColor: "#E8B547" }}
        />
      </span>
    </div>
    <div className="mt-4" style={{ height: 1, backgroundColor: "#E5E2DB" }} />

    <div className="relative mt-6">
      {/* Connecting line */}
      <div
        aria-hidden="true"
        className="absolute"
        style={{
          left: 7,
          top: 8,
          bottom: 8,
          width: 2,
          background:
            "linear-gradient(to bottom, #E8B547 0%, #E8B547 66%, #E5E2DB 66%, #E5E2DB 100%)",
        }}
      />
      <ul className="relative space-y-5">
        {steps.map((s, i) => {
          const isActive = s.status === "active";
          const isPending = s.status === "pending";
          return (
            <li
              key={i}
              className="relative flex items-start gap-3"
              style={
                isActive
                  ? {
                      backgroundColor: "#FDF6E3",
                      padding: "8px",
                      borderRadius: 6,
                      marginLeft: -8,
                      marginRight: -8,
                    }
                  : undefined
              }
            >
              <div className="pt-0.5">
                <Indicator status={s.status} />
              </div>
              <div className="flex-1 min-w-0">
                <div
                  className="font-sans font-semibold"
                  style={{
                    fontSize: 14,
                    color: "#152C4E",
                    opacity: isPending ? 0.5 : 1,
                  }}
                >
                  {s.title}
                </div>
                <div
                  className="font-sans"
                  style={{
                    fontSize: 12,
                    color: "#6B6B6B",
                    opacity: isPending ? 0.5 : 1,
                    marginTop: 2,
                  }}
                >
                  {s.sub}
                </div>
              </div>
              <div
                className="font-sans shrink-0"
                style={{ fontSize: 11, color: "#8B8680" }}
              >
                {s.time}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  </div>
);

export const Technology = () => (
  <section className="bg-background section-pad border-t border-border" aria-labelledby="tech-title">
    <div className="container-content">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 items-center">
        <div>
          <h2 id="tech-title" className="h2-section">
            Menselijke begeleiding, ondersteund door slimme automatisering
          </h2>
          <p className="mt-8 body-lg text-muted-foreground max-w-[640px]">
            Wij combineren persoonlijke begeleiding met slimme systemen voor intake,
            offerte-opbouw, communicatie en dossiercontrole. Daardoor werken we sneller,
            leveren we consistenter en kunnen we opschalen.
          </p>
        </div>
        <div className="flex justify-center md:justify-end">
          <Dashboard />
        </div>
      </div>
    </div>
  </section>
);
