const points = [
  {
    title: "Minder druk op de ondernemer",
    body: "Jullie focus blijft op de uitvoering.",
  },
  {
    title: "Bewoners beter begeleid",
    body: "Duidelijke uitleg en persoonlijk contact vergroten het vertrouwen.",
  },
  {
    title: "Offertes sneller en duidelijker",
    body: "Gestructureerde voorbereiding bespaart tijd en voorkomt misverstanden.",
  },
  {
    title: "Hogere kans op akkoord",
    body: "Een goed voortraject leidt vaker tot een getekende opdracht.",
  },
  {
    title: "Schaalbaar zonder direct extra personeel",
    body: "Jullie kunnen meer trajecten aannemen zonder intern te hoeven uitbreiden.",
  },
];

export const Why = () => (
  <section className="bg-background section-pad border-t border-border">
    <div className="container-content">
      <div className="grid lg:grid-cols-5 gap-12 lg:gap-20">
        <div className="lg:col-span-2">
          <div className="lg:sticky lg:top-32">
            <h2 className="h2-section">
              Waarom uitvoerders voor ons kiezen
            </h2>
          </div>
        </div>
        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-10">
            {points.map((p, i) => (
              <div
                key={p.title}
                className={i === points.length - 1 ? "sm:col-span-2" : ""}
              >
                <div
                  className="font-display font-light text-[48px] leading-none tabular-nums text-accent"
                >
                  {String(i + 1).padStart(2, "0")}
                </div>
                <h3 className="mt-2 font-display font-semibold text-[18px] tracking-[-0.02em] text-primary">
                  {p.title}
                </h3>
                <p className="mt-2 text-[15px] leading-[1.5] text-muted-foreground">
                  {p.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </section>
);
