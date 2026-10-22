import { ChevronRight } from "lucide-react";

/**
 * Kruimelpad boven de titel. Naast oriëntatie voor de bezoeker levert dit de
 * BreadcrumbList op die via de Seo-component als JSON-LD wordt meegegeven.
 *
 * "Verduurzamen" is sinds de hub-pagina een echte link; het niveau staat ook in
 * de JSON-LD (zie maatregelJsonLd). Zonder `label` is dit het kruimelpad van de
 * hub zelf.
 */
export const Kruimelpad = ({ label }: { label?: string }) => (
  <nav aria-label="Kruimelpad" className="mb-4 md:mb-5">
    <ol className="flex flex-wrap items-center gap-1.5 text-[13.5px] text-[hsl(var(--rs-tekst-zacht))]">
      <li>
        <a href="/" className="inline-flex min-h-[24px] items-center underline-offset-4 hover:underline">
          Home
        </a>
      </li>
      <ChevronRight size={13} aria-hidden="true" className="opacity-60" />
      {label ? (
        <>
          <li>
            <a
              href="/verduurzamen"
              className="inline-flex min-h-[24px] items-center underline-offset-4 hover:underline"
            >
              Verduurzamen
            </a>
          </li>
          <ChevronRight size={13} aria-hidden="true" className="opacity-60" />
          <li aria-current="page" className="font-bold text-primary">
            {label}
          </li>
        </>
      ) : (
        <li aria-current="page" className="font-bold text-primary">
          Verduurzamen
        </li>
      )}
    </ol>
  </nav>
);
