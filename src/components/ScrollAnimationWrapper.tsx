import { motion, Variants } from "framer-motion";
import { ReactNode, forwardRef } from "react";

interface ScrollAnimationWrapperProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "fade" | "scale";
  duration?: number;
}

const directionVariants: Record<string, Variants> = {
  up: {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  },
  down: {
    hidden: { opacity: 0, y: -30 },
    visible: { opacity: 1, y: 0 },
  },
  left: {
    hidden: { opacity: 0, x: 40 },
    visible: { opacity: 1, x: 0 },
  },
  right: {
    hidden: { opacity: 0, x: -40 },
    visible: { opacity: 1, x: 0 },
  },
  fade: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  scale: {
    hidden: { opacity: 0, scale: 0.92 },
    visible: { opacity: 1, scale: 1 },
  },
};

const ScrollAnimationWrapper = forwardRef<HTMLDivElement, ScrollAnimationWrapperProps>(
  ({ children, className = "", delay = 0, direction = "up", duration = 0.45 }, ref) => {
    return (
      <motion.div
        ref={ref}
        className={className}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "200px 0px -50px 0px", amount: 0 }}
        variants={directionVariants[direction]}
        transition={{
          duration,
          delay,
          ease: [0.25, 0.46, 0.45, 0.94],
        }}
      >
        {children}
      </motion.div>
    );
  }
);

ScrollAnimationWrapper.displayName = "ScrollAnimationWrapper";

export default ScrollAnimationWrapper;
