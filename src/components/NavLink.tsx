import { cn } from "@/lib/utils";

interface NavLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  active?: boolean;
}

export const NavLink = ({ className, active, children, ...props }: NavLinkProps) => (
  <a
    className={cn(
      "text-[15px] font-medium text-foreground/80 hover:text-primary transition-colors",
      active && "text-primary",
      className
    )}
    {...props}
  >
    {children}
  </a>
);

export default NavLink;
