import { cn } from "@/lib/utils";

export type VisualKind = "rack" | "wave" | "bars" | "cores" | "window";

const Rack = () => (
  <svg viewBox="0 0 200 150" className="h-full w-full" fill="none" aria-hidden>
    {[0, 1, 2, 3, 4].map((i) => (
      <g key={i} transform={`translate(20 ${14 + i * 25})`}>
        <rect width="160" height="18" rx="5" stroke="hsl(0 0% 100% / 0.16)" />
        <circle cx="12" cy="9" r="2.4" className="animate-pulse" style={{ animationDelay: `${i * 0.35}s` }} fill="hsl(186 100% 58%)" />
        <circle cx="21" cy="9" r="2.4" fill="hsl(0 0% 100% / 0.18)" />
        {[0, 1, 2, 3, 4, 5, 6].map((j) => (
          <rect key={j} x={96 + j * 8} y="6" width="4" height="6" rx="1" fill="hsl(0 0% 100% / 0.12)" />
        ))}
      </g>
    ))}
  </svg>
);

const Wave = () => (
  <svg viewBox="0 0 200 150" className="h-full w-full" fill="none" aria-hidden>
    {[0, 1, 2].map((i) => (
      <path
        key={i}
        d="M0 75 C 25 25, 50 25, 75 75 S 125 125, 150 75 S 200 25, 225 75"
        stroke={i === 1 ? "hsl(186 100% 58%)" : "hsl(0 0% 100% / 0.14)"}
        strokeWidth={i === 1 ? 1.6 : 1}
        strokeDasharray="6 7"
        style={{
          transform: `translateY(${(i - 1) * 22}px)`,
          animation: `dash-flow ${2.4 + i * 0.6}s linear infinite`,
        }}
      />
    ))}
  </svg>
);

const Bars = () => (
  <svg viewBox="0 0 200 150" className="h-full w-full" fill="none" aria-hidden>
    {[48, 80, 62, 104, 90, 118, 72, 98, 126, 84].map((h, i) => (
      <rect
        key={i}
        x={14 + i * 18}
        y={140 - h}
        width="9"
        height={h}
        rx="2"
        fill={i === 8 ? "hsl(186 100% 58%)" : "hsl(0 0% 100% / 0.12)"}
        style={{ transformOrigin: `${18 + i * 18}px 140px`, animation: `bar-breathe 3.2s ${i * 0.18}s ease-in-out infinite` }}
      />
    ))}
  </svg>
);

const Cores = () => (
  <svg viewBox="0 0 200 150" className="h-full w-full" fill="none" aria-hidden>
    <rect x="46" y="21" width="108" height="108" rx="12" stroke="hsl(0 0% 100% / 0.18)" />
    {Array.from({ length: 16 }).map((_, i) => {
      const x = 58 + (i % 4) * 22;
      const y = 33 + Math.floor(i / 4) * 22;
      return (
        <rect
          key={i}
          x={x}
          y={y}
          width="16"
          height="16"
          rx="3"
          fill="hsl(186 100% 58%)"
          style={{ opacity: 0.18, animation: `core-light 2.8s ${(i % 5) * 0.22 + Math.floor(i / 4) * 0.15}s ease-in-out infinite` }}
        />
      );
    })}
    {[0, 1, 2, 3, 4].map((i) => (
      <g key={i} stroke="hsl(0 0% 100% / 0.14)">
        <line x1={62 + i * 19} y1="8" x2={62 + i * 19} y2="21" />
        <line x1={62 + i * 19} y1="129" x2={62 + i * 19} y2="142" />
      </g>
    ))}
  </svg>
);

const Window = () => (
  <svg viewBox="0 0 200 150" className="h-full w-full" fill="none" aria-hidden>
    <rect x="18" y="16" width="164" height="110" rx="8" stroke="hsl(0 0% 100% / 0.18)" />
    <line x1="18" y1="32" x2="182" y2="32" stroke="hsl(0 0% 100% / 0.12)" />
    {[0, 1, 2].map((i) => (
      <rect key={i} x={160 - i * 10} y="21" width="6" height="6" rx="1" stroke="hsl(0 0% 100% / 0.2)" />
    ))}
    <rect x="30" y="44" width="20" height="20" rx="3" fill="hsl(186 100% 58% / 0.8)" />
    <rect x="30" y="72" width="20" height="20" rx="3" fill="hsl(0 0% 100% / 0.12)" />
    <rect x="62" y="44" width="106" height="68" rx="5" fill="hsl(0 0% 100% / 0.04)" stroke="hsl(0 0% 100% / 0.1)" />
    <rect x="72" y="56" width="60" height="4" rx="2" fill="hsl(0 0% 100% / 0.2)" />
    <rect x="72" y="66" width="80" height="4" rx="2" fill="hsl(0 0% 100% / 0.1)" />
    <rect x="72" y="76" width="44" height="4" rx="2" fill="hsl(0 0% 100% / 0.1)" />
    <rect x="18" y="132" width="164" height="10" rx="3" fill="hsl(0 0% 100% / 0.06)" />
    <rect x="94" y="134.5" width="12" height="5" rx="1.5" fill="hsl(186 100% 58%)" />
  </svg>
);

const MAP: Record<VisualKind, () => JSX.Element> = {
  rack: Rack,
  wave: Wave,
  bars: Bars,
  cores: Cores,
  window: Window,
};

export const FleetVisual = ({ kind, className }: { kind: VisualKind; className?: string }) => {
  const Comp = MAP[kind];
  return (
    <div className={cn("pointer-events-none", className)}>
      <Comp />
    </div>
  );
};
