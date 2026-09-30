import {
  motion,
  useMotionTemplate,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useMemo, useRef } from "react";
import { cn } from "@/lib/utils";
import { isFinePointer } from "@/lib/motion";
import { parseMarkup, plainText } from "./SplitText";

interface WordProps {
  word: string;
  accent: boolean;
  progress: MotionValue<number>;
  range: [number, number];
  blur: boolean;
  accentClassName: string;
}

const Word = ({ word, accent, progress, range, blur, accentClassName }: WordProps) => {
  const opacity = useTransform(progress, range, [0.14, 1]);
  const amount = useTransform(progress, range, [blur ? 7 : 0, 0]);
  const filter = useMotionTemplate`blur(${amount}px)`;
  return (
    <motion.span
      aria-hidden
      className={cn("inline-block", accent && accentClassName)}
      style={{ opacity, filter: blur ? filter : undefined }}
    >
      {word}
    </motion.span>
  );
};

interface FocusTextProps {
  text: string;
  className?: string;
  accentClassName?: string;
}

export const FocusText = ({ text, className, accentClassName = "accent-serif" }: FocusTextProps) => {
  const ref = useRef<HTMLParagraphElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.88", "end 0.45"] });
  const tokens = useMemo(() => parseMarkup(text.replace(/\n/g, " ")), [text]);
  const blur = useMemo(() => isFinePointer(), []);
  const Tag = motion.p;

  if (reduce) {
    return (
      <Tag ref={ref} className={className}>
        {tokens.map((t, i) => (
          <span key={i} className={cn(t.accent && accentClassName)}>
            {t.word}
            {i < tokens.length - 1 ? " " : ""}
          </span>
        ))}
      </Tag>
    );
  }

  const n = tokens.length;
  return (
    <Tag ref={ref} className={className} aria-label={plainText(text)}>
      {tokens.map((t, i) => {
        const start = (i / n) * 0.92;
        const end = start + Math.max(1 / n, 0.04) * 1.6;
        return (
          <span key={i}>
            <Word
              word={t.word}
              accent={t.accent}
              progress={scrollYProgress}
              range={[start, Math.min(end, 1)]}
              blur={blur}
              accentClassName={accentClassName}
            />
            {i < n - 1 ? " " : null}
          </span>
        );
      })}
    </Tag>
  );
};
