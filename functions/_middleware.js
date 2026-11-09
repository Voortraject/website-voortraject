// Stuurt www.voortraject.nl permanent door naar voortraject.nl, met behoud van pad en query.
//
// Dit kan niet in public/_redirects: Cloudflare Pages ondersteunt daar geen regels op
// domeinniveau en negeert ze zonder foutmelding. Zonder deze doorverwijzing bestaat de hele
// site dubbel en meldt Search Console dubbele pagina's.
//
// public/_routes.json houdt statische bestanden buiten deze function, zodat ze geen
// function-aanroep kosten.
const WWW_HOST = "www.voortraject.nl";
const HOOFD_HOST = "voortraject.nl";

export async function onRequest(context) {
  const url = new URL(context.request.url);
  const leesVerzoek = context.request.method === "GET" || context.request.method === "HEAD";

  if (url.hostname !== WWW_HOST || !leesVerzoek) return context.next();

  url.hostname = HOOFD_HOST;
  return Response.redirect(url.toString(), 301);
}
