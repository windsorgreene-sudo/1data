import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { lazy, useRef } from "react";
import { Link } from "react-router-dom";
import { SplitText } from "@/components/motion/SplitText";
import { Magnetic } from "@/components/motion/Magnetic";
import { Scramble } from "@/components/motion/Scramble";
import { Action } from "@/components/site/Action";
import { useIntroReady } from "@/components/site/IntroContext";
import { EASE_OUT } from "@/lib/motion";
import { GENERAL_MESSAGE, whatsappLink } from "@/lib/site";
import { RDP_FROM, VPS_FROM } from "@/lib/plans";
import { SceneMount } from "@/components/three/SceneMount";
import { HeroFallback } from "@/components/three/fallbacks";
import { useMediaQuery } from "@/hooks/useMediaQuery";

const HeroScene = lazy(() => import("@/components/three/scenes/HeroScene"));

const PROOF = ["99.9% uptime SLA", "IPv4 and IPv6", "Full root access", "No hidden fees"];

const MASK = "[mask-image:radial-gradient(65%_65%_at_55%_50%,#000_45%,transparent_78%)]";

export const HomeHero = () => {
  const ref = useRef<HTMLElement>(null);
  const ready = useIntroReady();
  const reduce = useReducedMotion();
  const desktop = useMediaQuery("(min-width: 1024px)");
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const contentY = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : ["0%", "28%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  const fade = (delay: number) => ({
    initial: { opacity: 0, y: 18 },
    animate: ready ? { opacity: 1, y: 0 } : undefined,
    transition: { duration: 0.9, ease: EASE_OUT, delay },
  });

  return (
    <section ref={ref} className="relative flex min-h-[100svh] flex-col overflow-hidden lg:block">
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(50%_60%_at_72%_45%,hsl(var(--beam)/0.08),transparent_70%)]"
      />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-ink to-transparent" />

      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="relative z-10 lg:flex lg:min-h-[100svh] lg:items-center"
      >
        <div className="shell w-full pb-16 pt-28 sm:pt-36 lg:pb-24">
          <div className="grid items-center lg:grid-cols-12">
            <div className="text-center lg:col-span-6 lg:text-left">
              <motion.div {...fade(0.05)} className="flex justify-center lg:justify-start">
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
                className="display mx-auto mt-8 max-w-5xl text-[clamp(3.1rem,10vw,5.2rem)] font-extrabold leading-[0.88] text-bone lg:mx-0 lg:max-w-none lg:text-[clamp(4rem,6.4vw,6.6rem)]"
                accentClassName="text-gradient-beam pr-[0.06em]"
              />

              {!desktop && (
                <SceneMount
                  immediate
                  fallback={<HeroFallback />}
                  className={`relative mx-auto -mb-4 mt-2 aspect-[4/3] w-full max-w-[520px] ${MASK}`}
                >
                  {(ctx) => <HeroScene {...ctx} scroll={scrollYProgress} />}
                </SceneMount>
              )}

              <motion.p
                {...fade(0.55)}
                className="mx-auto mt-6 max-w-[38rem] lg:mt-8 text-[17px] leading-relaxed text-bone/65 sm:text-[19px] lg:mx-0"
              >
                NVMe VPS from ${VPS_FROM} and Windows RDP from ${RDP_FROM} a month. Pick a plan, send one message, and log
                in as root, usually within 30 minutes.
              </motion.p>

              <motion.div {...fade(0.7)} className="mt-10 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
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
                className="mx-auto mt-14 flex max-w-3xl flex-wrap items-center justify-center gap-x-6 gap-y-3 font-mono text-[11px] uppercase tracking-[0.18em] text-mute lg:mx-0 lg:justify-start"
              >
                {PROOF.map((item) => (
                  <li key={item} className="inline-flex items-center gap-2">
                    <span className="h-px w-3 bg-beam/70" />
                    {item}
                  </li>
                ))}
              </motion.ul>
            </div>
          </div>
        </div>
      </motion.div>

      {desktop && (
        <SceneMount immediate fallback={<HeroFallback />} className={`absolute inset-y-0 right-0 w-[60%] ${MASK}`}>
          {(ctx) => <HeroScene {...ctx} scroll={scrollYProgress} />}
        </SceneMount>
      )}
    </section>
  );
};
