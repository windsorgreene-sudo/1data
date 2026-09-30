import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { ReactNode } from "react";
import { EASE_OUT } from "@/lib/motion";

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  x?: number;
  blur?: boolean;
  duration?: number;
  scale?: number;
}

const VIEWPORT = { once: true, margin: "0px 0px -8% 0px" } as const;

export const Reveal = ({
  children,
  className,
  delay = 0,
  y = 28,
  x = 0,
  blur = false,
  duration = 0.9,
  scale = 1,
}: RevealProps) => {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={
        reduce
          ? { opacity: 0 }
          : { opacity: 0, y, x, scale, filter: blur ? "blur(10px)" : "blur(0px)" }
      }
      whileInView={{ opacity: 1, y: 0, x: 0, scale: 1, filter: "blur(0px)" }}
      viewport={VIEWPORT}
      transition={{ duration, ease: EASE_OUT, delay }}
    >
      {children}
    </motion.div>
  );
};

interface StaggerProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  gap?: number;
  as?: "div" | "ul" | "ol";
}

export const Stagger = ({ children, className, delay = 0, gap = 0.08, as = "div" }: StaggerProps) => {
  const variants: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: gap, delayChildren: delay } },
  };
  const Comp = as === "ul" ? motion.ul : as === "ol" ? motion.ol : motion.div;
  return (
    <Comp className={className} initial="hidden" whileInView="show" viewport={VIEWPORT} variants={variants}>
      {children}
    </Comp>
  );
};

interface StaggerItemProps {
  children: ReactNode;
  className?: string;
  y?: number;
  as?: "div" | "li";
}

export const StaggerItem = ({ children, className, y = 26, as = "div" }: StaggerItemProps) => {
  const reduce = useReducedMotion();
  const variants: Variants = {
    hidden: reduce ? { opacity: 0 } : { opacity: 0, y },
    show: { opacity: 1, y: 0, transition: { duration: 0.85, ease: EASE_OUT } },
  };
  const Comp = as === "li" ? motion.li : motion.div;
  return (
    <Comp className={className} variants={variants}>
      {children}
    </Comp>
  );
};
