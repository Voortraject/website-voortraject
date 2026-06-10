import logoVoortraject from "@/assets/logo-voortraject.png";

const navCols = [
  {
    label: "Navigatie",
    items: [
      { href: "/uitvoerders", label: "Uitvoerders" },
      { href: "/bewoners", label: "Bewoners" },
      { href: "/maatregelen", label: "Maatregelen" },
      { href: "/over-ons", label: "Over ons" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    label: "Subsidies",
    items: [
      { href: "/subsidies/nij-begun", label: "Nij Begun" },
      { href: "/subsidies/landelijk", label: "Landelijke subsidies" },
      { href: "/subsidies/regionaal", label: "Regionale subsidies" },
    ],
  },
  {
    label: "Contact",
    items: [
      { href: "mailto:info@voortraject.nl", label: "info@voortraject.nl" },
      { href: "tel:+31640248371", label: "+31 6 40248371" },
      { href: "#", label: "Viaductstraat 3-15, Groningen" },
      { href: "#", label: "KVK 42066892" },
    ],
  },
];

export const Footer = () => (
  <footer className="text-white" style={{ backgroundColor: "#152C4E" }}>
    <div className="container-content md:py-20 py-[40px]">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-10 lg:gap-12">
        <div>
          <img src={logoVoortraject} alt="Voortraject" className="h-8 w-auto" />
          <p className="mt-4 text-sm leading-relaxed text-white/80 max-w-xs">
            Ondersteuning in het verduurzamingstraject
          </p>
        </div>

        {navCols.map((col) => (
          <div key={col.label}>
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-white/60">
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

      <div className="mt-16 pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
        <p className="text-xs text-white/60">
          © 2026 Voortraject. Alle rechten voorbehouden.
        </p>
        <div className="flex items-center gap-4">
          <a
            href="/privacy"
            className="text-sm text-white/80 hover:text-accent transition-colors"
          >
            Privacyverklaring
          </a>
          <a
            href="/cookieverklaring"
            className="text-sm text-white/80 hover:text-accent transition-colors"
          >
            Cookieverklaring
          </a>
          <a
            href="javascript:openAxeptioCookies()"
            className="text-sm text-white/80 hover:text-accent transition-colors"
          >
            Cookievoorkeuren
          </a>
        </div>
      </div>
    </div>
  </footer>
);
