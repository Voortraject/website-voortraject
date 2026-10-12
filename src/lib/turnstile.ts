import { useCallback, useEffect, useRef } from "react";

// Cloudflare Turnstile op de gegevensstap van de subsidiecheck: de enige plek op
// de site die mail stuurt naar een adres dat een bezoeker zelf intypt. Zie
// tasks/formulieren-misbruik-2026-10.md.
//
// - Alleen actief als VITE_TURNSTILE_SITE_KEY is gezet. Zonder key laadt er geen
//   script en stuurt het formulier geen token mee; de edge function laat dat door
//   zolang zijn eigen secret ook ontbreekt.
// - Onzichtbaar (`appearance: "interaction-only"`): een bezoeker ziet alleen iets
//   als Cloudflare echt twijfelt.
// - Geen tracker: Turnstile zet geen advertentie- of analysecookies, dus het valt
//   buiten de consentlaag. Het script laadt pas als deze stap in beeld komt.
// - Het token wordt aan de serverkant gecontroleerd in `subsidiecheck-mail`. Lukt
//   het hier niet (script geblokkeerd), dan gaat de inzending gewoon door; de
//   function slaat de lead dan wel op maar mailt niet.

const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined;
const SCRIPT_URL = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

type TurnstileApi = {
  render: (el: HTMLElement, opties: Record<string, unknown>) => string;
  getResponse: (id: string) => string | undefined;
  reset: (id: string) => void;
  remove: (id: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

let laden: Promise<TurnstileApi | null> | null = null;

/** Laadt het script één keer per pagina. Faalt het, dan null (en de volgende keer opnieuw). */
function laadTurnstile(): Promise<TurnstileApi | null> {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (!laden) {
    laden = new Promise((klaar) => {
      const script = document.createElement("script");
      script.src = SCRIPT_URL;
      script.async = true;
      script.defer = true;
      script.onload = () => klaar(window.turnstile ?? null);
      script.onerror = () => {
        laden = null;
        klaar(null);
      };
      document.head.appendChild(script);
    });
  }
  return laden;
}

/**
 * Rendert de onzichtbare controle in het element achter `ref`. `token()` geeft
 * het huidige token (of undefined), `reset()` vraagt een nieuw aan; een token is
 * maar één keer bruikbaar, dus reset na elke mislukte verzending.
 *
 * `actief`: true zodra het element achter `ref` op de pagina staat. Het formulier
 * verschijnt pas na de zoekanimatie, dus bij de eerste render is er nog niets
 * om in te renderen.
 */
export function useTurnstile(actief: boolean) {
  const ref = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const token = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!SITE_KEY || !actief || !ref.current) return;
    let weg = false;
    laadTurnstile().then((api) => {
      if (weg || !api || !ref.current) return;
      widgetId.current = api.render(ref.current, {
        sitekey: SITE_KEY,
        action: "subsidiecheck",
        appearance: "interaction-only",
        callback: (t: string) => {
          token.current = t;
        },
        "expired-callback": () => {
          token.current = undefined;
        },
        "error-callback": () => {
          token.current = undefined;
        },
      });
    });
    return () => {
      weg = true;
      if (widgetId.current && window.turnstile) window.turnstile.remove(widgetId.current);
      widgetId.current = null;
    };
  }, [actief]);

  const leesToken = useCallback((): string | undefined => {
    if (token.current) return token.current;
    if (widgetId.current && window.turnstile) return window.turnstile.getResponse(widgetId.current) || undefined;
    return undefined;
  }, []);

  const reset = useCallback(() => {
    token.current = undefined;
    if (widgetId.current && window.turnstile) window.turnstile.reset(widgetId.current);
  }, []);

  return { ref, token: leesToken, reset };
}
