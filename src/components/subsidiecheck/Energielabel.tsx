// Horizontale energielabel-schaal (G links → A rechts), met de actuele klasse
// uitgelicht. De kleuren zijn de officiële EU/NL labelkleuren als design-tokens
// (--label-a … --label-g in src/index.css); de overige klassen tonen we als
// lichte tint. De klasseletter staat er altijd als tekst bij — kleur is nooit
// het enige signaal (toegankelijkheid). A+…A+++++ delen de A-kleur/positie; de
// volledige klasse (bijv. "A+++") tonen we in het actieve vlak.

const SCHAAL = ["G", "F", "E", "D", "C", "B", "A"] as const;
type Letter = (typeof SCHAAL)[number];

const LABEL_VAR: Record<Letter, string> = {
  A: "--label-a",
  B: "--label-b",
  C: "--label-c",
  D: "--label-d",
  E: "--label-e",
  F: "--label-f",
  G: "--label-g",
};

// Op het volle vlak van geel/amber leest donkere inkt beter dan wit.
const INK_DONKER: Partial<Record<Letter, boolean>> = { D: true, E: true };

export const Energielabel = ({ klasse }: { klasse: string }) => {
  const actief = (klasse.trim()[0]?.toUpperCase() ?? "") as Letter;
  const bekend = SCHAAL.includes(actief);

  return (
    <ol
      className="flex items-stretch gap-1"
      aria-label={bekend ? `Energielabel ${klasse}` : "Energielabel onbekend"}
    >
      {SCHAAL.map((letter) => {
        const isActief = bekend && letter === actief;
        const varNaam = LABEL_VAR[letter];
        return (
          <li
            key={letter}
            aria-current={isActief ? "true" : undefined}
            className={`relative flex min-h-[44px] flex-1 items-center justify-center rounded-md text-[15px] font-bold leading-none transition-transform ${
              isActief ? "z-10 ring-4 ring-accent ring-offset-1 ring-offset-card" : ""
            }`}
            style={
              isActief
                ? {
                    backgroundColor: `hsl(var(${varNaam}))`,
                    color: INK_DONKER[letter] ? "hsl(var(--foreground))" : "#fff",
                  }
                : { backgroundColor: `hsl(var(${varNaam}) / 0.4)`, color: "hsl(var(--foreground) / 0.6)" }
            }
          >
            {isActief ? klasse : letter}
          </li>
        );
      })}
    </ol>
  );
};
