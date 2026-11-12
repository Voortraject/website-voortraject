import { useCallback, useId, useRef, useState, type RefObject } from "react";
import {
  controleerDomein,
  domeinSuggestie,
  domeinVan,
  isGeldigEmail,
  normaliseerEmail,
  type DomeinOordeel,
} from "@/lib/email";

/**
 * De e-mailcontrole van één formulierveld. Werkt samen met <EmailHint>, die de uitkomst
 * onder het veld toont. Het formulier houdt zijn eigen invoerveld, label en stijl: de vier
 * formulieren op de site zien er elk anders uit, en dit hoort er alleen naast te staan.
 *
 * Gebruik:
 *   const controle = useEmailControle(email, setEmail);
 *   <input ref={controle.ref} onBlur={controle.controleer} aria-describedby={controle.describedBy} … />
 *   <EmailHint controle={controle} />
 *   // bij versturen, ná de eigen validatie:  if (!(await controle.magVersturen())) return;
 *
 * Wat de bezoeker merkt:
 *   - Verlaat hij het veld, dan kijken we of het domein een vertyping lijkt
 *     ("Bedoelde je jan@gmail.com?", met één tik over te nemen) en of er mail kan aankomen.
 *   - Kan er aantoonbaar geen mail aankomen, dan staat er een fout en gaat het formulier niet
 *     weg tot het adres is aangepast.
 *   - Staat er een suggestie, dan houdt de eerste klik op versturen even stil, zodat de vraag
 *     niet gemist wordt. Klopt het adres toch, dan gaat het bij de tweede klik gewoon door.
 *     We passen het adres nooit zelf aan.
 *   - Elke storing of time-out van de domeincheck laat de bezoeker door (fail-open).
 */

type Staat = {
  /** Het genormaliseerde adres waar deze uitkomst bij hoort. Typt de bezoeker verder, dan vervalt hij. */
  adres: string;
  domein: DomeinOordeel | "bezig";
  /** Het versturen is voor dit adres al één keer tegengehouden vanwege de suggestie. */
  alGevraagd: boolean;
};

export type EmailControle = {
  /** Op het invoerveld zetten: bij een tegengehouden verzending zetten we de focus terug. */
  ref: RefObject<HTMLInputElement>;
  /** Id van de hint onder het veld. */
  hintId: string;
  /** Voor `aria-describedby`: alleen gezet als er iets onder het veld staat. */
  describedBy: string | undefined;
  /** Er kan aantoonbaar geen mail aankomen op dit domein. */
  ongeldig: boolean;
  /** Voorgestelde correctie, bijvoorbeeld "jan@gmail.com". */
  suggestie: string | null;
  /** Het versturen is net tegengehouden voor de suggestie; een tweede klik gaat door. */
  alGevraagd: boolean;
  /** Bij het verlaten van het veld. */
  controleer: () => void;
  /** De suggestie overnemen. */
  accepteer: () => void;
  /**
   * Bij versturen, ná de eigen validatie van het formulier. False = niet versturen; de hint
   * staat dan al in beeld en de focus staat in het veld. Een leeg veld of ongeldige syntax
   * laten we aan het formulier zelf over (dat geeft daar al een melding voor).
   */
  magVersturen: () => Promise<boolean>;
};

/** Terug naar het veld, met de hint eronder in beeld. */
function focusVeld(veld: HTMLInputElement | null) {
  if (!veld) return;
  veld.scrollIntoView({ behavior: "smooth", block: "center" });
  // Zonder preventScroll springt focus() er meteen heen en breekt de zachte scroll af.
  veld.focus({ preventScroll: true });
}

export function useEmailControle(email: string, onWijzig: (nieuw: string) => void): EmailControle {
  const hintId = useId();
  const ref = useRef<HTMLInputElement>(null);
  const [staat, setStaatState] = useState<Staat | null>(null);
  // Een ref naast de state: magVersturen leest de stand van een eerdere klik, ook als de
  // render daartussen nog niet geweest is.
  const staatRef = useRef<Staat | null>(null);
  const setStaat = useCallback((volgende: Staat | null) => {
    staatRef.current = volgende;
    setStaatState(volgende);
  }, []);

  const adres = normaliseerEmail(email);
  const actueel = staat && staat.adres === adres ? staat : null;
  const suggestie = actueel ? domeinSuggestie(email) : null;
  const ongeldig = actueel?.domein === "bestaat_niet";
  const heeftHint = ongeldig || !!suggestie;

  /** Start (of hergebruikt) de domeincheck voor dit adres en verwerkt de uitkomst. */
  const start = useCallback(
    (nu: string, alGevraagd = false) => {
      const domein = domeinVan(nu);
      setStaat({ adres: nu, domein: "bezig", alGevraagd });
      if (!domein) return Promise.resolve<DomeinOordeel>("onbekend");
      return controleerDomein(domein).then((oordeel) => {
        const huidig = staatRef.current;
        // Alleen tonen als de bezoeker intussen niet iets anders is gaan typen.
        if (huidig && huidig.adres === nu) setStaat({ ...huidig, domein: oordeel });
        return oordeel;
      });
    },
    [setStaat],
  );

  const controleer = useCallback(() => {
    if (!isGeldigEmail(adres)) {
      setStaat(null);
      return;
    }
    // Zelfde adres als de vorige keer: niets nieuws, en een eerdere "nog een keer" blijft staan.
    if (staatRef.current?.adres === adres) return;
    void start(adres);
  }, [adres, setStaat, start]);

  const beoordeel = useCallback(async () => {
    if (!isGeldigEmail(adres)) return true;

    const vorige = staatRef.current?.adres === adres ? staatRef.current : null;
    const alGevraagd = vorige?.alGevraagd ?? false;
    // Een definitief oordeel van het verlaten van het veld hergebruiken we. Liep die controle
    // nog, of was hij onbekend (storing), dan nu (opnieuw); controleerDomein wacht hooguit
    // DOH_WACHT_MS en hergebruikt een lopende vraag.
    const oordeel =
      vorige?.domein === "bestaat" || vorige?.domein === "bestaat_niet"
        ? vorige.domein
        : await start(adres, alGevraagd);

    if (oordeel === "bestaat_niet") {
      setStaat({ adres, domein: oordeel, alGevraagd });
      focusVeld(ref.current);
      return false;
    }
    if (domeinSuggestie(adres) && !alGevraagd) {
      setStaat({ adres, domein: oordeel, alGevraagd: true });
      focusVeld(ref.current);
      return false;
    }
    return true;
  }, [adres, setStaat, start]);

  // Fail-open: deze controle mag een aanvraag nooit tegenhouden door een eigen fout.
  const magVersturen = useCallback(async () => {
    try {
      return await beoordeel();
    } catch {
      return true;
    }
  }, [beoordeel]);

  const accepteer = useCallback(() => {
    if (!suggestie) return;
    onWijzig(suggestie);
    // Meteen nakijken: dan hoeft het versturen straks niet meer te wachten.
    void start(normaliseerEmail(suggestie));
    // De knop verdwijnt; zonder dit belandt de focus op de body.
    ref.current?.focus();
  }, [onWijzig, start, suggestie]);

  return {
    ref,
    hintId,
    describedBy: heeftHint ? hintId : undefined,
    ongeldig,
    suggestie,
    alGevraagd: !!actueel?.alGevraagd,
    controleer,
    accepteer,
    magVersturen,
  };
}
