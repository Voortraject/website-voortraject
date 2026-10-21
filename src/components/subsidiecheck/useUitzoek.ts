import { useCallback, useRef, useState } from "react";

import { formulierFoutMelding, TELEFOON_WEERGAVE } from "@/lib/formulierFout";
import { pushGtmEvent } from "@/lib/gtm";
import type { PdokAdres } from "@/lib/pdok";
import type { SubsidieCheckInput } from "@/lib/subsidies";

import { vraagUitzoekenAan } from "./uitzoekAanvraag";

export type UitzoekStatus = "klaar" | "bezig" | "binnen";

/**
 * De toestand van de oker knop, gedeeld door de hoofdtegel en de mobiele
 * actiebalk: allebei dezelfde knop, dus ook dezelfde uitkomst.
 *
 * Zonder bekende gegevens (zeldzaam: een gedeelde link of een verlopen sessie)
 * beloven we niets en roepen we `geenContact` aan; StapResultaat stuurt de
 * bezoeker dan naar het vraagblok met het verzoek al ingevuld.
 */
export function useUitzoek(args: {
  input: SubsidieCheckInput;
  adres: Pick<PdokAdres, "straatnaam" | "woonplaatsnaam">;
  overzichtUrl?: string;
  geenContact: () => void;
}) {
  const { input, adres, overzichtUrl, geenContact } = args;
  const [status, setStatus] = useState<UitzoekStatus>("klaar");
  const [fout, setFout] = useState<string | null>(null);
  // Het moment waarop het resultaat in beeld kwam: de function negeert te
  // snelle inzendingen, dus vraagUitzoekenAan wacht zo nodig het restje uit.
  const sinds = useRef(Date.now());
  const bezig = useRef(false);

  const start = useCallback(async () => {
    if (bezig.current || status === "binnen") return;
    bezig.current = true;
    setFout(null);
    setStatus("bezig");
    pushGtmEvent("subsidiecheck_vraag_cta", { bewonertype: input.bewonertype, plek: "uitzoeken" });
    try {
      const uitkomst = await vraagUitzoekenAan({ input, adres, overzichtUrl, sindsMs: sinds.current });
      if (uitkomst === "geen-contact") {
        setStatus("klaar");
        geenContact();
      } else {
        setStatus("binnen");
      }
    } catch (err) {
      console.error("Subsidiecheck: laat uitzoeken faalde", err);
      setFout(formulierFoutMelding(err, `Dat lukte niet. Probeer het nog eens, of bel ons op ${TELEFOON_WEERGAVE}.`));
      setStatus("klaar");
    } finally {
      bezig.current = false;
    }
  }, [input, adres, overzichtUrl, geenContact, status]);

  return { status, fout, start };
}
