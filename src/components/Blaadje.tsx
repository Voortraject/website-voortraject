import { useId } from "react";

// Het blad uit het logo, nagetekend als pad (viewBox 0 0 100 100), zodat we het
// los kunnen gebruiken: vullen, inkleuren, laten bewegen. Eén doorlopende
// omtrek; de nerf is de spleet die onderaan tussen het smalle linkerdeel en het
// hoofdblad opengaat, net als in het logo.
export const BLAD_PAD =
  "M 12 93 C 0 71 4 37 30 20 C 50 7 72 4 90 5 C 96 5 97 9 96.5 15 C 92 53 66 90 22 96 C 26 70 45 45 71 29 C 44 42 22 62 12 93 Z";

// De bovenste en onderste y van het blad. De vulling loopt tussen deze twee,
// anders zit het eerste en laatste stuk van de voortgang in lege ruimte.
const BOVEN = 4;
const ONDER = 96;

interface BlaadjeProps {
  /** Hoe vol het blad is, 0…1. Standaard vol: dan is het gewoon het logoblad. */
  vulling?: number;
  className?: string;
}

/**
 * Het blaadje als voortgang: leeg is het zand, het vult zich van onder met
 * inktblauw, met een okerlijn op het vulniveau. Vol is het precies het blad uit
 * het logo. Puur decoratief (aria-hidden); de aanroeper zorgt voor de tekst of
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
