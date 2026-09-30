import { motion, motionValue, useReducedMotion, useTransform, type MotionValue } from "framer-motion";
import { cn } from "@/lib/utils";

const STROKE = "hsl(var(--bone) / 0.18)";
const BEAM = "hsl(var(--beam))";
const NEBULA = "hsl(var(--nebula))";

const blade = (cx: number, cy: number, w: number, d: number, h: number) => {
  const top = `${cx},${cy - d} ${cx + w},${cy} ${cx},${cy + d} ${cx - w},${cy}`;
  const left = `${cx - w},${cy} ${cx},${cy + d} ${cx},${cy + d + h} ${cx - w},${cy + h}`;
  const right = `${cx},${cy + d} ${cx + w},${cy} ${cx + w},${cy + h} ${cx},${cy + d + h}`;
  return { top, left, right };
};

export const HeroFallback = () => {
  const rows = [0, 1, 2];
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="absolute inset-[12%] rounded-full bg-[radial-gradient(closest-side,hsl(var(--beam)/0.12),transparent)]" />
      <svg viewBox="0 0 400 300" className="relative h-[78%] w-[78%]" fill="none">
        {rows.map((r) => {
          const y = 190 - r * 46;
          const b = blade(200, y, 130, 52, 18);
          const led = r === 1 ? NEBULA : BEAM;
          return (
            <g key={r}>
              <polygon points={b.top} stroke={STROKE} strokeWidth={1} fill="hsl(var(--ink-2) / 0.6)" />
              <polygon points={b.left} stroke={STROKE} strokeWidth={1} fill="hsl(var(--ink-3) / 0.6)" />
              <polygon points={b.right} stroke={STROKE} strokeWidth={1} fill="hsl(var(--ink-2) / 0.8)" />
              {r !== 2 && (
                <line
                  x1={82}
                  y1={y + 9 + 14}
                  x2={196}
                  y2={y + 52 + 9}
                  stroke={led}
                  strokeOpacity={0.7}
                  strokeWidth={1.5}
                  strokeLinecap="round"
                />
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};

const CALLOUTS: [number, number, number, number][] = [
  [140, 70, 70, 30],
  [170, 132, 60, 112],
  [250, 150, 330, 118],
  [290, 118, 350, 70],
  [210, 205, 300, 240],
];

export const AnatomyDiagram = () => {
  const layers = [
    { y: 60, h: 6 },
    { y: 130, h: 22 },
    { y: 190, h: 30 },
  ];
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="absolute inset-[15%] rounded-full bg-[radial-gradient(closest-side,hsl(var(--beam)/0.08),transparent)]" />
      <svg viewBox="0 0 400 280" className="relative h-[82%] w-[82%]" fill="none">
        {layers.map((l, i) => {
          const b = blade(200, l.y, 120, 48, l.h);
          return (
            <g key={i}>
              <polygon points={b.top} stroke={STROKE} strokeWidth={1} fill="hsl(var(--ink-2) / 0.5)" />
              <polygon points={b.left} stroke={STROKE} strokeWidth={1} fill="hsl(var(--ink-3) / 0.5)" />
              <polygon points={b.right} stroke={STROKE} strokeWidth={1} fill="hsl(var(--ink-2) / 0.7)" />
            </g>
          );
        })}
        <line x1={200} y1={114} x2={200} y2={74} stroke={STROKE} strokeDasharray="3 4" />
        <line x1={200} y1={176} x2={200} y2={156} stroke={STROKE} strokeDasharray="3 4" />
        {CALLOUTS.map(([x, y, tx, ty], i) => (
          <g key={i}>
            <line x1={x} y1={y} x2={tx} y2={ty} stroke={BEAM} strokeOpacity={0.55} strokeWidth={1} />
            <circle cx={x} cy={y} r={2.5} fill={BEAM} />
            <circle cx={tx} cy={ty} r={10} fill="hsl(var(--ink) / 0.9)" stroke={BEAM} strokeOpacity={0.7} />
            <text
              x={tx}
              y={ty + 3.5}
              textAnchor="middle"
              fontSize={10}
              fontFamily="ui-monospace, monospace"
              fill="hsl(var(--bone))"
            >
              {i + 1}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
};

export const AccentFallback = ({ variant }: { variant: "module" | "stack" | "lattice" | "field" }) => (
  <div className="absolute inset-0 flex items-center justify-center">
    <div className="aspect-square w-[62%] rounded-full bg-[radial-gradient(closest-side,hsl(var(--beam)/0.1),hsl(var(--nebula)/0.05)_55%,transparent)]" />
    {variant === "lattice" && (
      <div className="absolute aspect-square w-[34%] rotate-12 rounded-2xl border border-white/[0.06] bg-grid opacity-60" />
    )}
  </div>
);

const zero = motionValue(0);

export const FieldFallback = ({ progress }: { progress?: MotionValue<number> }) => {
  const reduce = useReducedMotion();
  const y = useTransform(progress ?? zero, [0, 1], reduce ? ["0%", "0%"] : ["0%", "-18%"]);
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div
        className={cn(
          "absolute -inset-x-1/4 bottom-[-30%] top-[30%] origin-bottom overflow-hidden",
          "[transform:perspective(700px)_rotateX(62deg)]",
        )}
      >
        <motion.div style={{ y }} className="absolute inset-x-0 top-0 h-[140%] bg-grid opacity-70" />
      </div>
    </div>
  );
};
