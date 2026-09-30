import { animate, motion } from "framer-motion";
import { useEffect, useRef } from "react";
import { EASE_IN_OUT } from "@/lib/motion";
import { LogoMark } from "./Logo";

interface PreloaderProps {
  onDone: () => void;
}

export const Preloader = ({ onDone }: PreloaderProps) => {
  const countRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const controls = animate(0, 100, {
      duration: 1.15,
      ease: [0.65, 0, 0.35, 1],
      onUpdate: (v) => {
        if (countRef.current) countRef.current.textContent = String(Math.round(v)).padStart(3, "0");
        if (barRef.current) barRef.current.style.transform = `scaleX(${v / 100})`;
      },
      onComplete: () => window.setTimeout(onDone, 120),
    });
    return () => controls.stop();
  }, [onDone]);

  return (
    <motion.div
      className="fixed inset-0 z-[200] flex flex-col bg-ink"
      initial={{ clipPath: "inset(0% 0% 0% 0%)" }}
      exit={{ clipPath: "inset(0% 0% 100% 0%)" }}
      transition={{ duration: 0.9, ease: EASE_IN_OUT }}
      aria-hidden
    >
      <div className="shell flex flex-1 flex-col justify-between py-8">
        <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.22em] text-mute">
          <span>Beam Server</span>
          <span>Warming up the fleet</span>
        </div>
        <motion.div
          className="flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.92, filter: "blur(8px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -30 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <LogoMark size={64} />
        </motion.div>
        <div>
          <div className="flex items-end justify-between">
            <span className="display text-[clamp(4rem,12vw,9rem)] font-bold leading-[0.8] tracking-[-0.06em] text-bone">
              <span ref={countRef} className="tabular">
                000
              </span>
            </span>
            <span className="pb-2 font-mono text-[11px] uppercase tracking-[0.22em] text-mute">25 locations</span>
          </div>
          <div className="mt-6 h-px w-full bg-white/10">
            <span ref={barRef} className="block h-px origin-left scale-x-0 bg-beam" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};
