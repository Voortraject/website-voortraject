import type { ReactNode } from "react";
import logoVoortraject from "@/assets/logo-voortraject.png";
import "@/styles/home-onder.css";

const navCols = [
  {
    label: "Navigatie",
    items: [
      { href: "/zakelijk", label: "Zakelijk" },
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
 * afgeronde onderkant van de hero) en stil licht van rechtsboven (ho-voet-paneel
 * in src/styles/home-onder.css, geen animatie). De buitenste `bg-background`
 * laat die hoeken doorlopen in de off-white secties erboven.
 *
 * Pass a page's closing CTA via `cta` so it renders *inside* the same dark
 * container as the footer: the CTA and footer then read as one continuous
 * whole (no seam). The CTA content should be background-less; the dark
 * panel comes from here.
 */
export const Footer = ({ cta }: { cta?: ReactNode }) => (
  <footer className="bg-background">
    <div
      className="ho-voet-paneel relative overflow-hidden rounded-t-[2rem] md:rounded-t-[3rem]"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {cta && <div className="relative z-10">{cta}</div>}
      <div className="container-content relative z-10 pb-6 pt-14 md:pb-8 md:pt-20">
        <div className="grid grid-cols-1 gap-9 sm:grid-cols-2 lg:grid-cols-5 lg:gap-11">
          <div>
            <img src={logoVoortraject} alt="Voortraject" className="h-14 w-auto" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-primary-foreground/80">
              Ondersteuning in het verduurzamingstraject
            </p>
          </div>

          {navCols.map((col) => (
            <div key={col.label}>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary-foreground/70">
                {col.label}
              </p>
              <ul className="mt-[18px] space-y-3">
                {col.items.map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      className="text-sm text-primary-foreground/80 transition-colors hover:text-accent"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Verdeellijn als zachte inset-schaduw in plaats van een rand. */}
        <div className="mt-14 flex flex-col items-center justify-between gap-4 pt-6 text-center shadow-[inset_0_1px_0_hsl(var(--primary-foreground)/0.1)] sm:flex-row sm:text-left">
          <p className="text-[13.5px] text-primary-foreground/70">
            © 2026 Voortraject. Alle rechten voorbehouden.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
            <a
              href="/privacy"
              className="text-sm text-primary-foreground/80 transition-colors hover:text-accent"
            >
              Privacyverklaring
            </a>
            <a
              href="/cookieverklaring"
              className="text-sm text-primary-foreground/80 transition-colors hover:text-accent"
            >
              Cookieverklaring
            </a>
            <a
              href="javascript:openAxeptioCookies()"
              className="text-sm text-primary-foreground/80 transition-colors hover:text-accent"
            >
              Cookievoorkeuren
            </a>
          </div>
        </div>
      </div>
    </div>
  </footer>
);
