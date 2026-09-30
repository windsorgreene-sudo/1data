import { motion, useReducedMotion, useSpring } from "framer-motion";
import type { PointerEvent, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { trackPointer } from "./Spotlight";

interface TiltProps {
  children: ReactNode;
  max?: number;
  className?: string;
  spotlight?: boolean;
  depth?: boolean;
  lift?: number;
  perspective?: number | false;
}

export const Tilt = ({
  children,
  max = 5,
  className,
  spotlight = true,
  depth = false,
  lift = 0,
  perspective = 1100,
}: TiltProps) => {
  const reduce = useReducedMotion();
  const rx = useSpring(0, { stiffness: 160, damping: 18, mass: 0.5 });
  const ry = useSpring(0, { stiffness: 160, damping: 18, mass: 0.5 });
  const scale = useSpring(1, { stiffness: 220, damping: 22, mass: 0.5 });
  const track = depth || spotlight;

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (track) trackPointer(e);
    if (reduce || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    ry.set(px * max * 2);
    rx.set(-py * max * 2);
    if (lift) scale.set(1 + lift);
  };

  const reset = () => {
    rx.set(0);
    ry.set(0);
    scale.set(1);
  };

  const persp = perspective === false ? {} : { transformPerspective: perspective };

  if (depth) {
    return (
      <motion.div
        onPointerMove={onMove}
        onPointerLeave={reset}
        style={{ rotateX: rx, rotateY: ry, scale, transformStyle: "preserve-3d", ...persp }}
        className={cn("tilt-depth relative", className)}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      onPointerMove={onMove}
      onPointerLeave={reset}
      style={{ rotateX: rx, rotateY: ry, ...persp }}
      className={cn(spotlight && "spotlight", className)}
    >
      {children}
    </motion.div>
  );
};

export const TiltLayer = ({ z, className, children }: { z: number; className?: string; children?: ReactNode }) => (
  <div
    className={cn("relative", className)}
    style={{ transform: `translateZ(${z}px)`, transformStyle: "preserve-3d" }}
  >
    {children}
  </div>
);
