import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MarqueeProps {
  children: ReactNode;
  duration?: number;
  reverse?: boolean;
  vertical?: boolean;
  pauseOnHover?: boolean;
  className?: string;
  trackClassName?: string;
  fade?: boolean;
}

export const Marquee = ({
  children,
  duration = 40,
  reverse = false,
  vertical = false,
  pauseOnHover = true,
  className,
  trackClassName,
  fade = true,
}: MarqueeProps) => (
  <div
    className={cn(
      "group relative flex overflow-hidden",
      vertical ? "flex-col" : "flex-row",
      fade && (vertical ? "mask-fade-y" : "mask-fade-x"),
      className,
    )}
  >
    <div
      className={cn(
        "flex shrink-0",
        vertical ? "animate-marquee-y flex-col" : "w-max animate-marquee flex-row",
        pauseOnHover && "group-hover:[animation-play-state:paused]",
        trackClassName,
      )}
      style={
        {
          "--marquee-duration": `${duration}s`,
          animationDirection: reverse ? "reverse" : "normal",
        } as CSSProperties
      }
    >
      <div className={cn("flex shrink-0", vertical ? "flex-col" : "flex-row items-center")}>{children}</div>
      <div aria-hidden className={cn("flex shrink-0", vertical ? "flex-col" : "flex-row items-center")}>
        {children}
      </div>
    </div>
  </div>
);
