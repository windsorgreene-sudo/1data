import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { EASE_OUT } from "@/lib/motion";
import { CATEGORIES, DEDICATED_FROM, RDP_FROM, minPrice, range, type Plan } from "@/lib/plans";
import { SectionIntro } from "@/components/site/SectionIntro";
import { Stagger, StaggerItem } from "@/components/motion/Reveal";
import { FleetVisual, type VisualKind } from "./FleetVisual";

interface FleetItem {
  id: string;
  visual: VisualKind;
  title: string;
  family: string;
  tagline: string;
  from: number;
  specs: { k: string; v: string }[];
  bestFor: string[];
  to: string;
}

const specsOf = (plans: Plan[], disk?: string) => [
  { k: "vCPU", v: range(plans.map((p) => p.vcpu)) },
  { k: "Memory", v: `${range(plans.map((p) => p.ram))} GB` },
  {
    k: "Storage",
    v: `${range(plans.map((p) => p.storage))} GB ${disk ?? plans[0].disk}`,
  },
  { k: "Transfer", v: `${range(plans.map((p) => p.transfer))} TB` },
];

const cat = (id: string) => CATEGORIES.find((c) => c.id === id)!;
const dedicatedPlans = CATEGORIES.filter((c) => c.family === "dedicated").flatMap((c) => c.plans);
const rdpPlans = CATEGORIES.flatMap((c) => c.plans).filter((p) => p.rdp !== null);

export const FLEET: FleetItem[] = [
  {
    id: "cloud-compute",
    visual: "rack",
    title: "Cloud Compute",
    family: "Shared CPU",
    tagline: cat("cloud-compute").description,
    from: minPrice(cat("cloud-compute").plans, "vps") ?? 0,
    specs: specsOf(cat("cloud-compute").plans),
    bestFor: cat("cloud-compute").bestFor,
    to: "/servers#cloud-compute",
  },
  {
    id: "high-frequency",
    visual: "wave",
    title: "High Frequency",
    family: "Shared CPU",
    tagline: cat("high-frequency").description,
    from: minPrice(cat("high-frequency").plans, "vps") ?? 0,
    specs: specsOf(cat("high-frequency").plans),
    bestFor: cat("high-frequency").bestFor,
    to: "/servers#high-frequency",
  },
  {
    id: "high-performance",
    visual: "bars",
    title: "High Performance",
    family: "Shared CPU",
    tagline: cat("high-performance").description,
    from: minPrice(cat("high-performance").plans, "vps") ?? 0,
    specs: specsOf(cat("high-performance").plans),
    bestFor: cat("high-performance").bestFor,
    to: "/servers#high-performance",
  },
  {
    id: "dedicated",
    visual: "cores",
    title: "Dedicated CPU",
    family: "Four lines",
    tagline:
      "Cores reserved for you alone, in general purpose, CPU, memory and storage optimized shapes. Predictable under load.",
    from: DEDICATED_FROM,
    specs: specsOf(dedicatedPlans),
    bestFor: ["Production apps", "Databases", "CI and encoding"],
    to: "/servers#general-purpose",
  },
  {
    id: "rdp",
    visual: "window",
    title: "Cloud RDP",
    family: "Windows",
    tagline:
      "Windows Server 2019 or 2022 with full administrator rights, on any plan with 8 GB of memory or more.",
    from: RDP_FROM,
    specs: specsOf(rdpPlans, "SSD or NVMe"),
    bestFor: ["Remote desks", "Trading terminals", "Windows-only apps"],
    to: "/servers#rdp",
  },
];

const Expanded = ({ item }: { item: FleetItem }) => (
  <motion.div
    key={item.id}
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_OUT, delay: 0.18 } }}
    exit={{ opacity: 0, transition: { duration: 0.15 } }}
    className="flex h-full flex-col"
  >
    <p className="max-w-md text-[15px] leading-relaxed text-bone/70">{item.tagline}</p>
    <dl className="mt-auto grid grid-cols-2 gap-x-6 gap-y-4 border-t border-white/[0.08] pt-6">
      {item.specs.map((s) => (
        <div key={s.k}>
          <dt className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-mute">{s.k}</dt>
          <dd className="mt-1 text-[15px] text-bone">{s.v}</dd>
        </div>
      ))}
    </dl>
    <div className="mt-6 flex flex-wrap gap-2">
      {item.bestFor.map((b) => (
        <span key={b} className="chip normal-case tracking-normal">
          {b}
        </span>
      ))}
    </div>
  </motion.div>
);

