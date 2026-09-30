import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { EASE_OUT } from "@/lib/motion";
import { SplitText } from "@/components/motion/SplitText";
import { Reveal } from "@/components/motion/Reveal";
import { Scramble } from "@/components/motion/Scramble";

interface EyebrowProps {
  label: string;
  index?: string;
  total?: string;
  className?: string;
  line?: boolean;
}

export const Eyebrow = ({ label, index, total, className, line = true }: EyebrowProps) => {
  const reduce = useReducedMotion();
  return (
    <div className={cn("flex items-center gap-4", className)}>
      <span className="eyebrow inline-flex items-center gap-2.5">
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inset-0 animate-pulse-ring rounded-full bg-beam/60" />
          <span className="relative h-1.5 w-1.5 rounded-full bg-beam" />
        </span>
        <Scramble text={label} trigger="view" />
      </span>
      {line && (
        <motion.span
          className="h-px flex-1 origin-left bg-gradient-to-r from-white/[0.16] via-white/[0.08] to-transparent"
          initial={reduce ? { opacity: 0 } : { scaleX: 0 }}
          whileInView={reduce ? { opacity: 1 } : { scaleX: 1 }}
          viewport={{ once: true, margin: "0px 0px -8% 0px" }}
          transition={{ duration: 1.4, ease: EASE_OUT, delay: 0.1 }}
        />
      )}
      {index && (
        <span className="font-mono text-[11px] tracking-[0.2em] text-mute">
          {index}
          {total ? <span className="text-mute/50"> / {total}</span> : null}
        </span>
      )}
    </div>
  );
};

interface SectionIntroProps {
  eyebrow: string;
  title: string;
  description?: ReactNode;
  index?: string;
  total?: string;
  className?: string;
  titleClassName?: string;
  layout?: "split" | "stack" | "center";
  as?: "h1" | "h2";
}

export const SectionIntro = ({
  eyebrow,
  title,
  description,
  index,
  total,
  className,
  titleClassName,
  layout = "split",
  as = "h2",
}: SectionIntroProps) => {
  if (layout === "center") {
    return (
      <div className={cn("mx-auto flex max-w-3xl flex-col items-center text-center", className)}>
        <Eyebrow label={eyebrow} line={false} />
        <SplitText
          as={as}
          text={title}
          className={cn(
            "display mt-6 text-[clamp(2.4rem,5.6vw,4.8rem)] font-bold leading-[0.95] text-bone",
            titleClassName,
          )}
        />
        {description && (
          <Reveal delay={0.15} className="mt-6 max-w-xl text-[17px] leading-relaxed text-mute">
            {description}
          </Reveal>
        )}
      </div>
    );
  }

  return (
    <div className={className}>
      <Eyebrow label={eyebrow} index={index} total={total} />
      <div
        className={cn(
          "mt-8 grid gap-6",
          layout === "split" ? "lg:grid-cols-12 lg:items-end lg:gap-10" : "max-w-4xl",
        )}
      >
        <SplitText
          as={as}
          text={title}
          className={cn(
            "display font-bold leading-[0.95] text-bone",
            layout === "split" ? "text-[clamp(2.4rem,5.4vw,4.75rem)] lg:col-span-8" : "text-[clamp(2.3rem,4.2vw,3.6rem)]",
            titleClassName,
          )}
        />
        {description && (
          <Reveal
            delay={0.15}
            className={cn(
              "text-[17px] leading-relaxed text-mute",
              layout === "split" ? "lg:col-span-4 lg:pb-2 lg:text-right" : "max-w-2xl",
            )}
          >
            {description}
          </Reveal>
        )}
      </div>
    </div>
  );
};
