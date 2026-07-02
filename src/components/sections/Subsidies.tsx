import { useEffect, useRef, useState } from "react";

import subsidiesUitzoeken from "@/assets/subsidies-uitzoeken.webp";


const cards = [
  {
    tag: "GRONINGEN & NOORD-DRENTHE",
    naam: "Nij Begun",
    uitleg:
      "Tot 100% vergoed voor isolatie. Niet alleen voor het versterkingsgebied, ook met een lager inkomen.",
    actie:
      "Wij checken of jij in aanmerking komt en dienen de aanvraag bij SNN in.",
    linkTekst: "Lees meer over Nij Begun",
    href: "/subsidies/nij-begun",
  },
  {
    tag: "HEEL NEDERLAND",
    naam: "Landelijke subsidies",
    uitleg:
      "ISDE is de landelijke subsidie voor isolatie, warmtepomp en zonneboiler. Combineer je twee of meer maatregelen, dan verdubbelen de tarieven automatisch.",
    actie: "Wij rekenen voor jouw woning uit hoe je optimaal combineert.",
    linkTekst: "Lees meer over landelijke subsidies",
    href: "/subsidies/landelijk",
  },
  {
    tag: "PER GEMEENTE",
    naam: "Regionale subsidies",
    uitleg:
      "Eigen gemeentelijke regelingen, stapelbaar bovenop ISDE en Nij Begun. Bedragen wisselen.",
    actie: "Wij houden bij wat er nu actueel is in jouw gemeente.",
    linkTekst: "Lees meer over regionale subsidies",
    href: "/subsidies/regionaal",
  },
];

