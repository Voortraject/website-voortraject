import { useState, useEffect } from "react";
import { Menu, X, ChevronDown, Phone } from "lucide-react";
import { NavLink } from "./NavLink";
import { Button } from "./Button";
import logoVoortraject from "@/assets/logo-voortraject.png";


const verduurzamenItems = [
  { href: "/verduurzamen/isolatie", label: "Isolatie & ventilatie" },
  { href: "/verduurzamen/warmtepomp", label: "Warmtepomp" },
  { href: "/verduurzamen/airco", label: "Airco" },
  { href: "/verduurzamen/thuisbatterij", label: "Thuisbatterij & opslag" },
  { href: "/verduurzamen/zonnepanelen", label: "Zonnepanelen" },
  { href: "/verduurzamen/laadpaal", label: "Laadpaal" },
  { href: "/verduurzamen/onderhoud", label: "Onderhoud" },
];

const subsidiesItems = [
  { href: "/subsidies/nij-begun", label: "Nij Begun" },
  { href: "/subsidies/landelijk", label: "Landelijke subsidies" },
  { href: "/subsidies/regionaal", label: "Regionale subsidies" },
  { href: "/subsidies/stapelen", label: "Subsidies stapelen" },
];

const links: { href: string; label: string; dropdown?: typeof subsidiesItems }[] = [
  { href: "/bewoners", label: "Bewoners" },
  { href: "/uitvoerders", label: "Uitvoerders" },
  { href: "/verduurzamen/isolatie", label: "Verduurzamen", dropdown: verduurzamenItems },
  { href: "/subsidies", label: "Subsidies", dropdown: subsidiesItems },
  { href: "/over-ons", label: "Over ons" },
];


