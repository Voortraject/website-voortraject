Milieu Centraal heeft zijn filterlijst aangepast. Deze pull request werkt alleen de
momentopname bij; er verandert nog niets aan de tool.

Loop de diff na en vraag jezelf twee dingen af:

- Raakt de wijziging een van de negen maatregelen die wij aanbieden
  (`MAATREGEL_FILTER_ID` in `src/lib/subsidies/types.ts`)? Een hernoemd label betekent dat
  `MAATREGEL_LABELS` uit de pas loopt met de bron, en die labels gaan ook als platte tekst
  naar `subsidiecheck_interesses` in het CRM.
- Staat er een nieuwe maatregel bij die we zouden willen aanbieden? Meet dat eerst: een
  maatregel die in Noord-Nederland nul extra regelingen oplevert, maakt de lijst met chips
  alleen maar langer.

Is een van onze id's helemaal verdwenen, dan faalt deze workflow en komt er géén pull
request. Dat moet met voorrang opgelost worden, want de tool vindt dan stilletjes geen
regelingen meer voor die maatregel.

Aanpassen betekent altijd twee plekken: `src/lib/subsidies/types.ts` en de kopie in
`supabase/functions/subsidiecheck/types.ts`. Raakt het de labels, dan ook
`supabase/functions/subsidiecheck-mail/index.ts`, en die function moet daarna opnieuw
gedeployed worden.
