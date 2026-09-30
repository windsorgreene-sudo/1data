import { motion, useScroll, useSpring, useTransform, type MotionValue } from "framer-motion";
import { useRef } from "react";
import { SectionIntro } from "@/components/site/SectionIntro";
import { Stagger, StaggerItem } from "@/components/motion/Reveal";
import { Spotlight } from "@/components/motion/Spotlight";

const STEPS = [
  {
    title: "Pick a plan",
    text: "Filter by CPU type, memory or budget. The number on the pricing page is the number on the invoice.",
    meta: "2 minutes",
  },
  {
    title: "Send one message",
    text: "Tap order and WhatsApp opens with the plan already filled in. Confirm, pay, and we start building.",
    meta: "1 message",
  },
  {
    title: "Log in as root",
    text: "Credentials land in your inbox, usually within 30 minutes. Servers, invoices and tickets live in your portal.",
    meta: "Under 30 minutes",
  },
];

const Node = ({ at, progress, label }: { at: number; progress: MotionValue<number>; label: string }) => {
  const opacity = useTransform(progress, [at - 0.12, at], [0.25, 1]);
  const scale = useTransform(progress, [at - 0.12, at], [0.6, 1]);
  return (
    <motion.span
      style={{ left: `${at * 100}%`, opacity, scale }}
      className="absolute top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-2"
    >
      <span className="h-2.5 w-2.5 rounded-full border border-beam bg-ink shadow-[0_0_14px_hsl(var(--beam)/0.7)]" />
      <span className="sr-only">{label}</span>
    </motion.span>
  );
};

export const HowItWorks = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.55"] });
  const scaleX = useSpring(scrollYProgress, { stiffness: 80, damping: 22, mass: 0.4 });

  return (
    <section className="relative py-20 sm:py-28">
      <div className="shell">
        <SectionIntro
          index="04"
          total="05"
          eyebrow="How it works"
          title={"Pick. Pay.\n*Log in.*"}
          description="No sales call, no setup form with forty fields. Three steps from this page to a shell prompt."
        />
        <div ref={ref} className="relative mt-14 sm:mt-20">
          <div aria-hidden className="relative mb-8 hidden h-3 lg:block">
            <div className="absolute inset-x-0 top-1/2 h-px bg-white/[0.08]" />
            <motion.div style={{ scaleX }} className="absolute inset-x-0 top-1/2 h-px origin-left bg-beam" />
            {STEPS.map((s, i) => (
              <Node key={s.title} at={(i * 2 + 1) / 6} progress={scaleX} label={s.title} />
            ))}
          </div>
          <Stagger className="grid gap-3 lg:grid-cols-3" gap={0.12}>
            {STEPS.map((step, i) => (
              <StaggerItem key={step.title} className="h-full">
                <Spotlight className="panel relative flex h-full flex-col overflow-hidden p-7 sm:p-8">
                  <span
                    aria-hidden
                    className="display pointer-events-none absolute -right-2 -top-6 select-none text-[9rem] font-bold leading-none tracking-[-0.06em] text-white/[0.035]"
                  >
                    0{i + 1}
                  </span>
                  <div className="relative flex items-center gap-4">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full border border-beam/40 bg-ink font-mono text-[12px] text-beam">
                      0{i + 1}
                    </span>
                    <span className="h-px flex-1 bg-white/[0.08]" />
                    <span className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-mute">{step.meta}</span>
                  </div>
                  <h3 className="display relative mt-12 text-[1.9rem] font-semibold leading-none tracking-[-0.04em] text-bone">
                    {step.title}
                  </h3>
                  <p className="relative mt-4 text-[15px] leading-relaxed text-mute">{step.text}</p>
                </Spotlight>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </div>
    </section>
  );
};
