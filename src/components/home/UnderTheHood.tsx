import { motion } from "framer-motion";
import { ArrowRight, Mail, MessageCircle, Ticket } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { EASE_OUT } from "@/lib/motion";
import { OPERATING_SYSTEMS } from "@/lib/plans";
import { SectionIntro } from "@/components/site/SectionIntro";
import { Spotlight } from "@/components/motion/Spotlight";
import { CountUp } from "@/components/motion/CountUp";
import { Stagger, StaggerItem } from "@/components/motion/Reveal";
import { useSupportClock } from "@/hooks/useSupportClock";

const Tile = ({
  label,
  title,
  children,
  className,
  text,
}: {
  label: string;
  title?: string;
  text?: string;
  children?: ReactNode;
  className?: string;
}) => (
  <StaggerItem className={cn("h-full", className)}>
    <Spotlight className="panel flex h-full flex-col overflow-hidden p-7 sm:p-8">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-mute">{label}</p>
      {title && (
        <h3 className="display mt-3 text-[1.75rem] font-semibold leading-[1.05] tracking-[-0.035em] text-bone sm:text-[2rem]">
          {title}
        </h3>
      )}
      {text && <p className="mt-3 max-w-md text-[15px] leading-relaxed text-mute">{text}</p>}
      {children}
    </Spotlight>
  </StaggerItem>
);

const DISKS = [
  { name: "Spinning disk", value: 160, note: "typical" },
  { name: "SATA SSD", value: 550, note: "typical" },
  { name: "NVMe on Beam", value: 7000, note: "up to", hot: true },
];

const Throughput = () => (
  <div className="mt-auto space-y-4 pt-10">
    {DISKS.map((d, i) => (
      <div key={d.name}>
        <div className="flex items-baseline justify-between text-[13px]">
          <span className={d.hot ? "text-bone" : "text-mute"}>{d.name}</span>
          <span className="font-mono text-[12px] text-mute">
            {d.note}{" "}
            <CountUp to={d.value} className={d.hot ? "text-bone" : undefined} delay={0.2 + i * 0.1} /> MB/s
          </span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/[0.05]">
          <motion.div
            className={cn("h-full rounded-full", d.hot ? "bg-gradient-to-r from-beam-deep to-beam" : "bg-white/20")}
            initial={{ width: 0 }}
            whileInView={{ width: `${Math.max(2.5, (d.value / 7000) * 100)}%` }}
            viewport={{ once: true }}
            transition={{ duration: 1.6, ease: EASE_OUT, delay: 0.2 + i * 0.12 }}
          />
        </div>
      </div>
    ))}
  </div>
);

const SlaBars = () => (
  <div className="mt-auto pt-8">
    <div className="flex h-12 items-end gap-[3px]">
      {Array.from({ length: 30 }).map((_, i) => (
        <motion.span
          key={i}
          className="flex-1 rounded-[2px] bg-signal/70"
          initial={{ height: "20%", opacity: 0.2 }}
          whileInView={{ height: "100%", opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: EASE_OUT, delay: i * 0.025 }}
        />
      ))}
    </div>
    <div className="mt-2 flex justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-mute">
      <span>30 days</span>
      <span>Today</span>
    </div>
  </div>
);

const Code = ({ lines }: { lines: [string, string][] }) => (
  <div className="mt-auto rounded-xl border border-white/[0.07] bg-ink/70 p-4 font-mono text-[12.5px] leading-[1.8]">
    {lines.map(([a, b], i) => (
      <div key={i} className="truncate">
        <span className="text-beam">{a}</span> <span className="text-bone/80">{b}</span>
      </div>
    ))}
  </div>
);

const Upgrade = () => (
  <div className="mt-auto flex items-center gap-3 pt-8 font-mono text-[12px]">
    <span className="rounded-lg border border-white/10 px-3 py-2 text-mute">vc2-2c-4gb</span>
    <motion.span
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-beam text-ink"
      initial={{ x: -8, opacity: 0 }}
      whileInView={{ x: 0, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: EASE_OUT, delay: 0.3 }}
    >
      <ArrowRight className="h-4 w-4" />
    </motion.span>
    <span className="rounded-lg border border-beam/40 bg-beam/10 px-3 py-2 text-bone">vc2-4c-8gb</span>
  </div>
);

