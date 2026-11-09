/**
 * De heroafbeelding in meerdere formaten (public/hero/; src/assets/hero-adviesgesprek.webp
 * is dezelfde foto als 2560 x 1920 op -quality 92, ter referentie). De telefoon krijgt een staande
 * uitsnede van het midden (1290 x 1920, genoeg voor 430 px breed bij 640 px hoog),
 * zodat hij niet de hele liggende foto ophaalt om er een smalle strook van te
 * tonen. Zelfde schaal en midden als de volle foto, dus de uitsnede verandert
 * niets aan wat je ziet. index.html laadt dezelfde bestanden vooruit (preload,
 * alleen op "/"); een test bewaakt dat die lijsten gelijk blijven.
 * Snelheidsronde oktober 2026: de LCP op de telefoon was ruim 10 s.
 *
 * Scherpte (november 2026): de oude bron was zelf al zwaar gecomprimeerd (2560 x 1920
 * in 188 KB) en zag er op desktop korrelig uit. Alles is opnieuw gemaakt uit de
 * originele telefoonfoto (5712 x 4284 JPG, 1 juli 2026, niet in de repo): verkleind
 * met ImageMagick Lanczos, "-define webp:method=6 -define webp:sns-strength=0",
 * breed 1280 en 1920 op -quality 86, breed 2560 en mobiel op 82.
 * Maak varianten altijd uit het origineel, nooit uit een webp. Nieuwe versie =
 * nieuwe bestandsnaam (-v2, -v3): /hero/* staat 30 dagen in de cache. Vraag een nieuwe
 * URL pas op na de deploy, anders blijft Cloudflare de foutpagina bewaren (november 2026).
 *
 * breedSizes is bewust ruimer dan de echte breedte (100vw). Op een 1920-scherm met
 * schuifbalk is de hero 1905 px; het 1920-bestand wordt dan net iets verkleind en
 * dat maakt het waziger dan een flinke verkleinstap (gemeten in Chrome op het gezicht:
 * Laplace-scherpte 11,2 met 1920, 13,8 met 2560, ideaal 16,1). Met 134vw kiest zo'n
 * scherm het 2560-bestand. De getoonde maat komt uit de CSS en verandert niet.
 */
export const HERO_BEELD = {
  mobielSrcSet:
    "/hero/adviesgesprek-mobiel-645-v2.webp 645w, /hero/adviesgesprek-mobiel-860-v2.webp 860w, /hero/adviesgesprek-mobiel-1290-v2.webp 1290w",
  mobielSizes: "430px",
  breedSrcSet:
    "/hero/adviesgesprek-breed-1280-v4.webp 1280w, /hero/adviesgesprek-breed-1920-v4.webp 1920w, /hero/adviesgesprek-breed-2560-v4.webp 2560w",
  breedSizes: "134vw",
  terugval: "/hero/adviesgesprek-breed-1920-v4.webp",
} as const;
