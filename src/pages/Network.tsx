import { useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { ARCS, REGION_ORDER, summarize, type Location } from "@/lib/locations";
import { useLocations } from "@/hooks/useLocations";
import { usePageMeta } from "@/hooks/usePageMeta";
import { PageHero } from "@/components/site/PageHero";
import { SectionIntro } from "@/components/site/SectionIntro";
import { CTABand } from "@/components/site/CTABand";
import { LazyGlobe } from "@/components/fx/LazyGlobe";
import type { GlobeHandle } from "@/components/fx/ParticleGlobe";
import { CountUp } from "@/components/motion/CountUp";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { Spotlight } from "@/components/motion/Spotlight";

const TIPS = [
  {
    title: "Serve users, not yourself",
    text: "Put the server near the people who use it. A site for customers in Germany belongs in Frankfurt, even if you live in Toronto.",
  },
  {
    title: "Mind where data must live",
    text: "Some businesses need data to stay in a country or region. Pick a location inside that border and keep backups there too.",
  },
  {
    title: "Games and trading want proximity",
    text: "For game servers, trading terminals and voice, every hop counts. Choose the location closest to the players or the exchange.",
  },
];

const Row = ({
  l,
  active,
  onFocus,
}: {
  l: Location;
  active: boolean;
  onFocus: (l: Location) => void;
}) => (
  <li>
    <button
      type="button"
      onMouseEnter={() => onFocus(l)}
      onFocus={() => onFocus(l)}
      onClick={() => onFocus(l)}
      className={cn(
        "group grid w-full grid-cols-[3.5rem_1fr_auto] items-center gap-4 rounded-xl px-3 py-3 text-left transition-colors duration-300",
        active ? "bg-white/[0.06]" : "hover:bg-white/[0.03]",
      )}
    >
      <span className={cn("font-mono text-[12px] tracking-[0.12em]", active ? "text-ember" : "text-beam")}>{l.code}</span>
      <span className="min-w-0">
        <span className="block truncate text-[15px] text-bone">{l.name}</span>
        <span className="block truncate text-[13px] text-mute">{l.country}</span>
      </span>
      <span
        className={cn(
          "rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.16em]",
          l.hub ? "border-beam/30 text-beam" : "border-white/10 text-mute",
        )}
      >
        {l.hub ? "Hub" : "Edge"}
      </span>
    </button>
  </li>
);

const Network = () => {
  const locations = useLocations();
  const stats = useMemo(() => summarize(locations), [locations]);
  usePageMeta(
    "Network",
    `${stats.total} Beam Server locations across ${stats.continents} continents, with ${stats.hubs} primary hubs and ${stats.edges} edge locations.`,
  );
  const globe = useRef<GlobeHandle>(null);
  const [active, setActive] = useState<string | null>(null);
  const [region, setRegion] = useState<string>("All");

  const regions = useMemo(() => {
    const present = Array.from(new Set(locations.map((l) => l.region)));
    return present.sort((a, b) => {
      const ia = REGION_ORDER.indexOf(a);
      const ib = REGION_ORDER.indexOf(b);
      return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
    });
  }, [locations]);

  const grouped = useMemo(
    () =>
      regions
        .filter((r) => region === "All" || r === region)
        .map((r) => ({
          region: r,
          items: locations.filter((l) => l.region === r).sort((a, b) => Number(b.hub) - Number(a.hub)),
        })),
    [regions, region, locations],
  );

  const focus = (l: Location) => {
    setActive(l.code);
    globe.current?.focus(l.lat, l.lng);
  };

  const words = ["Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight"];

  return (
    <>
      <PageHero
        background="mesh"
        eyebrow="Network"
        title={`${stats.total} locations.\n*${words[stats.continents] ?? stats.continents} continents.*`}
        description={`${stats.hubs} primary hubs carry most of the capacity. ${stats.edges} edge locations put a server a short hop from the people using it. Pick one when you order, or ask us which fits best.`}
      />

      <section className="relative -mt-6 pb-8">
        <div className="shell">
          <Reveal className="grid grid-cols-2 gap-px overflow-hidden rounded-[1.4rem] border border-white/[0.08] bg-white/[0.08] md:grid-cols-4">
            {[
              { v: stats.total, l: "Locations" },
              { v: stats.hubs, l: "Primary hubs" },
              { v: stats.edges, l: "Edge locations" },
              { v: stats.continents, l: "Continents" },
            ].map((s) => (
              <div key={s.l} className="bg-ink-2 p-6">
                <p className="display text-[3rem] font-bold leading-none tracking-[-0.05em] text-bone">
                  <CountUp to={s.v} />
                </p>
                <p className="mt-2 font-mono text-[10.5px] uppercase tracking-[0.18em] text-mute">{s.l}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="relative py-20 sm:py-28">
        <div className="shell grid gap-10 lg:grid-cols-12">
          <div className="order-2 lg:order-1 lg:col-span-5">
            <SectionIntro
              layout="stack"
              eyebrow="Every location"
              title={"Hover a city.\n*Watch it turn.*"}
            />
            <div className="mt-8 flex flex-wrap gap-2">
              {["All", ...regions].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRegion(r)}
                  className={cn(
                    "rounded-full border px-3.5 py-1.5 text-[13px] transition-colors duration-300",
                    region === r
                      ? "border-bone bg-bone text-ink"
                      : "border-white/10 text-bone/70 hover:border-white/25 hover:text-bone",
                  )}
                >
                  {r}
                </button>
              ))}
            </div>
            <div className="mt-8 space-y-8" onMouseLeave={() => setActive(null)}>
              {grouped.map((g) => (
                <div key={g.region}>
                  <p className="flex items-center justify-between border-b border-white/[0.08] pb-3 font-mono text-[11px] uppercase tracking-[0.2em] text-mute">
                    {g.region}
                    <span>{g.items.length}</span>
                  </p>
                  <ul className="mt-2">
                    {g.items.map((l) => (
                      <Row key={`${l.code}-${l.name}`} l={l} active={active === l.code} onFocus={focus} />
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
          <div className="order-1 lg:order-2 lg:col-span-7">
            <div className="lg:sticky lg:top-24">
              <div className="relative overflow-hidden rounded-[2rem] border border-white/[0.07] bg-ink-2/60">
                <div aria-hidden className="absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_45%,hsl(var(--beam)/0.08),transparent_70%)]" />
                <LazyGlobe
                  ref={globe}
                  locations={locations}
                  arcs={ARCS}
                  activeCode={active}
                  className="aspect-square w-full"
                />
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between px-6 py-5 font-mono text-[10.5px] uppercase tracking-[0.18em] text-mute">
                  <span className="inline-flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-beam" /> Primary hub
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-beam/60" /> Edge
                  </span>
                  <span className="hidden sm:inline">Drag to rotate</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative py-20 sm:py-28">
        <div className="shell">
          <SectionIntro
            eyebrow="Choosing a region"
            title={"Three rules\n*of thumb.*"}
            description="Latency follows distance. These cover almost every case we get asked about."
          />
          <Stagger className="mt-14 grid gap-3 lg:grid-cols-3">
            {TIPS.map((t, i) => (
              <StaggerItem key={t.title} className="h-full">
                <Spotlight className="panel h-full p-7 sm:p-8">
                  <span className="font-mono text-[11px] tracking-[0.2em] text-mute">0{i + 1}</span>
                  <h3 className="display mt-10 text-[1.7rem] font-semibold leading-[1.05] tracking-[-0.04em] text-bone">
                    {t.title}
                  </h3>
                  <p className="mt-4 text-[15px] leading-relaxed text-mute">{t.text}</p>
                </Spotlight>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <CTABand
        eyebrow="Pick a location"
        title={"Choose a city.\n*We do the rest.*"}
        description="Tell us where your users are when you order and we will provision in the closest location, usually within 30 minutes."
      />
    </>
  );
};

export default Network;
