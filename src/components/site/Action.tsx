import { ArrowRight, ArrowUpRight } from "lucide-react";
import { forwardRef, type ReactNode, type Ref } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "beam" | "ghost";
type Size = "sm" | "md" | "lg";
type Icon = "arrow" | "external" | "none";

const base =
  "group/action relative inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium tracking-[-0.01em] transition-[background-color,color,box-shadow,border-color,transform] duration-500 ease-out-expo active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50";

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-[13px]",
  md: "h-11 px-5 text-sm",
  lg: "h-[52px] px-7 text-[15px]",
};

const variants: Record<Variant, string> = {
  primary:
    "bg-bone text-ink hover:bg-white hover:shadow-[0_0_0_5px_hsl(var(--bone)/0.1),0_14px_40px_-12px_hsl(var(--bone)/0.5)]",
  secondary:
    "border border-white/[0.14] bg-white/[0.03] text-bone backdrop-blur-sm hover:border-white/30 hover:bg-white/[0.07]",
  beam: "bg-beam text-ink hover:shadow-[0_0_0_5px_hsl(var(--beam)/0.16),0_14px_44px_-10px_hsl(var(--beam)/0.65)]",
  ghost: "h-auto px-0 text-bone/80 hover:text-bone",
};

export const ArrowSwap = ({ icon = "arrow", className }: { icon?: Icon; className?: string }) => {
  if (icon === "none") return null;
  const Glyph = icon === "external" ? ArrowUpRight : ArrowRight;
  const out =
    icon === "external"
      ? "group-hover/action:translate-x-full group-hover/action:-translate-y-full"
      : "group-hover/action:translate-x-full";
  const inn =
    icon === "external"
      ? "-translate-x-full translate-y-full group-hover/action:translate-x-0 group-hover/action:translate-y-0"
      : "-translate-x-full group-hover/action:translate-x-0";
  return (
    <span className={cn("relative inline-flex h-4 w-4 overflow-hidden", className)} aria-hidden>
      <Glyph className={cn("absolute inset-0 h-4 w-4 transition-transform duration-500 ease-out-expo", out)} strokeWidth={2} />
      <Glyph className={cn("absolute inset-0 h-4 w-4 transition-transform duration-500 ease-out-expo", inn)} strokeWidth={2} />
    </span>
  );
};

interface ActionProps {
  children: ReactNode;
  to?: string;
  href?: string;
  onClick?: () => void;
  variant?: Variant;
  size?: Size;
  icon?: Icon;
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
  newTab?: boolean;
  "aria-label"?: string;
}

export const Action = forwardRef<HTMLElement, ActionProps>(
  (
    {
      children,
      to,
      href,
      onClick,
      variant = "primary",
      size = "md",
      icon = "arrow",
      className,
      type = "button",
      disabled,
      newTab,
      ...aria
    },
    ref,
  ) => {
    const classes = cn(base, sizes[size], variants[variant], className);
    const content = (
      <>
        <span className="relative">{children}</span>
        <ArrowSwap icon={icon} />
      </>
    );

    if (to) {
      return (
        <Link ref={ref as Ref<HTMLAnchorElement>} to={to} onClick={onClick} className={classes} {...aria}>
          {content}
        </Link>
      );
    }

    if (href) {
      const external = newTab ?? /^https?:/.test(href);
      return (
        <a
          ref={ref as Ref<HTMLAnchorElement>}
          href={href}
          onClick={onClick}
          className={classes}
          target={external ? "_blank" : undefined}
          rel={external ? "noopener noreferrer" : undefined}
          {...aria}
        >
          {content}
        </a>
      );
    }

    return (
      <button
        ref={ref as Ref<HTMLButtonElement>}
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={classes}
        {...aria}
      >
        {content}
      </button>
    );
  },
);

Action.displayName = "Action";
