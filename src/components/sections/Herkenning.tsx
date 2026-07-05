import { Coins, MessagesSquare, Scale } from "lucide-react";

import herkenningVoortuin from "@/assets/herkenning-voortuin2.webp";
import { TrustCardList } from "./TrustCardList";

const twijfels = [
  {
    icon: MessagesSquare,
    title: "Ik weet niet wie ik moet geloven",
    body: "De installateur zegt warmtepomp, de buurman eerst isoleren, online lees je: nog even wachten. Wie heeft er nou gelijk?",
  },
  {
    icon: Scale,
    title: "Ik wil geen verkooppraatje",
    body: "Elk “gratis advies” eindigt bij een offerte voor wat ze zelf verkopen. Waar vind je nog iemand zonder eigen belang?",
  },
  {
    icon: Coins,
    title: "Ik wil geen geld laten liggen",
    body: "Er zijn meer regelingen dan je denkt, en sommige kun je stapelen. Maar hoe weet je zeker dat je niets misloopt?",
  },
];

export const Herkenning = () => (
  <section className="section-pad-home" style={{ backgroundColor: "#F5F3ED" }} aria-labelledby="herkenning-title">
    <div className="container-home">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
        <div>
          <h2 id="herkenning-title" className="h2-section">
            <span className="text-accent">Herken</span> je dit?
          </h2>

          <TrustCardList items={twijfels} />
        </div>

        <div className="hidden lg:block">
          <img
            src={herkenningVoortuin}
            alt="Adviseur van Voortraject in gesprek met twee bewoners in hun voortuin"
            loading="lazy"
            decoding="async"
            className="w-full h-64 sm:h-80 lg:h-[400px] rounded-2xl object-cover"
            style={{ objectPosition: "center 70%", boxShadow: "0 4px 20px hsl(var(--primary) / 0.08)" }}
          />
        </div>
      </div>
    </div>
  </section>
);
