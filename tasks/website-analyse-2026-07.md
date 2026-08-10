# Website-analyse juli 2026 — bevindingen + oppak-prompt

> Analyse uitgevoerd op 2026-07-12 (Claude Code). Nog niets gebouwd.
> Om dit op te pakken: geef Claude de prompt onderaan dit bestand.

## Samenvatting bevindingen

**Sterk:** structuur volgt de twee doelgroepen logisch (bewoners vs. uitvoerders), één consistente CTA ("Plan een gratis gesprek" → /contact) overal, laagdrempelig contactformulier met bewoner/uitvoerder-toggle en PDOK-autofill, goede social proof (Google-reviews in hero, logobalk officiële instanties, team met gezichten). Homepage volgt het klassieke conversiescript (pijnherkenning → stappenplan → aanbod → bewijs → FAQ → slot-CTA).

**Afgesproken eerste wijziging (homepage-secties Herkenning + HelderPlan):**
1. **CTA-knop onder het stappenplan** in `src/components/sections/HelderPlan.tsx`: direct na de `<ol>`, uitgelijnd met de staptekst (niet onder de cijferkolom), zodat de tijdlijn eindigt in de knop. Eén `CtaButton` naar `/contact`, label dat aan stap 1 haakt (bijv. "Plan stap 1: het gratis gesprek"), eventueel `OfBelOnsCta` ernaast. GEEN CTA in Herkenning (botst met de kaart "Ik wil geen verkooppraatje").
2. **Herkenning compacter** in `src/components/sections/Herkenning.tsx`: foto schrappen (is op mobiel al `hidden lg:block`) en de drie twijfels als drie kaarten naast elkaar over de volle breedte. Plus voor deze twee secties een krappere paddingvariant (~56–64px desktop i.p.v. de 88px van `section-pad-home` in `src/index.css`); `section-pad-home` zelf NIET globaal wijzigen.
3. Geparkeerd voor later: A/B-experiment Herkenning ↔ Reviews omwisselen (pas zinvol bij voldoende verkeer).

**Backlog uit de bredere analyse (prioriteitsvolgorde):**
1. Kapotte link: header-parent "Subsidies" verwijst naar `/subsidies` (`src/components/Header.tsx` regel ~37) maar die route bestaat niet → 404. Overweeg echte hubpagina's voor `/subsidies` en `/verduurzamen` (nu redirect naar home; "Verduurzamen"-parent wijst willekeurig naar /verduurzamen/isolatie).
2. Contactformulier context meegeven vanuit herkomstpagina: maatregel/pakket voorselecteren, Partners-CTA's ("Bespreek dit pakket" ×3) moeten op de uitvoerder-tab landen.
3. Onzichtbare content maatregel-pagina's: `src/components/MaatregelPagina.tsx` accepteert props die de zes pagina's invullen maar nooit rendert (subsidie-info, keurmerken, "wat valt eronder", kruislinks airco→onderhoud en laadpaal→zonnepanelen/thuisbatterij, zachte CTA's). Renderen of opruimen. `MaatregelTemplate.tsx` is dode code; ook `badges`-variabele in MaatregelPagina is dood.
4. Mobiele header-CTA zegt "Contact" i.p.v. "Plan een gratis gesprek" (`src/components/Header.tsx`, MobileMenu).
5. Toegankelijkheid: desktop-dropdowns openen alleen op hover (`group-hover:block`), parents zijn buttons → toetsenbordnavigatie opent ze vermoedelijk niet.
6. Dode footer-links: adres en KVK linken naar `#` (`src/components/Footer.tsx`) → platte tekst of Maps-link.
7. Uitvoerders-spoor versterken: nav-label "Partners" is ambigu (bijv. "Voor uitvoerders"), enige homepage-verwijzing zit helemaal onderaan in ClosingCta.
8. Interne kruislinks: slechts één in-content link tussen de vier subsidiepagina's; maatregel-pagina's linken nergens naar subsidies. Onderhoud ontbreekt in home-sectie "Waar we bij helpen".
9. Duplicatie subsidiepagina's: vier pagina's zijn gekopieerde code met woordelijk identieke footer-CTA's en bijna identieke stappenplannen/"Waarom Voortraject"-blokken.

## Oppak-prompt (kopieer dit naar Claude)

```
Lees eerst tasks/website-analyse-2026-07.md volledig. Voer daarna de "afgesproken
eerste wijziging" uit (CTA-knop onder het stappenplan in HelderPlan.tsx + Herkenning
compacter als kaartenrij zonder foto + krappere padding voor alleen deze twee secties).
Werkwijze: nieuwe branch vanaf main, huisstijl-tokens gebruiken (geen hex),
geen gedachtestreepjes in zichtbare copy, visueel verifiëren op desktop én mobiel,
daarna PR openen. Raak de backlog-punten uit dat bestand nog niet aan.
```
