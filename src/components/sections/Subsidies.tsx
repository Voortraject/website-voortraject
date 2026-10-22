import { Fragment, useRef } from "react";
import { ArrowRight, Building2, Globe, Map, Plus } from "lucide-react";

import { CtaButton } from "@/components/CtaButton";
import { useStaffel } from "@/lib/beweging";

const niveaus = [
  {
    icon: Globe,
    title: "Landelijke subsidies",
    body: "Zoals ISDE: een landelijke regeling die gewoon bovenop andere regelingen komt.",
    linkLabel: "Meer over landelijke subsidies",
    linkHref: "/subsidies/landelijk",
    tint: "hs-blauw",
    rondje: "hs-rondje-ink",
  },
  {
    icon: Map,
    title: "Provinciale subsidies",
    body: "Zoals Nij Begun: vergoedt isolatie voor eigenaar-bewoners in Groningen en Noord-Drenthe.",
    linkLabel: "Meer over regionale subsidies",
    linkHref: "/subsidies/regionaal",
    tint: "hs-tint-provincie",
    rondje: "hs-rondje-provincie",
  },
  {
    icon: Building2,
    title: "Gemeentelijke subsidies",
    body: "Veel gemeenten hebben daarnaast een eigen bijdrageregeling.",
    linkLabel: "Meer over regionale subsidies",
    linkHref: "/subsidies/regionaal",
    tint: "hs-zand",
    rondje: "hs-rondje-gemeente",
  },
];

// Een wit rondje met een plus, precies over de naad tussen twee kaarten:
// op de telefoon tussen boven en onder, op desktop tussen links en rechts.
const PlusTeken = () => (
  <div className="relative z-10 flex h-0 items-center justify-center md:h-auto" aria-hidden="true">
    <span className="hs-rondje hs-rondje-wit h-9 w-9">
      <Plus size={18} strokeWidth={2.6} />
    </span>
  </div>
);

export const Subsidies = () => {
  const sectie = useRef<HTMLElement>(null);
  useStaffel(sectie);

  return (
    <section ref={sectie} className="section-pad-home bg-background" aria-labelledby="subsidies-title">
      <div className="container-home">
        {/* De knop staat naast de kop en niet onder de kaarten: daar kostte hij
            een hele regel witruimte voor één link. Op desktop lijnt hij uit met
            de onderkant van de intro, op de telefoon valt hij eronder. */}
        <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-end md:gap-10" data-veer>
          <div className="min-w-0">
            <h2 id="subsidies-title" className="hs-h2">
              Wist je dat je subsidies kunt <span className="hs-accent">stapelen</span>?
            </h2>
            <p className="hs-tekst mt-3 max-w-[46rem] text-[16.5px] leading-[1.6] md:text-[19px]">
              Landelijk, provinciaal en gemeentelijk: er zijn meer regelingen dan de meeste mensen
              weten, en vaak zijn ze te combineren.
            </p>
          </div>
          <CtaButton href="/subsidies/stapelen" variant="licht" className="justify-self-start">
            Meer over subsidies stapelen
            <ArrowRight size={17} strokeWidth={2.2} className="hs-pijl" aria-hidden="true" />
          </CtaButton>
        </div>

        {/* De stapel: drie niveaus met plustekens ertussen */}
        <div className="mt-6 grid grid-cols-1 items-stretch gap-3 md:mt-10 md:grid-cols-[1fr_44px_1fr_44px_1fr] md:gap-0">
          {niveaus.map(({ icon: Icon, title, body, linkLabel, linkHref, tint, rondje }, i) => (
            <Fragment key={title}>
              <article className={`hs-tegel ${tint} hs-klik flex flex-col px-[18px] pb-4 pt-[18px] md:p-6`} data-veer>
                <div className="flex items-center justify-between gap-3">
                  <h3 className="hs-h3">{title}</h3>
                  <span className={`hs-rondje ${rondje}`} aria-hidden="true">
                    <Icon size={19} strokeWidth={2} />
                  </span>
                </div>
                <p className="hs-tekst mt-2 text-[15px] leading-[1.6]">{body}</p>
                <a href={linkHref} className="hs-pijl-link mt-auto pt-3 text-[14.5px]">
                  {linkLabel}
                  <ArrowRight size={16} strokeWidth={2.2} className="hs-pijl" aria-hidden="true" />
                </a>
              </article>
              {i < niveaus.length - 1 && <PlusTeken />}
            </Fragment>
          ))}
        </div>
      </div>
    </section>
  );
};