const MobileMenu = ({ onClose }: { onClose: () => void }) => {
  const [openSection, setOpenSection] = useState<string | null>(null);
  return (
    <div
      className="fixed inset-0 z-50 md:hidden flex flex-col animate-fade-up"
      onClick={onClose}
    >
      <div
        className="flex flex-col max-h-full overflow-y-auto"
        style={{ backgroundColor: "rgba(21, 44, 78, 0.95)", backdropFilter: "blur(8px)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="container-content flex items-center justify-between h-[72px] border-b border-white/10">
          <img src={logoVoortraject} alt="Voortraject" className="h-10 w-auto" />
          <button
            className="p-2 -mr-2 text-white"
            aria-label="Menu sluiten"
            onClick={onClose}
          >
            <X size={24} />
          </button>
        </div>
        <nav className="container-content flex flex-col gap-1 pt-6 pb-8" aria-label="Mobiele navigatie">
          {links.map((l) =>
            l.dropdown ? (
              <div key={l.href} className="border-b border-white/10">
                <button
                  type="button"
                  className="w-full flex items-center justify-between py-4 text-2xl font-display font-semibold tracking-tight text-white"
                  onClick={() =>
                    setOpenSection(openSection === l.href ? null : l.href)
                  }
                  aria-expanded={openSection === l.href}
                >
                  {l.label}
                  <ChevronDown
                    size={22}
                    className={`transition-transform ${openSection === l.href ? "rotate-180" : ""}`}
                  />
                </button>
                {openSection === l.href && (
                  <div className="pb-4 pl-2 flex flex-col gap-2">
                    {l.dropdown.map((s) => (
                      <a
                        key={s.href}
                        href={s.href}
                        onClick={onClose}
                        className="py-2 text-lg text-white/80 hover:text-accent"
                      >
                        {s.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <a
                key={l.href}
                href={l.href}
                onClick={onClose}
                className="py-4 text-2xl font-display font-semibold tracking-tight text-white border-b border-white/10"
              >
                {l.label}
              </a>
            )
          )}
          <div className="mt-5 flex items-center gap-3">
            <a
              href="/contact"
              onClick={onClose}
              className="flex-1 inline-flex items-center justify-center rounded-full px-5 py-3 text-base font-semibold"
              style={{ backgroundColor: "hsl(var(--accent))", color: "#152C4E" }}
            >
              Contact
            </a>
            <a
              href="tel:+31502112689"
              aria-label="Bel ons: 050 211 2689"
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-base font-semibold"
              style={{ backgroundColor: "#E5E7EB", color: "#152C4E" }}
            >
              <Phone size={18} strokeWidth={2} />
              <span>050 211 2689</span>
            </a>
          </div>
        </nav>
      </div>
    </div>
  );
};

export const Header = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className="sticky top-0 z-50"
      style={{
        backgroundColor: "#152C4E",
        borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
      }}
    >
      <div className="container-content flex items-center justify-between h-[72px] gap-6">
        <a
          href="/"
          className="shrink-0 hover:opacity-90 transition-opacity"
          aria-label="Voortraject home"
        >
          <img src={logoVoortraject} alt="Voortraject" className="h-12 w-auto" />
        </a>

        <nav className="hidden md:flex items-center gap-5 lg:gap-8 shrink-0 ml-auto" aria-label="Hoofdnavigatie">
          {links.map((l) => {
            const pathname = typeof window !== "undefined" ? window.location.pathname : "";
            const active = l.dropdown
              ? pathname.startsWith(l.href)
              : pathname === l.href;
            if (l.dropdown) {
              return (
                <div key={l.href} className="relative group">
                  <button
                    type="button"
                    className={`inline-flex items-center gap-1 text-[14px] lg:text-[15px] font-medium transition-colors ${active ? "text-accent" : "text-white/85 hover:text-accent"}`}
                  >
                    {l.label}
                    <ChevronDown size={14} className="transition-transform group-hover:rotate-180" />
                  </button>
                  <div className="absolute left-1/2 -translate-x-1/2 top-full pt-3 hidden group-hover:block">
                    <div className="bg-white rounded-lg shadow-lg border border-border py-2 min-w-[220px]">
                      {l.dropdown.map((s) => (
                        <a
                          key={s.href}
                          href={s.href}
                          className="block px-4 py-2.5 text-[14px] text-foreground hover:bg-secondary hover:text-primary transition-colors"
                        >
                          {s.label}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              );
            }
            return (
              <a
                key={l.href}
                href={l.href}
                className={`text-[14px] lg:text-[15px] font-medium transition-colors ${active ? "text-accent" : "text-white/85 hover:text-accent"}`}
                style={active ? { borderBottom: "2px solid hsl(var(--accent))", paddingBottom: 2 } : undefined}
              >
                {l.label}
              </a>
            );
          })}
          <a
            href="tel:+31502112689"
            aria-label="Bel ons: 050 211 2689"
            className="hidden lg:inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-[14px] font-semibold transition-colors hover:bg-white/90"
            style={{ backgroundColor: "#E5E7EB", color: "#152C4E" }}
          >
            <Phone size={16} strokeWidth={2} />
            <span>050 211 2689</span>
          </a>
          <a
            href="/contact"
            aria-label="Contact"
            className="relative overflow-hidden inline-flex items-center justify-center rounded-full py-3 px-6 text-base font-semibold"
            style={{ backgroundColor: "hsl(var(--accent))", color: "#152C4E" }}
          >
            <span className="relative z-10">Plan een gesprek</span>
            <span className="absolute inset-0 overflow-hidden rounded-full pointer-events-none">
              <span
                className="absolute top-0 left-0 w-1/3 h-full bg-gradient-to-r from-transparent via-white/40 to-transparent"
                style={{ animation: 'sheen 5s ease-in-out infinite' }}
              />
            </span>
          </a>
        </nav>

        <button
          className="md:hidden p-2 -mr-2 text-white min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Menu openen"
          aria-expanded={open}
          onClick={() => setOpen(true)}
        >
          <Menu size={24} />
        </button>
      </div>

      {open && <MobileMenu onClose={() => setOpen(false)} />}
    </header>
  );
};
