import { useId } from "react";

// Het blad uit het logo, met het takje uit onze losse favicon, nagetekend als
// pad (viewBox 0 0 100 100) zodat we het los kunnen gebruiken: vullen,
// inkleuren, laten bewegen. Eén doorlopende omtrek: het takje loopt door in de
// nerf, de spleet tussen het smalle linkerdeel en het hoofdblad.
export const BLAD_PAD =
  "M 22 93.5 C 22.6 82.5 25.8 74.5 29.2 68 C 23.8 54.5 24.5 35.5 38.5 22.5 C 50 11.5 63.5 6.5 77.5 6 C 78.5 23.5 75 43.5 65 58.5 C 57 68.5 45 73 33.3 72 C 40 54.5 49 40.5 59 28.5 C 45 41.5 33 58.5 30.2 70 C 27.8 78.5 26.7 86.5 26.7 93.5 Z";

// De bovenste en onderste y van blad plus takje. De vulling loopt tussen deze
// twee: eerst stijgt hij door het takje, dan vult het blad zich.
const BOVEN = 6;
const ONDER = 93.5;

interface BlaadjeProps {
  /** Hoe vol het blad is, 0…1. Standaard vol: dan is het gewoon het blad uit de favicon. */
  vulling?: number;
  className?: string;
}

/**
 * Het blaadje als voortgang: leeg is het zand, het vult zich van onder met
 * inktblauw, met een okerlijn op het vulniveau. Vol is het precies het blad uit
 * de favicon. Puur decoratief (aria-hidden); de aanroeper zorgt voor de tekst of
 * de progressbar-semantiek.
 */
export const Blaadje = ({ vulling = 1, className }: BlaadjeProps) => {
  // useId geeft ":r0:"; dubbele punten in url(#…) gaan niet overal goed.
  const id = `blad-${useId().replace(/:/g, "")}`;
  const v = Math.min(1, Math.max(0, vulling));
  const niveau = ONDER - v * (ONDER - BOVEN);

  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true" focusable="false">
      <defs>
        <clipPath id={id}>
          <path d={BLAD_PAD} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`}>
        <rect x="0" y="0" width="100" height="100" fill="hsl(var(--secondary))" />
        <rect x="0" y={niveau} width="100" height={100 - niveau} fill="hsl(var(--primary))" />
        {v > 0 && v < 1 && (
          <rect x="0" y={niveau - 1.25} width="100" height="2.5" fill="hsl(var(--accent))" />
        )}
      </g>
    </svg>
  );
};
