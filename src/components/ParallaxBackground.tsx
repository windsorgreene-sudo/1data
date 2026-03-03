import { useEffect, useState, ReactNode } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

interface ParallaxBackgroundProps {
  children: ReactNode;
  className?: string;
  intensity?: number; // 0.1 = subtle, 0.5 = strong
}

export const ParallaxBackground = ({
  children,
  className = "",
  intensity = 0.3,
}: ParallaxBackgroundProps) => {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 1000], [0, 300 * intensity]);

  return (
    <motion.div className={className} style={{ y }}>
      {children}
    </motion.div>
  );
};

interface ParallaxElementProps {
  children: ReactNode;
  className?: string;
  speed?: number; // negative = slower, positive = faster
  direction?: "up" | "down";
}

export const ParallaxElement = ({
  children,
  className = "",
  speed = 0.2,
  direction = "up",
}: ParallaxElementProps) => {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY;
      setOffset(scrolled * speed * (direction === "up" ? -1 : 1));
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [speed, direction]);

  return (
    <div
      className={className}
      style={{ transform: `translateY(${offset}px)` }}
    >
      {children}
    </div>
  );
};
