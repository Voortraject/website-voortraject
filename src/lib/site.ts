// Het canonieke adres van de site. Bewust hardcoded en niet
// `window.location.origin`: op een preview-deploy van Cloudflare Pages zou dat
// een tijdelijke URL opleveren, en die belandt dan in een canonical tag of in
// een link die een bezoeker doorstuurt naar zijn buren.
export const SITE_URL = "https://voortraject.nl";
