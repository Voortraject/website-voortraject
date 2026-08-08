/**
 * Meet paginaweergaves bij navigatie die React Router client-side afhandelt.
 *
 * Let op de reikwijdte: bijna alle links op deze site zijn gewone <a href>, dus
 * die doen een volledige herlading en worden al door de GA4-configuratietag
 * geteld. Deze component dekt de twee plekken waar dat níet gebeurt, en waar de
 * meting dus een gat had:
 *
 * 1. De subsidiecheck-CTA op de homepage. SubsidiecheckCta doet een navigate()
 *    naar /subsidiecheck, zonder herlading. GA4 zag daardoor "/" en daarna
 *    niets meer, terwijl dit juist het belangrijkste instappunt van de tool is.
 * 2. De vijf <Navigate>-redirects in App.tsx (/partners, /uitvoerders,
 *    /bewoners, /verduurzamen, /maatregelen). Daar telde GA4 het oude adres en
 *    nooit de pagina die de bezoeker werkelijk te zien kreeg.
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
