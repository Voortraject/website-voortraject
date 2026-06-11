import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Seo } from "@/components/Seo";

export type SubsidieLink = { href: string; label: string };

export interface MaatregelTemplateProps {
  slug: string;
  title: string;
  intro: string;
  icon: LucideIcon;
  seoTitle: string;
  seoDescription: string;
  badge?: string;
  watValtEronder: string[];
  voorWie: string;
  wanneerSlim: string;
  terugverdientijd: string;
  waarOpLetten: string;
  subsidies: SubsidieLink[];
  status?: "uitgewerkt" | "skelet";
}

export const MaatregelTemplate = ({
  slug,
  title,
  intro,
  icon: Icon,
  seoTitle,
  seoDescription,
  badge,
  watValtEronder,
  voorWie,
  wanneerSlim,
  terugverdientijd,
  waarOpLetten,
  subsidies,
  status = "skelet",
}: MaatregelTemplateProps) => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Seo title={seoTitle} description={seoDescription} path={`/verduurzamen/${slug}`} />
      <Header />
      <main className="flex-1">
        {/* HERO */}
        <section
          className="pb-[40px] md:pb-[64px]"
          style={{ backgroundColor: "#FBFAF7", paddingTop: "clamp(40px, 6vw, 64px)" }}
          aria-labelledby="m-title"
        >
          <div className="container-content">
            <a
              href="/verduurzamen"
              className="inline-flex items-center gap-2 text-sm transition-colors"
              style={{ color: "#152C4E", opacity: 0.7 }}
            >
              <ArrowLeft size={16} /> Terug naar overzicht
            </a>

            <div className="mt-6 flex items-start gap-4 md:gap-6">
              <div
                className="flex items-center justify-center rounded-full shrink-0"
                style={{ width: 64, height: 64, backgroundColor: "#F0E4D0" }}
              >
                <Icon size={28} color="#152C4E" strokeWidth={2.25} aria-hidden="true" />
              </div>
              <div className="min-w-0">
                {badge && (
                  <span
                    className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold"
                    style={{
                      backgroundColor: "#FDF6E3",
                      color: "#E8B547",
                      border: "1px solid rgba(232,181,71,0.4)",
                    }}
                  >
                    {badge}
                  </span>
                )}
                <h1
                  id="m-title"
                  className="font-display mt-3"
                  style={{
                    fontWeight: 700,
                    fontSize: "clamp(32px, 4.4vw, 48px)",
                    color: "#152C4E",
                    letterSpacing: "-0.02em",
                    lineHeight: 1.1,
                  }}
                >
                  {title}
                </h1>
                <p
                  className="mt-4 max-w-2xl"
                  style={{ fontSize: 17, color: "#6B6B6B", lineHeight: 1.6 }}
                >
                  {intro}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CONTENT */}
        <section className="py-[48px] md:py-[80px]" style={{ backgroundColor: "#FFFFFF" }}>
          <div className="container-content">
            <div className="mx-auto grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10" style={{ maxWidth: 1080 }}>
              <div className="flex flex-col gap-10">
                <Block title="Wat valt eronder">
                  <ul style={{ listStyle: "disc", paddingLeft: 20, margin: 0 }}>
                    {watValtEronder.map((b) => (
                      <li key={b} style={{ fontSize: 16, color: "#2B2B2B", lineHeight: 1.8 }}>
                        {b}
                      </li>
                    ))}
                  </ul>
                </Block>

                <Block title="Voor wie / wanneer slim in de route">
                  <Paragraph>{voorWie}</Paragraph>
                  <Paragraph>{wanneerSlim}</Paragraph>
                </Block>

                <Block title="Terugverdientijd & waar op letten">
                  <Paragraph>
                    <strong style={{ color: "#152C4E" }}>Terugverdientijd:</strong> {terugverdientijd}
                  </Paragraph>
                  <Paragraph>
                    <strong style={{ color: "#152C4E" }}>Waar op letten:</strong> {waarOpLetten}
                  </Paragraph>
                </Block>

                <Block title="Bijbehorende subsidies">
                  {subsidies.length === 0 ? (
                    <Paragraph>
                      Voor deze maatregel zijn op dit moment geen specifieke subsidies beschikbaar.
                    </Paragraph>
                  ) : (
                    <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                      {subsidies.map((s) => (
                        <li key={s.href} style={{ marginBottom: 10 }}>
                          <a
                            href={s.href}
                            className="inline-flex items-center gap-2 group"
                            style={{
                              color: "#152C4E",
                              fontWeight: 500,
                              fontSize: 16,
                              borderBottom: "1px solid #E8B547",
                              paddingBottom: 2,
                            }}
                          >
                            <Check size={16} color="#E8B547" />
                            {s.label}
                            <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </Block>

                {status === "skelet" && (
                  <div
                    className="rounded-2xl p-5"
                    style={{
                      backgroundColor: "#FDF6E3",
                      border: "1px dashed #E8B547",
                      color: "#6B6B6B",
                      fontSize: 14,
                    }}
                  >
                    Deze pagina staat klaar als basis. We werken de inhoud per maatregel verder uit.
                    Heb je vragen die hier nog niet beantwoord staan?{" "}
                    <a href="/contact" style={{ color: "#152C4E", textDecoration: "underline" }}>
                      Neem dan contact op
                    </a>
                    .
                  </div>
                )}
              </div>

              {/* CTA sticky aside */}
              <aside>
                <div
                  className="rounded-2xl p-6 lg:sticky lg:top-24"
                  style={{
                    backgroundColor: "#152C4E",
                    color: "#FFFFFF",
                  }}
                >
                  <h3
                    className="font-display"
                    style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.01em", lineHeight: 1.2 }}
                  >
                    Twijfel of dit voor jouw woning slim is?
                  </h3>
                  <p style={{ fontSize: 14, lineHeight: 1.6, opacity: 0.85, marginTop: 12 }}>
                    Plan een vrijblijvend gesprek. We kijken samen wat past bij jouw situatie en in welke
                    volgorde.
                  </p>
                  <a
                    href="/contact"
                    className="mt-5 inline-flex items-center justify-center w-full rounded-full font-semibold transition-colors"
                    style={{
                      backgroundColor: "#E8B547",
                      color: "#152C4E",
                      padding: "12px 20px",
                      fontSize: 15,
                    }}
                  >
                    Plan een gesprek
                  </a>
                </div>
              </aside>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

const Block = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div>
    <h2
      className="font-display"
      style={{
        fontSize: 22,
        fontWeight: 600,
        color: "#152C4E",
        letterSpacing: "-0.01em",
        lineHeight: 1.3,
        marginBottom: 16,
      }}
    >
      {title}
    </h2>
    <div className="flex flex-col gap-3">{children}</div>
  </div>
);

const Paragraph = ({ children }: { children: React.ReactNode }) => (
  <p style={{ fontSize: 16, color: "#4B4B4B", lineHeight: 1.7, margin: 0 }}>{children}</p>
);
