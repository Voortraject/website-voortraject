import { useId } from "react";

// Het blad uit het logo, met het takje uit onze losse favicon, nagetekend als
// pad (viewBox 0 0 100 100) zodat we het los kunnen gebruiken: vullen,
// inkleuren, laten bewegen. Eén doorlopende omtrek: het takje loopt door in de
// nerf, de spleet tussen het smalle linkerdeel en het hoofdblad.
export const BLAD_PAD =
  "M 22 93.5 C 22.6 82.5 25.8 74.5 29.2 68 C 23.8 54.5 24.5 35.5 38.5 22.5 C 50 11.5 63.5 6.5 77.5 6 C 78.5 23.5 75 43.5 65 58.5 C 57 68.5 45 73 33.3 72 C 40 54.5 49 40.5 59 28.5 C 45 41.5 33 58.5 30.2 70 C 27.8 78.5 26.7 86.5 26.7 93.5 Z";

// Het blad zoals het in het logo staat: zonder takje. Voor plekken waar het
// blad deel van een woord of getal is, zoals de 0 op de 404.
export const BLAD_PAD_ZONDER_TAKJE =
  "M 12 93 C 0 71 4 37 30 20 C 50 7 72 4 90 5 C 96 5 97 9 96.5 15 C 92 53 66 90 22 96 C 26 70 45 45 71 29 C 44 42 22 62 12 93 Z";

// De bovenste en onderste y per vorm. De vulling loopt tussen deze twee; met
// takje stijgt hij eerst door het takje en vult dan het blad.
const VORMEN = {
  metTakje: { pad: BLAD_PAD, boven: 6, onder: 93.5 },
  zonderTakje: { pad: BLAD_PAD_ZONDER_TAKJE, boven: 4, onder: 96 },
} as const;

interface BlaadjeProps {
  /** Hoe vol het blad is, 0…1. Standaard vol: dan is het gewoon het blad uit de favicon. */
  vulling?: number;
  /** Met het takje uit de favicon (standaard), of zonder, zoals in het logo. */
  takje?: boolean;
  className?: string;
}

/**
 * Het blaadje als voortgang: leeg is het zand, het vult zich van onder met
 * inktblauw, met een okerlijn op het vulniveau. Vol is het precies het blad uit
 * de favicon. Puur decoratief (aria-hidden); de aanroeper zorgt voor de tekst of
 * de progressbar-semantiek.
 */
export const Blaadje = ({ vulling = 1, takje = true, className }: BlaadjeProps) => {
  // useId geeft ":r0:"; dubbele punten in url(#…) gaan niet overal goed.
  const id = `blad-${useId().replace(/:/g, "")}`;
  const v = Math.min(1, Math.max(0, vulling));
  const { pad, boven, onder } = takje ? VORMEN.metTakje : VORMEN.zonderTakje;
  const niveau = onder - v * (onder - boven);

  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true" focusable="false">
      <defs>
        <clipPath id={id}>
          <path d={pad} />
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
