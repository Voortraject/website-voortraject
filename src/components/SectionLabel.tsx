interface SectionLabelProps {
  number: string;
  label: string;
}

export const SectionLabel = ({ number, label }: SectionLabelProps) => (
  <p
    className="font-sans font-medium uppercase text-accent text-[13px]"
    style={{ letterSpacing: "0.1em" }}
  >
    {number} / {label}
  </p>
);
