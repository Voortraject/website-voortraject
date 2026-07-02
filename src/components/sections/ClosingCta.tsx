import { OfBelOnsCta } from "@/components/OfBelOnsCta";

export const ClosingCta = () => (
  <section
    className="relative z-10 py-[64px] text-primary-foreground"
    aria-labelledby="closing-cta-title"
  >
    <div className="container-content text-center flex flex-col items-center">
      <h2
        id="closing-cta-title"
        className="font-display text-white"
        style={{
          fontWeight: 600,
          fontSize: "clamp(28px, 4.5vw, 44px)",
          letterSpacing: "-0.02em",
          lineHeight: 1.2,
          maxWidth: 900,
          marginBottom: 20,
        }}
      >
        Snel duidelijkheid voor jouw woning
      </h2>
      <p
        className="text-white/80"
        style={{
          fontSize: 17,
          lineHeight: 1.6,
          maxWidth: 720,
          marginBottom: 32,
        }}
      >
        In een gratis gesprek brengen we samen in kaart wat mogelijk is, welke maatregelen
        slim zijn voor jouw woning en welke subsidies je kunt krijgen. Je bepaalt daarna
        zelf wat je ermee doet.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5 w-full sm:w-auto">
        <a
          href="/contact"
          className="inline-flex items-center justify-center rounded-full px-8 py-3.5 text-[15px] font-semibold bg-accent text-primary transition-all duration-150 hover:scale-[1.02] hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 w-full sm:w-auto"
        >
          Plan een gratis gesprek
        </a>
        <OfBelOnsCta color="#FFFFFF" align="center" />
      </div>

      {/* Risico-verlagende microtekst */}
      <p className="mt-6 text-[13px] text-white/60">
        Vrijblijvend · Binnen 24 uur reactie · Je hoeft niets voor te bereiden
      </p>

      {/* Kleine partnerverwijzing voor uitvoerders */}
      <p className="mt-10 text-[14px] text-white/55">
        Ben je uitvoerder en zoek je ontzorging in het voortraject?{" "}
        <a
          href="/uitvoerders"
          className="font-medium text-white/85 underline underline-offset-4 hover:text-white transition-colors"
        >
          Bekijk onze partnerpagina
        </a>
      </p>
    </div>
  </section>
);
