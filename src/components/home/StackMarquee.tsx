import { Marquee } from "@/components/motion/Marquee";

const ITEMS = [
  "Ubuntu",
  "Debian",
  "AlmaLinux",
  "Windows Server 2022",
  "Windows Server 2019",
  "Docker",
  "Nginx",
  "Node.js",
  "Python",
  "PostgreSQL",
  "Redis",
  "WireGuard",
  "Game servers",
  "MetaTrader",
];

export const StackMarquee = () => (
  <section aria-label="Software that runs on Beam" className="relative border-y border-white/[0.06] bg-ink-2/40 py-6">
    <div className="shell mb-4 flex items-center justify-between">
      <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-mute">Runs what you run</span>
      <span className="hidden font-mono text-[11px] uppercase tracking-[0.22em] text-mute sm:inline">
        Root access, your stack
      </span>
    </div>
    <Marquee duration={48}>
      {ITEMS.map((item) => (
        <span key={item} className="flex items-center">
          <span className="display whitespace-nowrap px-7 text-[clamp(1.4rem,2.6vw,2.2rem)] font-semibold tracking-[-0.035em] text-bone/80 transition-colors duration-300 hover:text-bone">
            {item}
          </span>
          <span aria-hidden className="h-2 w-2 rotate-45 rounded-[2px] bg-gradient-to-br from-beam to-nebula" />
        </span>
      ))}
    </Marquee>
  </section>
);
