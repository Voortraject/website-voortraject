# Lessons

Project-specific lessons learned for the Voortraject website. Add a dated entry whenever
the user corrects course or a non-obvious gotcha surfaces. Review at session start.

<!-- Template:
## YYYY-MM-DD — short title
**Context:** what happened
**Lesson:** the rule to follow next time
-->

## 2026-07-06 — Mobiele safe-area witte stroken: fixed i.p.v. absolute, en body-navy
**Context:** Twee eerdere pogingen om de witte stroken boven de header / onder de footer op
iOS Safari navy te maken faalden. Aanpak: `theme-color`, `html`-navy, en een *absolute* navy
strook (`inset-x-0 top-0`, hoogte `env(safe-area-inset-top)`) bovenaan het document. In
headless Chrome (Blink) rendert die strook aantoonbaar correct (geverifieerd via CDP-screenshot:
nette navy balk op {0,0,390,47}), maar op de iPhone bleef de zone wit.
**Lesson:**
- **Vertrouw niet op een `position: absolute`-element dat aan de initial containing block hangt
  binnen een root met `overflow-x: clip`.** WebKit/iOS clipt zulke elementen weg (Blink niet) —
  dé valkuil die "in de code klopt maar op de iPhone faalt".
- **iOS 26 (Safari "Liquid Glass") kan géén ruwe content dóór de statusbalk laten scrollen, en is
  allergisch voor `position: fixed`.** Vanaf iOS 26 tekent Safari de status-/toolbar altijd als een
  *getinte* balk en bepaalt de kleur door te samplen: eerst `position: fixed`/`sticky` elementen bij
  de schermrand (background-color + backdrop-filter), anders de `html`/`body` achtergrondkleur.
  **`theme-color` wordt genegeerd.** Gevolgen die we live hebben gezien:
  - "Content zichtbaar door de statusbalk scrollen" (zoals gevraagd, bol/coca-cola-stijl) kan niet
    meer — bol/coca-cola hebben op iOS 26 óók een vaste getinte balk. De statische navy bovenbalk
    is dus onvermijdelijk; accepteer dat.
  - **Een `fixed` navy strook bovenaan brak de ÓNDERrand:** met een fixed element gaat iOS 26 dat
    element gebruiken om zowel forehead (boven) als chin (onder) te tinten en pakt onder de
    verkeerde/witte kleur → wit vlak onder de footer. Wég ermee.
  - **Werkende aanpak (alle iOS-versies): GEEN fixed element.** Navy top = een **in-flow** strook
    als eerste element in `Header.tsx` (hoogte `env(safe-area-inset-top)`) + sticky header op
    `top-[env(safe-area-inset-top)]`; `body` navy. Zonder fixed element valt iOS 26 voor BEIDE
    randen terug op de body-kleur → boven én onder navy. Bronnen:
    benfrain.com/ios26-safari-theme-color…, 1ar.io/updates/safari-26-liquid-glass-web.
- **Overscroll/rubber-band-kleur op iOS komt van de `body`-achtergrond, niet altijd van `html`.**
  Zet `body { @apply bg-primary }` (naast `html`) navy. Veilig omdat elke pagina een eigen
  dekkende wrapper (`min-h-screen bg-background`/sand/etc.) heeft; body-navy is alleen zichtbaar
  in de safe-area/overscroll-randen — én het is de fallback-kleur die iOS 26 voor de balk sampelt.
- **`overflow-x: clip` op html/body maakt `body` de scroll-container** (overflow-y wordt `auto`).
  Dat maakt `window.scrollTo`/`scrollTop` in tests onbetrouwbaar; gebruik CDP
  `Input.synthesizeScrollGesture`. Headless-`captureScreenshot` desynct ná compositor-scroll
  (toont dan de body-kleur) — verifieer scroll-gedrag daarom via `elementFromPoint`, niet de
  screenshot.
- **Windows/geen iPhone = geen echte iOS-Safari-verificatie mogelijk.** Bevestig safe-area-fixes
  altijd nog op een fysiek toestel; wees daar eerlijk over richting de gebruiker.

## 2026-06-24 — Footer oker glow: match the reference, treat sections as one whole, apply site-wide
**Context:** Asked to add a De Duurzame Jongens–style warm oker glow behind the footer. Took
several iterations: (1) a subtle drifting gradient was "too vague"; (2) two stacked sections
(closing CTA + Footer) each with their own glow showed a visible seam; (3) switching to many
small pulsing "lamp" blobs was wrong — the reference is one large, smooth gradient that slowly
drifts; (4) the "one whole" fix was only applied to the homepage, not every page.
**Lesson:**
- When a visual reference is given, match its *character* exactly (here: one big soft warm wash
  that orbits, NOT many small blobs). Study all the example images before choosing a technique.
- "Two sections as one whole" means a single shared dark container + one glow layer spanning
  both — not two adjacent boxes each styled the same. Separate `overflow-hidden` boxes always
  seam.
- Closing CTA + Footer pattern repeats on nearly every page (homepage `ClosingCta`, inline dark
  CTAs on Bewoners/Uitvoerders/OverOns/Subsidies*, and the shared `MaatregelPagina` template).
  A footer change like this must be rolled out everywhere, not just the page being previewed.
- Implementation that worked: `Footer` takes a `cta?: ReactNode`, renders it inside its own
  `bg-primary` + `.ambient-glow` container; each page moves its closing CTA `<section>` into the
  `cta` prop and drops the section's own dark background.
