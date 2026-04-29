import logoVoortraject from "@/assets/logo-voortraject.png";

const navCols = [
  {
    label: "Navigatie",
    items: [
      { href: "/uitvoerders", label: "Voor uitvoerders" },
      { href: "/bewoners", label: "Voor bewoners" },
      { href: "/maatregelen", label: "Maatregelen" },
      { href: "/over-ons", label: "Over ons" },
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
      { href: "#", label: "Privacyverklaring" },
      { href: "#", label: "Algemene voorwaarden" },
      { href: "#", label: "KvK: 00000000" },
    ],
  },
];

export const Footer = () => (
  <footer className="text-white" style={{ backgroundColor: "#152C4E" }}>
    <div className="container-content md:py-20 py-[40px]">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
        <div>
          <p className="font-display font-semibold text-[20px] tracking-tight">
            Voortraject
          </p>
          <p className="mt-4 text-sm leading-relaxed text-white/80 max-w-xs">
            Voortraject voor verduurzamingsbedrijven
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

      <div className="mt-16 pt-8 border-t border-white/10">
        <p className="text-xs text-white/60">
          © 2026 Voortraject. Alle rechten voorbehouden.
        </p>
      </div>
    </div>
  </footer>
);
