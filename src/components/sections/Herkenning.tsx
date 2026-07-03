import { Coins, MessagesSquare, Scale } from "lucide-react";

const twijfels = [
  {
    icon: MessagesSquare,
    title: "Iedereen zegt iets anders",
    body: "De installateur adviseert een warmtepomp, de buurman zegt eerst isoleren, online lees je: wacht nog even. Wie heeft er gelijk?",
  },
  {
    icon: Scale,
    title: "Ik wil geen verkooppraatje",
    body: "Elk “gratis advies” blijkt een offerte voor het product dat ze toevallig verkopen. Je zoekt iemand zonder eigen belang.",
  },
  {
    icon: Coins,
    title: "Bang om geld te laten liggen",
    body: "Er zijn meer regelingen dan je denkt en sommige kun je stapelen. Niemand wil achteraf horen dat hij duizenden euro’s heeft gemist.",
  },
];

export const Herkenning = () => (
  <section className="section-pad-home" style={{ backgroundColor: "#F5F3ED" }} aria-labelledby="herkenning-title">
    <div className="container-home">
      <div className="max-w-3xl">
        <h2 id="herkenning-title" className="h2-section">
          Verduurzamen zou niet zo <span className="text-accent">ingewikkeld</span> moeten zijn
        </h2>
        <p className="mt-4 text-[18px] md:text-[20px] leading-[1.6] text-muted-foreground">
          Je wilt wel, maar zodra je je erin verdiept loop je tegen dezelfde muren aan.
        </p>
      </div>

      <div className="mt-8 md:mt-10 grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 items-stretch">
        {twijfels.map(({ icon: Icon, title, body }) => (
          <article
            key={title}
            className="bg-card rounded-2xl border border-border p-6 md:p-7 flex flex-col transition-all duration-200 ease-out hover:-translate-y-0.5"
            style={{ boxShadow: "0 4px 24px hsl(var(--primary) / 0.06)" }}
          >
            <div className="flex items-center gap-3.5">
              <span className="inline-flex shrink-0 w-11 h-11 items-center justify-center rounded-full bg-accent">
                <Icon size={20} className="text-primary" aria-hidden="true" />
              </span>
              <h3 className="font-display font-semibold text-primary text-[18px] leading-[1.25] tracking-[-0.01em]">
                {title}
              </h3>
            </div>
            <p className="mt-3 text-[15px] leading-[1.6] text-muted-foreground">{body}</p>
          </article>
        ))}
      </div>
    </div>
  </section>
);
