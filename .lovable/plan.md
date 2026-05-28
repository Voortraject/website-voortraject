Plan: Favicon vervangen door de originele geüploade PNG en index.html opschonen.

1. Kopieer de geüploade favicon (Voortraject_Favicon_Wit_Blauwe_Achtergrond_Uitgezoomd.png) vanuit `user-uploads://` naar `public/favicon.png`.
2. Verwijder de huidige `public/favicon.svg`.
3. Update `index.html` zodat alleen de PNG-favicon wordt geladen (regel 15–16): vervang de SVG-link door een PNG-link en verwijder de dubbele/verkeerde referentie.

Dit lost op dat de huidige `favicon.svg` wordt gebruikt terwijl jullie de originele PNG (met transparante hoekjes) willen tonen.