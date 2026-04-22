import {
  MessageCircle,
  FileText,
  ClipboardList,
  CheckCircle,
  ArrowRightCircle,
  type LucideIcon,
} from "lucide-react";
import { SectionLabel } from "../SectionLabel";

const items: { icon: LucideIcon; title: string }[] = [
  { icon: MessageCircle, title: "Bewonerscontact en communicatie" },
  { icon: FileText, title: "Uitleg van subsidies en regelingen" },
  { icon: ClipboardList, title: "Offertevoorbereiding en opmaak" },
  { icon: CheckCircle, title: "Akkoordtraject en dossieropbouw" },
  { icon: ArrowRightCircle, title: "Overdracht naar uitvoering" },
];

export const Problems = () => (
  <section className="bg-background section-pad border-t border-border">
    <div className="container-content">
      <SectionLabel number="01" label="INLEIDING" />
      <div className="mt-16 max-w-[720px]">
        <h2 className="h2-section text-foreground">
          Het voortraject waar uitvoerders op vastlopen
        </h2>
      </div>

      <div className="mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 lg:divide-x lg:divide-border">
        {items.map(({ icon: Icon, title }) => (
          <div
            key={title}
            className="flex flex-col items-start py-6 lg:py-2 lg:px-8 first:lg:pl-0 last:lg:pr-0"
          >
            <Icon size={28} className="text-primary" strokeWidth={1.6} aria-hidden="true" />
            <h3 className="mt-6 font-display font-semibold text-[18px] tracking-[-0.02em] leading-snug text-foreground">
              {title}
            </h3>
          </div>
        ))}
      </div>
    </div>
  </section>
);
