import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import { createContext, lazy, Suspense, useEffect, useRef, useState, type ReactNode } from "react";
import type { SceneQuality } from "@/lib/quality";

const BloomPass = lazy(() => import("./BloomPass"));

export const ActiveContext = createContext(true);

export interface SceneCanvasProps {
  quality: SceneQuality;
  mode: "loop" | "demand";
  camera: { position: [number, number, number]; fov: number };
  onReady: () => void;
  onFail: () => void;
  bloom?: boolean;
  fog?: { color: string; near: number; far: number };
  children: ReactNode;
}

const Invalidator = ({ active }: { active: boolean }) => {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    if (active) invalidate();
  }, [active, invalidate]);
  return null;
};

const Ready = ({ onReady }: { onReady: () => void }) => {
  const done = useRef(false);
  useFrame(() => {
    if (done.current) return;
    done.current = true;
    requestAnimationFrame(() => onReady());
  });
  return null;
};

const SceneCanvasRoot = ({ quality, mode, camera, onReady, onFail, bloom = false, fog, children }: SceneCanvasProps) => {
  const wrap = useRef<HTMLDivElement>(null);
  const mounted = useRef(true);
  const canvasEl = useRef<HTMLCanvasElement | null>(null);
  const failRef = useRef(onFail);
  failRef.current = onFail;
  const [degraded, setDegraded] = useState(false);
  const [intersecting, setIntersecting] = useState(true);
  const [visible, setVisible] = useState(() => typeof document === "undefined" || !document.hidden);

  const onLost = useRef(() => {
    if (mounted.current) failRef.current();
  }).current;

  useEffect(() => {
    mounted.current = true;
    const el = wrap.current;
    const io = el
      ? new IntersectionObserver(([entry]) => setIntersecting(entry.isIntersecting), { rootMargin: "100px 0px" })
      : null;
    if (el && io) io.observe(el);
    const onVis = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      mounted.current = false;
      io?.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      canvasEl.current?.removeEventListener("webglcontextlost", onLost);
    };
  }, [onLost]);

  const tier = quality.tier;
  const active = intersecting && visible;
  const frameloop = mode === "loop" && active && !quality.reduce ? "always" : "demand";
  const bloomOn = bloom && tier === "high" && !degraded && !quality.reduce;

  return (
    <div ref={wrap} className="absolute inset-0">
      <Canvas
        dpr={tier === "high" && !degraded ? [1, 1.75] : [1, 1.25]}
        gl={{ antialias: tier === "low", alpha: true, powerPreference: "high-performance", stencil: false, depth: true }}
        frameloop={frameloop}
        camera={{ position: camera.position, fov: camera.fov }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
          canvasEl.current = gl.domElement;
          gl.domElement.addEventListener("webglcontextlost", onLost);
        }}
      >
        {fog && <fog attach="fog" args={[fog.color, fog.near, fog.far]} />}
        <ActiveContext.Provider value={active}>
          <Invalidator active={active} />
          <PerformanceMonitor flipflops={2} onDecline={() => setDegraded(true)} />
          {children}
          <Ready onReady={onReady} />
          {bloomOn && (
            <Suspense fallback={null}>
              <BloomPass />
            </Suspense>
          )}
        </ActiveContext.Provider>
      </Canvas>
    </div>
  );
};

export const SceneCanvas = (props: SceneCanvasProps) => <SceneCanvasRoot key={props.quality.tier} {...props} />;
