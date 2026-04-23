import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { NavLink } from "./NavLink";
import { Button } from "./Button";

const links = [
  { href: "/uitvoerders", label: "Voor uitvoerders" },
  { href: "/bewoners", label: "Voor bewoners" },
  { href: "/maatregelen", label: "Maatregelen" },
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
        backgroundColor: "rgba(255, 255, 255, 0.6)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(229, 226, 219, 0.5)",
      }}
    >
      <div className="container-content flex items-center justify-between h-[72px] gap-6">
        <a
          href="/"
          className="font-display font-semibold text-primary text-[20px] tracking-tight shrink-0"
        >
          Voortraject
        </a>

        <nav className="hidden lg:flex items-center gap-8 shrink-0 ml-auto" aria-label="Hoofdnavigatie">
          {links.map((l) => {
            const active = typeof window !== "undefined" && window.location.pathname === l.href;
            return (
              <NavLink key={l.href} href={l.href} active={active}>{l.label}</NavLink>
            );
          })}
          <a
            href="/contact"
            className="inline-flex items-center justify-center rounded-full bg-accent text-accent-foreground hover:bg-accent-hover transition-all duration-150 ease-out hover:scale-[1.02] px-5 py-2.5 text-[15px] font-medium"
          >
            Contact
          </a>
        </nav>

        <button
          className="lg:hidden p-2 -mr-2 text-primary"
          aria-label="Menu openen"
          aria-expanded={open}
          onClick={() => setOpen(true)}
        >
          <Menu size={24} />
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 bg-background lg:hidden flex flex-col animate-fade-up">
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
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="py-4 text-2xl font-display font-semibold tracking-tight text-foreground border-b border-border"
              >
                {l.label}
              </a>
            ))}
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
