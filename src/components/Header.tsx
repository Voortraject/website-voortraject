import { useState, useEffect } from "react";
import { Menu, X, ChevronDown, LayoutGrid, Search, ArrowRight } from "lucide-react";
import logoVoortrajectBlauw from "@/assets/logo-voortraject-blauw.png";
import logoVoortrajectWit from "@/assets/logo-voortraject.png";

const pillShadow = {
  boxShadow:
    "0 8px 32px -8px hsl(var(--primary) / 0.22), 0 2px 8px -2px hsl(var(--primary) / 0.14)",
};

// Premium "frosted glass" surface used across the header pills.
const glassPill = "bg-white/70 backdrop-blur-xl";

// Dropdown panels hang over a busier/darker part of the hero than the slim header
// bar (and, being nested inside the nav's own backdrop-filter, blur weaker), so they
// need a higher white opacity to read as the *same* frosted surface as the pills.
const glassPanel = "bg-white/95 backdrop-blur-xl";

type DropdownItem = { href: string; label: string; tool?: boolean; overzicht?: boolean };

const verduurzamenItems: DropdownItem[] = [
  // De hub bovenaan, zelfde plek als de subsidiecheck in de andere dropdown:
  // wie nog niet weet welke maatregel hij zoekt, hoort daar te beginnen.
  { href: "/verduurzamen", label: "Overzicht en route", overzicht: true },
  { href: "/verduurzamen/isolatie", label: "Isolatie & ventilatie" },
  { href: "/verduurzamen/warmtepomp", label: "Warmtepomp" },
  { href: "/verduurzamen/airco", label: "Airco" },
  { href: "/verduurzamen/thuisbatterij", label: "Thuisbatterij & opslag" },
  { href: "/verduurzamen/zonnepanelen", label: "Zonnepanelen" },
  { href: "/verduurzamen/laadpaal", label: "Laadpaal" },
  { href: "/verduurzamen/onderhoud", label: "Onderhoud" },
];

const subsidiesItems: DropdownItem[] = [
  // De subsidiecheck is een interactieve tool, geen leespagina — uitgelicht
  // bovenaan de dropdown, visueel losgetrokken van de informatiepagina's.
  { href: "/subsidiecheck", label: "Subsidiecheck", tool: true },
  { href: "/subsidies/nij-begun", label: "Nij Begun" },
  { href: "/subsidies/landelijk", label: "Landelijke subsidies" },
  { href: "/subsidies/regionaal", label: "Regionale subsidies" },
  { href: "/subsidies/stapelen", label: "Subsidies stapelen" },
];

const links: { href: string; label: string; dropdown?: typeof subsidiesItems }[] = [
  // De href van een item mét dropdown wordt niet als link gerenderd (dat is een
  // <button>), maar bepaalt wel wanneer het item actief oplicht. Met
  // /verduurzamen/isolatie lichtte "Verduurzamen" alleen op de isolatiepagina
  // op en niet op de andere zes.
  { href: "/verduurzamen", label: "Verduurzamen", dropdown: verduurzamenItems },
  { href: "/subsidies", label: "Subsidies", dropdown: subsidiesItems },
  { href: "/over-ons", label: "Over ons" },
  { href: "/zakelijk", label: "Zakelijk" },
  { href: "/contact", label: "Contact" },
];


