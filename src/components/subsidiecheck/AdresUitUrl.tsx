import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import {
  adresUitIndexHtml,
  adresUitParams,
  heeftAdresParams,
  isCheckPad,
  metAdres,
  vergeetAdresUitIndexHtml,
  zonderAdres,
} from "@/components/subsidiecheck/checkStaat";

// Haalt het adres van de subsidiecheck uit de URL en zet het in de history-state
// (zie checkStaat.ts). Staat in App.tsx, binnen de router en vóór RouteTracker,
// en zit dus in de hoofdbundel: de check zelf laadt lazy.
//
// Twee routes naar binnen, allebei hier afgehandeld:
//
//  1. Een volledige paginalading (de link in de overzichtsmail, een bladwijzer).
//     Het script bovenaan index.html heeft de adresparameters dan al uit de URL
//     gehaald, vóór GTM; hier gaat wat het klaarzette naar de history-state.
//  2. Een navigatie binnen de app naar /subsidiecheck?pc=…. Geen enkele link in de
//     site doet dat (die geven het adres mee als state; src/test/adresUitUrl.test.tsx
//     bewaakt dat), maar komt er toch een bij, dan blijft het adres hier niet in
//     de URL hangen. Daarom niet in de check zelf: die laadt lazy, en tot hij er
//     is zou virtual_page_view (RouteTracker) de URL mét adres meten.
//
// Een gewoon effect en bewust geen layout-effect: bij de eerste render gaat de
// router pas in zijn eigen layout-effect naar de history luisteren, ná die van
// zijn kinderen, en een navigatie daarvóór raakt hij kwijt (de URL verandert, de
// state niet). Dit effect draait wel vóór RouteTracker en vóór de meetmomenten
// van de check: effects lopen in de volgorde van de boom, en deze component staat
// vóór beide. `replace`, zodat er geen history-entry mét adres achterblijft.
export const AdresUitUrl = () => {
  const { pathname, search, hash, key } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const uitIndexHtml = adresUitIndexHtml();
    vergeetAdresUitIndexHtml();
    if (!isCheckPad(pathname)) return;

    const params = new URLSearchParams(search);
    const inUrl = heeftAdresParams(params);
    if (!inUrl && !uitIndexHtml) return;

    // Het adres in de URL is het nieuwst; lege of onbruikbare parameters gaan er
    // ook uit, maar dan zonder adres in de state.
    const adres = inUrl ? adresUitParams(params) : uitIndexHtml;
    const rest = zonderAdres(params).toString();
    navigate({ pathname, search: rest ? `?${rest}` : "", hash }, { replace: true, state: metAdres(adres) });
    // Per history-entry één keer: `key` verandert bij elke navigatie.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return null;
};

export default AdresUitUrl;
