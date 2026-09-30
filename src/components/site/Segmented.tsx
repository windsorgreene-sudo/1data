import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Option<T extends string> {
  value: T;
  label: string;
  hint?: string;
}

interface SegmentedProps<T extends string> {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  id: string;
  className?: string;
  label: string;
}

export const Segmented = <T extends string>({ options, value, onChange, id, className, label }: SegmentedProps<T>) => (
  <div
    role="radiogroup"
    aria-label={label}
    className={cn("relative inline-flex rounded-full border border-white/10 bg-white/[0.03] p-1", className)}
  >
    {options.map((o) => {
      const on = o.value === value;
      return (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={on}
          onClick={() => onChange(o.value)}
          className={cn(
            "relative z-0 inline-flex h-9 items-center gap-2 rounded-full px-4 text-[13.5px] font-medium transition-colors duration-300",
            on ? "text-ink" : "text-bone/65 hover:text-bone",
          )}
        >
          {on && (
            <motion.span
              layoutId={`seg-${id}`}
              className="absolute inset-0 -z-10 rounded-full bg-bone"
              transition={{ type: "spring", bounce: 0.18, duration: 0.55 }}
            />
          )}
          {o.label}
          {o.hint && <span className={cn("font-mono text-[10.5px]", on ? "text-ink/60" : "text-mute")}>{o.hint}</span>}
        </button>
      );
    })}
  </div>
);
