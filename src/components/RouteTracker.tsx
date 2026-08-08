/**
 * Meet paginaweergaves bij navigatie binnen de SPA.
 *
 * Waarom dit nodig is: het GTM-snippet draait één keer, bij de eerste lading.
 * React Router wisselt daarna van pagina zonder dat de browser iets herlaadt,
 * dus zonder deze component telt GA4 alleen de landingspagina en blijft de rest
 * van de sessie onzichtbaar.
 *
 * Twee details die makkelijk misgaan:
 *
 * 1. De eerste weergave slaan we over. Die meet de GA4-configuratietag in GTM
 *    zelf al; ook pushen zou elke landingspagina dubbel tellen.
 * 2. We wachten één frame op de titel. react-helmet-async zet document.title
 *    pas ná deze effect-cyclus, dus direct uitlezen levert de titel van de
 *    vórige pagina op.
 *
 * De querystring gaat bewust NIET mee. Op /subsidiecheck staat de volledige
 * invoer in de URL (?pc=…&hn=…), en dat is het adres van de bezoeker. Dat hoort
 * niet in GA4 thuis. Zie ook de PII-waarschuwing in src/lib/gtm.ts.
 */
import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

import { pushGtmEvent } from "@/lib/gtm";

export const RouteTracker = () => {
  const { pathname } = useLocation();
  const eersteWeergave = useRef(true);

  useEffect(() => {
    if (eersteWeergave.current) {
      eersteWeergave.current = false;
      return;
    }

    const frame = requestAnimationFrame(() => {
      pushGtmEvent("virtual_page_view", {
        page_path: pathname,
        page_title: document.title,
      });
    });

    return () => cancelAnimationFrame(frame);
  }, [pathname]);

  return null;
};

export default RouteTracker;
