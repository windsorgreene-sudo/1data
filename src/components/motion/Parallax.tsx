import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { useRef, type ReactNode } from "react";

interface ParallaxProps {
  children: ReactNode;
  offset?: number;
  axis?: "x" | "y";
  className?: string;
  smooth?: boolean;
}

export const Parallax = ({ children, offset = 80, axis = "y", className, smooth = false }: ParallaxProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const raw = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [offset, -offset]);
  const sprung = useSpring(raw, { stiffness: 120, damping: 30, mass: 0.4 });
  const v = smooth ? sprung : raw;
  return (
    <motion.div ref={ref} className={className} style={axis === "y" ? { y: v } : { x: v }}>
      {children}
    </motion.div>
  );
};
