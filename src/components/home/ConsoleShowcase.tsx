import { motion, useInView, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Terminal, type TermLine } from "@/components/fx/Terminal";
import { Reveal } from "@/components/motion/Reveal";
import { EASE_OUT } from "@/lib/motion";

const LINES: TermLine[] = [
  { kind: "dim", text: "Welcome to Ubuntu 24.04 LTS (GNU/Linux x86_64)" },
  { kind: "dim", text: "Last login: just now from your laptop" },
  { kind: "cmd", text: "nproc" },
  { kind: "out", text: "4" },
  { kind: "cmd", text: "free -h | awk '/Mem/ {print $2}'" },
  { kind: "out", text: "7.8Gi" },
  { kind: "cmd", text: "df -h / | tail -1" },
  { kind: "out", text: "/dev/vda1   251G  2.9G  236G   2% /" },
  { kind: "cmd", text: "uptime -p" },
  { kind: "ok", text: "up 11 minutes" },
];

const SPECS = [
  { k: "Region", v: "Frankfurt · FRA" },
  { k: "Image", v: "Ubuntu 24.04 LTS" },
  { k: "vCPU", v: "4 cores at 3 GHz+" },
  { k: "Memory", v: "8 GB" },
  { k: "Storage", v: "256 GB NVMe" },
  { k: "Transfer", v: "4 TB a month" },
  { k: "IPv4", v: "203.0.113.24" },
  { k: "IPv6", v: "2001:db8:4a::24/64" },
];

const SPARK = "M0 30 C 12 28, 18 12, 30 16 S 48 30, 60 22 S 78 6, 90 14 S 108 26, 120 18 S 138 8, 150 12 S 168 22, 180 16";

const Uptime = () => {
  const [s, setS] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref);
  useEffect(() => {
    if (!inView) return;
    const id = window.setInterval(() => setS((v) => v + 1), 1000);
    return () => window.clearInterval(id);
  }, [inView]);
  const total = 11 * 60 + s;
  const mm = String(Math.floor(total / 60)).padStart(2, "0");
  const ss = String(total % 60).padStart(2, "0");
  return (
    <span ref={ref} className="tabular">
      00:{mm}:{ss}
    </span>
  );
};

const ServerCard = () => (
  <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-ink-2/95 shadow-lift backdrop-blur-xl">
    <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-3">
      <span className="font-mono text-[12px] text-bone">vhf-4c-8gb</span>
      <span className="inline-flex items-center gap-2 rounded-full border border-signal/25 bg-signal/10 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.16em] text-signal">
        <span className="h-1.5 w-1.5 rounded-full bg-signal" />
        Running
      </span>
    </div>
    <dl className="grid flex-1 grid-cols-1 divide-y divide-white/[0.05] px-5">
      {SPECS.map((row) => (
        <div key={row.k} className="flex items-center justify-between py-2.5 text-[13px]">
          <dt className="text-mute">{row.k}</dt>
          <dd className="font-mono text-[12.5px] text-bone/90">{row.v}</dd>
        </div>
      ))}
    </dl>
    <div className="border-t border-white/[0.06] px-5 py-4">
      <div className="flex items-center justify-between font-mono text-[10.5px] uppercase tracking-[0.16em] text-mute">
        <span>CPU, last hour</span>
        <span>
          Uptime <Uptime />
        </span>
      </div>
      <svg viewBox="0 0 180 36" className="mt-3 h-9 w-full" preserveAspectRatio="none" aria-hidden>
        <defs>
          <linearGradient id="spark-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="hsl(186 100% 58%)" stopOpacity="0.28" />
            <stop offset="1" stopColor="hsl(186 100% 58%)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <motion.path
          d={`${SPARK} L180 36 L0 36 Z`}
          fill="url(#spark-fill)"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, delay: 0.8 }}
        />
        <motion.path
          d={SPARK}
          fill="none"
          stroke="hsl(186 100% 58%)"
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.8, ease: EASE_OUT, delay: 0.3 }}
        />
      </svg>
      <div className="mt-3 flex items-center justify-between text-[13px]">
        <span className="text-mute">Billed monthly</span>
        <span className="font-mono text-bone">$23/mo</span>
      </div>
    </div>
  </div>
);

export const ConsoleShowcase = () => {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "start 0.25"] });
  const progress = useSpring(scrollYProgress, { stiffness: 90, damping: 24, mass: 0.4 });
  const rotateX = useTransform(progress, [0, 1], reduce ? [0, 0] : [24, 0]);
  const scale = useTransform(progress, [0, 1], reduce ? [1, 1] : [0.88, 1]);
  const y = useTransform(progress, [0, 1], reduce ? [0, 0] : [80, 0]);
  const glow = useTransform(progress, [0, 1], [0, 1]);

  return (
    <section className="relative -mt-24 pb-24 sm:-mt-32 sm:pb-32">
      <div className="shell" style={{ perspective: 1400 }}>
        <motion.div
          ref={ref}
          style={{ rotateX, scale, y, transformOrigin: "50% 0%" }}
          className="relative mx-auto max-w-6xl"
        >
          <motion.div
            aria-hidden
            style={{ opacity: glow }}
            className="pointer-events-none absolute -inset-x-10 -top-10 bottom-10 rounded-[3rem] bg-[radial-gradient(50%_60%_at_50%_0%,hsl(var(--beam)/0.18),transparent_70%)] blur-2xl"
          />
          <div className="relative rounded-[1.75rem] border border-white/[0.08] bg-white/[0.02] p-2.5 backdrop-blur-sm sm:p-3">
            <div className="grid gap-2.5 sm:gap-3 lg:grid-cols-12">
              <Terminal lines={LINES} className="lg:col-span-7" />
              <div className="lg:col-span-5">
                <ServerCard />
              </div>
            </div>
          </div>
        </motion.div>
        <Reveal delay={0.1} className="mx-auto mt-8 max-w-xl text-center text-[15px] text-mute">
          A clean image, credentials in your inbox, and a shell that answers on the first try.
        </Reveal>
      </div>
    </section>
  );
};
