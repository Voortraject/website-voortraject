import { Helmet } from "react-helmet-async";

import { SITE_URL } from "@/lib/site";

// Standaard deel-afbeelding (1200×630, op ons eigen domein). Social-crawlers
// draaien geen JS, dus voor de crawler telt de statische kopie in index.html;
// deze tags houden de client-side DOM consistent en dekken JS-uitvoerende bots.
const OG_IMAGE = `${SITE_URL}/og/voortraject-og-v2.jpg`;

interface SeoProps {
  title: string;
  description: string;
  path: string;
  type?: "website" | "article";
  /** Absolute URL naar een pagina-specifieke deel-afbeelding; default = OG_IMAGE. */
  image?: string;
  /** Houd deze pagina uit de zoekresultaten (bv. een tijdelijke placeholder). */
  noindex?: boolean;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

export const Seo = ({ title, description, path, type = "website", image = OG_IMAGE, noindex = false, jsonLd }: SeoProps) => {
  const url = `${SITE_URL}${path}`;
  const schemas = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      {/* follow: linkwaarde blijft doorstromen, alleen indexeren staat uit. */}
      {noindex && <meta name="robots" content="noindex, follow" />}
      <link rel="canonical" href={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta property="og:site_name" content="Voortraject" />
      <meta property="og:image" content={image} />
      <meta property="og:image:alt" content={title} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:image" content={image} />
      {schemas.map((schema, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
};
