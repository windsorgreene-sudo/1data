import { motion, useReducedMotion, useSpring } from "framer-motion";
import type { PointerEvent, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { trackPointer } from "./Spotlight";

interface TiltProps {
  children: ReactNode;
  max?: number;
  className?: string;
  spotlight?: boolean;
}

export const Tilt = ({ children, max = 5, className, spotlight = true }: TiltProps) => {
  const reduce = useReducedMotion();
  const rx = useSpring(0, { stiffness: 160, damping: 18, mass: 0.5 });
  const ry = useSpring(0, { stiffness: 160, damping: 18, mass: 0.5 });

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (spotlight) trackPointer(e);
    if (reduce || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    ry.set(px * max * 2);
    rx.set(-py * max * 2);
  };

  const reset = () => {
    rx.set(0);
    ry.set(0);
  };

  return (
    <motion.div
      onPointerMove={onMove}
      onPointerLeave={reset}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 1100 }}
      className={cn(spotlight && "spotlight", className)}
    >
      {children}
    </motion.div>
  );
};
