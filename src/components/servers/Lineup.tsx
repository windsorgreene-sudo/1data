import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { CATEGORIES, FAMILY_LABEL, minPrice, specRange, type Category } from "@/lib/plans";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { Eyebrow } from "@/components/site/SectionIntro";
import { SplitText } from "@/components/motion/SplitText";
import { Stagger, StaggerItem } from "@/components/motion/Reveal";
import { trackPointer } from "@/components/motion/Spotlight";

const HEADLINE: Record<string, { value: string; label: string }> = {
  "cloud-compute": { value: "$9", label: "Lowest monthly price we sell" },
  "high-frequency": { value: "3 GHz+", label: "Intel clock speed" },
  "high-performance": { value: "9 TB", label: "Monthly transfer on the top plan" },
  "general-purpose": { value: "8", label: "Dedicated cores on the top plan" },
  "cpu-optimized": { value: "0", label: "Neighbors sharing your cores" },
  "memory-optimized": { value: "8 GB", label: "Memory behind every core" },
  "storage-optimized": { value: "640 GB", label: "NVMe on the top plan" },
};

const Panel = ({ c, i, total, className, compact = false }: { c: Category; i: number; total: number; className?: string; compact?: boolean }) => {
  const s = specRange(c);
  const vps = minPrice(c.plans, "vps");
  const rdp = minPrice(c.plans, "rdp");
  const h = HEADLINE[c.id];
  return (
    <article
      onPointerMove={trackPointer}
      className={cn(
        "spotlight relative flex flex-col overflow-hidden rounded-[1.6rem] border border-white/[0.08] bg-ink-2 p-7 sm:p-8",
        className,
      )}
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-dots opacity-30 mask-fade-b" />
      <div className="relative flex items-center justify-between">
        <span className="font-mono text-[11px] tracking-[0.2em] text-mute">
          0{i + 1} <span className="text-mute/50">/ 0{total}</span>
        </span>
        <span
          className={cn(
            "chip",
            c.family === "dedicated" ? "border-beam/30 text-beam" : "",
          )}
        >
          {FAMILY_LABEL[c.family]}
        </span>
      </div>

      <div className={cn("relative", compact ? "mt-6" : "mt-10")}>
        <p className="display text-[clamp(3rem,5vw,4.6rem)] font-bold leading-none tracking-[-0.06em] text-bone">
          {h.value}
        </p>
        <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.18em] text-mute">{h.label}</p>
      </div>

      <div className={cn("relative", compact ? "mt-6" : "mt-10")}>
        <h3 className="display text-[2rem] font-semibold leading-none tracking-[-0.04em] text-bone">{c.name}</h3>
        <p className="mt-1.5 text-[14px] text-beam/90">{c.tagline}</p>
        <p className={cn("mt-4 text-[15px] leading-relaxed text-mute", compact && "hidden")}>{c.description}</p>
      </div>

      <dl className="relative mt-7 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-white/[0.08] pt-6 text-[14px]">
        <div>
          <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-mute">vCPU</dt>
          <dd className="mt-1 text-bone">{s.vcpu}</dd>
        </div>
        <div>
          <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-mute">Memory</dt>
          <dd className="mt-1 text-bone">{s.ram} GB</dd>
        </div>
        <div>
          <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-mute">Storage</dt>
          <dd className="mt-1 text-bone">
            {s.storage} GB {s.disk}
          </dd>
        </div>
        <div>
          <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-mute">Transfer</dt>
          <dd className="mt-1 text-bone">{s.transfer} TB</dd>
        </div>
      </dl>

      <div className={cn("relative mt-6 flex flex-wrap gap-2", compact && "hidden")}>
        {c.bestFor.map((b) => (
          <span key={b} className="chip normal-case tracking-normal">
            {b}
          </span>
        ))}
      </div>

      <div className="relative mt-auto flex items-end justify-between gap-4 pt-8">
        <div className="text-[13px] text-mute">
          <p>
            Linux from <span className="display text-2xl font-semibold text-bone">${vps}</span>/mo
          </p>
          <p className="mt-1">{rdp ? `Windows from $${rdp}/mo` : "Linux only"}</p>
        </div>
        <Link
          to={`/pricing?family=${c.family}#${c.id}`}
          className="group inline-flex items-center gap-1.5 rounded-full border border-white/10 px-4 py-2 text-sm text-bone transition-colors hover:border-white/30 hover:bg-white/[0.05]"
        >
          See prices
          <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </Link>
      </div>
    </article>
  );
};

