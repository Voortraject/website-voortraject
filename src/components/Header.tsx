import { useState, useEffect } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { NavLink } from "./NavLink";
import { Button } from "./Button";
import logoVoortraject from "@/assets/logo-voortraject.png";
import { Component as GlowingButton } from "@/components/ui/glowing-button";

const subsidiesItems = [
  { href: "/subsidies/nij-begun", label: "Nij Begun" },
  { href: "/subsidies/landelijk", label: "Landelijke subsidies" },
  { href: "/subsidies/regionaal", label: "Regionale subsidies" },
];

const links: { href: string; label: string; dropdown?: typeof subsidiesItems }[] = [
  { href: "/bewoners", label: "Bewoners" },
  { href: "/uitvoerders", label: "Uitvoerders" },
  { href: "/maatregelen", label: "Maatregelen" },
  { href: "/subsidies", label: "Subsidies", dropdown: subsidiesItems },
  { href: "/over-ons", label: "Over ons" },
];

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
          <img src={logoVoortraject} alt="Voortraject" className="h-7 w-auto" />
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
          <a href="/contact" aria-label="Contact">
            <GlowingButton glowColor="#c9a227">Contact</GlowingButton>
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

      {open && (
        <div className="fixed inset-0 z-50 bg-background md:hidden flex flex-col animate-fade-up overflow-y-auto">
          <div className="container-content flex items-center justify-between h-[72px] border-b border-border">
            <span className="font-display font-semibold text-primary text-[20px]">
              Voortraject
            </span>
            <button
              className="p-2 -mr-2 text-primary"
              aria-label="Menu sluiten"
              onClick={() => setOpen(false)}
            >
              <X size={24} />
            </button>
          </div>
          <nav className="container-content flex flex-col gap-2 pt-10" aria-label="Mobiele navigatie">
            {links.map((l) =>
              l.dropdown ? (
                <div key={l.href} className="border-b border-border">
                  <div className="py-4 text-2xl font-display font-semibold tracking-tight text-foreground">
                    {l.label}
                  </div>
                  <div className="pb-4 pl-2 flex flex-col gap-2">
                    {l.dropdown.map((s) => (
                      <a
                        key={s.href}
                        href={s.href}
                        onClick={() => setOpen(false)}
                        className="py-2 text-lg text-foreground/80"
                      >
                        {s.label}
                      </a>
                    ))}
                  </div>
                </div>
              ) : (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="py-4 text-2xl font-display font-semibold tracking-tight text-foreground border-b border-border"
                >
                  {l.label}
                </a>
              )
            )}
            <div className="mt-8">
              <Button href="/contact" variant="primary" className="w-full">
                Contact
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};
