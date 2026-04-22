const navCols = [
  {
    label: "Navigatie",
    items: [
      { href: "#voor-uitvoerders", label: "Voor uitvoerders" },
      { href: "#voor-bewoners", label: "Voor bewoners" },
      { href: "/maatregelen", label: "Maatregelen" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    label: "Contact",
    items: [
      { href: "mailto:info@placeholder.nl", label: "info@placeholder.nl" },
      { href: "tel:+31000000000", label: "+31 (0)00 000 0000" },
      { href: "#", label: "Noord-Nederland" },
    ],
  },
  {
    label: "Juridisch",
    items: [
      { href: "/privacy", label: "Privacyverklaring" },
      { href: "/voorwaarden", label: "Algemene voorwaarden" },
      { href: "#", label: "KvK: 00000000" },
    ],
  },
];

export const Footer = () => (
  <footer className="bg-primary text-white">
    <div className="container-content py-16 md:py-20">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
        <div>
          <p className="font-semibold text-[17px] tracking-tight">
            Partner Duurzame Innovatie
          </p>
          <p className="mt-4 text-sm leading-relaxed text-white/80 max-w-xs">
            Commerciële en operationele ontzorgingspartner voor uitvoerders in
            de verduurzamingssector.
          </p>
        </div>

        {navCols.map((col) => (
          <div key={col.label}>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/60">
              {col.label}
            </p>
            <ul className="mt-5 space-y-3">
              {col.items.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className="text-sm text-white/80 hover:text-accent transition-colors"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-16 pt-8 border-t border-white/10">
        <p className="text-xs text-white/60">
          © 2026 Partner Duurzame Innovatie. Alle rechten voorbehouden.
        </p>
      </div>
    </div>
  </footer>
);
