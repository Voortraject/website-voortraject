import { useRef } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Seo } from "@/components/Seo";
import { CtaButton } from "@/components/CtaButton";
import { Cijfers } from "@/components/sections/Cijfers";
import { UserCheck, ShieldCheck, Zap, FolderCheck, Mail } from "lucide-react";
import { TEAM, teamJsonLd } from "@/config/team";
import { useStaffel } from "@/lib/beweging";

const howWeWork = [
  {
    icon: UserCheck,
    title: "Één vaste begeleider",
    desc: "Je werkt altijd met dezelfde persoon. Die kent jouw dossier, jouw woning en jouw situatie.",
  },
  {
    icon: ShieldCheck,
    title: "Eerlijk advies",
    desc: "Wij verkopen niets. Geen installaties, geen materiaal. Alleen advies dat in jouw belang is.",
  },
  {
    icon: Zap,
    title: "Snel en zonder wachtrijen",
    desc: "Geen maanden wachten op een afspraak. Wij schakelen snel en houden de voortgang scherp in de gaten.",
  },
  {
    icon: FolderCheck,
    title: "Alles netjes vastgelegd",
    desc: "Afspraken, dossiers en vervolgstappen worden bijgehouden zodat niets verloren gaat.",
  },
];

// Huisstijl oktober 2026 (src/styles/huisstijl.css): koppen met een oker
// markeerstreep, tegels met schaduw in plaats van randen, inktblauwe rondjes.
const OverOns = () => {
  const main = useRef<HTMLElement>(null);
  useStaffel(main);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Seo
        title="Over ons | Voortraject"
        description="Maak kennis met het team van Voortraject. Een klein, vast team dat het hele verduurzamingstraject voor uitvoerders en bewoners overziet."
        path="/over-ons"
        jsonLd={teamJsonLd}
      />
      <Header />
      <main ref={main} className="flex-1">
        {/* Origin story */}
        <section className="hs-band pt-10 pb-12 md:py-[88px]">
          <div className="container-content">
            <h2 className="hs-h2 text-center">
              Hoe Voortraject is <span className="hs-accent">ontstaan</span>
            </h2>
            <div className="hs-tekst mx-auto mt-4 md:mt-6 max-w-3xl text-center text-[16.5px] md:text-[18px] leading-[1.6]">
              <p className="mb-4">
                Verduurzamingsbedrijven verloren te veel tijd aan alles behalve bouwen. Bewoners wachtten maanden op duidelijkheid en werden van het kastje naar de muur gestuurd.
              </p>
              <p className="mb-4">
                Wij zagen dat het anders kon. Niet met een loket of een app, maar met mensen die het voortraject serieus nemen: van eerste vraag tot getekend akkoord en verder. Geen verkooppraatje, geen standaardadvies. Gewoon iemand die meekijkt, regelt en opvolgt.
              </p>
              <p className="font-bold text-primary">Dat is Voortraject.</p>
            </div>
          </div>
        </section>

        {/* Team. Op de telefoon een lage tegel met de foto náást de naam (vier
            portretten onder elkaar kostten anders ruim twee schermen); vanaf sm
            de staande kaart. De foto's zijn 4:5 met de ogen op 31%, dus het
            fotovak blijft 4:5 en de uitsnede bovenaan. */}
        <section className="py-12 md:py-[88px]" aria-label="Het team">
          <div className="container-content">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 max-w-6xl mx-auto">
              {TEAM.map((p) => (
                <article
                  key={p.name}
                  data-veer
                  className="hs-tegel overflow-hidden flex flex-row sm:flex-col"
                >
                  <div className="w-[104px] shrink-0 sm:w-full aspect-[4/5] overflow-hidden bg-secondary">
                    <img
                      src={p.img}
                      alt={p.name}
                      loading="lazy"
                      className="w-full h-full object-cover"
                      style={{ objectPosition: "top center" }}
                    />
                  </div>
                  <div className="min-w-0 flex-1 flex flex-col justify-center px-4 py-4 sm:justify-start sm:px-6 sm:py-5">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="hs-h3 text-[19px] md:text-[20px]">{p.name}</h3>
                      {/* Direct mailen naar de persoon zelf: wie al weet wie hij
                          nodig heeft, hoeft niet langs het contactformulier. Het
                          adres staat alleen in de link, niet als tekst op de
                          kaart. */}
                      <a
                        href={`mailto:${p.email}`}
                        title={`Mail ${p.name}: ${p.email}`}
                        aria-label={`Mail ${p.name} op ${p.email}`}
                        className="hs-rondje hs-klik h-9 w-9 bg-[hsl(var(--rs-hoofd-midden))] text-primary focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-accent"
                      >
                        <Mail className="w-[17px] h-[17px]" aria-hidden="true" />
                      </a>
                    </div>
                    <p className="hs-tekst mt-0.5 text-[14px] leading-snug">{p.specialty}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Cijferband: het harde bewijs onder het verhaal, vlak voordat we
            vertellen hoe we werken. */}
        <Cijfers />

        {/* Hoe wij werken */}
        <section className="hs-band py-12 md:py-[88px]">
          <div className="container-content">
            <div className="text-center mb-6 md:mb-10">
              <h2 className="hs-h2">
                Hoe wij <span className="hs-accent">werken</span>
              </h2>
              <p className="hs-tekst mx-auto mt-3 md:mt-4 max-w-[560px] text-[16px] md:text-[18px] leading-[1.6]">
                Geen groot kantoor, geen anonieme helpdesk. Wij werken met een klein, vast team dat het hele traject overziet.
              </p>
            </div>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-5 max-w-4xl mx-auto">
              {howWeWork.map(({ icon: Icon, title, desc }) => (
                <li
                  key={title}
                  data-veer
                  className="hs-tegel hs-blauw-zacht p-[18px] md:p-6"
                >
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="hs-h3">{title}</h3>
                    <span className="hs-rondje hs-rondje-ink" aria-hidden="true">
                      <Icon size={19} strokeWidth={2} />
                    </span>
                  </div>
                  <p className="hs-tekst mt-2 text-[15px] leading-[1.6]">{desc}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>
      <Footer
        cta={
          /* Slot-CTA in het donkere paneel van de footer. */
          <section className="hs-op-donker pt-[60px] pb-4 md:pt-[88px]">
            <div className="container-content text-center flex flex-col items-center">
              <h2 className="hs-h2 max-w-[900px] text-primary-foreground">
                Wil je weten wie je aan de lijn krijgt?
              </h2>
              <p className="mt-3.5 max-w-[560px] text-[16px] leading-[1.6] text-primary-foreground/85">
                Plan een vrijblijvende kennismaking. We vertellen je precies wie wat doet en hoe een traject eruitziet.
              </p>
              <CtaButton href="/contact" className="mt-7 w-full sm:w-auto">
                Plan een kennismaking
              </CtaButton>
            </div>
          </section>
        }
      />
    </div>
  );
};

export default OverOns;
