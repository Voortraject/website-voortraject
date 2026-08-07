const cols = [
  {
    id: "voor-bewoners",
    eyebrow: "BEWONERS",
    title: "Helder advies, begeleiding tot uitvoering",
    body: "Wij bieden bewoners duidelijkheid over isolatie, installaties en regelingen, en begeleiden hen richting een betrouwbare uitvoerder.",
    cta: "Bekijk wat we voor bewoners doen",
    href: "/bewoners",
  },
  {
    id: "voor-uitvoerders",
    eyebrow: "UITVOERDERS",
    title: "Groeien zonder extra personeel",
    body: "Wij helpen kleine en middelgrote uitvoerders om sneller en professioneler te werken in verduurzamingstrajecten. Van intake tot akkoord, jullie kunnen zich richten op de uitvoering.",
    cta: "Bekijk wat we voor uitvoerders doen",
    href: "/zakelijk",
  },
];

export const Audiences = () => (
  <section className="bg-secondary section-pad">
    <div className="container-content">
      <div className="max-w-[720px]">
        <h2 className="h2-section text-foreground">Twee ingangen, één aanpak</h2>
      </div>

      <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-12">
        {cols.map((c) => (
          <article
            key={c.id}
            id={c.id}
            className="bg-white rounded-xl shadow-card p-10 md:p-12 flex flex-col"
          >
            <span className="label-eyebrow">{c.eyebrow}</span>
            <h3 className="h3-block mt-5 text-foreground">{c.title}</h3>
            <p className="mt-5 body-lg text-muted-foreground">{c.body}</p>
            <a
              href={c.href}
              className="mt-8 inline-flex items-center gap-1.5 text-[15px] font-medium text-primary hover:underline underline-offset-4"
            >
              {c.cta} →
            </a>
          </article>
        ))}
      </div>
    </div>
  </section>
);
