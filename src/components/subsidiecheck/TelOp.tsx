import { useEffect, useRef, useState } from "react";

import { minderBeweging } from "./beweging";

/** Een getal dat in ruim een seconde optelt en zacht afremt. */
export const TelOp = ({ waarde, className }: { waarde: number; className?: string }) => {
  const [getoond, setGetoond] = useState(() => (minderBeweging() ? waarde : 0));
  const frame = useRef<number>();
  useEffect(() => {
    if (minderBeweging() || typeof requestAnimationFrame !== "function") {
      setGetoond(waarde);
      return;
    }
    const start = performance.now() + 250;
    const duur = 1100;
    const stap = (t: number) => {
      const p = Math.min(1, Math.max(0, (t - start) / duur));
      setGetoond(Math.round(waarde * (1 - Math.pow(1 - p, 4))));
      if (p < 1) frame.current = requestAnimationFrame(stap);
    };
    frame.current = requestAnimationFrame(stap);
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, [waarde]);
  // Schermlezers krijgen meteen het eindgetal, niet de tussenstanden.
  return (
    <span className={className} aria-label={String(waarde)}>
      <span aria-hidden="true">{getoond}</span>
    </span>
  );
};
