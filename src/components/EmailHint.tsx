import type { EmailControle } from "@/hooks/useEmailControle";

/**
 * Wat er onder een e-mailveld staat als de controle iets vindt (zie useEmailControle):
 *   - "Op dit adres kan geen mail aankomen. …" als het domein aantoonbaar geen mail aanneemt;
 *   - "Bedoelde je jan@gmail.com?" bij een waarschijnlijke vertyping, met het adres als knop.
 *
 * Het blok staat er altijd (leeg als er niets te melden is): een aria-live-regio wordt alleen
 * betrouwbaar voorgelezen als hij al in de DOM stond vóór de tekst verscheen.
 *
 * `donker` is voor het vraagblok op het resultaat van de subsidiecheck (inktblauw vlak): daar
 * zijn foutmeldingen oker, net als de andere meldingen in dat blok.
 */
export function EmailHint({ controle, donker = false }: { controle: EmailControle; donker?: boolean }) {
  const { hintId, ongeldig, suggestie, alGevraagd, accepteer } = controle;

  const fout = donker ? "text-accent" : "text-destructive";
  const tekst = donker ? "text-primary-foreground" : "text-primary";
  const knop = donker
    ? "decoration-primary-foreground/50 hover:decoration-primary-foreground focus-visible:outline-accent"
    : "decoration-primary/40 hover:decoration-primary focus-visible:outline-primary";

  return (
    <div id={hintId} aria-live="polite">
      {ongeldig && (
        <p className={`font-sans mt-1.5 text-[13.5px] font-semibold ${fout}`}>
          Op dit adres kan geen mail aankomen. Controleer wat er na de @ staat.
        </p>
      )}
      {suggestie && (
        <p className={`font-sans mt-1.5 text-[13.5px] font-semibold leading-snug ${tekst}`}>
          Bedoelde je{" "}
          <button
            type="button"
            onClick={accepteer}
            // Het adres zelf is de knop: één tik en het staat goed. "Gebruik …" vooraan voor
            // een schermlezer; de zichtbare tekst zit er letterlijk in (WCAG 2.5.3).
            aria-label={`Gebruik ${suggestie}`}
            className={`-my-1.5 inline-block break-all rounded-sm py-1.5 text-left font-bold underline underline-offset-[3px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${knop}`}
          >
            {suggestie}
          </button>
          ?
          {/* Alleen na een tegengehouden klik op versturen: dan weet de bezoeker waarom er
              niets gebeurde, en hoe hij toch verder kan. */}
          {alGevraagd && !ongeldig && <> Klopt je adres toch? Verstuur dan nog een keer.</>}
        </p>
      )}
    </div>
  );
}
