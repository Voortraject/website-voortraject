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
        <ol className="lg:col-span-3 space-y-10">
          {points.map((p, i) => (
            <li key={p.title} className="grid grid-cols-[auto_1fr] gap-6">
              <span className="font-display font-light text-[40px] leading-none text-accent tabular-nums">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="font-display font-semibold text-[20px] tracking-[-0.02em] text-foreground">
                  {p.title}
                </h3>
                <p className="mt-2 text-[17px] leading-relaxed text-muted-foreground">
                  {p.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  </section>
);