export const Subsidies = () => {
  const gridRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced) {
      setVisible(true);
      return;
    }
    const el = gridRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setVisible(true);
            obs.disconnect();
          }
        });
      },
      { threshold: 0.2 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section className="section-pad bg-secondary">
      <div className="container-content">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center mb-14 md:mb-16">
          <div>
            <h2 className="h2-section">
              Welke subsidies gelden er voor{" "}
              <span style={{ color: "hsl(var(--accent))" }}>jouw woning?</span>
            </h2>
            <p
              className="mt-5"
              style={{ fontSize: 18, color: "hsl(var(--primary) / 0.8)", lineHeight: 1.6 }}
            >
              Landelijk, provinciaal én gemeentelijk: er zijn meer regelingen dan de meeste
              mensen weten, en vaak zijn ze te combineren. Wij kennen het hele landschap,
              bewaken de termijnen en zoeken gratis voor je uit wat er voor jouw adres kan.
              Jij hoeft geen subsidie-expert te zijn.
            </p>

            <div
              className="mt-6 flex items-start gap-3 rounded-xl p-4"
              style={{ backgroundColor: "#FFFFFF", border: "1px solid rgba(229, 201, 103, 0.5)" }}
            >
              <span
                className="mt-0.5 shrink-0 font-semibold"
                style={{ color: "hsl(var(--accent))" }}
                aria-hidden="true"
              >
                +
              </span>
              <p style={{ fontSize: 15, color: "hsl(var(--primary))", lineHeight: 1.55 }}>
                <strong className="font-semibold">Subsidies zijn vaak stapelbaar.</strong>{" "}
                Landelijk, regionaal en gemeentelijk samen vergoeden soms een groot deel van
                je investering. Wij zoeken uit hoe je ze combineert zonder er één te missen.
              </p>
            </div>

            <a
              href="/contact"
              className="mt-7 inline-flex items-center justify-center rounded-full px-7 py-3.5 font-sans font-semibold transition-all duration-150 hover:scale-[1.02]"
              style={{
                backgroundColor: "hsl(var(--accent))",
                color: "hsl(var(--primary))",
                fontSize: 15,
              }}
            >
              Plan een gratis gesprek
            </a>
          </div>

          <div>
            <img
              src={subsidiesUitzoeken}
              alt="Twee adviseurs van Voortraject zoeken achter hun laptops uit welke subsidies voor een woning gelden"
              loading="lazy"
              decoding="async"
              className="w-full h-64 sm:h-96 lg:h-[480px] rounded-2xl object-cover"
              style={{ boxShadow: "0 4px 20px hsl(var(--primary) / 0.08)" }}
            />
          </div>
        </div>

        <div
          ref={gridRef}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 subsidies-grid sm:[&>*:last-child:nth-child(odd)]:col-span-2 sm:[&>*:last-child:nth-child(odd)]:max-w-[calc(50%-0.75rem)] sm:[&>*:last-child:nth-child(odd)]:mx-auto lg:[&>*:last-child:nth-child(odd)]:col-span-1 lg:[&>*:last-child:nth-child(odd)]:max-w-none"
        >
          {cards.map((c, i) => (
            <a
              key={c.naam}
              href={c.href}
              className="subsidy-card group rounded-2xl p-8 md:p-10 lg:p-12 flex flex-col"
              style={{
                backgroundColor: "#FFFFFF",
                border: "1px solid rgba(229, 201, 103, 0.5)",
                boxShadow: "0 4px 14px rgba(21,44,78,0.08), 0 2px 4px rgba(21,44,78,0.04)",
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(20px)",
                transition:
                  "opacity 500ms ease-out, transform 500ms ease-out, box-shadow 250ms ease-out",
                transitionDelay: visible ? `${i * 120}ms` : "0ms",
              }}
            >
              <span
                className="font-sans uppercase"
                style={{
                  fontSize: 12,
                  letterSpacing: "0.05em",
                  color: "#6B7280",
                  fontWeight: 600,
                }}
              >
                {c.tag}
              </span>
              <h3
                className="font-display mt-5 text-[28px] md:text-[32px]"
                style={{
                  fontWeight: 700,
                  color: "hsl(var(--primary))",
                  letterSpacing: "-0.02em",
                  lineHeight: 1.2,
                }}
              >
                {c.naam}
              </h3>
              <p
                className="mt-5"
                style={{
                  fontSize: 16,
                  color: "hsl(var(--primary))",
                  lineHeight: 1.55,
                }}
              >
                {c.uitleg}
              </p>

              <div
                className="my-5"
                style={{
                  width: 48,
                  height: 1,
                  backgroundColor: "hsl(var(--accent) / 0.3)",
                }}
                aria-hidden="true"
              />

              <p
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: "hsl(var(--primary))",
                  lineHeight: 1.5,
                }}
              >
                {c.actie}
              </p>

              <span
                className="inline-flex items-center mt-auto pt-5 font-sans font-semibold subsidy-link"
                style={{ fontSize: 15, color: "hsl(var(--accent))" }}
              >
                <span className="subsidy-link-text">{c.linkTekst}</span>
                <span
                  className="subsidy-arrow"
                  style={{ marginLeft: 6, display: "inline-block" }}
                  aria-hidden="true"
                >
                  →
                </span>
              </span>
            </a>
          ))}
        </div>
      </div>

      <style>{`
        @media (hover: hover) and (pointer: fine) {
          .subsidy-card:hover {
            transform: translateY(-4px) !important;
            box-shadow: 0 10px 25px -5px rgba(21,44,78,0.12), 0 4px 10px -4px rgba(21,44,78,0.08) !important;
          }
          .subsidy-card .subsidy-arrow {
            transition: transform 200ms ease-out;
          }
          .subsidy-card .subsidy-link-text {
            background-image: linear-gradient(currentColor, currentColor);
            background-size: 0% 1px;
            background-repeat: no-repeat;
            background-position: 0 100%;
            transition: background-size 200ms ease-out;
          }
          .subsidy-card:hover .subsidy-arrow {
            transform: translateX(4px);
          }
          .subsidy-card:hover .subsidy-link-text {
            background-size: 100% 1px;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .subsidy-card,
          .subsidy-card .subsidy-arrow,
          .subsidy-card .subsidy-link-text {
            transition: none !important;
          }
        }
      `}</style>
    </section>
  );
};
