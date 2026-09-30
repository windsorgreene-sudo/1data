import { forwardRef, type HTMLAttributes, type PointerEvent } from "react";
import { cn } from "@/lib/utils";

export const trackPointer = (e: PointerEvent<HTMLElement>) => {
  const el = e.currentTarget;
  const r = el.getBoundingClientRect();
  el.style.setProperty("--mx", `${e.clientX - r.left}px`);
  el.style.setProperty("--my", `${e.clientY - r.top}px`);
};

export const Spotlight = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, onPointerMove, children, ...rest }, ref) => (
    <div
      ref={ref}
      onPointerMove={(e) => {
        trackPointer(e);
        onPointerMove?.(e);
      }}
      className={cn("spotlight", className)}
      {...rest}
    >
      {children}
    </div>
  ),
);

Spotlight.displayName = "Spotlight";
