import { useEffect, useRef, useState } from "react";
import {
  MessageCircle,
  FileText,
  ClipboardList,
  CheckCircle,
  ArrowRightCircle,
  type LucideIcon,
} from "lucide-react";

const items: { icon: LucideIcon; title: string }[] = [
  { icon: MessageCircle, title: "Bewonerscontact en communicatie" },
  { icon: FileText, title: "Uitleg van subsidies en regelingen" },
  { icon: ClipboardList, title: "Offertevoorbereiding en opmaak" },
  { icon: CheckCircle, title: "Akkoordtraject en dossieropbouw" },
  { icon: ArrowRightCircle, title: "Overdracht naar uitvoering" },
];

export const Problems = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setVisible(true);
            obs.disconnect();
          }
        });
      },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="bg-background section-pad border-t border-border"
    >
      <div className="container-content">
        <div className="max-w-[900px]">
          <h2 className="h2-section">
            Het voortraject waar uitvoerders op{" "}
            <span style={{ color: "hsl(var(--accent))" }}>vastlopen</span>
          </h2>
        </div>

        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {items.map(({ icon: Icon, title }, i) => (
            <div
              key={title}
              className="group flex flex-col items-start p-6 rounded-[12px] transition-all duration-200 hover:bg-[#FDF6E3]"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(20px)",
                transition: `opacity 400ms ease-out ${i * 100}ms, transform 400ms ease-out ${i * 100}ms, background-color 200ms ease`,
              }}
            >
              <div
                className="flex items-center justify-center rounded-full transition-colors duration-200 group-hover:bg-accent"
                style={{
                  width: 56,
                  height: 56,
                  backgroundColor: "#F0E4D0",
                }}
              >
                <Icon
                  size={24}
                  strokeWidth={2.5}
                  className="text-primary transition-colors duration-200 group-hover:text-white"
                  aria-hidden="true"
                />
              </div>
              <h3 className="mt-6 font-display font-semibold text-[18px] tracking-[-0.02em] leading-snug text-foreground transition-all duration-200 group-hover:[text-decoration:underline] group-hover:[text-decoration-color:hsl(var(--accent))] group-hover:[text-decoration-thickness:2px] group-hover:[text-underline-offset:4px]">
                {title}
              </h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
