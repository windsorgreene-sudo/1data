import { motion, Variants } from "framer-motion";
import { ReactNode } from "react";

interface TextRevealProps {
  children: string;
  className?: string;
  delay?: number;
  staggerDelay?: number;
  type?: "words" | "letters" | "lines";
  animation?: "fade" | "slide" | "blur" | "wave" | "typewriter";
  animate?: "visible" | "hidden";
}

const animationVariants: Record<string, { hidden: object; visible: object }> = {
  fade: {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  },
  slide: {
    hidden: { opacity: 0, x: -30 },
    visible: { opacity: 1, x: 0 },
  },
  blur: {
    hidden: { opacity: 0, filter: "blur(10px)", y: 10 },
    visible: { opacity: 1, filter: "blur(0px)", y: 0 },
  },
  wave: {
    hidden: { opacity: 0, y: 30, rotateX: -90 },
    visible: { opacity: 1, y: 0, rotateX: 0 },
  },
  typewriter: {
    hidden: { opacity: 0, width: 0 },
    visible: { opacity: 1, width: "auto" },
  },
};

export const TextReveal = ({
  children,
  className = "",
  delay = 0,
  staggerDelay = 0.05,
  type = "words",
  animation = "fade",
  animate,
}: TextRevealProps) => {
  const variants = animationVariants[animation];

  const containerVariants: Variants = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: delay,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: variants.hidden as { opacity: number; y?: number; x?: number; filter?: string; rotateX?: number; width?: number | string },
    visible: {
      ...(variants.visible as object),
      transition: {
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  const splitText = () => {
    if (type === "letters") {
      return children.split("").map((char, index) => (
        <motion.span
          key={index}
          variants={itemVariants}
          className="inline-block"
          style={{ whiteSpace: char === " " ? "pre" : "normal" }}
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ));
    }

    if (type === "lines") {
      return children.split("\n").map((line, index) => (
        <motion.div key={index} variants={itemVariants} className="block">
          {line}
        </motion.div>
      ));
    }

    // Default: words
    return children.split(" ").map((word, index) => (
      <motion.span
        key={index}
        variants={itemVariants}
        className="inline-block mr-[0.25em]"
      >
        {word}
      </motion.span>
    ));
  };

  return (
    <motion.span
      className={className}
      variants={containerVariants}
      initial="hidden"
      animate={animate}
      whileInView={animate ? undefined : "visible"}
      viewport={animate ? undefined : { once: true, margin: "0px" }}
    >
      {splitText()}
    </motion.span>
  );
};

// Headline reveal with simple fade-in effect
export const HeadlineReveal = ({
  children,
  className = "",
  delay = 0,
}: {
  children: string;
  className?: string;
  delay?: number;
}) => {
  return (
    <motion.h2
      className={className}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        duration: 0.6,
        delay,
        ease: "easeOut",
      }}
    >
      {children}
    </motion.h2>
  );
};

// Paragraph reveal with simple fade-in effect
export const ParagraphReveal = ({
  children,
  className = "",
  delay = 0,
}: {
  children: string;
  className?: string;
  delay?: number;
}) => {
  return (
    <motion.p
      className={className}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        duration: 0.6,
        delay,
        ease: "easeOut",
      }}
    >
      {children}
    </motion.p>
  );
};

// Character-by-character typing effect
export const TypewriterText = ({
  children,
  className = "",
  delay = 0,
  speed = 0.03,
}: {
  children: string;
  className?: string;
  delay?: number;
  speed?: number;
}) => {
  return (
    <motion.span
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      <TextReveal type="letters" animation="fade" delay={delay} staggerDelay={speed}>
        {children}
      </TextReveal>
    </motion.span>
  );
};

export default TextReveal;
