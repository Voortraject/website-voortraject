/**
 * De heroafbeelding in meerdere formaten (public/hero/, gemaakt uit
 * src/assets/hero-adviesgesprek.webp, 2560 x 1920). De telefoon krijgt een staande
 * uitsnede van het midden (1290 x 1920, genoeg voor 430 px breed bij 640 px hoog),
 * zodat hij niet de hele liggende foto ophaalt om er een smalle strook van te
 * tonen. Zelfde schaal en midden als de volle foto, dus de uitsnede verandert
 * niets aan wat je ziet. index.html laadt dezelfde bestanden vooruit (preload,
 * alleen op "/"); een test bewaakt dat die lijsten gelijk blijven.
 * Snelheidsronde oktober 2026: de LCP op de telefoon was ruim 10 s.
 *
 * Breed (november 2026): de eerste versies waren te hard gecomprimeerd en zagen er
 * op een gewoon 1920-scherm korrelig uit (haar en huid uitgesmeerd). Nu: 2560 is
 * de bron zelf (opnieuw coderen kost alleen kwaliteit), 1920 en 1280 met ImageMagick
 * Lanczos + "-define webp:method=6 -define webp:sns-strength=0 -quality 88".
 * Niet verder samenpersen; de telefoon (3x pixeldichtheid) verbergt het wel, desktop
 * niet. Nieuwe versie = nieuwe bestandsnaam (-v2, -v3): /hero/* staat 30 dagen in de cache.
 */
export const HERO_BEELD = {
  mobielSrcSet:
    "/hero/adviesgesprek-mobiel-645.webp 645w, /hero/adviesgesprek-mobiel-860.webp 860w, /hero/adviesgesprek-mobiel-1290.webp 1290w",
  mobielSizes: "430px",
  breedSrcSet:
    "/hero/adviesgesprek-breed-1280-v2.webp 1280w, /hero/adviesgesprek-breed-1920-v2.webp 1920w, /hero/adviesgesprek-breed-2560-v2.webp 2560w",
  breedSizes: "100vw",
  terugval: "/hero/adviesgesprek-breed-1920-v2.webp",
} as const;
