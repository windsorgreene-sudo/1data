import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { SectionIntro } from "@/components/site/SectionIntro";
import { TierCards } from "@/components/site/TierCards";
import { Action } from "@/components/site/Action";
import { Reveal } from "@/components/motion/Reveal";
import { ALL_PLANS } from "@/lib/plans";

export const PricingPreview = () => {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const x = useTransform(scrollYProgress, [0, 1], reduce ? ["-10%", "-10%"] : ["4%", "-34%"]);

  return (
    <section ref={ref} className="relative overflow-hidden py-20 sm:py-28">
      <motion.div
        aria-hidden
        style={{ x }}
        className="display text-outline pointer-events-none absolute left-0 top-[42%] select-none whitespace-nowrap text-[26vw] font-bold leading-none tracking-[-0.06em]"
      >
        Pricing Pricing
      </motion.div>
      <div className="shell relative">
        <SectionIntro
          index="05"
          total="05"
          eyebrow="Pricing"
          title={"Plain numbers.\n*No asterisks.*"}
          description="Three of our most ordered plans. Monthly billing, no contract, and every plan includes the 99.9% SLA."
        />
        <TierCards className="mt-14 sm:mt-20" />
        <Reveal className="mt-10 flex flex-col items-center justify-between gap-4 rounded-2xl border border-white/[0.07] bg-ink-2/70 p-5 backdrop-blur-sm sm:flex-row sm:p-6">
          <p className="text-[15px] text-mute">
            <span className="text-bone">{ALL_PLANS.length} plans</span> across shared and dedicated CPU, with Windows
            pricing on anything from 8 GB.
          </p>
          <Action to="/pricing" variant="secondary" size="sm">
            Compare every plan
          </Action>
        </Reveal>
      </div>
    </section>
  );
};
