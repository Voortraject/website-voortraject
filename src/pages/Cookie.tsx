import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Seo } from "@/components/Seo";

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
            <h1
              style={{
                fontFamily: "'Inter Tight', sans-serif",
                fontWeight: 700,
                color: "#152C4E",
                fontSize: "clamp(28px, 4vw, 40px)",
                letterSpacing: "-0.02em",
                lineHeight: 1.2,
                marginBottom: 8,
              }}
            >
              Cookieverklaring Voortraject
            </h1>
            <p
              style={{
                color: "#6B6B6B",
                fontSize: 15,
                lineHeight: 1.6,
                marginBottom: 40,
                fontStyle: "italic",
              }}
            >
              Versie juni 2026
            </p>

            <div style={{ marginBottom: 32 }}>
              <h2
                style={{
                  fontFamily: "'Inter Tight', sans-serif",
                  fontWeight: 600,
                  color: "#152C4E",
                  fontSize: 18,
                  lineHeight: 1.3,
                  marginBottom: 12,
                }}
              >
                1. Inleiding
              </h2>
              <div
                style={{
                  color: "#4B4B4B",
                  fontSize: 15,
                  lineHeight: 1.7,
                }}
              >
                <p style={{ marginBottom: 12 }}>
                  Deze cookieverklaring hoort bij de website van Voortraject VOF
                  (hierna: "Voortraject", "wij" of "ons"). Hierin leggen wij uit
                  wat cookies zijn, welke cookies wij gebruiken, met welk doel en
                  hoe u uw voorkeuren kunt beheren.
                </p>
                <p>
                  Voor meer informatie over hoe wij met persoonsgegevens omgaan,
                  verwijzen wij naar onze{" "}
                  <a href="/privacy" className="text-accent hover:underline">
                    privacyverklaring
                  </a>
                  .
                </p>
              </div>
            </div>

            <div style={{ marginBottom: 32 }}>
              <h2
                style={{
                  fontFamily: "'Inter Tight', sans-serif",
                  fontWeight: 600,
                  color: "#152C4E",
                  fontSize: 18,
                  lineHeight: 1.3,
                  marginBottom: 12,
                }}
              >
                2. Wat zijn cookies?
              </h2>
              <div
                style={{
                  color: "#4B4B4B",
                  fontSize: 15,
                  lineHeight: 1.7,
                }}
              >
                <p>
                  Cookies zijn kleine tekstbestanden die bij een bezoek aan onze
                  website op uw apparaat (computer, tablet of telefoon) worden
                  opgeslagen. Met cookies en vergelijkbare technieken kunnen wij
                  onze website laten functioneren en het gebruik van de website
                  meten. Sommige cookies worden door ons geplaatst, andere door
                  derde partijen, zoals Google en Microsoft.
                </p>
              </div>
            </div>

            <div style={{ marginBottom: 32 }}>
              <h2
                style={{
                  fontFamily: "'Inter Tight', sans-serif",
                  fontWeight: 600,
                  color: "#152C4E",
                  fontSize: 18,
                  lineHeight: 1.3,
                  marginBottom: 12,
                }}
              >
                3. Uw toestemming
              </h2>
              <div
                style={{
                  color: "#4B4B4B",
                  fontSize: 15,
                  lineHeight: 1.7,
                }}
              >
                <p style={{ marginBottom: 12 }}>
                  Voor noodzakelijke en functionele cookies hebben wij geen
                  toestemming nodig; deze zijn nodig om de website goed te laten
                  werken en om uw cookievoorkeuren te onthouden.
                </p>
                <p style={{ marginBottom: 12 }}>
                  Voor analytische cookies vragen wij vooraf uw toestemming. Deze
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

            <div style={{ marginBottom: 32 }}>
              <h2
                style={{
                  fontFamily: "'Inter Tight', sans-serif",
                  fontWeight: 600,
                  color: "#152C4E",
                  fontSize: 18,
                  lineHeight: 1.3,
                  marginBottom: 12,
                }}
              >
                4. Welke cookies gebruiken wij?
              </h2>

              <h3
                style={{
                  fontFamily: "'Inter Tight', sans-serif",
                  fontWeight: 600,
                  color: "#152C4E",
                  fontSize: 16,
                  lineHeight: 1.3,
                  marginBottom: 12,
                  marginTop: 20,
                }}
              >
                4.1 Noodzakelijke en functionele cookies
              </h3>
              <p
                style={{
                  color: "#4B4B4B",
                  fontSize: 15,
                  lineHeight: 1.7,
                  marginBottom: 16,
                }}
              >
                Deze cookies zijn nodig voor de werking van de website en voor
                het onthouden van uw cookievoorkeuren. Hiervoor is geen toestemming
                vereist.
              </p>
              <div style={{ overflowX: "auto", marginBottom: 24 }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: 14,
                    lineHeight: 1.5,
                  }}
                >
                  <thead>
                    <tr style={{ borderBottom: "2px solid #E5E7EB" }}>
                      <th
                        style={{
                          textAlign: "left",
                          padding: "10px 12px",
                          fontWeight: 600,
                          color: "#152C4E",
                        }}
                      >
                        Cookie
                      </th>
                      <th
                        style={{
                          textAlign: "left",
                          padding: "10px 12px",
                          fontWeight: 600,
                          color: "#152C4E",
                        }}
                      >
                        Doel
                      </th>
                      <th
                        style={{
                          textAlign: "left",
                          padding: "10px 12px",
                          fontWeight: 600,
                          color: "#152C4E",
                        }}
                      >
                        Partij
                      </th>
                      <th
                        style={{
                          textAlign: "left",
                          padding: "10px 12px",
                          fontWeight: 600,
                          color: "#152C4E",
                        }}
                      >
                        Bewaartermijn
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: "1px solid #E5E7EB" }}>
                      <td style={{ padding: "10px 12px", color: "#4B4B4B" }}>
                        axeptio_cookies
                      </td>
                      <td style={{ padding: "10px 12px", color: "#4B4B4B" }}>
                        Onthouden van uw cookievoorkeuren
                      </td>
                      <td style={{ padding: "10px 12px", color: "#4B4B4B" }}>
                        Axeptio
                      </td>
                      <td style={{ padding: "10px 12px", color: "#4B4B4B" }}>
                        12 maanden
                      </td>
                    </tr>
                    <tr style={{ borderBottom: "1px solid #E5E7EB" }}>
                      <td style={{ padding: "10px 12px", color: "#4B4B4B" }}>
                        axeptio_authorized_vendors
                      </td>
                      <td style={{ padding: "10px 12px", color: "#4B4B4B" }}>
                        Onthouden welke partijen u heeft toegestaan
                      </td>
                      <td style={{ padding: "10px 12px", color: "#4B4B4B" }}>
                        Axeptio
                      </td>
                      <td style={{ padding: "10px 12px", color: "#4B4B4B" }}>
                        12 maanden
                      </td>
                    </tr>
                    <tr style={{ borderBottom: "1px solid #E5E7EB" }}>
                      <td style={{ padding: "10px 12px", color: "#4B4B4B" }}>
                        axeptio_all_vendors
                      </td>
                      <td style={{ padding: "10px 12px", color: "#4B4B4B" }}>
                        Onthouden van de beschikbare partijen op het moment van uw
                        keuze
                      </td>
                      <td style={{ padding: "10px 12px", color: "#4B4B4B" }}>
                        Axeptio
                      </td>
                      <td style={{ padding: "10px 12px", color: "#4B4B4B" }}>
                        12 maanden
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3
                style={{
                  fontFamily: "'Inter Tight', sans-serif",
                  fontWeight: 600,
                  color: "#152C4E",
                  fontSize: 16,
                  lineHeight: 1.3,
                  marginBottom: 12,
                  marginTop: 20,
                }}
              >
                4.2 Analytische cookies
              </h3>
              <p
                style={{
                  color: "#4B4B4B",
                  fontSize: 15,
                  lineHeight: 1.7,
                  marginBottom: 16,
                }}
              >
                Deze cookies gebruiken wij om te meten hoe bezoekers onze website
                gebruiken, zodat wij de website kunnen verbeteren. Ze worden
                uitsluitend geplaatst nadat u daarvoor toestemming heeft gegeven.
              </p>
              <p
                style={{
                  fontWeight: 600,
                  color: "#152C4E",
                  fontSize: 15,
                  marginBottom: 12,
                }}
              >
                Google Analytics 4 (Google)
              </p>
              <div style={{ overflowX: "auto", marginBottom: 24 }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: 14,
                    lineHeight: 1.5,
                  }}
                >
                  <thead>
                    <tr style={{ borderBottom: "2px solid #E5E7EB" }}>
                      <th
                        style={{
                          textAlign: "left",
                          padding: "10px 12px",
                          fontWeight: 600,
                          color: "#152C4E",
                        }}
                      >
                        Cookie
                      </th>
                      <th
                        style={{
                          textAlign: "left",
                          padding: "10px 12px",
                          fontWeight: 600,
                          color: "#152C4E",
                        }}
                      >
                        Doel
                      </th>
                      <th
                        style={{
                          textAlign: "left",
                          padding: "10px 12px",
                          fontWeight: 600,
                          color: "#152C4E",
                        }}
                      >
                        Partij
                      </th>
                      <th
                        style={{
                          textAlign: "left",
                          padding: "10px 12px",
                          fontWeight: 600,
                          color: "#152C4E",
                        }}
                      >
                        Bewaartermijn
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: "1px solid #E5E7EB" }}>
                      <td style={{ padding: "10px 12px", color: "#4B4B4B" }}>
                        _ga
                      </td>
                      <td style={{ padding: "10px 12px", color: "#4B4B4B" }}>
                        Onderscheiden van unieke bezoekers
                      </td>
                      <td style={{ padding: "10px 12px", color: "#4B4B4B" }}>
                        Google
                      </td>
                      <td style={{ padding: "10px 12px", color: "#4B4B4B" }}>
                        2 jaar
                      </td>
                    </tr>
                    <tr style={{ borderBottom: "1px solid #E5E7EB" }}>
                      <td style={{ padding: "10px 12px", color: "#4B4B4B" }}>
                        _ga_&lt;id&gt;
                      </td>
                      <td style={{ padding: "10px 12px", color: "#4B4B4B" }}>
                        Bewaren van de sessiestatus
                      </td>
                      <td style={{ padding: "10px 12px", color: "#4B4B4B" }}>
                        Google
                      </td>
                      <td style={{ padding: "10px 12px", color: "#4B4B4B" }}>
                        2 jaar
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p
                style={{
                  color: "#4B4B4B",
                  fontSize: 15,
                  lineHeight: 1.7,
                  marginBottom: 20,
                }}
              >
                Afhankelijk van de configuratie kunnen ook de cookies{" "}
                <code>_gid</code> (24 uur) en <code>_gat</code> (1 minuut) worden
                geplaatst.
              </p>

              <p
                style={{
                  fontWeight: 600,
                  color: "#152C4E",
                  fontSize: 15,
                  marginBottom: 12,
                }}
              >
                Microsoft Clarity (Microsoft)
              </p>
              <p
                style={{
                  color: "#4B4B4B",
                  fontSize: 15,
                  lineHeight: 1.7,
                  marginBottom: 16,
                }}
              >
                Met Microsoft Clarity meten wij het gedrag van bezoekers, onder
                meer via heatmaps en sessieweergaven, om de gebruiksvriendelijkheid
                te verbeteren.
              </p>
              <div style={{ overflowX: "auto", marginBottom: 24 }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: 14,
                    lineHeight: 1.5,
                  }}
                >
                  <thead>
                    <tr style={{ borderBottom: "2px solid #E5E7EB" }}>
                      <th
                        style={{
                          textAlign: "left",
                          padding: "10px 12px",
                          fontWeight: 600,
                          color: "#152C4E",
                        }}
                      >
                        Cookie
                      </th>
                      <th
                        style={{
                          textAlign: "left",
                          padding: "10px 12px",
                          fontWeight: 600,
                          color: "#152C4E",
                        }}
                      >
                        Doel
                      </th>
                      <th
                        style={{
                          textAlign: "left",
                          padding: "10px 12px",
                          fontWeight: 600,
                          color: "#152C4E",
                        }}
                      >
                        Partij
                      </th>
                      <th
                        style={{
                          textAlign: "left",
                          padding: "10px 12px",
                          fontWeight: 600,
                          color: "#152C4E",
                        }}
                      >
                        Bewaartermijn
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: "1px solid #E5E7EB" }}>
                      <td style={{ padding: "10px 12px", color: "#4B4B4B" }}>
                        _clck
                      </td>
                      <td style={{ padding: "10px 12px", color: "#4B4B4B" }}>
                        Onthouden van een uniek gebruikers-ID
                      </td>
                      <td style={{ padding: "10px 12px", color: "#4B4B4B" }}>
                        Microsoft
                      </td>
                      <td style={{ padding: "10px 12px", color: "#4B4B4B" }}>
                        1 jaar
                      </td>
                    </tr>
                    <tr style={{ borderBottom: "1px solid #E5E7EB" }}>
                      <td style={{ padding: "10px 12px", color: "#4B4B4B" }}>
                        _clsk
                      </td>
                      <td style={{ padding: "10px 12px", color: "#4B4B4B" }}>
                        Koppelen van paginaweergaven binnen één sessie
                      </td>
                      <td style={{ padding: "10px 12px", color: "#4B4B4B" }}>
                        Microsoft
                      </td>
                      <td style={{ padding: "10px 12px", color: "#4B4B4B" }}>
                        1 dag
                      </td>
                    </tr>
                    <tr style={{ borderBottom: "1px solid #E5E7EB" }}>
                      <td style={{ padding: "10px 12px", color: "#4B4B4B" }}>
                        CLID
                      </td>
                      <td style={{ padding: "10px 12px", color: "#4B4B4B" }}>
                        Herkennen of Clarity de gebruiker eerder heeft gezien
                      </td>
                      <td style={{ padding: "10px 12px", color: "#4B4B4B" }}>
                        Microsoft
                      </td>
                      <td style={{ padding: "10px 12px", color: "#4B4B4B" }}>
                        1 jaar
                      </td>
                    </tr>
                    <tr style={{ borderBottom: "1px solid #E5E7EB" }}>
                      <td style={{ padding: "10px 12px", color: "#4B4B4B" }}>
                        ANONCHK
                      </td>
                      <td style={{ padding: "10px 12px", color: "#4B4B4B" }}>
                        Controle op doorgifte van het browser-ID (voor Clarity
                        altijd uitgeschakeld)
                      </td>
                      <td style={{ padding: "10px 12px", color: "#4B4B4B" }}>
                        Microsoft
                      </td>
                      <td style={{ padding: "10px 12px", color: "#4B4B4B" }}>
                        10 minuten
                      </td>
                    </tr>
                    <tr style={{ borderBottom: "1px solid #E5E7EB" }}>
                      <td style={{ padding: "10px 12px", color: "#4B4B4B" }}>
                        MR
                      </td>
                      <td style={{ padding: "10px 12px", color: "#4B4B4B" }}>
                        Bepalen of het browser-ID (MUID) wordt vernieuwd
                      </td>
                      <td style={{ padding: "10px 12px", color: "#4B4B4B" }}>
                        Microsoft
                      </td>
                      <td style={{ padding: "10px 12px", color: "#4B4B4B" }}>
                        7 dagen
                      </td>
                    </tr>
                    <tr style={{ borderBottom: "1px solid #E5E7EB" }}>
                      <td style={{ padding: "10px 12px", color: "#4B4B4B" }}>
                        MUID
                      </td>
                      <td style={{ padding: "10px 12px", color: "#4B4B4B" }}>
                        Uniek browser-ID, gedeeld over Microsoft-domeinen
                      </td>
                      <td style={{ padding: "10px 12px", color: "#4B4B4B" }}>
                        Microsoft
                      </td>
                      <td style={{ padding: "10px 12px", color: "#4B4B4B" }}>
                        1 jaar
                      </td>
                    </tr>
                    <tr style={{ borderBottom: "1px solid #E5E7EB" }}>
                      <td style={{ padding: "10px 12px", color: "#4B4B4B" }}>
                        SM
                      </td>
                      <td style={{ padding: "10px 12px", color: "#4B4B4B" }}>
                        Consistent houden van het browser-ID over
                        Microsoft-domeinen
                      </td>
                      <td style={{ padding: "10px 12px", color: "#4B4B4B" }}>
                        Microsoft
                      </td>
                      <td style={{ padding: "10px 12px", color: "#4B4B4B" }}>
                        sessie
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{ marginBottom: 32 }}>
              <h2
                style={{
                  fontFamily: "'Inter Tight', sans-serif",
                  fontWeight: 600,
                  color: "#152C4E",
                  fontSize: 18,
                  lineHeight: 1.3,
                  marginBottom: 12,
                }}
              >
                5. Doorgifte buiten de Europese Economische Ruimte (EER)
              </h2>
              <div
                style={{
                  color: "#4B4B4B",
                  fontSize: 15,
                  lineHeight: 1.7,
                }}
              >
                <p>
                  Google en Microsoft zijn Amerikaanse partijen. Bij gebruik van hun
                  cookies kunnen persoonsgegevens naar de Verenigde Staten worden
                  doorgegeven. Deze doorgifte vindt plaats op basis van het EU-VS
                  Data Privacy Framework en/of de standaardcontractbepalingen van
                  de Europese Commissie, met passende waarborgen conform hoofdstuk
                  V AVG. Zie ook onze{" "}
                  <a href="/privacy" className="text-accent hover:underline">
                    privacyverklaring
                  </a>
                  .
                </p>
              </div>
            </div>

            <div style={{ marginBottom: 32 }}>
              <h2
                style={{
                  fontFamily: "'Inter Tight', sans-serif",
                  fontWeight: 600,
                  color: "#152C4E",
                  fontSize: 18,
                  lineHeight: 1.3,
                  marginBottom: 12,
                }}
              >
                6. Cookies beheren en verwijderen
              </h2>
              <div
                style={{
                  color: "#4B4B4B",
                  fontSize: 15,
                  lineHeight: 1.7,
                }}
              >
                <p style={{ marginBottom: 12 }}>
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

            <div style={{ marginBottom: 32 }}>
              <h2
                style={{
                  fontFamily: "'Inter Tight', sans-serif",
                  fontWeight: 600,
                  color: "#152C4E",
                  fontSize: 18,
                  lineHeight: 1.3,
                  marginBottom: 12,
                }}
              >
                7. Wijzigingen
              </h2>
              <div
                style={{
                  color: "#4B4B4B",
                  fontSize: 15,
                  lineHeight: 1.7,
                }}
              >
                <p>
                  Wij kunnen deze cookieverklaring wijzigen wanneer de cookies op
                  onze website veranderen. De meest actuele versie publiceren wij
                  op onze website.
                </p>
              </div>
            </div>

            <div style={{ marginBottom: 32 }}>
              <h2
                style={{
                  fontFamily: "'Inter Tight', sans-serif",
                  fontWeight: 600,
                  color: "#152C4E",
                  fontSize: 18,
                  lineHeight: 1.3,
                  marginBottom: 12,
                }}
              >
                8. Contact
              </h2>
              <div
                style={{
                  color: "#4B4B4B",
                  fontSize: 15,
                  lineHeight: 1.7,
                }}
              >
                <p style={{ marginBottom: 8 }}>
                  Heeft u vragen over deze cookieverklaring? Neem contact met ons
                  op:
                </p>
                <p style={{ marginBottom: 4 }}>
                  <strong>Voortraject VOF</strong>
                </p>
                <p style={{ marginBottom: 4 }}>
                  Viaductstraat 3-15, 9725 BG Groningen
                </p>
                <p style={{ marginBottom: 4 }}>KvK-nummer: 42066892</p>
                <p>
                  <a
                    href="mailto:info@voortraject.nl"
                    className="text-accent hover:underline font-semibold"
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
