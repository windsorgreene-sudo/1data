import { animate, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface CountUpProps {
  to: number;
  from?: number;
  decimals?: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  delay?: number;
}

const formatNumber = (v: number, decimals: number, prefix: string, suffix: string) =>
  `${prefix}${v.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}${suffix}`;

export const CountUp = ({
  to,
  from = 0,
  decimals = 0,
  duration = 1.8,
  prefix = "",
  suffix = "",
  className,
  delay = 0,
}: CountUpProps) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const reduce = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || !inView) return;
    if (reduce) {
      el.textContent = formatNumber(to, decimals, prefix, suffix);
      return;
    }
    const controls = animate(from, to, {
      duration,
      delay,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        el.textContent = formatNumber(v, decimals, prefix, suffix);
      },
    });
    return () => controls.stop();
  }, [inView, to, from, decimals, prefix, suffix, duration, delay, reduce]);

  return (
    <span ref={ref} className={cn("tabular", className)} aria-label={formatNumber(to, decimals, prefix, suffix)}>
      {formatNumber(from, decimals, prefix, suffix)}
    </span>
  );
};
