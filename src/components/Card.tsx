import { cn } from "@/lib/utils";

export const Card = ({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "bg-white border border-border rounded-lg shadow-card",
      className
    )}
    {...props}
  >
    {children}
  </div>
);