const MobileMenu = ({ onClose }: { onClose: () => void }) => {
  const [openSection, setOpenSection] = useState<string | null>(null);

  // Sluiten ná de huidige event-lus, en alleen bij een klik op een link.
  //
  // Synchroon sluiten ontkoppelt het <a> uit de DOM terwijl de klik nog aan het
  // bubbelen is. De klik komt dan wél bij `document` aan, maar met een target
  // die nergens meer in het document hangt, waardoor een GTM-trigger op een
  // CSS-selector ("header a") niet meer matcht. Een trigger op Click URL werkt
  // dan nog wel, wat het verschil verklaarde tussen klik_contact (vuurde) en
  // nav_klik (vuurde niet) bij één en dezelfde klik.
  //
  // De X-knop hieronder mag wél synchroon sluiten: daar wordt niets gemeten.
  // Zie docs/tracking.md.
  const sluitNaKlik = () => setTimeout(onClose, 0);

  // Huisstijl oktober 2026: een dicht inktblauw paneel met stil licht (hs-donker),
  // ronde onderhoeken, grote koppen met een pijl, submenu's in een glazen tegel
  // en de oker knop onderaan. Eerder was het paneel doorschijnend en las je de
  // herotekst erdoorheen. De klik-afhandeling hierboven en hieronder is
  // ongewijzigd (meting, zie docs/tracking.md en mobielMenuKlik.test.tsx).
  const kop = "font-['Inter_Tight',_'Inter',_sans-serif] text-[22px] font-bold tracking-[-0.02em] text-primary-foreground";

  return (
    <div
      className="fixed inset-0 z-50 lg:hidden flex flex-col bg-primary/45 animate-fade-up"
      // Sluit alleen bij een klik op de achtergrond zelf, niet op het paneel
      // erbinnen. Dit stond eerder als een stopPropagation() op het paneel,
      // maar dat brak de meting: React koppelt zijn listeners op de
      // root-container, dus stopPropagation() daar houdt óók het native event
      // tegen en dan bereikt de klik `document` nooit. Precies daar luistert
      // Google Tag Manager, waardoor geen enkele klik in het mobiele menu nog
      // gemeten werd. Zie docs/tracking.md.
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="hs-donker relative flex max-h-full flex-col overflow-y-auto rounded-b-[28px] pt-[env(safe-area-inset-top)] shadow-[0_24px_60px_hsl(var(--primary)/0.45)]">
        <div className="container-content flex items-center justify-between pt-4">
          <img src={logoVoortrajectWit} alt="Voortraject" className="h-9 w-auto" />
          <button
            type="button"
            className="hs-knop-glas grid h-12 w-12 place-items-center rounded-full"
            aria-label="Menu sluiten"
            onClick={onClose}
          >
            <X size={22} aria-hidden="true" />
          </button>
        </div>
        <nav className="container-content flex flex-col pt-3 pb-7" aria-label="Mobiele navigatie">
          {links.map((l) =>
            l.dropdown ? (
              <div key={l.href} className="border-b border-primary-foreground/10">
                <button
                  type="button"
                  className={`flex w-full items-center justify-between gap-4 py-[18px] text-left ${kop}`}
                  onClick={() =>
                    setOpenSection(openSection === l.href ? null : l.href)
                  }
                  aria-expanded={openSection === l.href}
                >
                  {l.label}
                  <span className="hs-rondje hs-rondje-glas h-9 w-9" aria-hidden="true">
                    <ChevronDown
                      size={18}
                      strokeWidth={2.2}
                      className={`transition-transform duration-300 motion-reduce:transition-none ${openSection === l.href ? "rotate-180" : ""}`}
                    />
                  </span>
                </button>
                {openSection === l.href && (
                  <div className="mb-4 grid gap-0.5 rounded-[20px] bg-primary-foreground/[0.07] p-2">
                    {l.dropdown.map((s) =>
                      s.tool || s.overzicht ? (
                        <a
                          key={s.href}
                          href={s.href}
                          onClick={sluitNaKlik}
                          className="flex items-center gap-3 rounded-[14px] px-3 py-2.5 text-[16.5px] font-bold text-primary-foreground hover:bg-primary-foreground/10"
                        >
                          <span
                            className={`hs-rondje h-8 w-8 ${s.tool ? "hs-rondje-oker" : "hs-rondje-glas"}`}
                            aria-hidden="true"
                          >
                            {s.tool ? (
                              <Search size={15} strokeWidth={2.2} />
                            ) : (
                              <LayoutGrid size={15} strokeWidth={2.2} />
                            )}
                          </span>
                          {s.label}
                          {s.tool && (
                            <span className="rounded-full bg-accent/25 px-2 py-0.5 text-[11px] font-bold text-primary-foreground">
                              Tool
                            </span>
                          )}
                        </a>
                      ) : (
                        <a
                          key={s.href}
                          href={s.href}
                          onClick={sluitNaKlik}
                          className="flex items-center justify-between gap-3 rounded-[14px] px-3 py-2.5 text-[16px] font-semibold text-primary-foreground/85 hover:bg-primary-foreground/10 hover:text-primary-foreground"
                        >
                          {s.label}
                          <ArrowRight size={16} className="shrink-0 text-primary-foreground/40" aria-hidden="true" />
                        </a>
                      ),
                    )}
                  </div>
                )}
              </div>
            ) : (
              <a
                key={l.href}
                href={l.href}
                onClick={sluitNaKlik}
                className={`flex items-center justify-between gap-4 border-b border-primary-foreground/10 py-[18px] ${kop}`}
              >
                {l.label}
                <ArrowRight size={20} className="shrink-0 text-primary-foreground/45" aria-hidden="true" />
              </a>
            )
          )}
          <a
            href="/subsidiecheck"
            onClick={sluitNaKlik}
            className="hs-knop hs-knop-oker mt-7 w-full"
          >
            <Search size={18} strokeWidth={2.2} aria-hidden="true" />
            Check jouw subsidies
          </a>
        </nav>
      </div>
    </div>
  );
};

