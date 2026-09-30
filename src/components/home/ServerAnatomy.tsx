import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { lazy, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { EASE_OUT } from "@/lib/motion";
import { STAGES, railFill, segmentFill, stageAt, stageFocus, stageTitle, type AnatomyStage } from "@/lib/anatomy";
import { summarize } from "@/lib/locations";
import { useSceneQuality } from "@/lib/quality";
import { scrollToTarget } from "@/lib/scroll";
import { useLocations } from "@/hooks/useLocations";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { Eyebrow, SectionIntro } from "@/components/site/SectionIntro";
import { CountUp } from "@/components/motion/CountUp";
import { SceneMount } from "@/components/three/SceneMount";
import { AnatomyDiagram } from "@/components/three/fallbacks";

const AnatomyScene = lazy(() => import("@/components/three/scenes/AnatomyScene"));

const MASK =
  "[mask-image:linear-gradient(to_bottom,transparent,#000_16%),radial-gradient(70%_70%_at_60%_50%,#000_50%,transparent_80%)] [mask-composite:intersect] [-webkit-mask-composite:source-in]";

const StageCopy = ({ stage, total, counted = false }: { stage: AnatomyStage; total: number; counted?: boolean }) => (
  <>
    <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-beam">
      {stage.index} {stage.label}
    </p>
    <h3 className="display mt-4 text-[clamp(2rem,3.6vw,3.2rem)] font-bold leading-[0.98] text-bone">
      {stageTitle(stage, total)}
    </h3>
    <p className="mt-4 text-[16px] leading-relaxed text-mute">{stage.body}</p>
    {stage.stat && (
      <div className="mt-6">
        <p className="display text-[2.4rem] font-bold leading-none tracking-[-0.04em] text-bone">
          <CountUp
            to={stage.stat.value}
            from={counted ? stage.stat.value : 0}
            decimals={stage.stat.decimals}
            prefix={stage.stat.prefix}
            suffix={stage.stat.suffix}
          />
        </p>
        <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.2em] text-mute">{stage.stat.caption}</p>
      </div>
    )}
  </>
);

const StageSwap = ({ stage, total, counted }: { stage: number; total: number; counted: boolean }) => (
  <AnimatePresence mode="wait" initial={false}>
    <motion.div
      key={stage}
      initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.5, ease: EASE_OUT }}
    >
      <StageCopy stage={STAGES[stage]} total={total} counted={counted} />
    </motion.div>
  </AnimatePresence>
);

const Segment = ({ progress, k }: { progress: MotionValue<number>; k: number }) => {
  const scaleX = useTransform(progress, (v) => segmentFill(v, k));
  return (
    <span className="h-[2px] flex-1 overflow-hidden rounded-full bg-white/10">
      <motion.span style={{ scaleX }} className="block h-full origin-left bg-beam" />
    </span>
  );
};

const ScreenReaderStages = ({ total }: { total: number }) => (
  <ol className="sr-only">
    {STAGES.map((s) => (
      <li key={s.id}>
        {s.label}. {stageTitle(s, total)} {s.body}
        {s.stat ? ` ${s.stat.caption}: ${s.stat.prefix ?? ""}${s.stat.value}${s.stat.suffix ?? ""}.` : ""}
      </li>
    ))}
  </ol>
);

