import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Seo } from "@/components/Seo";

// Tabellen zonder harde lijnen: een kopregel in zacht blauw en om en om een
// getinte rij. Op de telefoon wordt elke rij een klein blok (naam, daaronder
// doel, partij en bewaartermijn met hun label ervoor), zodat er niets
// horizontaal hoeft te scrollen.
const TABEL =
  "w-full border-collapse text-[14px] leading-[1.5] max-sm:block max-sm:[&_tbody]:block max-sm:[&_thead]:sr-only";
const RIJ = "even:bg-[hsl(var(--rs-hoofd-naar))] max-sm:block max-sm:py-3";
const KOPCEL = "px-3.5 py-2.5 text-left font-bold text-primary";
const CEL = "px-3.5 py-2.5 align-top text-[hsl(var(--rs-tekst-zacht))] max-sm:block max-sm:py-0.5";
const CEL_LABEL = "max-sm:before:mr-1.5 max-sm:before:font-bold max-sm:before:text-primary max-sm:before:content-[attr(data-label)]";

const Cookie = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Seo
        title="Cookieverklaring | Voortraject"
        description="Lees hier de cookieverklaring van Voortraject. Wij leggen uit welke cookies wij gebruiken, met welk doel en hoe u uw voorkeuren kunt beheren."
        path="/cookieverklaring"
      />
      <Header />
      <main className="flex-1">
        <section className="py-12 md:py-20">
          <div className="container-content max-w-3xl mx-auto">
            <h1 className="hs-h2 text-[24px] md:text-[40px]">
              Cookieverklaring Voortraject
            </h1>
            <p className="hs-tekst mt-2 mb-8 text-[15px] italic md:mb-10">
              Versie oktober 2026
            </p>

            <div className="mb-8 md:mb-10">
              <h2 className="hs-h3 mb-3">
                1. Inleiding
              </h2>
              <div className="hs-tekst text-[15px] leading-[1.7] md:text-[16px]">
                <p className="mb-3">
                  Deze cookieverklaring hoort bij de website van Voortraject VOF
                  (hierna: "Voortraject", "wij" of "ons"). Hierin leggen wij uit
                  wat cookies zijn, welke cookies wij gebruiken, met welk doel en
                  hoe u uw voorkeuren kunt beheren.
                </p>
                <p>
                  Voor meer informatie over hoe wij met persoonsgegevens omgaan,
                  verwijzen wij naar onze{" "}
                  <a href="/privacy" className="font-semibold text-primary underline underline-offset-2">
                    privacyverklaring
                  </a>
                  .
                </p>
              </div>
            </div>

            <div className="mb-8 md:mb-10">
              <h2 className="hs-h3 mb-3">
                2. Wat zijn cookies?
              </h2>
              <div className="hs-tekst text-[15px] leading-[1.7] md:text-[16px]">
                <p>
                  Cookies zijn kleine tekstbestanden die bij een bezoek aan onze
                  website op uw apparaat (computer, tablet of telefoon) worden
                  opgeslagen. Met cookies en vergelijkbare technieken kunnen wij
                  onze website laten functioneren en het gebruik van de website
                  meten. Sommige cookies worden door ons geplaatst, andere door
                  derde partijen, zoals Google, Microsoft en Meta.
                </p>
              </div>
            </div>

            <div className="mb-8 md:mb-10">
              <h2 className="hs-h3 mb-3">
                3. Uw toestemming
              </h2>
              <div className="hs-tekst text-[15px] leading-[1.7] md:text-[16px]">
                <p className="mb-3">
                  Voor noodzakelijke en functionele cookies hebben wij geen
                  toestemming nodig; deze zijn nodig om de website goed te laten
                  werken en om uw cookievoorkeuren te onthouden.
                </p>
                <p className="mb-3">
                  Voor analytische en marketingcookies vragen wij vooraf uw
                  toestemming. Deze
                  cookies worden pas geplaatst nadat u daarvoor toestemming heeft
                  gegeven via ons cookievenster. U kunt uw keuze op elk moment
                  wijzigen of intrekken door het cookievenster opnieuw te openen
                  via onze website. Het intrekken van toestemming geldt voor de
                  toekomst en laat de rechtmatigheid van eerdere verwerking
                  onverlet.
                </p>
                <p>
                  Voor het beheren van toestemming maken wij gebruik van Axeptio.
                </p>
              </div>
            </div>

            <div className="mb-8 md:mb-10">
              <h2 className="hs-h3 mb-3">
                4. Welke cookies gebruiken wij?
              </h2>

              <h3 className="mt-6 mb-2.5 font-['Inter_Tight',_'Inter',_sans-serif] text-[16.5px] font-bold text-primary">
                4.1 Noodzakelijke en functionele cookies
              </h3>
              <p className="hs-tekst text-[15px] leading-[1.7] md:text-[16px] mb-4">
                Deze cookies zijn nodig voor de werking van de website en voor
                het onthouden van uw cookievoorkeuren. Hiervoor is geen toestemming
                vereist.
              </p>
              <div className="hs-tegel mb-6 overflow-x-auto">
                <table className={TABEL}>
                  <thead>
                    <tr className="bg-[hsl(var(--rs-hoofd-midden))]">
                      <th className={KOPCEL}>
                        Cookie
                      </th>
                      <th className={KOPCEL}>
                        Doel
                      </th>
                      <th className={KOPCEL}>
                        Partij
                      </th>
                      <th className={KOPCEL}>
                        Bewaartermijn
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className={RIJ}>
                      <td className={`${CEL} max-sm:pt-0 max-sm:font-bold max-sm:text-primary`}>
                        axeptio_cookies
                      </td>
                      <td data-label="Doel" className={`${CEL} ${CEL_LABEL}`}>
                        Onthouden van uw cookievoorkeuren
                      </td>
                      <td data-label="Partij" className={`${CEL} ${CEL_LABEL}`}>
                        Axeptio
                      </td>
                      <td data-label="Bewaartermijn" className={`${CEL} ${CEL_LABEL}`}>
                        12 maanden
                      </td>
                    </tr>
                    <tr className={RIJ}>
                      <td className={`${CEL} max-sm:pt-0 max-sm:font-bold max-sm:text-primary`}>
                        axeptio_authorized_vendors
                      </td>
                      <td data-label="Doel" className={`${CEL} ${CEL_LABEL}`}>
                        Onthouden welke partijen u heeft toegestaan
                      </td>
                      <td data-label="Partij" className={`${CEL} ${CEL_LABEL}`}>
                        Axeptio
                      </td>
                      <td data-label="Bewaartermijn" className={`${CEL} ${CEL_LABEL}`}>
                        12 maanden
                      </td>
                    </tr>
                    <tr className={RIJ}>
                      <td className={`${CEL} max-sm:pt-0 max-sm:font-bold max-sm:text-primary`}>
                        axeptio_all_vendors
                      </td>
                      <td data-label="Doel" className={`${CEL} ${CEL_LABEL}`}>
                        Onthouden van de beschikbare partijen op het moment van uw
                        keuze
                      </td>
                      <td data-label="Partij" className={`${CEL} ${CEL_LABEL}`}>
                        Axeptio
                      </td>
                      <td data-label="Bewaartermijn" className={`${CEL} ${CEL_LABEL}`}>
                        12 maanden
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="mt-6 mb-2.5 font-['Inter_Tight',_'Inter',_sans-serif] text-[16.5px] font-bold text-primary">
                4.2 Analytische cookies
              </h3>
              <p className="hs-tekst text-[15px] leading-[1.7] md:text-[16px] mb-4">
                Deze cookies gebruiken wij om te meten hoe bezoekers onze website
                gebruiken, zodat wij de website kunnen verbeteren. Ze worden
                uitsluitend geplaatst nadat u daarvoor toestemming heeft gegeven.
              </p>
              <p className="mb-3 text-[15px] font-bold text-primary">
                Google Analytics 4 (Google)
              </p>
              <div className="hs-tegel mb-6 overflow-x-auto">
                <table className={TABEL}>
                  <thead>
                    <tr className="bg-[hsl(var(--rs-hoofd-midden))]">
                      <th className={KOPCEL}>
                        Cookie
                      </th>
                      <th className={KOPCEL}>
                        Doel
                      </th>
                      <th className={KOPCEL}>
                        Partij
                      </th>
                      <th className={KOPCEL}>
                        Bewaartermijn
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className={RIJ}>
                      <td className={`${CEL} max-sm:pt-0 max-sm:font-bold max-sm:text-primary`}>
                        _ga
                      </td>
                      <td data-label="Doel" className={`${CEL} ${CEL_LABEL}`}>
                        Onderscheiden van unieke bezoekers
                      </td>
                      <td data-label="Partij" className={`${CEL} ${CEL_LABEL}`}>
                        Google
                      </td>
                      <td data-label="Bewaartermijn" className={`${CEL} ${CEL_LABEL}`}>
                        2 jaar
                      </td>
                    </tr>
                    <tr className={RIJ}>
                      <td className={`${CEL} max-sm:pt-0 max-sm:font-bold max-sm:text-primary`}>
                        _ga_&lt;id&gt;
                      </td>
                      <td data-label="Doel" className={`${CEL} ${CEL_LABEL}`}>
                        Bewaren van de sessiestatus
                      </td>
                      <td data-label="Partij" className={`${CEL} ${CEL_LABEL}`}>
                        Google
                      </td>
                      <td data-label="Bewaartermijn" className={`${CEL} ${CEL_LABEL}`}>
                        2 jaar
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="hs-tekst text-[15px] leading-[1.7] md:text-[16px] mb-5">
                Afhankelijk van de configuratie kunnen ook de cookies{" "}
                <code>_gid</code> (24 uur) en <code>_gat</code> (1 minuut) worden
                geplaatst.
              </p>

              <p className="mb-3 text-[15px] font-bold text-primary">
                Microsoft Clarity (Microsoft)
              </p>
              <p className="hs-tekst text-[15px] leading-[1.7] md:text-[16px] mb-4">
                Met Microsoft Clarity meten wij het gedrag van bezoekers, onder
                meer via heatmaps en sessieweergaven, om de gebruiksvriendelijkheid
                te verbeteren.
              </p>
              <div className="hs-tegel mb-6 overflow-x-auto">
                <table className={TABEL}>
                  <thead>
                    <tr className="bg-[hsl(var(--rs-hoofd-midden))]">
                      <th className={KOPCEL}>
                        Cookie
                      </th>
                      <th className={KOPCEL}>
                        Doel
                      </th>
                      <th className={KOPCEL}>
                        Partij
                      </th>
                      <th className={KOPCEL}>
                        Bewaartermijn
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className={RIJ}>
                      <td className={`${CEL} max-sm:pt-0 max-sm:font-bold max-sm:text-primary`}>
                        _clck
                      </td>
                      <td data-label="Doel" className={`${CEL} ${CEL_LABEL}`}>
                        Onthouden van een uniek gebruikers-ID
                      </td>
                      <td data-label="Partij" className={`${CEL} ${CEL_LABEL}`}>
                        Microsoft
                      </td>
                      <td data-label="Bewaartermijn" className={`${CEL} ${CEL_LABEL}`}>
                        1 jaar
                      </td>
                    </tr>
                    <tr className={RIJ}>
                      <td className={`${CEL} max-sm:pt-0 max-sm:font-bold max-sm:text-primary`}>
                        _clsk
                      </td>
                      <td data-label="Doel" className={`${CEL} ${CEL_LABEL}`}>
                        Koppelen van paginaweergaven binnen één sessie
                      </td>
                      <td data-label="Partij" className={`${CEL} ${CEL_LABEL}`}>
                        Microsoft
                      </td>
                      <td data-label="Bewaartermijn" className={`${CEL} ${CEL_LABEL}`}>
                        1 dag
                      </td>
                    </tr>
                    <tr className={RIJ}>
                      <td className={`${CEL} max-sm:pt-0 max-sm:font-bold max-sm:text-primary`}>
                        CLID
                      </td>
                      <td data-label="Doel" className={`${CEL} ${CEL_LABEL}`}>
                        Herkennen of Clarity de gebruiker eerder heeft gezien
                      </td>
                      <td data-label="Partij" className={`${CEL} ${CEL_LABEL}`}>
                        Microsoft
                      </td>
                      <td data-label="Bewaartermijn" className={`${CEL} ${CEL_LABEL}`}>
                        1 jaar
                      </td>
                    </tr>
                    <tr className={RIJ}>
                      <td className={`${CEL} max-sm:pt-0 max-sm:font-bold max-sm:text-primary`}>
                        ANONCHK
                      </td>
                      <td data-label="Doel" className={`${CEL} ${CEL_LABEL}`}>
                        Controle op doorgifte van het browser-ID (voor Clarity
                        altijd uitgeschakeld)
                      </td>
                      <td data-label="Partij" className={`${CEL} ${CEL_LABEL}`}>
                        Microsoft
                      </td>
                      <td data-label="Bewaartermijn" className={`${CEL} ${CEL_LABEL}`}>
                        10 minuten
                      </td>
                    </tr>
                    <tr className={RIJ}>
                      <td className={`${CEL} max-sm:pt-0 max-sm:font-bold max-sm:text-primary`}>
                        MR
                      </td>
                      <td data-label="Doel" className={`${CEL} ${CEL_LABEL}`}>
                        Bepalen of het browser-ID (MUID) wordt vernieuwd
                      </td>
                      <td data-label="Partij" className={`${CEL} ${CEL_LABEL}`}>
                        Microsoft
                      </td>
                      <td data-label="Bewaartermijn" className={`${CEL} ${CEL_LABEL}`}>
                        7 dagen
                      </td>
                    </tr>
                    <tr className={RIJ}>
                      <td className={`${CEL} max-sm:pt-0 max-sm:font-bold max-sm:text-primary`}>
                        MUID
                      </td>
                      <td data-label="Doel" className={`${CEL} ${CEL_LABEL}`}>
                        Uniek browser-ID, gedeeld over Microsoft-domeinen
                      </td>
                      <td data-label="Partij" className={`${CEL} ${CEL_LABEL}`}>
                        Microsoft
                      </td>
                      <td data-label="Bewaartermijn" className={`${CEL} ${CEL_LABEL}`}>
                        1 jaar
                      </td>
                    </tr>
                    <tr className={RIJ}>
                      <td className={`${CEL} max-sm:pt-0 max-sm:font-bold max-sm:text-primary`}>
                        SM
                      </td>
                      <td data-label="Doel" className={`${CEL} ${CEL_LABEL}`}>
                        Consistent houden van het browser-ID over
                        Microsoft-domeinen
                      </td>
                      <td data-label="Partij" className={`${CEL} ${CEL_LABEL}`}>
                        Microsoft
                      </td>
                      <td data-label="Bewaartermijn" className={`${CEL} ${CEL_LABEL}`}>
                        sessie
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="mt-6 mb-2.5 font-['Inter_Tight',_'Inter',_sans-serif] text-[16.5px] font-bold text-primary">
                4.3 Marketingcookies
              </h3>
              <p className="hs-tekst text-[15px] leading-[1.7] md:text-[16px] mb-4">
                Deze cookies gebruiken wij om te meten welke advertenties tot een
                aanvraag leiden. Ze worden alleen geplaatst na toestemming.
              </p>
              <p className="mb-3 text-[15px] font-bold text-primary">
                Meta-pixel (Meta)
              </p>
              <p className="hs-tekst text-[15px] leading-[1.7] md:text-[16px] mb-4">
                Met de Meta-pixel zien wij welke advertenties op Facebook en
                Instagram bezoekers naar onze website brengen. Naam, e-mailadres,
                telefoonnummer en adres sturen wij niet naar Meta.
              </p>
              <div className="hs-tegel mb-6 overflow-x-auto">
                <table className={TABEL}>
                  <thead>
                    <tr className="bg-[hsl(var(--rs-hoofd-midden))]">
                      <th className={KOPCEL}>
                        Cookie
                      </th>
                      <th className={KOPCEL}>
                        Doel
                      </th>
                      <th className={KOPCEL}>
                        Partij
                      </th>
                      <th className={KOPCEL}>
                        Bewaartermijn
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className={RIJ}>
                      <td className={`${CEL} max-sm:pt-0 max-sm:font-bold max-sm:text-primary`}>
                        _fbp
                      </td>
                      <td data-label="Doel" className={`${CEL} ${CEL_LABEL}`}>
                        Herkennen van een browser, om bezoeken en aanvragen aan
                        advertenties te koppelen
                      </td>
                      <td data-label="Partij" className={`${CEL} ${CEL_LABEL}`}>
                        Meta Platforms Ireland Ltd.
                      </td>
                      <td data-label="Bewaartermijn" className={`${CEL} ${CEL_LABEL}`}>
                        90 dagen
                      </td>
                    </tr>
                    <tr className={RIJ}>
                      <td className={`${CEL} max-sm:pt-0 max-sm:font-bold max-sm:text-primary`}>
                        _fbc
                      </td>
                      <td data-label="Doel" className={`${CEL} ${CEL_LABEL}`}>
                        Onthouden via welke advertentie een bezoek begon
                      </td>
                      <td data-label="Partij" className={`${CEL} ${CEL_LABEL}`}>
                        Meta Platforms Ireland Ltd.
                      </td>
                      <td data-label="Bewaartermijn" className={`${CEL} ${CEL_LABEL}`}>
                        90 dagen
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mb-8 md:mb-10">
              <h2 className="hs-h3 mb-3">
                5. Doorgifte buiten de Europese Economische Ruimte (EER)
              </h2>
              <div className="hs-tekst text-[15px] leading-[1.7] md:text-[16px]">
                <p>
                  Google en Microsoft zijn Amerikaanse partijen. Bij gebruik van hun
                  cookies kunnen persoonsgegevens naar de Verenigde Staten worden
                  doorgegeven. Dat geldt ook voor Meta: Meta Platforms Ireland Ltd.
                  kan gegevens doorgeven aan Meta Platforms, Inc. in de Verenigde
                  Staten. Deze doorgifte vindt plaats op basis van het EU-VS
                  Data Privacy Framework en/of de standaardcontractbepalingen van
                  de Europese Commissie, met passende waarborgen conform hoofdstuk
                  V AVG. Zie ook onze{" "}
                  <a href="/privacy" className="font-semibold text-primary underline underline-offset-2">
                    privacyverklaring
                  </a>
                  .
                </p>
              </div>
            </div>

            <div className="mb-8 md:mb-10">
              <h2 className="hs-h3 mb-3">
                6. Cookies beheren en verwijderen
              </h2>
              <div className="hs-tekst text-[15px] leading-[1.7] md:text-[16px]">
                <p className="mb-3">
                  U kunt uw cookievoorkeuren op elk moment aanpassen of intrekken
                  via het cookievenster op onze website.
                </p>
                <p>
                  Daarnaast kunt u cookies beheren en verwijderen via de
                  instellingen van uw browser. Raadpleeg de helpfunctie van uw
                  browser voor meer informatie. Houd er rekening mee dat het
                  uitschakelen van cookies invloed kan hebben op de werking van
                  onze website.
                </p>
              </div>
            </div>

            <div className="mb-8 md:mb-10">
              <h2 className="hs-h3 mb-3">
                7. Wijzigingen
              </h2>
              <div className="hs-tekst text-[15px] leading-[1.7] md:text-[16px]">
                <p>
                  Wij kunnen deze cookieverklaring wijzigen wanneer de cookies op
                  onze website veranderen. De meest actuele versie publiceren wij
                  op onze website.
                </p>
              </div>
            </div>

            <div className="mb-8 md:mb-10">
              <h2 className="hs-h3 mb-3">
                8. Contact
              </h2>
              <div className="hs-tekst text-[15px] leading-[1.7] md:text-[16px]">
                <p className="mb-2">
                  Heeft u vragen over deze cookieverklaring? Neem contact met ons
                  op:
                </p>
                <p className="mb-1">
                  <strong>Voortraject VOF</strong>
                </p>
                <p className="mb-1">
                  Viaductstraat 3-15, 9725 BG Groningen
                </p>
                <p className="mb-1">KvK-nummer: 42066892</p>
                <p>
                  <a
                    href="mailto:info@voortraject.nl"
                    className="font-semibold text-primary underline underline-offset-2"
                  >
                    info@voortraject.nl
                  </a>
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Cookie;
