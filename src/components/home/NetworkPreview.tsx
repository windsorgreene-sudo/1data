import { useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { ARCS, summarize } from "@/lib/locations";
import { useLocations } from "@/hooks/useLocations";
import { LazyGlobe } from "@/components/fx/LazyGlobe";
import type { GlobeHandle } from "@/components/fx/ParticleGlobe";
import { CountUp } from "@/components/motion/CountUp";
import { Reveal } from "@/components/motion/Reveal";
import { Eyebrow } from "@/components/site/SectionIntro";
import { SplitText } from "@/components/motion/SplitText";
import { Action } from "@/components/site/Action";

export const NetworkPreview = () => {
  const locations = useLocations();
  const globe = useRef<GlobeHandle>(null);
  const [active, setActive] = useState<string | null>(null);
  const stats = useMemo(() => summarize(locations), [locations]);
  const hubs = useMemo(() => locations.filter((l) => l.hub), [locations]);

  const focus = (code: string) => {
    const l = locations.find((x) => x.code === code);
    if (!l) return;
    setActive(code);
    globe.current?.focus(l.lat, l.lng);
  };

  return (
    <section className="relative overflow-hidden py-20 sm:py-28">
      <div aria-hidden className="pointer-events-none absolute right-[-20%] top-1/2 h-[900px] w-[900px] -translate-y-1/2 rounded-full bg-beam/[0.05] blur-[140px]" />
      <div className="shell relative">
        <Eyebrow label="The network" index="03" total="05" />
        <div className="mt-10 grid items-center gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SplitText
              text={"Close to your users,\n*wherever they are.*"}
              className="display text-[clamp(2.4rem,5vw,4.4rem)] font-bold leading-[0.95] text-bone"
            />
            <Reveal delay={0.15} className="mt-6 max-w-md text-[17px] leading-relaxed text-mute">
              {stats.hubs} primary hubs carry most of the capacity. {stats.edges} edge locations put a server a short hop
              from the people using it.
            </Reveal>

            <Reveal delay={0.2} className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.07]">
              {[
                { v: stats.total, l: "Locations" },
                { v: stats.continents, l: "Continents" },
                { v: stats.hubs, l: "Primary hubs" },
                { v: 99.9, l: "Uptime SLA", d: 1, s: "%" },
              ].map((s) => (
                <div key={s.l} className="bg-ink-2 p-5">
                  <p className="display text-[2.4rem] font-bold leading-none tracking-[-0.05em] text-bone">
                    <CountUp to={s.v} decimals={s.d ?? 0} suffix={s.s ?? ""} />
                  </p>
                  <p className="mt-2 font-mono text-[10.5px] uppercase tracking-[0.18em] text-mute">{s.l}</p>
                </div>
              ))}
            </Reveal>

            <Reveal delay={0.25} className="mt-8">
              <p className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-mute">Hover a hub</p>
              <div className="mt-3 flex flex-wrap gap-2" onMouseLeave={() => setActive(null)}>
                {hubs.map((h) => (
                  <button
                    key={h.code}
                    type="button"
                    onMouseEnter={() => focus(h.code)}
                    onFocus={() => focus(h.code)}
                    onClick={() => focus(h.code)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 font-mono text-[11px] tracking-[0.12em] transition-colors duration-300",
                      active === h.code
                        ? "border-ember/60 bg-ember/10 text-ember"
                        : "border-white/10 text-bone/70 hover:border-white/25 hover:text-bone",
                    )}
                  >
                    {h.code} <span className="text-mute">{h.name}</span>
                  </button>
                ))}
              </div>
            </Reveal>

            <Reveal delay={0.3} className="mt-10">
              <Action to="/network" variant="secondary">
                Explore all {stats.total} locations
              </Action>
            </Reveal>
          </div>

          <div className="relative lg:col-span-7">
            <LazyGlobe
              ref={globe}
              locations={locations}
              arcs={ARCS}
              activeCode={active}
              className="mx-auto aspect-square w-full max-w-[720px]"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
