import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { EASE_OUT } from "@/lib/motion";
import { CATEGORIES, FAMILY_LABEL, OPERATING_SYSTEMS, RDP_FROM, VPS_FROM, DEDICATED_FROM } from "@/lib/plans";
import { usePageMeta } from "@/hooks/usePageMeta";
import { PageHero } from "@/components/site/PageHero";
import { SectionIntro } from "@/components/site/SectionIntro";
import { Action } from "@/components/site/Action";
import { CTABand } from "@/components/site/CTABand";
import { Lineup } from "@/components/servers/Lineup";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { Spotlight } from "@/components/motion/Spotlight";

const JumpCard = () => (
  <div className="panel p-6">
    {(["shared", "dedicated"] as const).map((family, fi) => (
      <div key={family} className={cn(fi > 0 && "mt-6 border-t border-white/[0.07] pt-6")}>
        <div className="flex items-baseline justify-between">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-mute">{FAMILY_LABEL[family]}</p>
          <p className="text-[13px] text-mute">from ${family === "shared" ? VPS_FROM : DEDICATED_FROM}/mo</p>
        </div>
        <ul className="mt-3 space-y-1">
          {CATEGORIES.filter((c) => c.family === family).map((c) => (
            <li key={c.id}>
              <Link
                to={`/servers#${c.id}`}
                className="group flex items-center justify-between rounded-lg px-2 py-1.5 text-[15px] text-bone/80 transition-colors hover:bg-white/[0.04] hover:text-bone"
              >
                {c.name}
                <span className="font-mono text-[11px] text-mute transition-colors group-hover:text-beam">{c.tagline}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    ))}
  </div>
);

const CoreGrid = ({ dedicated }: { dedicated: boolean }) => (
  <div className="grid max-w-[300px] grid-cols-8 gap-1.5">
    {Array.from({ length: 32 }).map((_, i) => {
      const mine = dedicated ? i < 8 : i % 4 === 0;
      const other = !dedicated && !mine;
      return (
        <motion.span
          key={i}
          className={cn(
            "aspect-square rounded-[4px]",
            mine ? "bg-gradient-to-br from-beam to-nebula" : other ? "bg-white/[0.14]" : "bg-white/[0.04]",
          )}
          initial={{ opacity: 0, scale: 0.6 }}
          whileInView={{ opacity: mine ? 1 : other ? 0.8 : 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: EASE_OUT, delay: (i % 8) * 0.03 + Math.floor(i / 8) * 0.05 }}
        />
      );
    })}
  </div>
);

const SharedVsDedicated = () => (
  <section className="relative py-20 sm:py-28">
    <div className="shell">
      <SectionIntro
        eyebrow="Shared or dedicated"
        title={"The only choice\n*that really matters.*"}
        description="Everything else is sizing. This decides how your server behaves when the machine next door gets busy."
      />
      <Stagger className="mt-14 grid gap-3 lg:grid-cols-2">
        {[
          {
            title: "Shared CPU",
            price: VPS_FROM,
            dedicated: false,
            lead: "Your vCPUs are time-sliced on a host with other customers.",
            points: [
              "The best price for the performance you get",
              "Great for sites, bots, APIs, staging and small databases",
              "Bursty work is fine, sustained 100% CPU is not what it is for",
            ],
            legend: [
              ["bg-beam", "Your vCPU time"],
              ["bg-white/[0.14]", "Other tenants"],
            ],
          },
          {
            title: "Dedicated CPU",
            price: DEDICATED_FROM,
            dedicated: true,
            lead: "Physical cores are reserved for you and nobody else runs on them.",
            points: [
              "Consistent performance under sustained load",
              "Built for production apps, databases, CI and encoding",
              "Four shapes: general, CPU, memory and storage optimized",
            ],
            legend: [
              ["bg-beam", "Your reserved cores"],
              ["bg-white/[0.04]", "Idle capacity on the host"],
            ],
          },
        ].map((card) => (
          <StaggerItem key={card.title} className="h-full">
            <Spotlight className="panel flex h-full flex-col p-7 sm:p-9">
              <div className="flex items-baseline justify-between">
                <h3 className="display text-[2.2rem] font-semibold leading-none tracking-[-0.045em] text-bone">
                  {card.title}
                </h3>
                <p className="text-[14px] text-mute">
                  from <span className="text-bone">${card.price}</span>/mo
                </p>
              </div>
              <p className="mt-4 max-w-md text-[16px] leading-relaxed text-bone/75">{card.lead}</p>
              <div className="mt-8 rounded-2xl border border-white/[0.07] bg-ink/60 p-5">
                <CoreGrid dedicated={card.dedicated} />
                <div className="mt-4 flex flex-wrap gap-4 font-mono text-[10.5px] uppercase tracking-[0.14em] text-mute">
                  {card.legend.map(([c, l]) => (
                    <span key={l} className="inline-flex items-center gap-2">
                      <span className={cn("h-2.5 w-2.5 rounded-[3px]", c)} />
                      {l}
                    </span>
                  ))}
                </div>
              </div>
              <ul className="mt-8 space-y-3">
                {card.points.map((p) => (
                  <li key={p} className="flex gap-3 text-[15px] text-bone/80">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-beam" />
                    {p}
                  </li>
                ))}
              </ul>
            </Spotlight>
          </StaggerItem>
        ))}
      </Stagger>
    </div>
  </section>
);

const RdpWindow = () => (
  <div className="relative overflow-hidden rounded-2xl border border-white/[0.1] bg-[#0b1a2c] shadow-lift">
    <div className="flex items-center justify-between border-b border-white/[0.08] bg-ink/60 px-4 py-2.5">
      <span className="font-mono text-[11px] text-bone/70">rdp-voc-g-4c-16gb · Administrator</span>
      <span className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <span key={i} className="h-2.5 w-2.5 rounded-sm border border-white/20" />
        ))}
      </span>
    </div>
    <div className="relative aspect-[16/10] bg-[radial-gradient(90%_80%_at_70%_20%,#1d4f7c,transparent_60%),radial-gradient(70%_70%_at_10%_90%,#123150,transparent_60%)]">
      <div className="absolute left-5 top-5 grid gap-4">
        {["This PC", "Terminal", "Browser"].map((l, i) => (
          <div key={l} className="flex w-16 flex-col items-center gap-1.5">
            <span className={cn("h-9 w-9 rounded-lg", i === 0 ? "bg-beam/80" : "bg-white/15")} />
            <span className="text-[10px] text-bone/75">{l}</span>
          </div>
        ))}
      </div>
      <motion.div
        className="absolute bottom-16 right-6 w-[58%] rounded-xl border border-white/10 bg-ink/85 p-4 backdrop-blur-md"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, ease: EASE_OUT, delay: 0.3 }}
      >
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-mute">System</p>
        <p className="mt-2 text-[13px] text-bone">Windows Server 2022 Datacenter</p>
        <div className="mt-3 grid grid-cols-3 gap-2 font-mono text-[11px]">
          {[
            ["CPU", "4 cores"],
            ["RAM", "16 GB"],
            ["Disk", "80 GB NVMe"],
          ].map(([k, v]) => (
            <div key={k} className="rounded-lg bg-white/[0.04] px-2 py-1.5">
              <p className="text-mute">{k}</p>
              <p className="text-bone">{v}</p>
            </div>
          ))}
        </div>
      </motion.div>
      <div className="absolute inset-x-0 bottom-0 flex h-10 items-center justify-center gap-2 border-t border-white/[0.08] bg-ink/70 backdrop-blur-md">
        {[0, 1, 2, 3, 4].map((i) => (
          <span key={i} className={cn("h-5 w-5 rounded-md", i === 0 ? "bg-beam" : "bg-white/15")} />
        ))}
      </div>
    </div>
  </div>
);

