import { motion, HTMLMotionProps } from "framer-motion";
import { ReactNode } from "react";

// Magnetic button wrapper
export const MagneticButton = ({ 
  children, 
  className = "",
  strength = 0.3 
}: { 
  children: ReactNode; 
  className?: string;
  strength?: number;
}) => {
  return (
    <motion.div
      className={`relative ${className}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      {children}
    </motion.div>
  );
};

// Staggered list item
export const StaggerItem = ({ 
  children, 
  index = 0,
  className = "" 
}: { 
  children: ReactNode; 
  index?: number;
  className?: string;
}) => (
  <motion.div
    className={className}
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay: index * 0.1, duration: 0.4 }}
  >
    {children}
  </motion.div>
);

// Hover lift effect
export const HoverLift = ({ 
  children, 
  className = "",
  lift = -8 
}: { 
  children: ReactNode; 
  className?: string;
  lift?: number;
}) => (
  <motion.div
    className={className}
    whileHover={{ y: lift }}
    transition={{ type: "spring", stiffness: 400, damping: 20 }}
  >
    {children}
  </motion.div>
);

// Pulse effect
export const PulseEffect = ({ 
  children, 
  className = "" 
}: { 
  children: ReactNode;
  className?: string;
}) => (
  <motion.div
    className={className}
    animate={{ 
      scale: [1, 1.02, 1],
      opacity: [0.8, 1, 0.8]
    }}
    transition={{ 
      duration: 2, 
      repeat: Infinity, 
      ease: "easeInOut" 
    }}
  >
    {children}
  </motion.div>
);

// Fade in on scroll
export const FadeInView = ({ 
  children, 
  className = "",
  delay = 0
}: { 
  children: ReactNode; 
  className?: string;
  delay?: number;
}) => (
  <motion.div
    className={className}
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ delay, duration: 0.6, ease: "easeOut" }}
  >
    {children}
  </motion.div>
);

// Scale on hover
export const ScaleHover = ({ 
  children, 
  className = "",
  scale = 1.05
}: { 
  children: ReactNode; 
  className?: string;
  scale?: number;
}) => (
  <motion.div
    className={className}
    whileHover={{ scale }}
    whileTap={{ scale: 0.95 }}
    transition={{ type: "spring", stiffness: 400, damping: 17 }}
  >
    {children}
  </motion.div>
);

// Rotating icon on hover
export const RotateHover = ({ 
  children, 
  className = "",
  rotation = 10
}: { 
  children: ReactNode; 
  className?: string;
  rotation?: number;
}) => (
  <motion.div
    className={className}
    whileHover={{ rotate: rotation, scale: 1.1 }}
    transition={{ type: "spring", stiffness: 300 }}
  >
    {children}
  </motion.div>
);

// Shimmer loading effect
export const ShimmerLoading = ({ className = "" }: { className?: string }) => (
  <div className={`relative overflow-hidden bg-muted/30 rounded-lg ${className}`}>
    <motion.div
      className="absolute inset-0 bg-gradient-to-r from-transparent via-foreground/5 to-transparent"
      animate={{ x: ["-100%", "100%"] }}
      transition={{ 
        duration: 1.5, 
        repeat: Infinity, 
        ease: "easeInOut" 
      }}
    />
  </div>
);

// Glowing dot
export const GlowingDot = ({ 
  color = "primary",
  size = "w-2 h-2"
}: { 
  color?: "primary" | "accent" | "emerald";
  size?: string;
}) => {
  const colorClasses = {
    primary: "bg-primary shadow-[0_0_10px_hsl(var(--primary))]",
    accent: "bg-accent shadow-[0_0_10px_hsl(var(--accent))]",
    emerald: "bg-emerald-500 shadow-[0_0_10px_rgb(16,185,129)]",
  };

  return (
    <motion.div
      className={`rounded-full ${size} ${colorClasses[color]}`}
      animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
      transition={{ duration: 2, repeat: Infinity }}
    />
  );
};

// Animated counter
export const AnimatedCounter = ({ 
  value, 
  duration = 1,
  className = ""
}: { 
  value: number; 
  duration?: number;
  className?: string;
}) => (
  <motion.span
    className={className}
    initial={{ opacity: 0 }}
    whileInView={{ opacity: 1 }}
    viewport={{ once: true }}
  >
    {value}
  </motion.span>
);

// Typing effect text
export const TypingText = ({ 
  text, 
  className = "" 
}: { 
  text: string; 
  className?: string;
}) => (
  <motion.span className={className}>
    {text.split("").map((char, index) => (
      <motion.span
        key={index}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: index * 0.05 }}
      >
        {char}
      </motion.span>
    ))}
  </motion.span>
);

// Bouncing arrow
export const BouncingArrow = ({ className = "" }: { className?: string }) => (
  <motion.div
    className={className}
    animate={{ y: [0, 8, 0] }}
    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
  >
    ↓
  </motion.div>
);
