import type { ReactNode } from "react";
import logoVoortraject from "@/assets/logo-voortraject.png";

const navCols = [
  {
    label: "Navigatie",
    items: [
      { href: "/partners", label: "Partners" },
      { href: "/over-ons", label: "Over ons" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    label: "Verduurzamen",
    items: [
      { href: "/verduurzamen/isolatie", label: "Isolatie & ventilatie" },
      { href: "/verduurzamen/warmtepomp", label: "Warmtepomp" },
      { href: "/verduurzamen/airco", label: "Airco" },
      { href: "/verduurzamen/thuisbatterij", label: "Thuisbatterij & opslag" },
      { href: "/verduurzamen/zonnepanelen", label: "Zonnepanelen" },
      { href: "/verduurzamen/laadpaal", label: "Laadpaal" },
      { href: "/verduurzamen/onderhoud", label: "Onderhoud" },
    ],
  },
  {
    label: "Subsidies",
    items: [
      { href: "/subsidies/nij-begun", label: "Nij Begun" },
      { href: "/subsidies/landelijk", label: "Landelijke subsidies" },
      { href: "/subsidies/regionaal", label: "Regionale subsidies" },
      { href: "/subsidies/stapelen", label: "Subsidies stapelen" },
    ],
  },
  {
    label: "Contact",
    items: [
      { href: "mailto:info@voortraject.nl", label: "info@voortraject.nl" },
      { href: "tel:+31502112689", label: "050 211 2689" },
      { href: "#", label: "Viaductstraat 3-15, Groningen" },
      { href: "#", label: "KVK 42066892" },
    ],
  },
];

/**
 * Site footer. Het donkere paneel heeft afgeronde bovenhoeken (spiegelt de
 * afgeronde onderkant van de hero); de buitenste `bg-white` laat die hoeken
 * puur wit doorlopen met de sectie erboven.
 *
 * Pass a page's closing CTA via `cta` so it renders *inside* the same dark
 * container as the footer — the CTA and footer then read as one continuous
 * whole (no seam). The CTA content should be background-less; the dark
 * `bg-primary` comes from here.
 */
export const Footer = ({ cta }: { cta?: ReactNode }) => (
  <footer className="bg-white">
    <div className="relative overflow-hidden bg-primary text-white rounded-t-[2rem] md:rounded-t-[3rem]">
      {cta && <div className="relative z-10">{cta}</div>}
      <div className="container-content md:py-20 py-[40px] relative z-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-12">
        <div>
          <img src={logoVoortraject} alt="Voortraject" className="h-14 w-auto" />
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

        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
          <p className="text-xs text-white/60">
            © 2026 Voortraject. Alle rechten voorbehouden.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
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
    </div>
  </footer>
);