const RdpSpotlight = () => (
  <section id="rdp" className="relative scroll-mt-20 py-20 sm:py-28">
    <div className="shell grid items-center gap-12 lg:grid-cols-12">
      <div className="lg:col-span-5">
        <SectionIntro
          layout="stack"
          eyebrow="Cloud RDP"
          title={"A Windows desk,\n*anywhere.*"}
          description={`Windows Server 2019 or 2022 with full Administrator rights, from $${RDP_FROM} a month. Connect from Windows, macOS, Linux, iOS or Android with any Remote Desktop client.`}
        />
        <Reveal delay={0.2}>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {[
              "Full Administrator access",
              "Windows Server 2019 or 2022",
              "SSD or NVMe storage",
              "Any plan with 8 GB or more",
            ].map((p) => (
              <li key={p} className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.02] px-4 py-3 text-[14px] text-bone/85">
                <Check className="h-4 w-4 shrink-0 text-beam" />
                {p}
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <Action to="/pricing?kind=rdp">See Windows prices</Action>
          </div>
        </Reveal>
      </div>
      <Reveal delay={0.1} y={40} className="lg:col-span-7">
        <RdpWindow />
      </Reveal>
    </div>
  </section>
);

const Images = () => (
  <section className="relative py-20 sm:py-28">
    <div className="shell">
      <SectionIntro
        eyebrow="Images and hardware"
        title={"Your OS, on\n*current silicon.*"}
        description="Clean, current images and hosts built on AMD EPYC and Intel Xeon. Storage is SSD on Cloud Compute and NVMe on everything else."
      />
      <Stagger className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {OPERATING_SYSTEMS.map((os) => (
          <StaggerItem key={os.name}>
            <Spotlight className="panel flex h-full flex-col p-6">
              <span
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-xl border font-mono text-[12px]",
                  os.kind === "rdp" ? "border-beam/30 text-beam" : "border-white/10 text-bone/80",
                )}
              >
                {os.name.startsWith("Windows") ? `W${os.name.slice(-2)}` : os.name.slice(0, 2).toUpperCase()}
              </span>
              <p className="mt-10 text-[17px] text-bone">{os.name}</p>
              <p className="mt-1 font-mono text-[10.5px] uppercase tracking-[0.16em] text-mute">{os.detail}</p>
            </Spotlight>
          </StaggerItem>
        ))}
      </Stagger>
    </div>
  </section>
);

const Servers = () => {
  usePageMeta(
    "Servers",
    "Seven kinds of cloud server: three shared CPU lines, four dedicated CPU lines and Windows RDP on any plan with 8 GB of memory.",
  );
  return (
    <>
      <PageHero
        eyebrow="Servers"
        title={"Seven kinds of server,\n*explained plainly.*"}
        description="Shared CPU is the value pick for most projects. Dedicated CPU reserves the cores for you. Any plan with 8 GB of memory can also run Windows."
        aside={<JumpCard />}
      >
        <Action to="/pricing">Compare prices</Action>
        <Action to="#rdp" variant="secondary" icon="none">
          Looking for Windows?
        </Action>
      </PageHero>
      <Lineup />
      <SharedVsDedicated />
      <RdpSpotlight />
      <Images />
      <CTABand />
    </>
  );
};

export default Servers;
