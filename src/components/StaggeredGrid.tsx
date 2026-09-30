import { motion } from "framer-motion";
import { ReactNode } from "react";

interface StaggeredGridProps {
  children: ReactNode[];
  className?: string;
  staggerDelay?: number;
  itemClassName?: string;
  triggerOnScroll?: boolean;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { 
    opacity: 0, 
    y: 50, 
    scale: 0.9,
    filter: "blur(10px)",
  },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    filter: "blur(0px)",
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 15,
      mass: 0.8,
    },
  },
};

export const StaggeredGrid = ({
  children,
  className = "",
  staggerDelay = 0.15,
  itemClassName = "",
  triggerOnScroll = true,
}: StaggeredGridProps) => {
  const customContainerVariants = {
    ...containerVariants,
    visible: {
      ...containerVariants.visible,
      transition: {
        ...containerVariants.visible.transition,
        staggerChildren: staggerDelay,
      },
    },
  };

  return (
    <motion.div
      className={className}
      initial="hidden"
      {...(triggerOnScroll 
        ? { whileInView: "visible", viewport: { once: true, margin: "-50px" } }
        : { animate: "visible" }
      )}
      variants={customContainerVariants}
    >
      {children.map((child, index) => (
        <motion.div
          key={index}
          className={itemClassName}
          variants={itemVariants}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};

// Wave effect variant - items animate in a wave pattern
interface WaveGridProps {
  children: ReactNode[];
  className?: string;
  columns?: number;
  waveDelay?: number;
  triggerOnScroll?: boolean;
}

export const WaveGrid = ({
  children,
  className = "",
  columns = 3,
  waveDelay = 0.1,
  triggerOnScroll = true,
}: WaveGridProps) => {
  return (
    <motion.div 
      className={className}
      initial="hidden"
      {...(triggerOnScroll 
        ? { whileInView: "visible", viewport: { once: true, margin: "-50px" } }
        : { animate: "visible" }
      )}
      variants={containerVariants}
    >
      {children.map((child, index) => {
        // Calculate wave delay based on row and column
        const row = Math.floor(index / columns);
        const col = index % columns;
        const waveOffset = (row + col) * 0.08;

        return (
          <motion.div
            key={index}
            variants={{
              hidden: { 
                opacity: 0, 
                y: 60, 
                scale: 0.85,
                rotateX: 15,
              },
              visible: { 
                opacity: 1, 
                y: 0, 
                scale: 1,
                rotateX: 0,
                transition: {
                  type: "spring",
                  stiffness: 80,
                  damping: 15,
                  delay: waveOffset + waveDelay,
                },
              },
            }}
          >
            {child}
          </motion.div>
        );
      })}
    </motion.div>
  );
};

// Cascade reveal - cards cascade from one side
interface CascadeGridProps {
  children: ReactNode[];
  className?: string;
  direction?: "left" | "right" | "up" | "down";
  staggerDelay?: number;
}

export const CascadeGrid = ({
  children,
  className = "",
  direction = "left",
  staggerDelay = 0.12,
}: CascadeGridProps) => {
  const getInitialPosition = () => {
    switch (direction) {
      case "left": return { x: -80, y: 0 };
      case "right": return { x: 80, y: 0 };
      case "up": return { x: 0, y: -60 };
      case "down": return { x: 0, y: 60 };
    }
  };

  const initial = getInitialPosition();

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: 0.1,
          },
        },
      }}
    >
      {children.map((child, index) => (
        <motion.div
          key={index}
          variants={{
            hidden: { 
              opacity: 0, 
              x: initial.x,
              y: initial.y,
              scale: 0.8,
            },
            visible: { 
              opacity: 1, 
              x: 0,
              y: 0,
              scale: 1,
              transition: {
                type: "spring",
                stiffness: 100,
                damping: 20,
              },
            },
          }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};

// Pop-in grid - items pop in with a scale bounce effect
interface PopGridProps {
  children: ReactNode[];
  className?: string;
  staggerDelay?: number;
}

export const PopGrid = ({
  children,
  className = "",
  staggerDelay = 0.08,
}: PopGridProps) => {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-30px" }}
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
    >
      {children.map((child, index) => (
        <motion.div
          key={index}
          variants={{
            hidden: { 
              opacity: 0, 
              scale: 0.5,
              y: 30,
            },
            visible: { 
              opacity: 1, 
              scale: 1,
              y: 0,
              transition: {
                type: "spring",
                stiffness: 300,
                damping: 20,
              },
            },
          }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};
