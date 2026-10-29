import { useState, useRef, useEffect, FormEvent, ChangeEvent } from "react";
import { useLocation } from "react-router-dom";
import { ArrowRight, Check, Loader2, Mail, MapPin, MessageSquare, Phone, User } from "lucide-react";
import { Header } from "@/components/Header";
import { Seo } from "@/components/Seo";
import { adresUitState } from "@/components/subsidiecheck/checkStaat";
import { formulierFoutMelding } from "@/lib/formulierFout";
import { herkomstUitParams, leesHerkomst, maakEventId } from "@/lib/herkomst";
import { MIN_INVULTIJD_MS } from "@/lib/invultijd";
import { pushGtmEvent } from "@/lib/gtm";
import { Footer } from "@/components/Footer";
import { supabaseExternal as supabase } from "@/integrations/supabase/external-client";
import {
  ADRES_MAX,
  huisnummerGeldig,
  stadGeldig,
  straatGeldig,
  toevoegingGeldig,
} from "@/lib/adresVelden";
import { displayPostcode, normalizePostcode, POSTCODE_RE, zoekAdres } from "@/lib/pdok";
import { TELEFOON_FOUT, validatePhoneNL } from "@/lib/telefoon";
import "@/styles/contact.css";

// Velden zoals de instap van de subsidietool: wit, radius 14, zachte inset-ring
// en een inktblauwe focusring (instap-invoer in src/index.css). De foutstaat is
// een ring in --destructive in plaats van een rode rand (src/styles/contact.css).
const baseInputClass = "instap-invoer ct-invoer";

const cx = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(" ");
// Labels in leesbaar grijsblauw (--rs-tekst-zacht), kleiner dan de invoer, zodat
// elf labels niet lezen als elf kopjes. Een te lang label breekt af in plaats
// van over zijn buurman te lopen; justify-end houdt de velden dan op één lijn.
const labelClass = "ct-label";
// Verplicht is de regel, niet de uitzondering: we markeren alleen wat optioneel
// is. Dat scheelt zes accentkleurige sterretjes die met de CTA concurreerden.
// De spatie ervoor is een breekpunt: zonder liep "Tussenvoegsel (optioneel)" op
// de telefoon over het label ernaast.
const optional = (
  <>
    {" "}
    <span className="ct-label-licht">(optioneel)</span>
  </>
);
// Zelfde markering, maar pas vanaf sm: in de adresrij staan drie velden naast
// elkaar en op mobiel duwt "(optioneel)" die labels over twee regels.
const optionalSm = (
  <>
    {" "}
    <span className="ct-label-licht hidden sm:inline">(optioneel)</span>
  </>
);

// Groepskop in het formulier met een rond inktblauw icoon rechts.
const GroepKop = ({ icon: Icon, children, className }: { icon: typeof User; children: string; className?: string }) => (
  <h2 className={cx("ct-groep-kop", className)}>
    {children}
    <span className="hs-rondje hs-rondje-ink h-[34px] w-[34px]" aria-hidden="true">
      <Icon size={17} strokeWidth={2} />
    </span>
  </h2>
);

// Kort genoeg voor één regel in de smalle kolom. Bewust geen termijn ("binnen 1
// werkdag"): dat is een belofte die we niet altijd kunnen waarmaken.
const expectations = [
  "We nemen zelf contact met je op",
  "We kijken samen wat bij jouw woning past",
  "Je hoeft niets voor te bereiden",
];

// Dezelfde gegevens als in de footer: één plek om ons te bereiken zonder eerst
// het formulier in te vullen. Telefoon eerst: dat is de snelste route.
const contactBlokken = [
  { icon: Phone, label: "Telefoonnummer", waarde: "050 211 2689", href: "tel:+31502112689" },
  { icon: Mail, label: "E-mailadres", waarde: "info@voortraject.nl", href: "mailto:info@voortraject.nl" },
  { icon: MapPin, label: "Vestiging", waarde: "Viaductstraat 3-15, Groningen" },
];

// Exact de drie waarden die het CRM zelf in zijn lead-formulieren aanbiedt
// (kolom `leads_bewoners.aanhef`, vrije tekst). Afwijken zou de aanhef in het
// CRM en in de mailsjablonen laten rammelen.
const aanhefOpties = ["Dhr.", "Mevr.", "Fam."];

const belVoorkeurOpties = [
  "Per e-mail",
  "Telefonisch: Ochtend",
  "Telefonisch: Middag",
  "Telefonisch: Avond",
];

// Op de belroute alleen de dagdelen, met een korter label. De waarde blijft
// "Telefonisch: …": n8n herkent een websitelead onder meer aan notities die met
// "Voorkeur voor contact" beginnen, en het team leest dezelfde tekst als altijd.
const beltijdOpties = [
  { waarde: "Telefonisch: Ochtend", label: "Ochtend" },
  { waarde: "Telefonisch: Middag", label: "Middag" },
  { waarde: "Telefonisch: Avond", label: "Avond" },
];

const initialBewoner = {
  aanhef: "",
  voornaam: "",
  tussenvoegsel: "",
  achternaam: "",
  email: "",
  telefoonnummer: "",
  postcode: "",
  huisnummer: "",
  toevoeging: "",
  straatnaam: "",
  plaatsnaam: "",
  bel_voorkeur: "",
  vragen: "",
};

const MAX_NOTES = 1000;

