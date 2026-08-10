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
 * Het kruimelpad bevat sinds de hub-pagina ook het /verduurzamen-niveau, zodat
 * de structured data gelijkloopt met wat de bezoeker in Kruimelpad.tsx ziet.
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
      { "@type": "ListItem", position: 2, name: "Verduurzamen", item: `${SITE_URL}/verduurzamen` },
      { "@type": "ListItem", position: 3, name: label, item: url },
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
