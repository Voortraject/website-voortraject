/**
 * De heroafbeelding in meerdere formaten (public/hero/, gemaakt uit
 * src/assets/hero-adviesgesprek.webp, 2560 x 1920). De telefoon krijgt een staande
 * uitsnede van het midden (1290 x 1920, genoeg voor 430 px breed bij 640 px hoog),
 * zodat hij niet de hele liggende foto ophaalt om er een smalle strook van te
 * tonen. Zelfde schaal en midden als de volle foto, dus de uitsnede verandert
 * niets aan wat je ziet. index.html laadt dezelfde bestanden vooruit (preload,
 * alleen op "/"); een test bewaakt dat die lijsten gelijk blijven.
 * Snelheidsronde oktober 2026: de LCP op de telefoon was ruim 10 s.
 */
export const HERO_BEELD = {
  mobielSrcSet:
    "/hero/adviesgesprek-mobiel-645.webp 645w, /hero/adviesgesprek-mobiel-860.webp 860w, /hero/adviesgesprek-mobiel-1290.webp 1290w",
  mobielSizes: "430px",
  breedSrcSet:
    "/hero/adviesgesprek-breed-1280.webp 1280w, /hero/adviesgesprek-breed-1920.webp 1920w, /hero/adviesgesprek-breed-2560.webp 2560w",
  breedSizes: "100vw",
  terugval: "/hero/adviesgesprek-breed-1920.webp",
} as const;