// ---------- Validators ----------
const NAME_RE = /^[\p{L}\s'\-]+$/u;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Bewust géén HTML-escaping op de invoer: wat we opslaan moet exact zijn wat de
// bezoeker typte. Escapen hoort bij het renderen (React doet dat zelf, en het
// CRM toont deze kolommen als platte tekst), niet bij het opslaan.

// De nummercheck zelf staat in src/lib/telefoon.ts, gedeeld met de subsidiecheck.

// ---------- Component ----------
const Contact = () => {
  const location = useLocation();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Adres dat de subsidiecheck meegaf (knop "Bel mij"). Het komt via de
  // history-state en nooit via de URL: de Meta-pixel stuurt de volledige URL mee
  // (zie checkStaat.ts). Straat en plaats staan er alleen in als de check het
  // huis al herkend had; dan tonen we meteen de bevestiging.
  const [meegegeven] = useState(() => adresUitState(location.state));
  // Binnengekomen via de knop "Bel mij" op stap 1 van de check: een korter
  // formulier, waarin achternaam, e-mail en bericht optioneel zijn. Ook dit
  // staat in de history-state, zodat een herlaad de route vasthoudt.
  const [viaBellen] = useState(
    () => (location.state as { bellen?: unknown } | null)?.bellen === true,
  );
  // Voor het bedankscherm: het formulier is dan al leeggemaakt.
  const [bedankt, setBedankt] = useState<{ voornaam: string; telefoon: string } | null>(null);
  const meegegevenMetStraat = !!(meegegeven?.str && meegegeven?.pl);
  const [bewoner, setBewoner] = useState(() =>
    meegegeven
      ? {
          ...initialBewoner,
          postcode: displayPostcode(meegegeven.pc),
          huisnummer: meegegeven.hn,
          toevoeging: meegegeven.tv,
          straatnaam: meegegeven.str,
          plaatsnaam: meegegeven.pl,
        }
      : initialBewoner,
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [adresLocked, setAdresLocked] = useState(meegegevenMetStraat);
  const [adresChecked, setAdresChecked] = useState(meegegevenMetStraat);
  const [adresLoading, setAdresLoading] = useState(false);
  const [adresEditOverride, setAdresEditOverride] = useState(false);

  // Honeypot
  const [honeypot, setHoneypot] = useState("");
  // Time on page
  const pageLoadedAt = useRef<number>(Date.now());

  const formRef = useRef<HTMLFormElement>(null);

  const clearError = (key: string) =>
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });

  // ---------- PDOK lookup (gedeeld met de subsidiecheck, zie src/lib/pdok.ts) ----------
  const lookupAdres = async () => {
    const hn = bewoner.huisnummer.trim();
    if (!POSTCODE_RE.test(bewoner.postcode) || !/^[0-9]/.test(hn)) return;
    setAdresLoading(true);
    setAdresChecked(false);
    const adres = await zoekAdres(bewoner.postcode, hn);
    setAdresChecked(true);
    if (adres) {
      setBewoner((b) => ({ ...b, straatnaam: adres.straatnaam, plaatsnaam: adres.woonplaatsnaam }));
      setAdresLocked(true);
      setAdresEditOverride(false);
      clearError("straatnaam");
      clearError("plaatsnaam");
    } else {
      setAdresLocked(false);
    }
    setAdresLoading(false);
  };

  // Meegegeven adres zonder straat en plaats: één keer zelf opzoeken, zoals na
  // het invullen van postcode en huisnummer.
  useEffect(() => {
    if (meegegeven && !meegegevenMetStraat) void lookupAdres();
    // Alleen bij binnenkomst.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePostcodeChange = (v: string) => {
    setBewoner((b) => ({ ...b, postcode: v, straatnaam: "", plaatsnaam: "" }));
    setAdresLocked(false);
    setAdresChecked(false);
    setAdresEditOverride(false);
    clearError("postcode");
  };
  const handleHuisnummerChange = (v: string) => {
    setBewoner((b) => ({ ...b, huisnummer: v, straatnaam: "", plaatsnaam: "" }));
    setAdresLocked(false);
    setAdresChecked(false);
    setAdresEditOverride(false);
    clearError("huisnummer");
  };

  // ---------- Validation ----------
  const validate = (): Record<string, string> => {
    const e: Record<string, string> = {};

    const voornaam = bewoner.voornaam.trim();
    if (!voornaam) e.voornaam = "Vul je voornaam in.";
    else if (voornaam.length > 100 || !NAME_RE.test(voornaam))
      e.voornaam = "Je voornaam bevat ongeldige tekens.";

    const tussenvoegsel = bewoner.tussenvoegsel.trim();
    if (tussenvoegsel && (tussenvoegsel.length > 25 || !NAME_RE.test(tussenvoegsel)))
      e.tussenvoegsel = "Het tussenvoegsel bevat ongeldige tekens.";

    const achternaam = bewoner.achternaam.trim();
    if (!achternaam) {
      if (!viaBellen) e.achternaam = "Vul je achternaam in.";
    } else if (achternaam.length < 2) e.achternaam = "Je achternaam moet minimaal 2 karakters bevatten.";
    else if (achternaam.length > 100 || !NAME_RE.test(achternaam)) e.achternaam = "Je achternaam bevat ongeldige tekens.";

    const email = bewoner.email.trim();
    // Op de belroute mag e-mail leeg blijven: de kolom is nullable, en n8n
    // "Website formulier (bewoners)" stuurt sinds 27-10-2026 alleen een
    // bevestigingsmail als `record.email` gevuld is ("Bevestigingsmail
    // sturen?"). Daarvóór stopte de workflow zonder adres vóór de Slack-ping.
    // Haal die voorwaarde in n8n dus niet weg zolang dit zo is.
    if (!email) {
      if (!viaBellen) e.email = "Vul je e-mailadres in.";
    } else if (!EMAIL_RE.test(email) || email.length > 255) e.email = "Dit lijkt geen geldig e-mailadres.";

    const tel = bewoner.telefoonnummer.trim();
    if (!tel) e.telefoonnummer = "Vul je telefoonnummer in.";
    else if (!validatePhoneNL(tel)) e.telefoonnummer = TELEFOON_FOUT;

    const pc = bewoner.postcode.trim();
    const hn = bewoner.huisnummer.trim();
    if (pc && !POSTCODE_RE.test(pc)) e.postcode = "Vul een geldige postcode in (bijvoorbeeld 1234 AB).";
    if (hn && !huisnummerGeldig(hn)) e.huisnummer = "Huisnummer moet beginnen met een cijfer (max 5 karakters).";
    if (pc && !hn) e.huisnummer = "Vul ook een huisnummer in.";
    if (hn && !pc) e.postcode = "Vul ook een postcode in.";

    // Straat, plaats en toevoeging staan normaal via PDOK ingevuld, maar zijn
    // met de hand te overschrijven. De `maxLength` op het invoerveld is alleen
    // een suggestie: de insert gaat rechtstreeks naar Supabase en die aanroep is
    // met de publieke anon-key na te bootsen. Dus ook hier een echte regel.
    const tv = bewoner.toevoeging.trim();
    if (tv && !toevoegingGeldig(tv))
      e.toevoeging = `Toevoeging mag maximaal ${ADRES_MAX.toevoeging} karakters zijn.`;

    const straat = bewoner.straatnaam.trim();
    if (straat && !straatGeldig(straat))
      e.straatnaam = `Straatnaam mag maximaal ${ADRES_MAX.straat} karakters zijn, zonder < of >.`;

    const plaats = bewoner.plaatsnaam.trim();
    if (plaats && !stadGeldig(plaats))
      e.plaatsnaam = `Plaatsnaam mag maximaal ${ADRES_MAX.stad} karakters zijn, zonder < of >.`;

    if (!bewoner.vragen.trim()) {
      if (!viaBellen) e.vragen = "Vul je bericht in.";
    } else if (bewoner.vragen.length > MAX_NOTES)
      e.vragen = `Je bericht is te lang (maximaal ${MAX_NOTES} karakters).`;

    return e;
  };

  const focusFirstError = (errs: Record<string, string>) => {
    const order = [
      "voornaam",
      "tussenvoegsel",
      "achternaam",
      "email",
      "telefoonnummer",
      "postcode",
      "huisnummer",
      "toevoeging",
      "straatnaam",
      "plaatsnaam",
      "vragen",
    ];
    const first = order.find((k) => errs[k]);
    if (!first || !formRef.current) return;
    const el = formRef.current.querySelector<HTMLElement>(`[name="${first}"]`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(() => el.focus(), 200);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setErrorMsg(null);

    // Honeypot
    if (honeypot.trim() !== "") {
      // silent fail
      setSubmitted(true);
      return;
    }
    // Time on page check (min 3s). Alleen in de browser: deze insert gaat
    // rechtstreeks naar het CRM, de controle aan de serverkant ligt daar.
    if (Date.now() - pageLoadedAt.current < MIN_INVULTIJD_MS) {
      setErrorMsg("Even geduld, wacht een moment voordat je het formulier verstuurt.");
      return;
    }

    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      focusFirstError(errs);
      return;
    }

    setSubmitting(true);
    // Eén id voor dit lead-moment: in de dataLayer-push (GTM geeft hem als
    // eventID aan de Meta-pixel) én in `meta_event_id` op de lead. Zo is de Lead
    // uit de browser later te ontdubbelen tegen dezelfde Lead via de Conversions
    // API. Zelfde opzet als de subsidiecheck (StapGegevens.tsx).
    const eventId = maakEventId();
    // Herkomst: de first touch uit sessionStorage (main.tsx), met als terugval
    // wat er in de URL van deze pagina staat. Die komt via de link "Liever even
    // bellen?" in de subsidiecheck, en blijft na de navigatie binnen de app staan.
    const herkomst = { ...herkomstUitParams(new URLSearchParams(location.search)), ...leesHerkomst() };
    try {
      const beltijd = bewoner.bel_voorkeur.trim();
      const opmerkingen = bewoner.vragen.trim();
      let notities: string | null = null;
      if (beltijd && opmerkingen) notities = `Voorkeur voor contact: ${beltijd}\n${opmerkingen}`;
      else if (beltijd) notities = `Voorkeur voor contact: ${beltijd}`;
      else if (opmerkingen) notities = opmerkingen;

      // De kolom `naam` bewust niet meesturen: het CRM stelt die zelf samen uit
      // voornaam/tussenvoegsel/achternaam (gegenereerde kolom).
      const { error } = await supabase.from("leads_bewoners").insert({
        tenant_id: "00000000-0000-0000-0000-000000000001",
        aanhef: bewoner.aanhef || null,
        voornaam: bewoner.voornaam.trim(),
        tussenvoegsel: bewoner.tussenvoegsel.trim() || null,
        // Op de belroute mogen achternaam en e-mail leeg blijven. De CHECK op de
        // tabel eist dan NULL, geen lege tekst (leads_bewoners_achternaam_niet_leeg).
        achternaam: bewoner.achternaam.trim() || null,
        email: bewoner.email.trim() || null,
        telefoon: bewoner.telefoonnummer.trim(),
        postcode: bewoner.postcode ? normalizePostcode(bewoner.postcode) : null,
        huisnummer: bewoner.huisnummer.trim() || null,
        toevoeging: bewoner.toevoeging.trim() || null,
        straat: bewoner.straatnaam.trim() || null,
        stad: bewoner.plaatsnaam.trim() || null,
        notities,
        // Eigen lead van onze eigen site: bron "Voortraject". Het CRM
        // normaliseert dat (trigger `normaliseer_lead_bron`) via de naam in
        // `lead_bronnen` naar de code `voortraject`. De oude waarde "Website"
        // werd code `website`, en die bron is in het CRM niet meer in gebruik.
        bron: "Voortraject",
        // Welk formulier de lead opleverde. n8n bepaalt hiermee de taaktitel én
        // of de bevestigingsmail (die in n8n zelf) uitgaat. Er staat een
        // CHECK op: alleen 'contactformulier', 'subsidietool' of NULL.
        formulier: "contactformulier",
        // utm_source, utm_medium, utm_campaign, utm_term, utm_content en fbclid,
        // alleen de geldige (zie src/lib/herkomst.ts). Zelfde kolommen als de lead
        // uit de subsidiecheck; anon mag erin schrijven.
        ...herkomst,
        meta_event_id: eventId,
        // `status`, `prioriteit` en `toegewezen_aan` sturen we bewust NIET mee.
        // De kolom heeft DEFAULT 'nieuw', en het CRM zet die drie velden bij een
        // anonieme insert sowieso terug (trigger `publieke_lead_velden_vastzetten`).
        // Ze meesturen suggereert dat de website er iets over te zeggen heeft.
      } as any);
      if (error) throw error;
      // Tegenhanger van zakelijk_lead in ZakelijkContactFormulier. Geen
      // persoonsgegevens mee, alleen of de optionele blokken zijn ingevuld:
      // daarmee valt te zien of het adresblok en het vragenveld de inzending
      // helpen of juist afremmen.
      //
      // Container v10 maakt van deze push ook een Meta Lead met
      // content_name "contact" (alleen met toestemming in Axeptio). event_id gaat
      // daar als eventID mee; GA4 gebruikt hem niet.
      pushGtmEvent("bewoner_lead", {
        heeft_adres: bewoner.postcode.trim() ? 1 : 0,
        heeft_vraag: opmerkingen ? 1 : 0,
        event_id: eventId,
      });
      setBedankt({ voornaam: bewoner.voornaam.trim(), telefoon: bewoner.telefoonnummer.trim() });
      setBewoner(initialBewoner);
      setAdresLocked(false);
      setAdresChecked(false);
      setSubmitted(true);
    } catch (err) {
      console.error("Lead submit failed", err);
      // De volumerem van het CRM (PT429) is geen storing en verdient een eigen,
      // eerlijke melding: wachten helpt pas over een uur, dus bellen is dan de
      // route die wél werkt.
      setErrorMsg(
        formulierFoutMelding(
          err,
          "Er ging iets mis bij het versturen. Probeer het later nog eens of mail ons direct op info@voortraject.nl.",
        ),
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ---------- Reusable field renderers ----------
  const errId = (k: string) => `err-${k}`;

  const FieldError = ({ name }: { name: string }) =>
    errors[name] ? (
      <p
        id={errId(name)}
        role="alert"
        className="font-sans mt-1.5 text-[13.5px] font-semibold text-destructive"
      >
        {errors[name]}
      </p>
    ) : null;

  const inputCls = (name: string) => cx(baseInputClass, !!errors[name] && "ct-fout");

  const onChangeBew = (k: keyof typeof bewoner) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setBewoner({ ...bewoner, [k]: e.target.value });
    clearError(k);
  };

  // Straat en plaats vullen we zelf in via PDOK; dan zijn het geen vragen meer
  // maar een bevestiging. Twee readonly invoervakken tonen zou de bezoeker twee
  // extra vakjes laten lezen voor iets wat hij niet hoeft in te vullen.
  const adresBevestigd =
    adresLocked && !adresEditOverride && !!bewoner.straatnaam.trim() && !!bewoner.plaatsnaam.trim();
  // Handmatig invullen: na een mislukte lookup, of als de bezoeker zelf op
  // "bewerken" klikt.
  const adresHandmatig = adresEditOverride || (adresChecked && !adresLocked && !adresLoading);
  const heeftPostcodeEnNummer = !!(bewoner.postcode.trim() && bewoner.huisnummer.trim());
  const toonAdresBlok = heeftPostcodeEnNummer && (adresBevestigd || adresHandmatig);

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Contact | Voortraject"
        description="Stel je vraag of laat je nummer achter. We helpen je verder met verduurzamen, gratis en vrijblijvend."
        path="/contact"
      />
      <Header />

      {/* Hero + Form (samengevoegd) */}
      <section className="bg-background pt-6 md:pt-10 pb-14 md:pb-[88px]">
        <div className="mx-auto px-6 md:px-12" style={{ maxWidth: 1200 }}>
          <div className="mx-auto text-center" style={{ maxWidth: 900 }}>
            {viaBellen ? (
              <>
                <h1 className="ct-h1">
                  Liever even <span className="hs-accent">bellen</span>?
                </h1>
                <p className="hs-tekst font-sans mt-3 text-[16px] leading-relaxed">
                  Laat je naam en nummer achter. We bellen je terug.
                </p>
              </>
            ) : (
              <h1 className="ct-h1">
                Waar kunnen we je mee <span className="hs-accent">helpen</span>?
              </h1>
            )}
          </div>
        </div>

        <div className="mx-auto px-6 md:px-12 mt-6 md:mt-9" style={{ maxWidth: 1200 }}>
          {/* Twee kolommen pas vanaf lg: op een tablet (768) werd het formulier
              zo smal dat "Telefoonnummer" niet meer in zijn vak paste.
              items-stretch: de rechterkolom is even hoog als het formulier,
              zodat de tegel erin ruimte heeft om sticky mee te lopen. */}
          <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-7 lg:gap-10 items-stretch">
            <div className="hs-tegel hs-blauw-zacht min-w-0 p-5 md:p-9">
              {submitted ? (
                <div
                  role="status"
                  aria-live="polite"
                  className="hs-groen flex flex-col items-center rounded-[20px] px-5 py-7 text-center"
                >
                  <span className="hs-rondje hs-rondje-groen h-12 w-12" aria-hidden="true">
                    <Check size={22} strokeWidth={3} />
                  </span>
                  {viaBellen && bedankt ? (
                    <>
                      <h2 className="hs-h3 mt-4">Bedankt, {bedankt.voornaam}!</h2>
                      <p className="hs-tekst font-sans mt-2 text-[15px] leading-relaxed">
                        We bellen je op <span className="whitespace-nowrap font-bold text-primary">{bedankt.telefoon}</span>.
                      </p>
                    </>
                  ) : (
                    <>
                      <h2 className="hs-h3 mt-4">Bedankt!</h2>
                      <p className="hs-tekst font-sans mt-2 text-[15px] leading-relaxed">
                        We hebben je bericht ontvangen. Iemand van ons team neemt contact met je op.
                      </p>
                    </>
                  )}
                </div>
              ) : (
                <>
                  {errorMsg && (
                    <div
                      role="alert"
                      className="font-sans mb-4 rounded-2xl bg-destructive/[0.08] px-4 py-3 text-[14px] font-semibold text-destructive"
                    >
                      {errorMsg}
                    </div>
                  )}

                  <form ref={formRef} onSubmit={handleSubmit} noValidate>
                    {/* Honeypot: een gewoon tekstveld (géén type="hidden" — dat slaan
                        bots juist over) dat alleen met CSS uit beeld staat. De naam is
                        bewust nietszeggend: browser-autofill herkent `vt_check` niet, dus
                        een echte bezoeker laat hem gegarandeerd leeg. */}
                    <div aria-hidden="true" style={{ position: "absolute", left: "-10000px", top: "auto", width: 1, height: 1, overflow: "hidden" }}>
                      <label>
                        Laat dit veld leeg
                        <input
                          type="text"
                          name="vt_check"
                          tabIndex={-1}
                          autoComplete="off"
                          value={honeypot}
                          onChange={(e) => setHoneypot(e.target.value)}
                        />
                      </label>
                    </div>

                    {/* Eén raster van 12 kolommen voor het hele formulier, zodat elke
                        verticale naad op 33% of 67% valt. Daarvoor sprong die naad per
                        rij (33% bij de namen, 50% bij e-mail/telefoon, 48% en 76% bij
                        het adres) en dat las als rommel, ook al klopte elke rij op
                        zichzelf. Onder sm: 50/50 — in 4 van 12 kolommen past het woord
                        "Tussenvoegsel" niet en liep het label buiten zijn vak.
                        justify-end houdt de inputs op één lijn als een label over twee
                        regels breekt. */}
                    <GroepKop icon={User}>Jouw gegevens</GroepKop>
                    {viaBellen ? (
                      <>
                        {/* Belroute: alleen voornaam en telefoon verplicht. Telefoon
                            staat vóór e-mail, want daar kwam de bezoeker voor. */}
                        <div className="mt-3.5 grid grid-cols-2 sm:grid-cols-12 gap-3">
                          <div className="sm:col-span-6 min-w-0 flex flex-col justify-end">
                            <label htmlFor="f-voornaam" className={labelClass}>Voornaam</label>
                            <input
                              id="f-voornaam"
                              name="voornaam"
                              type="text"
                              autoComplete="given-name"
                              aria-required="true"
                              aria-invalid={!!errors.voornaam}
                              aria-describedby={errors.voornaam ? errId("voornaam") : undefined}
                              className={inputCls("voornaam")}
                              value={bewoner.voornaam}
                              onChange={onChangeBew("voornaam")}
                              maxLength={100}
                            />
                          </div>
                          <div className="sm:col-span-6 min-w-0 flex flex-col justify-end">
                            <label htmlFor="f-achternaam" className={labelClass}>Achternaam{optional}</label>
                            <input
                              id="f-achternaam"
                              name="achternaam"
                              type="text"
                              autoComplete="family-name"
                              aria-invalid={!!errors.achternaam}
                              aria-describedby={errors.achternaam ? errId("achternaam") : undefined}
                              className={inputCls("achternaam")}
                              value={bewoner.achternaam}
                              onChange={onChangeBew("achternaam")}
                              maxLength={100}
                            />
                          </div>
                          {(errors.voornaam || errors.achternaam) && (
                            <div className="col-span-full -mt-2">
                              <FieldError name="voornaam" />
                              <FieldError name="achternaam" />
                            </div>
                          )}
                        </div>
                        <div className="mt-3.5 grid grid-cols-1 sm:grid-cols-12 gap-3">
                          <div className="sm:col-span-6 min-w-0">
                            <label htmlFor="f-tel-b" className={labelClass}>Telefoonnummer</label>
                            <input
                              id="f-tel-b"
                              name="telefoonnummer"
                              type="tel"
                              autoComplete="tel"
                              aria-required="true"
                              aria-invalid={!!errors.telefoonnummer}
                              aria-describedby={errors.telefoonnummer ? errId("telefoonnummer") : undefined}
                              className={inputCls("telefoonnummer")}
                              value={bewoner.telefoonnummer}
                              onChange={onChangeBew("telefoonnummer")}
                            />
                            <FieldError name="telefoonnummer" />
                          </div>
                          <div className="sm:col-span-6 min-w-0">
                            <label htmlFor="f-email-b" className={labelClass}>E-mailadres{optional}</label>
                            <input
                              id="f-email-b"
                              name="email"
                              type="email"
                              autoComplete="email"
                              aria-invalid={!!errors.email}
                              aria-describedby={errors.email ? errId("email") : undefined}
                              className={inputCls("email")}
                              value={bewoner.email}
                              onChange={onChangeBew("email")}
                              maxLength={255}
                            />
                            <FieldError name="email" />
                          </div>
                        </div>
                      </>
                    ) : (
                    <>
                    <div className="mt-3.5 grid grid-cols-2 sm:grid-cols-12 gap-3">
                      <div className="sm:col-span-4 min-w-0 flex flex-col justify-end">
                        <label htmlFor="f-aanhef" className={labelClass}>Aanhef</label>
                        <select
                          id="f-aanhef"
                          name="aanhef"
                          className={baseInputClass}
                          value={bewoner.aanhef}
                          onChange={onChangeBew("aanhef")}
                        >
                          <option value="">—</option>
                          {aanhefOpties.map((o) => (
                            <option key={o} value={o}>
                              {o}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="sm:col-span-8 min-w-0 flex flex-col justify-end">
                        <label htmlFor="f-voornaam" className={labelClass}>Voornaam</label>
                        <input
                          id="f-voornaam"
                          name="voornaam"
                          type="text"
                          autoComplete="given-name"
                          aria-required="true"
                          aria-invalid={!!errors.voornaam}
                          aria-describedby={errors.voornaam ? errId("voornaam") : undefined}
                          className={inputCls("voornaam")}
                          value={bewoner.voornaam}
                          onChange={onChangeBew("voornaam")}
                          maxLength={100}
                        />
                      </div>
                      <div className="sm:col-span-4 min-w-0 flex flex-col justify-end">
                        <label htmlFor="f-tussenvoegsel" className={labelClass}>Tussenvoegsel{optional}</label>
                        <input
                          id="f-tussenvoegsel"
                          name="tussenvoegsel"
                          type="text"
                          aria-invalid={!!errors.tussenvoegsel}
                          aria-describedby={errors.tussenvoegsel ? errId("tussenvoegsel") : undefined}
                          className={inputCls("tussenvoegsel")}
                          value={bewoner.tussenvoegsel}
                          onChange={onChangeBew("tussenvoegsel")}
                          maxLength={25}
                        />
                      </div>
                      <div className="sm:col-span-8 min-w-0 flex flex-col justify-end">
                        <label htmlFor="f-achternaam" className={labelClass}>Achternaam</label>
                        <input
                          id="f-achternaam"
                          name="achternaam"
                          type="text"
                          autoComplete="family-name"
                          aria-required="true"
                          aria-invalid={!!errors.achternaam}
                          aria-describedby={errors.achternaam ? errId("achternaam") : undefined}
                          className={inputCls("achternaam")}
                          value={bewoner.achternaam}
                          onChange={onChangeBew("achternaam")}
                          maxLength={100}
                        />
                      </div>
                      {(errors.voornaam || errors.tussenvoegsel || errors.achternaam) && (
                        <div className="col-span-full -mt-2">
                          <FieldError name="voornaam" />
                          <FieldError name="tussenvoegsel" />
                          <FieldError name="achternaam" />
                        </div>
                      )}
                    </div>
                    <div className="mt-3.5 grid grid-cols-1 sm:grid-cols-12 gap-3">
                      <div className="sm:col-span-8 min-w-0">
                        <label htmlFor="f-email-b" className={labelClass}>E-mailadres</label>
                        <input
                          id="f-email-b"
                          name="email"
                          type="email"
                          aria-required="true"
                          aria-invalid={!!errors.email}
                          aria-describedby={errors.email ? errId("email") : undefined}
                          className={inputCls("email")}
                          value={bewoner.email}
                          onChange={onChangeBew("email")}
                          maxLength={255}
                        />
                        <FieldError name="email" />
                      </div>
                      <div className="sm:col-span-4 min-w-0">
                        <label htmlFor="f-tel-b" className={labelClass}>Telefoonnummer</label>
                        <input
                          id="f-tel-b"
                          name="telefoonnummer"
                          type="tel"
                          aria-required="true"
                          aria-invalid={!!errors.telefoonnummer}
                          aria-describedby={errors.telefoonnummer ? errId("telefoonnummer") : undefined}
                          className={inputCls("telefoonnummer")}
                          value={bewoner.telefoonnummer}
                          onChange={onChangeBew("telefoonnummer")}
                        />
                        <FieldError name="telefoonnummer" />
                      </div>
                    </div>
                    </>
                    )}

                    {/* Adres hoort bij dezelfde groep als naam en contactgegevens, maar
                        is als enige niet verplicht: de drie velden dragen dat zelf.
                        Op mobiel één rij: huisnummer en toevoeging minstens zo breed als
                        hun label (de vette labels pasten niet meer in 1.2fr en 1fr),
                        de postcode krijgt de rest. Vanaf sm drie gelijke blokken van 4 kolommen,
                        waardoor de naden samenvallen met de rijen erboven. */}
                    <div className="mt-3.5">
                      <div className="grid grid-cols-[minmax(0,1.3fr)_minmax(min-content,1fr)_minmax(min-content,0.9fr)] sm:grid-cols-12 gap-3">
                        <div className="sm:col-span-4 min-w-0 flex flex-col justify-end">
                          <label htmlFor="f-postcode" className={labelClass}>
                            Postcode{optionalSm}
                          </label>
                          <input
                            id="f-postcode"
                            name="postcode"
                            type="text"
                            autoComplete="postal-code"
                            placeholder="9711 AB"
                            aria-invalid={!!errors.postcode}
                            aria-describedby={errors.postcode ? errId("postcode") : undefined}
                            className={inputCls("postcode")}
                            value={bewoner.postcode}
                            onChange={(e) => handlePostcodeChange(e.target.value)}
                            onBlur={lookupAdres}
                          />
                        </div>
                        <div className="sm:col-span-4 min-w-0 flex flex-col justify-end">
                          <label htmlFor="f-huisnummer" className={labelClass}>
                            Huisnummer{optionalSm}
                          </label>
                          <input
                            id="f-huisnummer"
                            name="huisnummer"
                            type="text"
                            inputMode="numeric"
                            placeholder="12"
                            aria-invalid={!!errors.huisnummer}
                            aria-describedby={errors.huisnummer ? errId("huisnummer") : undefined}
                            className={inputCls("huisnummer")}
                            value={bewoner.huisnummer}
                            onChange={(e) => handleHuisnummerChange(e.target.value)}
                            onBlur={lookupAdres}
                            maxLength={5}
                          />
                        </div>
                        <div className="sm:col-span-4 min-w-0 flex flex-col justify-end">
                          <label htmlFor="f-toevoeging" className={labelClass}>
                            Toevoeging{optionalSm}
                          </label>
                          <input
                            id="f-toevoeging"
                            name="toevoeging"
                            type="text"
                            placeholder="A"
                            className={inputCls("toevoeging")}
                            value={bewoner.toevoeging}
                            onChange={onChangeBew("toevoeging")}
                            maxLength={ADRES_MAX.toevoeging}
                          />
                        </div>
                      </div>
                      {/* Alle drie de foutmeldingen onder de rij, zodat een melding
                          het veld erboven niet uit de lijn duwt. */}
                      <div className="mt-1">
                        <FieldError name="postcode" />
                        <FieldError name="huisnummer" />
                        <FieldError name="toevoeging" />
                      </div>
                      {adresLoading && (
                        <p className="hs-tekst font-sans flex items-center gap-2 mt-2 text-[13.5px]">
                          <Loader2 size={14} className="animate-spin" /> Adres zoeken...
                        </p>
                      )}
                      {adresChecked && !adresLocked && !adresLoading && bewoner.postcode && bewoner.huisnummer && (
                        <p className="font-sans mt-2 text-[13.5px] font-semibold text-primary">
                          Geen adres gevonden bij deze combinatie van postcode en huisnummer. Controleer je invoer of vul Straatnaam en Plaatsnaam zelf in.
                        </p>
                      )}

                      {/* Gevonden adres is een bevestiging, geen vraag: één regel in
                          plaats van twee grijze readonly-vakken. Alleen als PDOK niets
                          vindt (of de bezoeker op "bewerken" klikt) verschijnen de twee
                          invoervelden echt. */}
                      <div
                        className={cx(
                          "grid transition-all duration-300 ease-in-out",
                          toonAdresBlok ? "mt-3.5 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                        )}
                        aria-hidden={!toonAdresBlok}
                      >
                        <div className="overflow-hidden">
                          {adresBevestigd ? (
                            <div className="hs-groen flex items-center gap-3 rounded-2xl px-3.5 py-3">
                              <span className="hs-rondje hs-rondje-groen h-7 w-7" aria-hidden="true">
                                <MapPin size={14} strokeWidth={2.4} />
                              </span>
                              <p className="font-sans min-w-0 flex-1 text-[14.5px] font-semibold leading-snug text-primary">
                                {bewoner.straatnaam} {bewoner.huisnummer}
                                {bewoner.toevoeging.trim() ? ` ${bewoner.toevoeging.trim()}` : ""}, {bewoner.plaatsnaam}
                              </p>
                              <button
                                type="button"
                                tabIndex={toonAdresBlok ? 0 : -1}
                                onClick={() => { setAdresEditOverride(true); setAdresLocked(false); }}
                                className="shrink-0 min-h-[32px] rounded-md px-1 text-[14px] font-bold text-primary underline decoration-primary/40 underline-offset-[3px] hover:decoration-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
                              >
                                bewerken
                              </button>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                              <input
                                name="straatnaam"
                                type="text"
                                placeholder="Straatnaam"
                                aria-label="Straatnaam"
                                tabIndex={toonAdresBlok ? 0 : -1}
                                className={cx(inputCls("straatnaam"), "sm:col-span-8 min-w-0")}
                                value={bewoner.straatnaam}
                                onChange={onChangeBew("straatnaam")}
                                maxLength={ADRES_MAX.straat}
                              />
                              <input
                                name="plaatsnaam"
                                type="text"
                                placeholder="Plaatsnaam"
                                aria-label="Plaatsnaam"
                                tabIndex={toonAdresBlok ? 0 : -1}
                                className={cx(inputCls("plaatsnaam"), "sm:col-span-4 min-w-0")}
                                value={bewoner.plaatsnaam}
                                onChange={onChangeBew("plaatsnaam")}
                                maxLength={ADRES_MAX.stad}
                              />
                              <div className="sm:col-span-12">
                                <FieldError name="straatnaam" />
                                <FieldError name="plaatsnaam" />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <GroepKop icon={viaBellen ? Phone : MessageSquare} className="mt-7">
                      {viaBellen ? "Wanneer bellen we je?" : "Jouw vraag"}
                    </GroepKop>

                    <div className="mt-3.5">
                      <label htmlFor="f-bel" className={labelClass}>
                        {viaBellen ? "Wanneer bellen we je het liefst?" : "Voorkeur voor contact"}
                        {optional}
                      </label>
                      <select
                        id="f-bel"
                        name="bel_voorkeur"
                        className={baseInputClass}
                        value={bewoner.bel_voorkeur}
                        onChange={onChangeBew("bel_voorkeur")}
                      >
                        <option value="">{viaBellen ? "Maakt niet uit" : "Maak een keuze"}</option>
                        {viaBellen
                          ? beltijdOpties.map((o) => (
                              <option key={o.waarde} value={o.waarde}>
                                {o.label}
                              </option>
                            ))
                          : belVoorkeurOpties.map((o) => (
                              <option key={o} value={o}>
                                {o}
                              </option>
                            ))}
                      </select>
                    </div>

                    <div className="mt-3">
                      {/* Zelfde opbouw als het berichtblok op /zakelijk. De
                          tekenlimiet staat alleen in de teller eronder; twee
                          keer hetzelfde getal is ruis. */}
                      <label htmlFor="f-vragen-b" className={labelClass}>Bericht{viaBellen && optional}</label>
                      <textarea
                        id="f-vragen-b"
                        name="vragen"
                        aria-required={!viaBellen}
                        aria-invalid={!!errors.vragen}
                        aria-describedby={errors.vragen ? errId("vragen") : "count-vragen-b"}
                        className={inputCls("vragen")}
                        placeholder={
                          viaBellen
                            ? "Waar wil je het over hebben?"
                            : "Vertel kort waar je tegenaan loopt of wat je wil weten."
                        }
                        value={bewoner.vragen}
                        onChange={onChangeBew("vragen")}
                        maxLength={MAX_NOTES}
                      />
                      <div className="flex justify-between items-center mt-1">
                        <FieldError name="vragen" />
                        <span id="count-vragen-b" className="hs-tekst font-sans text-[13.5px] ml-auto">
                          {bewoner.vragen.length} / {MAX_NOTES}
                        </span>
                      </div>
                    </div>

                    {/* De ene oker knop op dit scherm: een pil van 56px over de volle
                        breedte. Hover en indrukken komen uit hs-knop. */}
                    <button
                      type="submit"
                      disabled={submitting}
                      className="hs-knop hs-knop-oker mt-[22px] w-full min-h-[56px] text-[16px] disabled:opacity-70"
                    >
                      {submitting ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Bezig met versturen...
                        </>
                      ) : viaBellen ? (
                        "Bel mij terug"
                      ) : (
                        "Verstuur bericht"
                      )}
                    </button>
                  </form>
                </>
              )}
            </div>

            {/* Eén rustige tegel naast het formulier: wat je kunt verwachten en,
                onder een dunne lijn, hoe je ons direct bereikt. Kleine vinkjes en
                iconen naast de tekst in plaats van gevulde rondjes, zoals de
                beloftes op stap 1 van de check. Op desktop blijft hij staan terwijl
                het formulier scrolt; op de telefoon komt hij rustig na het
                formulier. Hier stonden eerder ook de reviews; die maakten de
                pagina druk en zijn er bewust af. */}
            <div className="min-w-0">
              <div className="hs-tegel p-5 md:p-7 lg:sticky lg:top-28">
                <h2 className="hs-h3">Wat kun je verwachten?</h2>
                <ul className="mt-4 grid gap-3">
                  {expectations.map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <Check size={17} strokeWidth={2.5} className="mt-[2px] shrink-0 text-instap-subsidie" aria-hidden="true" />
                      <span className="font-sans text-[15px] leading-[1.45] text-foreground">{item}</span>
                    </li>
                  ))}
                </ul>

                <div className="ct-tegel-scheiding mt-6 pt-5">
                  <h3 className="hs-tekst text-[13.5px] font-bold">Liever direct contact?</h3>
                  <ul className="mt-1.5">
                    {contactBlokken.map(({ icon: Icon, label, waarde, href }) => {
                      const inhoud = (
                        <>
                          <Icon size={17} strokeWidth={2} className="shrink-0 text-primary/70" aria-hidden="true" />
                          <span className="sr-only">{label}: </span>
                          <span className="min-w-0 break-words text-[15px] font-bold text-primary">{waarde}</span>
                        </>
                      );
                      return (
                        <li key={label}>
                          {href ? (
                            <a
                              href={href}
                              className="group flex min-h-[44px] items-center gap-3 rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                            >
                              {inhoud}
                              <ArrowRight size={16} strokeWidth={2.2} className="hs-pijl ml-auto shrink-0 text-primary/50 group-hover:translate-x-1" aria-hidden="true" />
                            </a>
                          ) : (
                            <div className="flex min-h-[44px] items-center gap-3">{inhoud}</div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;