const Channels = () => {
  const clock = useSupportClock();
  const rows = [
    {
      icon: MessageCircle,
      name: "WhatsApp",
      detail: "Sales and quick questions",
      status: clock.open ? "Open now" : "Opens next business day",
      on: clock.open,
    },
    { icon: Mail, name: "Email", detail: "Replies within 2 hours in business hours", status: "Any time", on: true },
    { icon: Ticket, name: "Portal tickets", detail: "Technical issues, around the clock", status: "24/7", on: true },
  ];
  return (
    <ul className="mt-auto divide-y divide-white/[0.06] pt-6">
      {rows.map((r) => (
        <li key={r.name} className="flex items-center gap-4 py-3.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 text-beam">
            <r.icon className="h-4 w-4" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[15px] text-bone">{r.name}</span>
            <span className="block truncate text-[13px] text-mute">{r.detail}</span>
          </span>
          <span className="inline-flex shrink-0 items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.14em] text-mute">
            <span className={cn("h-1.5 w-1.5 rounded-full", r.on ? "bg-signal" : "bg-ember")} />
            {r.status}
          </span>
        </li>
      ))}
    </ul>
  );
};

export const UnderTheHood = () => (
  <section className="relative py-20 sm:py-28">
    <div className="shell">
      <SectionIntro
        index="02"
        total="05"
        eyebrow="Under the hood"
        title={"The boring parts,\n*done properly.*"}
        description="Fast disks, both IP stacks, real root access and an SLA with a number on it. The things you only notice when a host gets them wrong."
      />
      <Stagger className="mt-14 grid gap-3 sm:mt-20 lg:grid-cols-12" gap={0.07}>
        <Tile
          className="lg:col-span-7"
          label="Storage"
          title="NVMe that reads at up to 7,000 MB/s."
          text="Every High Frequency, High Performance and Dedicated plan runs on NVMe. Databases, builds and package installs stop waiting on the disk."
        >
          <Throughput />
        </Tile>
        <Tile className="lg:col-span-5" label="Uptime SLA">
          <p className="display mt-4 text-[clamp(4rem,8vw,6.2rem)] font-bold leading-none tracking-[-0.06em] text-bone">
            <CountUp to={99.9} decimals={1} suffix="%" />
          </p>
          <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-mute">
            That leaves about 43 minutes of downtime in a month. We treat every one of them like a bug.
          </p>
          <SlaBars />
        </Tile>
        <Tile
          className="lg:col-span-4"
          label="Access"
          title="Full root. Full admin."
          text="Root on Linux, Administrator on Windows, and as many logins as you need."
        >
          <div className="pt-8" />
          <Code
            lines={[
              ["$", "sudo -i"],
              ["#", "whoami"],
              ["", "root"],
            ]}
          />
        </Tile>
        <Tile
          className="lg:col-span-4"
          label="Network"
          title="IPv4 and IPv6, day one."
          text="Both stacks are live on every plan from the first boot."
        >
          <div className="pt-8" />
          <Code
            lines={[
              ["inet ", "203.0.113.24/24"],
              ["inet6", "2001:db8:4a::24/64"],
            ]}
          />
        </Tile>
        <Tile
          className="lg:col-span-4"
          label="Upgrades"
          title="Grow without a rebuild."
          text="Move up a plan when you need to and pay only the difference for the rest of the month."
        >
          <Upgrade />
        </Tile>
        <Tile className="lg:col-span-5" label="Images" title="Pick your OS.">
          <ul className="mt-auto grid grid-cols-1 gap-2 pt-8 sm:grid-cols-2">
            {OPERATING_SYSTEMS.map((os) => (
              <li
                key={os.name}
                className="flex items-center justify-between rounded-xl border border-white/[0.07] bg-white/[0.02] px-4 py-3"
              >
                <span className="text-[14px] text-bone">{os.name}</span>
                <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-mute">{os.detail}</span>
              </li>
            ))}
          </ul>
        </Tile>
        <Tile
          className="lg:col-span-7"
          label="Support"
          title="People on the other end."
          text="No bots, no ticket roulette. Pick the channel that suits the problem."
        >
          <Channels />
        </Tile>
      </Stagger>
    </div>
  </section>
);
