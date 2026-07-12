import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

// Een SPA behoudt bij navigatie de scrollpositie van de vorige pagina, dus
// wie onderaan de homepage op een link klikt, landt onderaan de volgende
// pagina. Bij elke echte navigatie (push/replace) zetten we de scroll terug
// naar boven; bij de back-/forwardknop (POP) laten we de browser de eerdere
// positie herstellen. Queryparam-wissels (zoals de stappen van de
// subsidiecheck) veranderen het pathname niet en blijven ongemoeid.
export const ScrollToTop = () => {
  const { pathname } = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    if (navigationType !== "POP") window.scrollTo(0, 0);
  }, [pathname, navigationType]);

  return null;
};
