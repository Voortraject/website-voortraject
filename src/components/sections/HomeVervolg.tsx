import { Herkenning } from "@/components/sections/Herkenning";
import { WaarWeBijHelpen } from "@/components/sections/WaarWeBijHelpen";
import { WaaromKiezen } from "@/components/sections/WaaromKiezen";
import { Cijfers } from "@/components/sections/Cijfers";
import { Reviews } from "@/components/sections/Reviews";
import { Subsidies } from "@/components/sections/Subsidies";
import { Team } from "@/components/sections/Team";
import { Faq } from "@/components/sections/Faq";

/**
 * Alles van de homepagina onder de subsidiecheck, als eigen bundel. Index laadt
 * dit pas na de eerste weergave (React.lazy), zodat de hero niet wacht op de
 * code van de review-carrousel, de FAQ en de rest (snelheidsronde oktober 2026:
 * de foto was na 55 ms binnen, maar werd pas getekend als al het JavaScript van
 * de pagina gedraaid had).
 *
 * Een fragment, geen wikkel: de secties blijven directe kinderen van <main>,
 * want de footer kijkt met `main:has(> section.hs-band:last-child)` naar de
 * laatste sectie (home-onder.css).
 */
const HomeVervolg = () => (
  <>
    <Herkenning />
    <WaarWeBijHelpen />
    <Subsidies />
    <WaaromKiezen />
    <Cijfers />
    <Reviews />
    <Team />
    <Faq />
  </>
);

export default HomeVervolg;
