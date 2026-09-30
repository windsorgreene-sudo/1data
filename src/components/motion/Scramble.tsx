import { useInView, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/<>_#";

interface ScrambleProps {
  text: string;
  className?: string;
  trigger?: "hover" | "view" | "both";
  duration?: number;
}

export const Scramble = ({ text, className, trigger = "hover", duration = 650 }: ScrambleProps) => {
  const ref = useRef<HTMLSpanElement>(null);
  const frame = useRef<number>();
  const reduce = useReducedMotion();
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });

  const run = useCallback(() => {
    const el = ref.current;
    if (!el || reduce) return;
    if (frame.current) cancelAnimationFrame(frame.current);
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const revealed = Math.floor(t * text.length);
      let out = "";
      for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        out += ch === " " || i < revealed ? ch : GLYPHS[(Math.random() * GLYPHS.length) | 0];
      }
      el.textContent = out;
      if (t < 1) frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
  }, [text, duration, reduce]);

  useEffect(() => {
    if ((trigger === "view" || trigger === "both") && inView) run();
  }, [inView, trigger, run]);

  useEffect(
    () => () => {
      if (frame.current) cancelAnimationFrame(frame.current);
    },
    [],
  );

  return (
    <span
      className={cn("inline-block", className)}
      onMouseEnter={trigger === "hover" || trigger === "both" ? run : undefined}
      aria-label={text}
    >
      <span ref={ref} aria-hidden>
        {text}
      </span>
    </span>
  );
};
