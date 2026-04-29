## Plan: Bewonerspagina (/bewoners) volledig herschrijven

Ik werk uitsluitend in `src/pages/Bewoners.tsx`. Header, Footer en bestaande visuele tokens (kleuren `#152C4E`, `#E8B547`, `#FBFAF7`, `#F5F2EC`, card-stijl met `border: 1px solid #E5E2DB`, `borderRadius: 16`) blijven ongewijzigd. Goud-accent in headings via `<span style={{ color: "hsl(var(--accent))" }}>`.

### Sectie-volgorde en achtergronden (afwisselend wit ↔ crème)

1. **Hero** — `#FBFAF7` (bestaand) — alleen subtekst vervangen.
2. **Herkenning** (NIEUW) — `#F5F2EC` crème — kop "Misschien *herken* je dit", intro-zin, 2×2 grid met 4 kaartjes (zelfde card-styling als vragenkaartjes, géén iconen), afsluitzin "Wij brengen rust in deze chaos." gecentreerd.
3. **Vragenblok** — `#FBFAF7` (was crème → wit-tint voor afwisseling) — intro vervangen, 7e vraag toevoegen ("Kan ik uiteindelijk volledig van het gas af?"). Grid wordt `md:grid-cols-3` met 3+3+1 — om te vermijden dat de laatste kaart te eenzaam oogt maak ik de laatste kaart `md:col-span-3` met gecentreerde inhoud, zodat hij visueel als afsluitende vraag fungeert.
4. **Wat wij voor je doen** — `#F5F2EC` crème — kop ongewijzigd, subtekst + alle 5 nummerpunten herschreven (incl. nieuwe titel "01 Onafhankelijk meekijken" en "04 Hulp bij keuzes, zonder wachtrij").
5. **Praktische route** (NIEUW) — `#FBFAF7` — kop "Verduurzamen is geen *losse* stap, maar een route", intro gecentreerd (max-w 70%), 5 stappen horizontaal op desktop (`md:grid-cols-5`) met grote okere nummers, op mobiel verticaal gestapeld. Subtiele chevron/pijl tussen stappen op desktop. Afsluitzin gecentreerd, donkerblauw 70% opacity.
6. **Aanvullende mogelijkheden per gemeente** (NIEUW) — `#FFFFFF` wit — twee koloms (`lg:grid-cols-2`): links kop "Meer dan alleen *landelijke* subsidies" + 2 alinea's; rechts 2×2 grid met 4 mini-kaartjes, alleen titel met okere check/streepje ervoor.
7. **Waarom bewoners dit prettig vinden** (NIEUW) — `#F5F2EC` crème — kop "Waarom bewoners hier *rust* van krijgen", korte intro, 6 punten in `md:grid-cols-2 lg:grid-cols-3` met okere vinkjes (lucide `Check`).
8. **CTA-blok** — donkerblauw `#152C4E` (bestaand) — kop "Snel duidelijkheid voor *jouw* woning", nieuwe subtekst toegevoegd boven de knop (de huidige sectie heeft geen subtekst — die voeg ik toe), knop blijft "Plan een vrijblijvend gesprek".

### Technische details

- Hergebruik bestaande inline-stijl-conventies van het bestand (geen nieuwe Tailwind tokens).
- Card-styling consistent: `bg-white`, `borderRadius: 16`, `padding: 20-24`, `border: 1px solid #E5E2DB`, lichte hover-shadow zoals bij de vragenkaartjes (alleen waar dat al bestond — nieuwe statische infokaartjes krijgen geen hover).
- Goud-span pattern: `<span style={{ color: "hsl(var(--accent))" }}>woord</span>`.
- Iconen: alleen `lucide-react` `Check` voor sectie 6 (klein streepje/vinkje) en sectie 7 (vinkjes). Geen nieuwe afbeeldingen.
- Mobiel: alle grids vallen terug op 1 kolom; sectie-padding `py-[64px] md:py-[96px]` zoals elders; body font ≥ 16px.
- Headers/Footer en routing ongewijzigd; geen wijzigingen in andere bestanden.

### Niet doen

- Geen wijzigingen aan andere pagina's of componenten.
- Geen nieuwe afbeeldingen genereren.
- Geen wijziging van kleurtokens of typografie-config.
