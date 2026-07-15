// Cloudflare Pages Function voor de route /subsidiecheck.
//
// Social-crawlers (WhatsApp, Facebook, LinkedIn) draaien geen JavaScript, dus
// normaal bepaalt de statische index.html de deelkaart — met de algemene
// homepage-titel. Deze function overschrijft serverside, alléén voor deze route,
// de OG/Twitter-titel + omschrijving via HTMLRewriter, zodat een gedeelde
// subsidiecheck-link een eigen, passende kaart krijgt. De og:image (de foto) en
// alle andere routes blijven ongemoeid; browsers krijgen gewoon de SPA en
// react-helmet zet daarna zelf de client-side titel.
const TITLE = "Gratis subsidiecheck | Voortraject";
const DESCRIPTION =
  "Check gratis welke verduurzamingssubsidies gelden voor jouw woning: landelijke, provinciale en gemeentelijke regelingen in één overzicht. Klaar in 1 minuut.";
const CANONICAL = "https://voortraject.nl/subsidiecheck";

export async function onRequest(context) {
  // next() levert wat er normaal geserveerd wordt (de SPA-fallback: index.html).
  const response = await context.next();

  // Alleen een echte HTML-pagina aanpassen; al het andere ongewijzigd doorgeven.
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("text/html")) return response;

  const setContent = (value) => ({
    element(el) {
      el.setAttribute("content", value);
    },
  });

  return new HTMLRewriter()
    .on('meta[property="og:title"]', setContent(TITLE))
    .on('meta[name="twitter:title"]', setContent(TITLE))
    .on('meta[property="og:description"]', setContent(DESCRIPTION))
    .on('meta[name="twitter:description"]', setContent(DESCRIPTION))
    .on('meta[property="og:url"]', setContent(CANONICAL))
    .transform(response);
}