/**
 * Waar zolang het element met dit id in beeld is. Zonder id altijd onwaar.
 * Zonder IntersectionObserver ook onwaar: dan staat de knop er gewoon.
 */
const useVerborgenZolangInBeeld = (id?: string) => {
  const [inBeeld, setInBeeld] = useState(!!id);
  useEffect(() => {
    if (!id) return;
    const el = document.getElementById(id);
    if (!el || typeof IntersectionObserver !== "function") {
      setInBeeld(false);
      return;
    }
    const io = new IntersectionObserver(([e]) => setInBeeld(e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, [id]);
  return !!id && inBeeld;
};

interface HeaderProps {
  /**
   * Alleen het logo, geen navigatie en geen CTA.
   *
   * Voor pagina's met precies één doel (de subsidiecheck). Elke link in de
   * header is daar een uitgang: de nav, de dropdowns én een "Check jouw
   * subsidies"-knop die naar de pagina wijst waar je al staat. Wat overblijft
   * is het logo, zodat de bezoeker altijd terug naar huis kan; de volledige
   * navigatie staat gewoon in de footer.
   */
  compact?: boolean;
  /**
   * Id van de hoofdknop in de hero. Zolang die in beeld is, staat de oker
   * "Check jouw subsidies" hier niet: anders staan er bovenin twee identieke
   * oker knoppen naast elkaar. Hij verschijnt zodra de hero-knop uit beeld is.
   * Alleen pagina's met een eigen oker knop in de hero geven dit mee.
   */
  ctaNaElement?: string;
}

export const Header = ({ compact = false, ctaNaElement }: HeaderProps) => {
  const [open, setOpen] = useState(false);
  const ctaVerborgen = useVerborgenZolangInBeeld(ctaNaElement);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (compact) {
    return (
      <>
        <div aria-hidden className="bg-primary" style={{ height: "env(safe-area-inset-top)" }} />
        <header className="sticky top-[env(safe-area-inset-top)] z-50">
          <div className="container-content flex items-center h-20">
            <a
              href="/"
              className={`shrink-0 inline-flex items-center ${glassPill} rounded-full px-5 py-2.5 hover:bg-white/80 transition-colors`}
              style={pillShadow}
              aria-label="Voortraject home"
            >
              <img src={logoVoortrajectBlauw} alt="Voortraject" className="h-8 w-auto" />
            </a>
          </div>
        </header>
      </>
    );
  }

  return (
    <>
      {/* In-flow navy vulling achter de statusbalk (safe-area boven). BEWUST
          in-flow — géén fixed/absolute — zodat hij MEE-scrollt: bij rust navy
          achter de statusbalk, bij naar beneden scrollen schuift hij weg en
          vult de pagina-content de zone (zoals gevraagd). In-flow elementen
          worden niet weggeknipt door de `overflow-x: clip` op html/body — dat
          was juist de valkuil van de eerdere absolute strook op iOS. De sticky
          header plakt daarom net onder de statusbalk (top = safe-area-inset-top)
          i.p.v. bovenaan. Hoogte 0 zonder safe-area ⇒ geen effect op desktop. */}
      <div aria-hidden className="bg-primary" style={{ height: "env(safe-area-inset-top)" }} />
      <header className="sticky top-[env(safe-area-inset-top)] z-50">
      <div className="container-content flex items-center justify-between gap-3 h-20">
        <a
          href="/"
          className={`shrink-0 inline-flex items-center ${glassPill} rounded-full px-5 py-2.5 hover:bg-white/80 transition-colors`}
          style={pillShadow}
          aria-label="Voortraject home"
        >
          <img src={logoVoortrajectBlauw} alt="Voortraject" className="h-8 w-auto" />
        </a>

        <nav
          className={`hidden lg:flex items-center gap-1 ${glassPill} rounded-full px-2 py-1.5`}
          style={pillShadow}
          aria-label="Hoofdnavigatie"
        >
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
                    className={`inline-flex items-center gap-1 rounded-full px-3.5 py-2 text-[15px] font-medium transition-colors ${active ? "text-primary font-semibold" : "text-primary/90 hover:text-primary"}`}
                  >
                    {l.label}
                    <ChevronDown size={14} className="transition-transform group-hover:rotate-180" />
                  </button>
                  <div className="absolute left-1/2 -translate-x-1/2 top-full pt-3 hidden group-hover:block">
                    <div className={`${glassPanel} rounded-lg overflow-hidden py-2 min-w-[220px]`} style={pillShadow}>
                      {l.dropdown.map((s) =>
                        s.tool || s.overzicht ? (
                          <div key={s.href}>
                            <a
                              href={s.href}
                              className="flex items-center gap-2.5 px-4 py-2.5 text-[14px] font-semibold text-primary hover:bg-secondary transition-colors"
                            >
                              {s.tool ? (
                                <Search size={15} strokeWidth={2} className="text-primary" aria-hidden="true" />
                              ) : (
                                <LayoutGrid size={15} strokeWidth={2} className="text-primary" aria-hidden="true" />
                              )}
                              {s.label}
                              {s.tool && (
                                <span className="ml-auto rounded-full bg-accent/25 px-2 py-0.5 text-[11px] font-semibold text-primary">
                                  Tool
                                </span>
                              )}
                            </a>
                            <div className="mx-4 my-1.5 h-px bg-border" aria-hidden="true" />
                          </div>
                        ) : (
                          <a
                            key={s.href}
                            href={s.href}
                            className="block px-4 py-2.5 text-[14px] text-foreground hover:bg-secondary hover:text-primary transition-colors"
                          >
                            {s.label}
                          </a>
                        ),
                      )}
                    </div>
                  </div>
                </div>
              );
            }
            return (
              <a
                key={l.href}
                href={l.href}
                className={`rounded-full px-3.5 py-2 text-[15px] font-medium transition-colors ${active ? "text-primary font-semibold" : "text-primary/90 hover:text-primary"}`}
              >
                {l.label}
              </a>
            );
          })}
        </nav>

        <div className="hidden lg:flex items-center gap-3 shrink-0">
          {/* Hoofd-CTA van de site: de subsidiecheck, gelijk aan de hero. */}
          <a
            href="/subsidiecheck"
            aria-label="Check jouw subsidies"
            aria-hidden={ctaVerborgen || undefined}
            tabIndex={ctaVerborgen ? -1 : undefined}
            data-verborgen={ctaVerborgen}
            className="hs-knop hs-knop-oker hs-kop-cta min-h-[48px] px-6 text-[15px]"
          >
            <Search size={16} strokeWidth={2.2} aria-hidden="true" />
            Check jouw subsidies
          </a>
        </div>

        <button
          className={`lg:hidden w-12 h-12 flex items-center justify-center ${glassPill} rounded-full text-primary`}
          style={pillShadow}
          aria-label="Menu openen"
          aria-expanded={open}
          onClick={() => setOpen(true)}
        >
          <Menu size={22} />
        </button>
      </div>

      {open && <MobileMenu onClose={() => setOpen(false)} />}
      </header>
    </>
  );
};
