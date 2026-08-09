-- Toestemming voor telefonisch en per e-mail opvolgen, per lead vastgelegd.
--
-- Sinds 1 juli 2021 mag telemarketing richting consumenten alleen met
-- toestemming vooraf (art. 11.7 lid 2 Telecommunicatiewet); het
-- bel-me-niet-register verviel toen. De ACM verlangt dat je die toestemming per
-- persoon kunt aantonen: wanneer, en waar de betrokkene precies ja tegen zei.
--
-- Die twee dingen staan al in `notities`, als regel onder de hulpvraag. Dat
-- werkt en blijft ook staan (het is de terugval als deze kolommen om wat voor
-- reden dan ook niet gevuld raken), maar een vrij tekstveld is niet filterbaar
-- en kan door een medewerker worden overschreven bij het bijwerken van een
-- notitie. Vandaar deze twee kolommen.
--
-- `toestemming_tekst` bewaart de letterlijke zin die op dat moment op het scherm
-- stond, niet een versienummer. Verandert de copy later, dan blijft bij oude
-- leads staan waar zíj ja tegen zeiden, zonder dat je een versietabel hoeft te
-- raadplegen.
--
-- Beide kolommen zijn nullable: leads van vóór deze wijziging hebben ze niet, en
-- leads uit andere formulieren (contactformulier) evenmin. NULL betekent hier
-- dus "niet vastgelegd", en dat is iets anders dan "geweigerd".
--
-- LET OP: deze tabel staat in het CRM-project (lfelnfukbrxznkevnevr) en wordt
-- ook door de CRM-app gebruikt. Toevoegen van nullable kolommen is additief en
-- raakt bestaande queries niet.

ALTER TABLE public.leads_bewoners
  ADD COLUMN IF NOT EXISTS toestemming_op timestamptz,
  ADD COLUMN IF NOT EXISTS toestemming_tekst text;

COMMENT ON COLUMN public.leads_bewoners.toestemming_op IS
  'Moment waarop de bezoeker toestemming gaf voor opvolging per mail of telefoon (art. 11.7 lid 2 Tw). NULL = niet vastgelegd.';
COMMENT ON COLUMN public.leads_bewoners.toestemming_tekst IS
  'De letterlijke zin die de bezoeker op dat moment zag. Bewaard als bewijs, zodat latere copywijzigingen oude leads niet raken.';

-- Voor het terugzoeken bij een controle: alleen de rijen mét toestemming.
CREATE INDEX IF NOT EXISTS leads_bewoners_toestemming_op_idx
  ON public.leads_bewoners (toestemming_op)
  WHERE toestemming_op IS NOT NULL;
