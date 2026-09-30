import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useRef } from "react";
import { Link } from "react-router-dom";
import { TideShader } from "@/components/fx/TideShader";
import { SplitText } from "@/components/motion/SplitText";
import { Magnetic } from "@/components/motion/Magnetic";
import { Scramble } from "@/components/motion/Scramble";
import { Action } from "@/components/site/Action";
import { useIntroReady } from "@/components/site/IntroContext";
import { EASE_OUT } from "@/lib/motion";
import { GENERAL_MESSAGE, whatsappLink } from "@/lib/site";
import { RDP_FROM, VPS_FROM } from "@/lib/plans";

const PROOF = ["99.9% uptime SLA", "IPv4 and IPv6", "Full root access", "No hidden fees"];

export const HomeHero = () => {
  const ref = useRef<HTMLElement>(null);
  const ready = useIntroReady();
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const contentY = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : ["0%", "28%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const bgScale = useTransform(scrollYProgress, [0, 1], reduce ? [1, 1] : [1, 1.12]);

  const fade = (delay: number) => ({
    initial: { opacity: 0, y: 18 },
    animate: ready ? { opacity: 1, y: 0 } : undefined,
    transition: { duration: 0.9, ease: EASE_OUT, delay },
  });

  return (
    <section ref={ref} className="relative flex min-h-[100svh] items-center overflow-hidden">
      <motion.div
        aria-hidden
        style={{ scale: bgScale }}
        className="absolute inset-0 bg-[radial-gradient(60%_70%_at_0%_40%,hsl(270_80%_45%/0.35),transparent_70%),radial-gradient(60%_70%_at_100%_40%,hsl(190_100%_45%/0.3),transparent_70%)]"
      >
        <TideShader />
      </motion.div>
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-ink to-transparent" />

      <motion.div style={{ y: contentY, opacity: contentOpacity }} className="shell relative z-10 pb-24 pt-36 text-center">
        <motion.div {...fade(0.05)} className="flex justify-center">
          <Link
            to="/network"
            className="group inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-ink/50 py-1.5 pl-3 pr-3.5 font-mono text-[11px] uppercase tracking-[0.2em] text-bone/75 backdrop-blur-md transition-colors hover:border-white/25 hover:text-bone"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-beam shadow-[0_0_10px_hsl(var(--beam))]" />
            <Scramble text="25 locations on 6 continents" />
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
          </Link>
        </motion.div>

        <SplitText
          as="h1"
          trigger="mount"
          delay={0.15}
          stagger={0.06}
          text={"Cloud servers\nthat *keep up.*"}
          className="display mx-auto mt-8 max-w-5xl text-[clamp(3.3rem,10vw,8.4rem)] font-extrabold leading-[0.88] text-bone"
          accentClassName="text-gradient-beam pr-[0.06em]"
        />

        <motion.p
          {...fade(0.55)}
          className="mx-auto mt-8 max-w-[38rem] text-[17px] leading-relaxed text-bone/65 sm:text-[19px]"
        >
          NVMe VPS from ${VPS_FROM} and Windows RDP from ${RDP_FROM} a month. Pick a plan, send one message, and log
          in as root, usually within 30 minutes.
        </motion.p>

        <motion.div {...fade(0.7)} className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Magnetic>
            <Action to="/pricing" size="lg">
              See plans and prices
            </Action>
          </Magnetic>
          <Magnetic>
            <Action href={whatsappLink(GENERAL_MESSAGE)} size="lg" variant="secondary" icon="external">
              Talk to a person
            </Action>
          </Magnetic>
        </motion.div>

        <motion.ul
          {...fade(0.85)}
          className="mx-auto mt-14 flex max-w-3xl flex-wrap items-center justify-center gap-x-6 gap-y-3 font-mono text-[11px] uppercase tracking-[0.18em] text-mute"
        >
          {PROOF.map((item) => (
            <li key={item} className="inline-flex items-center gap-2">
              <span className="h-px w-3 bg-beam/70" />
              {item}
            </li>
          ))}
        </motion.ul>
      </motion.div>

    </section>
  );
};
