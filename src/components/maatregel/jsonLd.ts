import { SITE_URL } from "@/lib/site";

export interface FaqItem {
  q: string;
  a: string;
}

/**
 * Structured data voor een maatregelpagina: FAQPage en BreadcrumbList.
 *
 * De FAQ's staan al op elke pagina maar waren voor Google onzichtbaar als
 * vraag-en-antwoord. Met FAQPage kan Google ze uitklapbaar in de
 * zoekresultaten tonen.
 *
 * Het kruimelpad bevat bewust nog geen /verduurzamen-niveau: die URL redirect
 * op dit moment naar de homepage. Zodra de hub-pagina bestaat hoort dat niveau
 * hier tussen te staan (en wordt het ook in Kruimelpad.tsx een link).
 */
export const maatregelJsonLd = ({
  slug,
  label,
  faqs,
}: {
  slug: string;
  label: string;
  faqs: FaqItem[];
}): Record<string, unknown>[] => {
  const url = `${SITE_URL}/verduurzamen/${slug}`;

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: label, item: url },
    ],
  };

  if (faqs.length === 0) return [breadcrumb];

  return [
    breadcrumb,
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ];
};
