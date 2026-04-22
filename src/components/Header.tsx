import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { NavLink } from "./NavLink";
import { Button } from "./Button";

const links = [
  { href: "#voor-uitvoerders", label: "Voor uitvoerders" },
  { href: "#voor-bewoners", label: "Voor bewoners" },
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
    <header className="sticky top-0 z-50 bg-background/85 backdrop-blur-md border-b border-border">
      <div className="container-content flex items-center justify-between h-[72px]">
        <a href="/" className="font-sans font-semibold text-primary text-[17px] tracking-tight">
          Partner Duurzame Innovatie
        </a>

        <nav className="hidden lg:flex items-center gap-9" aria-label="Hoofdnavigatie">
          {links.map((l) => (
            <NavLink key={l.href} href={l.href}>{l.label}</NavLink>
          ))}
          <Button href="/contact" variant="primary" className="px-6 py-2.5 text-[15px]">
            Contact
          </Button>
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

      {/* Mobile fullscreen overlay */}
      {open && (
        <div className="fixed inset-0 z-50 bg-background lg:hidden flex flex-col animate-fade-up">
          <div className="container-content flex items-center justify-between h-[72px] border-b border-border">
            <span className="font-sans font-semibold text-primary text-[17px]">
              Partner Duurzame Innovatie
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
                className="py-4 text-2xl heading-serif text-foreground border-b border-border"
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
