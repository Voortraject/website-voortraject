import {
  MessageCircle,
  FileText,
  ClipboardList,
  CheckCircle,
  ArrowRightCircle,
  type LucideIcon,
} from "lucide-react";
import { SectionHeader } from "../SectionHeader";
import { Card } from "../Card";

const items: { icon: LucideIcon; title: string }[] = [
  { icon: MessageCircle, title: "Bewonerscontact en communicatie" },
  { icon: FileText, title: "Uitleg van subsidies en regelingen" },
  { icon: ClipboardList, title: "Offertevoorbereiding en opmaak" },
  { icon: CheckCircle, title: "Akkoordtraject en dossieropbouw" },
  { icon: ArrowRightCircle, title: "Overdracht naar uitvoering" },
];

export const Problems = () => (
  <section className="bg-white section-pad">
    <div className="container-content">
      <SectionHeader
        title="Het voortraject waar uitvoerders op vastlopen"
        intro="Veel uitvoerders willen groeien, maar verliezen tijd aan bewonersvragen, regelinguitleg, offerte-opmaak en opvolging. Wij nemen dat stuk uit handen en zorgen voor rust, structuur en een professioneler traject — van het eerste bewonerscontact tot het akkoord."
      />

      <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        {items.map(({ icon: Icon, title }) => (
          <Card key={title} className="p-7 flex flex-col items-start">
            <Icon size={32} className="text-primary" strokeWidth={1.6} aria-hidden="true" />
            <h3 className="mt-6 text-[18px] font-semibold leading-snug text-foreground">
              {title}
            </h3>
          </Card>
        ))}
      </div>
    </div>
  </section>
);