const DesktopFleet = () => {
  const [active, setActive] = useState(0);
  return (
    <div className="hidden h-[560px] gap-3 lg:flex">
      {FLEET.map((item, i) => {
        const on = i === active;
        return (
          <Link
            key={item.id}
            to={item.to}
            onMouseEnter={() => setActive(i)}
            onFocus={() => setActive(i)}
            className={cn(
              "group relative flex min-w-0 flex-col overflow-hidden rounded-[1.6rem] border p-7 transition-[flex-grow,border-color,background-color] duration-700 ease-out-expo",
              on
                ? "flex-[3.6] border-white/[0.14] bg-ink-3"
                : "flex-[1] border-white/[0.07] bg-ink-2 hover:border-white/[0.12]",
            )}
          >
            <div
              aria-hidden
              className={cn(
                "absolute inset-0 transition-opacity duration-700",
                on ? "opacity-100" : "opacity-0",
              )}
            >
              <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-beam/[0.09] blur-3xl" />
              <div className="absolute inset-0 bg-dots opacity-40 mask-fade-b" />
            </div>

            <div className="relative flex items-start justify-between">
              <span className="font-mono text-[11px] tracking-[0.2em] text-mute">0{i + 1}</span>
              <span
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full border border-white/10 transition-all duration-500",
                  on ? "bg-bone text-ink" : "text-bone/60",
                )}
              >
                <ArrowUpRight className="h-4 w-4" />
              </span>
            </div>

            <FleetVisual
              kind={item.visual}
              className={cn(
                "absolute right-6 top-16 h-40 w-52 transition-all duration-700 ease-out-expo",
                on ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
              )}
            />

            <div className="relative mt-auto">
              {on ? (
                <div className="flex h-[330px] flex-col">
                  <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-beam">{item.family}</p>
                  <div className="mt-2 flex items-end justify-between gap-6">
                    <h3 className="display text-[2.6rem] font-bold leading-none tracking-[-0.045em] text-bone">
                      {item.title}
                    </h3>
                    <p className="shrink-0 pb-1 text-right text-sm text-mute">
                      from <span className="display text-2xl font-semibold text-bone">${item.from}</span>/mo
                    </p>
                  </div>
                  <div className="mt-5 flex-1">
                    <AnimatePresence mode="wait">
                      <Expanded item={item} />
                    </AnimatePresence>
                  </div>
                </div>
              ) : (
                <div className="flex h-[330px] flex-col justify-end">
                  <h3
                    className="display whitespace-nowrap text-[1.6rem] font-semibold leading-none tracking-[-0.04em] text-bone/80 [writing-mode:vertical-rl] rotate-180 self-start"
                  >
                    {item.title}
                  </h3>
                  <p className="mt-5 font-mono text-[11px] text-mute">${item.from}+</p>
                </div>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
};

const MobileFleet = () => (
  <Stagger className="grid gap-3 sm:grid-cols-2 lg:hidden">
    {FLEET.map((item, i) => (
      <StaggerItem key={item.id}>
        <Link
          to={item.to}
          className="relative flex h-full flex-col overflow-hidden rounded-[1.4rem] border border-white/[0.08] bg-ink-2 p-6"
        >
          <FleetVisual kind={item.visual} className="absolute -right-6 -top-4 h-28 w-40 opacity-70" />
          <span className="font-mono text-[11px] tracking-[0.2em] text-mute">0{i + 1}</span>
          <p className="mt-10 font-mono text-[11px] uppercase tracking-[0.2em] text-beam">{item.family}</p>
          <h3 className="display mt-2 text-[2rem] font-bold leading-none tracking-[-0.045em] text-bone">{item.title}</h3>
          <p className="mt-3 text-[15px] leading-relaxed text-bone/65">{item.tagline}</p>
          <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-white/[0.08] pt-5">
            {item.specs.map((s) => (
              <div key={s.k}>
                <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-mute">{s.k}</dt>
                <dd className="mt-1 text-sm text-bone">{s.v}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-6 flex items-center justify-between text-sm text-mute">
            <span>
              from <span className="display text-xl font-semibold text-bone">${item.from}</span>/mo
            </span>
            <ArrowUpRight className="h-4 w-4 text-bone" />
          </p>
        </Link>
      </StaggerItem>
    ))}
  </Stagger>
);

export const Fleet = () => (
  <section id="fleet" className="relative py-20 sm:py-28">
    <div className="shell">
      <SectionIntro
        index="01"
        total="05"
        eyebrow="The fleet"
        title={"Seven machines.\n*One short menu.*"}
        description="Three shared CPU lines for everyday work, four dedicated lines for production, and Windows RDP on anything with 8 GB of memory."
      />
      <div className="mt-14 sm:mt-20">
        <DesktopFleet />
        <MobileFleet />
      </div>
    </div>
  </section>
);
