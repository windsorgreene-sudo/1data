import { motion, useInView, useReducedMotion } from "framer-motion";
import { Fragment, useMemo, useRef, type ElementType } from "react";
import { cn } from "@/lib/utils";
import { EASE_OUT } from "@/lib/motion";
import { useIntroReady } from "@/components/site/IntroContext";

type Token = { word: string; accent: boolean };

export const parseMarkup = (line: string): Token[] => {
  const tokens: Token[] = [];
  line
    .split(/(\*[^*]+\*)/g)
    .filter(Boolean)
    .forEach((part) => {
      const accent = part.length > 2 && part.startsWith("*") && part.endsWith("*");
      const clean = accent ? part.slice(1, -1) : part;
      clean
        .split(/\s+/)
        .filter(Boolean)
        .forEach((word) => tokens.push({ word, accent }));
    });
  return tokens;
};

export const plainText = (text: string) => text.replace(/\*/g, "").replace(/\s*\n\s*/g, " ");

interface SplitTextProps {
  text: string;
  as?: "h1" | "h2" | "h3" | "p" | "div" | "span";
  className?: string;
  accentClassName?: string;
  lineClassName?: string;
  delay?: number;
  stagger?: number;
  trigger?: "view" | "mount";
}

export const SplitText = ({
  text,
  as = "h2",
  className,
  accentClassName = "accent-serif",
  lineClassName,
  delay = 0,
  stagger = 0.045,
  trigger = "view",
}: SplitTextProps) => {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -8% 0px" });
  const ready = useIntroReady();
  const reduce = useReducedMotion();
  const active = ready && (trigger === "mount" || inView);
  const lines = useMemo(() => text.split("\n").map(parseMarkup), [text]);
  const Tag = as as ElementType;
  let index = 0;

  return (
    <Tag ref={ref} className={className} aria-label={plainText(text)}>
      {lines.map((tokens, li) => (
        <span key={li} aria-hidden className={cn("block", lineClassName)}>
          {tokens.map((t, ti) => {
            const i = index++;
            return (
              <Fragment key={`${li}-${ti}`}>
                <span className="relative -mb-[0.16em] -mr-[0.1em] inline-block overflow-hidden pb-[0.16em] pr-[0.1em] align-top">
                  <motion.span
                    className={cn("inline-block", t.accent && accentClassName)}
                    initial={reduce ? { opacity: 0 } : { y: "118%", rotate: 4 }}
                    animate={active ? (reduce ? { opacity: 1 } : { y: "0%", rotate: 0 }) : undefined}
                    transition={{ duration: 1.1, ease: EASE_OUT, delay: delay + i * stagger }}
                    style={{ transformOrigin: "0% 100%" }}
                  >
                    {t.word}
                  </motion.span>
                </span>
                {ti < tokens.length - 1 ? " " : null}
              </Fragment>
            );
          })}
        </span>
      ))}
    </Tag>
  );
};

export const Markup = ({ text, accentClassName = "accent-serif" }: { text: string; accentClassName?: string }) => (
  <>
    {text.split("\n").map((line, li, arr) => (
      <Fragment key={li}>
        {line
          .split(/(\*[^*]+\*)/g)
          .filter(Boolean)
          .map((part, pi) =>
            part.length > 2 && part.startsWith("*") && part.endsWith("*") ? (
              <span key={pi} className={accentClassName}>
                {part.slice(1, -1)}
              </span>
            ) : (
              <Fragment key={pi}>{part}</Fragment>
            ),
          )}
        {li < arr.length - 1 ? <br /> : null}
      </Fragment>
    ))}
  </>
);
