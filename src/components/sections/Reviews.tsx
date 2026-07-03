import { useState } from "react";
import { Star } from "lucide-react";

// Letterlijke citaten — teksten niet aanpassen.
const reviews = [
  {
    naam: "Julian",
    quote:
      "Ik had geen idee hoe ik moest beginnen met het verduurzamen van mijn huis. Voortraject heeft me daarmee geholpen.",
    vervolg:
      " Ze regelden de subsidieaanvraag en zorgden dat alles goed op papier stond. Zelf hoefde ik weinig te doen. Dak en spouwmuren zijn nu geïsoleerd en het huis is een stuk warmer. Fijn dat er een partij is die je hier gewoon bij helpt.",
  },
  {
    naam: "Tibbe",
    quote:
      "Goed geholpen door Michael. Hij heeft alles voor mij geregeld en komen ze binnenkort nieuwe kozijnen plaatsen.",
  },
  {
    naam: "Eefje",
    quote: "Zeer tevreden. Ik kreeg deskundig advies en fijn dat ze alle subsidies regelde!",
  },
];

const Sterren = ({ size = 16 }: { size?: number }) => (
  <span className="inline-flex items-center gap-1" aria-label="5 van 5 sterren">
    {Array.from({ length: 5 }, (_, i) => (
      <Star key={i} size={size} className="text-accent fill-accent" aria-hidden="true" />
    ))}
  </span>
);

export const Reviews = () => {
  const [uitgeklapt, setUitgeklapt] = useState(false);

  return (
    <section className="section-pad bg-primary" aria-labelledby="reviews-title">
      <div className="container-home">
        <div className="text-center">
          <h2 id="reviews-title" className="h2-section !text-white">
            Wat bewoners <span className="text-accent">zeggen</span>
          </h2>
          <p className="mt-4 inline-flex items-center gap-2.5 text-[16px] font-medium text-white/85">
            <Sterren />
            <span>5,0 op Google</span>
          </p>
        </div>

        {/* items-start: het uitklappen van één kaart mag de andere niet oprekken */}
        <div className="mt-10 md:mt-14 grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 items-start">
          {reviews.map(({ naam, quote, vervolg }) => {
            const open = !vervolg || uitgeklapt;
            return (
              <article
                key={naam}
                className="bg-card rounded-2xl border border-border p-6 md:p-7 flex flex-col md:min-h-[250px]"
                style={{ boxShadow: "0 4px 24px hsl(var(--primary) / 0.2)" }}
              >
                <Sterren />
                <blockquote className="mt-4 text-[15px] leading-[1.65] text-foreground">
                  <p>
                    “{quote}
                    {vervolg && uitgeklapt && vervolg}”
                    {vervolg && (
                      <>
                        {" "}
                        <button
                          type="button"
                          onClick={() => setUitgeklapt(!uitgeklapt)}
                          aria-expanded={open}
                          className="font-semibold text-primary underline underline-offset-4 decoration-accent hover:text-accent-hover transition-colors"
                        >
                          {uitgeklapt ? "Lees minder" : "Lees meer"}
                        </button>
                      </>
                    )}
                  </p>
                </blockquote>
                <footer className="mt-auto pt-5 text-[15px] font-semibold text-primary">
                  {naam}
                </footer>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};