const PinnedAnatomy = ({ total }: { total: number }) => {
  const section = useRef<HTMLElement>(null);
  const stageRef = useRef(0);
  const seen = useRef(new Set([0]));
  const [{ stage, counted }, setStage] = useState({ stage: 0, counted: false });
  const desktop = useMediaQuery("(min-width: 1024px)");
  const { scrollYProgress: progress } = useScroll({ target: section, offset: ["start start", "end end"] });
  const rail = useTransform(progress, railFill);

  useMotionValueEvent(progress, "change", (v) => {
    const s = stageAt(v);
    if (s !== stageRef.current) {
      stageRef.current = s;
      setStage({ stage: s, counted: seen.current.has(s) });
      seen.current.add(s);
    }
  });

  const goTo = (i: number) => {
    const el = section.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    scrollToTarget(top + stageFocus(i) * (el.offsetHeight - window.innerHeight), { offset: 0 });
  };

  return (
    <section ref={section} className="relative h-[320vh] overflow-x-clip md:h-[400vh]">
      <span id="inside" aria-hidden className="pointer-events-none absolute left-0 top-[88px] h-0 w-0" />
      <ScreenReaderStages total={total} />
      <div className="sticky top-0 h-[100svh] pt-16">
        {desktop ? (
          <SceneMount fallback={<AnatomyDiagram />} className={cn("absolute bottom-0 right-0 top-16 w-[64vw]", MASK)}>
            {(ctx) => <AnatomyScene {...ctx} progress={progress} total={total} />}
          </SceneMount>
        ) : (
          <SceneMount fallback={<AnatomyDiagram />} className={cn("absolute inset-x-0 top-16 h-[58%]", MASK)}>
            {(ctx) => <AnatomyScene {...ctx} progress={progress} total={total} />}
          </SceneMount>
        )}

        {desktop ? (
          <div className="shell relative z-10 grid h-full items-center lg:grid-cols-12">
            <div className="relative lg:col-span-5 lg:pl-28">
              <div className="absolute left-0 top-1/2 h-64 -translate-y-1/2">
                <div aria-hidden className="absolute left-[3px] top-0 h-full w-px bg-white/10">
                  <motion.div style={{ scaleY: rail }} className="absolute inset-0 origin-top bg-beam" />
                </div>
                {STAGES.map((s, i) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => goTo(i)}
                    aria-label={`Go to ${s.label}`}
                    style={{ top: `${(i / 4) * 100}%` }}
                    className={cn(
                      "absolute left-0 flex -translate-y-1/2 items-center gap-3 whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.2em] transition-colors",
                      i === stage ? "text-bone" : "text-mute hover:text-bone",
                    )}
                  >
                    <span
                      className={cn(
                        "h-[7px] w-[7px] rounded-full border transition-colors",
                        i <= stage ? "border-beam bg-beam" : "border-white/25 bg-ink",
                      )}
                    />
                    <span aria-hidden>
                      {s.index}
                      {i === stage ? ` ${s.label}` : ""}
                    </span>
                  </button>
                ))}
              </div>
              <div aria-hidden>
                <Eyebrow label="Inside the box" />
                <div className="mt-10 min-h-[22rem]">
                  <StageSwap stage={stage} total={total} counted={counted} />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative z-10 flex h-full flex-col justify-end">
            <div aria-hidden className="panel mx-5 mb-6 p-6">
              <div className="flex gap-1.5">
                {STAGES.map((s, k) => (
                  <Segment key={s.id} progress={progress} k={k} />
                ))}
              </div>
              <div className="mt-5 min-h-[13.5rem]">
                <StageSwap stage={stage} total={total} counted={counted} />
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

const StaticAnatomy = ({ total, webgl }: { total: number; webgl: boolean }) => (
  <section id="inside" className="py-20 sm:py-28">
    <div className="shell">
      <SectionIntro index="02" total="05" eyebrow="Inside the box" title={"Inside every\n*Beam server.*"} />
      <div className="mt-14 grid gap-10 sm:mt-20 lg:grid-cols-12">
        <div className="relative aspect-[4/3] lg:col-span-7">
          {webgl ? (
            <SceneMount fallback={<AnatomyDiagram />} className={cn("absolute inset-0", MASK)}>
              {(ctx) => <AnatomyScene {...ctx} staticPose={2} total={total} />}
            </SceneMount>
          ) : (
            <AnatomyDiagram />
          )}
        </div>
        <ol className="space-y-3 lg:col-span-5">
          {STAGES.map((s) => (
            <li key={s.id} className="panel p-6">
              <StageCopy stage={s} total={total} />
            </li>
          ))}
        </ol>
      </div>
    </div>
  </section>
);

export const ServerAnatomy = () => {
  const quality = useSceneQuality();
  const total = summarize(useLocations()).total;
  return !quality.reduce && quality.webgl ? (
    <PinnedAnatomy total={total} />
  ) : (
    <StaticAnatomy total={total} webgl={quality.webgl} />
  );
};
