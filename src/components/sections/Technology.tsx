import { Inbox, FileText, Bell, ClipboardCheck, CheckCircle, type LucideIcon } from "lucide-react";

const cards: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: Inbox,
    title: "Automatische intake",
    body: "Nieuwe aanvragen en bewonersvragen worden direct vastgelegd, zodat minder verloren gaat in losse mails of notities.",
  },
  {
    icon: FileText,
    title: "Slimme offertevoorbereiding",
    body: "Trajectinput wordt sneller samengebracht, zodat offertes minder tijd kosten en niet blijven liggen tussen plan en akkoord.",
  },
  {
    icon: Bell,
    title: "Opvolging zonder gejaag",
    body: "Openstaande acties blijven in beeld, zodat jullie minder achter bewoners of akkoordmomenten aan hoeven.",
  },
  {
    icon: ClipboardCheck,
    title: "Grip op wat na uitvoering blijft hangen",
    body: "Wij houden overzicht op ontbrekende stukken en acties, zodat jullie niet opnieuw het dossier in hoeven omdat er iets is blijven liggen.",
  },
  {
    icon: CheckCircle,
    title: "Dossiercontrole voor overdracht",
    body: "We controleren of alles compleet is, zodat er geen losse eindjes of ontbrekende stukken tussen blijven zitten.",
  },
];

export const Technology = () => (
  <section
    style={{ backgroundColor: "#FFFFFF", paddingTop: 64, paddingBottom: 64 }}
    aria-labelledby="tech-title"
    className="md:!py-24"
  >
    <div className="container-content">
      <div className="text-center mx-auto" style={{ maxWidth: 960 }}>
        <h2 id="tech-title" className="h2-section" style={{ marginBottom: 16 }}>
          Menselijke begeleiding, ondersteund door slimme{" "}
          <span style={{ color: "#E8B547" }}>systemen</span>
        </h2>
        <p
          className="mx-auto"
          style={{ fontSize: 17, color: "#6B6B6B", lineHeight: 1.6, marginBottom: 48 }}
        >
          Onze systemen zijn er niet om mooie software te laten zien, maar om te voorkomen
          dat er tijd verloren gaat aan alles wat blijft liggen. Van intake en
          offertevoorbereiding tot opvolging, dossiercontrole en openstaande acties na
          uitvoering.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
        {cards.map(({ icon: Icon, title, body }) => (
          <article
            key={title}
            className="bg-white flex flex-col"
            style={{
              borderRadius: 16,
              padding: 32,
              border: "1px solid #E5E2DB",
              boxShadow: "0 4px 24px rgba(21,44,78,0.04)",
            }}
          >
            <div className="flex flex-row items-center" style={{ gap: 12 }}>
              <div
                className="flex items-center justify-center rounded-full shrink-0"
                style={{ width: 48, height: 48, backgroundColor: "#F0E4D0" }}
              >
                <Icon size={22} color="#152C4E" strokeWidth={2.25} aria-hidden="true" />
              </div>
              <h3
                className="font-display"
                style={{
                  fontSize: "1.05rem",
                  fontWeight: 600,
                  color: "#152C4E",
                  letterSpacing: "-0.01em",
                  lineHeight: 1.3,
                  margin: 0,
                }}
              >
                {title}
              </h3>
            </div>
            <p style={{ marginTop: 16, fontSize: 15, color: "#6B6B6B", lineHeight: 1.6 }}>
              {body}
            </p>
          </article>
        ))}
      </div>
    </div>
  </section>
);