const Heading = ({ compact = false }: { compact?: boolean }) => (
  <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
    <div>
      <Eyebrow label="The lineup" line={false} />
      <SplitText
        text={"Three shared.\n*Four dedicated.*"}
        className={cn("display mt-6 font-bold leading-[0.95] text-bone", compact ? "text-[clamp(2.2rem,3.6vw,3.4rem)]" : "text-[clamp(2.4rem,5vw,4.4rem)]")}
      />
    </div>
    <p className="max-w-sm text-[15px] leading-relaxed text-mute lg:text-right">
      Keep scrolling to move through the lineup. Every card links to the exact prices for that line.
    </p>
  </div>
);

const Horizontal = () => {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [dist, setDist] = useState(0);
  const [marks, setMarks] = useState<number[]>([]);

  useLayoutEffect(() => {
    const measure = () => {
      const el = track.current;
      if (!el) return;
      const d = Math.max(0, el.scrollWidth - window.innerWidth);
      setDist(d);
      const pad = (el.firstElementChild as HTMLElement | null)?.offsetLeft ?? 0;
      setMarks(
        Array.from(el.querySelectorAll<HTMLElement>("[data-panel]")).map((p) => Math.min(d, Math.max(0, p.offsetLeft - pad))),
      );
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (track.current) ro.observe(track.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, (v) => -v * dist);
  const bar = useTransform(scrollYProgress, [0, 1], [0.04, 1]);

  return (
    <section ref={section} className="relative" style={{ height: `calc(100vh + ${dist}px)` }}>
      {CATEGORIES.map((c, i) => (
        <span
          key={c.id}
          id={c.id}
          aria-hidden
          className="pointer-events-none absolute left-0 h-px w-px"
          style={{ top: (marks[i] ?? 0) + 88 }}
        />
      ))}
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden pt-14">
        <div className="shell mb-8">
          <Heading compact />
        </div>
        <motion.div ref={track} style={{ x }} className="flex h-[min(560px,62vh)] w-max gap-4 px-5 sm:px-8 lg:px-[max(2.5rem,calc((100vw_-_1320px)/2_+_2.5rem))]">
          {CATEGORIES.map((c, i) => (
            <div key={c.id} data-panel className="flex">
              <Panel c={c} i={i} total={CATEGORIES.length} compact className="h-full w-[420px]" />
            </div>
          ))}
          <div className="flex w-[340px] flex-col justify-center rounded-[1.6rem] border border-dashed border-white/[0.12] p-8">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-mute">Not sure yet?</p>
            <p className="display mt-4 text-[2rem] font-semibold leading-[1.05] tracking-[-0.04em] text-bone">
              Tell us the workload. We will suggest the plan.
            </p>
            <Link to="/contact" className="mt-8 inline-flex items-center gap-1.5 text-sm text-beam hover:underline">
              Ask the team <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </motion.div>
        <div className="shell mt-8">
          <div className="h-px w-full bg-white/[0.08]">
            <motion.div style={{ scaleX: bar }} className="h-px origin-left bg-beam" />
          </div>
        </div>
      </div>
    </section>
  );
};

const Vertical = () => (
  <section className="relative py-20">
    <div className="shell">
      <Heading />
      <Stagger className="mt-12 grid gap-3 md:grid-cols-2">
        {CATEGORIES.map((c, i) => (
          <StaggerItem key={c.id}>
            <div id={c.id} className="scroll-mt-24">
              <Panel c={c} i={i} total={CATEGORIES.length} className="h-full" />
            </div>
          </StaggerItem>
        ))}
      </Stagger>
    </div>
  </section>
);

export const Lineup = () => {
  const wide = useMediaQuery("(min-width: 1024px) and (min-height: 700px)");
  return wide ? <Horizontal /> : <Vertical />;
};
