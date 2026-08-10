import { ChevronRight } from "lucide-react";

import { KLEUR } from "./stijl";

/**
 * Kruimelpad boven de titel. Naast oriëntatie voor de bezoeker levert dit de
 * BreadcrumbList op die via de Seo-component als JSON-LD wordt meegegeven.
 *
 * "Verduurzamen" is sinds de hub-pagina een echte link; het niveau staat ook in
 * de JSON-LD (zie maatregelJsonLd).
 */
export const Kruimelpad = ({ label }: { label: string }) => (
  <nav aria-label="Kruimelpad" className="mb-5">
    <ol className="flex flex-wrap items-center gap-1.5 text-[13px]" style={{ color: KLEUR.navy }}>
      <li>
        <a
          href="/"
          className="underline-offset-4 transition-colors hover:underline"
          style={{ opacity: 0.7 }}
        >
          Home
        </a>
      </li>
      <ChevronRight size={13} aria-hidden="true" style={{ opacity: 0.45 }} />
      <li>
        <a
          href="/verduurzamen"
          className="underline-offset-4 transition-colors hover:underline"
          style={{ opacity: 0.7 }}
        >
          Verduurzamen
        </a>
      </li>
      <ChevronRight size={13} aria-hidden="true" style={{ opacity: 0.45 }} />
      <li aria-current="page" style={{ fontWeight: 600 }}>
        {label}
      </li>
    </ol>
  </nav>
);
