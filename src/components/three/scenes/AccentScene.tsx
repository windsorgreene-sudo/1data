import { useFrame, useThree } from "@react-three/fiber";
import type { MotionValue } from "framer-motion";
import { useContext, useEffect, useMemo, useRef } from "react";
import {
  BoxGeometry,
  EdgesGeometry,
  LineBasicMaterial,
  MathUtils,
  MeshStandardMaterial,
  Object3D,
  type BufferGeometry,
  type Group,
  type InstancedMesh,
} from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import type { SceneQuality } from "@/lib/quality";
import { ActiveContext, SceneCanvas } from "./SceneCanvas";
import { StudioLights } from "./StudioLights";
import { ServerBlade } from "./ServerBlade";
import { BEAM, GLASS_TINT, INK_2, useBladeMaterials } from "./materials";
import { usePointer } from "./usePointer";

type Variant = "module" | "stack" | "lattice" | "field";

interface AccentSceneProps {
  quality: SceneQuality;
  onReady: () => void;
  onFail: () => void;
  variant: Variant;
  progress?: MotionValue<number>;
}

interface VariantProps {
  quality: SceneQuality;
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

const useParallax = (quality: SceneQuality) => {
  const enabled = quality.finePointer && !quality.reduce;
  const pointer = usePointer({ enabled });
  const rig = useRef<Group>(null);
  const apply = (d: number) => {
    const g = rig.current;
    if (!g) return;
    g.rotation.x = MathUtils.damp(g.rotation.x, enabled ? -pointer.current.y * 0.15 : 0, 4, d);
    g.rotation.y = MathUtils.damp(g.rotation.y, enabled ? pointer.current.x * 0.15 : 0, 4, d);
  };
  return { rig, apply };
};

const ModuleVariant = ({ quality }: VariantProps) => {
  const materials = useBladeMaterials(quality.tier);
  const spin = useRef<Group>(null);
  const sled = useRef<Group>(null);
  const clock = useRef({ t: 0 });
  const { rig, apply } = useParallax(quality);

  useFrame((_, dt) => {
    const d = Math.min(dt, 1 / 30);
    apply(d);
    if (quality.reduce) return;
    clock.current.t += d;
    const t = clock.current.t;
    const g = spin.current;
    if (g) {
      g.rotation.y = -0.55 + Math.sin(t * 0.35) * 0.3;
      g.position.y = Math.sin(t) * 0.05;
    }
    if (sled.current) sled.current.position.z = 0.45 + Math.sin(t * 0.6) * 0.12;
  });

  return (
    <group ref={rig}>
      <group ref={spin} rotation={[0.36, -0.55, 0]}>
        <ServerBlade materials={materials} tier={quality.tier} led="beam" width={2.6} bays={6} activeBay={4} position={[0, -0.36, 0]} />
        <group ref={sled} position={[0, 0, 0.45]}>
          <ServerBlade materials={materials} tier={quality.tier} led="nebula" width={2.6} bays={6} activeBay={2} />
        </group>
        <ServerBlade materials={materials} tier={quality.tier} led="beam" width={2.6} bays={6} activeBay={1} position={[0, 0.36, 0]} />
      </group>
    </group>
  );
};

const StackVariant = ({ quality }: VariantProps) => {
  const materials = useBladeMaterials(quality.tier);
  const group = useRef<Group>(null);
  const blades = useRef<(Group | null)[]>([]);
  const clock = useRef({ t: 0 });
  const { rig, apply } = useParallax(quality);

  useFrame((_, dt) => {
    const d = Math.min(dt, 1 / 30);
    apply(d);
    if (quality.reduce) return;
    clock.current.t += d;
    const t = clock.current.t;
    if (group.current) group.current.rotation.y = -0.5 + Math.sin(t * 0.4) * 0.2;
    blades.current.forEach((b, i) => {
      if (b) b.position.y = -0.84 + i * 0.42 + Math.sin(t * 0.8 + i * 0.7) * 0.03;
    });
  });

  return (
    <group ref={rig}>
      <group ref={group} rotation={[0.28, -0.5, 0]}>
        {Array.from({ length: 5 }, (_, i) => (
          <ServerBlade
            key={i}
            innerRef={(g) => {
              blades.current[i] = g;
            }}
            materials={materials}
            tier={quality.tier}
            led={i === 2 ? "nebula" : "beam"}
            activeBay={(i * 3) % 8}
            width={2.4}
            position={[i * 0.08 - 0.16, -0.84 + i * 0.42, 0]}
            rotation={[0, i * 0.06, 0]}
          />
        ))}
      </group>
    </group>
  );
};

const CELLS: [number, number, number][] = [
  [0, 1, 2],
  [1, 3, 0],
  [2, 0, 3],
  [3, 2, 1],
  [1, 1, 3],
  [2, 3, 2],
];

const at = (n: number) => (n - 1.5) * 0.5;

const LatticeVariant = ({ quality }: VariantProps) => {
  const lattice = useRef<Group>(null);
  const clock = useRef({ t: 0 });
  const { rig, apply } = useParallax(quality);

  const { lines, lineMat, cubeGeo, cubeMats } = useMemo(() => {
    const box = new BoxGeometry(0.34, 0.34, 0.34);
    const edges = new EdgesGeometry(box);
    const parts: BufferGeometry[] = [];
    for (let x = 0; x < 4; x++)
      for (let y = 0; y < 4; y++)
        for (let z = 0; z < 4; z++) {
          const g = edges.clone();
          g.translate(at(x), at(y), at(z));
          parts.push(g);
        }
    const merged = mergeGeometries(parts) ?? edges.clone();
    parts.forEach((g) => g.dispose());
    edges.dispose();
    return {
      lines: merged,
      lineMat: new LineBasicMaterial({ color: BEAM, transparent: true, opacity: 0.35, depthWrite: false }),
      cubeGeo: box,
      cubeMats: CELLS.map(
        () =>
          new MeshStandardMaterial({
            color: GLASS_TINT,
            emissive: BEAM,
            emissiveIntensity: 0.4,
            metalness: 0.2,
            roughness: 0.15,
            transparent: true,
            opacity: 0.55,
          }),
      ),
    };
  }, []);

  useEffect(
    () => () => {
      lines.dispose();
      lineMat.dispose();
      cubeGeo.dispose();
      cubeMats.forEach((m) => m.dispose());
    },
    [lines, lineMat, cubeGeo, cubeMats],
  );

  useFrame((_, dt) => {
    const d = Math.min(dt, 1 / 30);
    apply(d);
    if (quality.reduce) return;
    clock.current.t += d;
    const t = clock.current.t;
    if (lattice.current) lattice.current.rotation.set(t * 0.08, t * 0.12, 0);
    cubeMats.forEach((m, i) => {
      m.emissiveIntensity = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(t * 1.4 + i));
    });
  });

  return (
    <group ref={rig}>
      <group ref={lattice} rotation={[0.35, 0.6, 0]}>
        <lineSegments geometry={lines} material={lineMat} />
        {CELLS.map(([x, y, z], i) => (
          <mesh key={i} geometry={cubeGeo} material={cubeMats[i]} position={[at(x), at(y), at(z)]} />
        ))}
      </group>
    </group>
  );
};

const COLS = 18;
const ROWS = 10;
const LIT = Array.from({ length: COLS * ROWS }, (_, i) => i).filter((i) => i % 7 === 3);
const dummy = new Object3D();

const FieldVariant = ({ quality, progress }: VariantProps & { progress?: MotionValue<number> }) => {
  const materials = useBladeMaterials(quality.tier);
  const blades = useRef<InstancedMesh>(null);
  const edges = useRef<InstancedMesh>(null);
  const camera = useThree((s) => s.camera);
  const invalidate = useThree((s) => s.invalidate);
  const active = useContext(ActiveContext);
  const activeRef = useRef(active);
  activeRef.current = active;

  useEffect(
    () =>
      progress?.on("change", () => {
        if (activeRef.current) invalidate();
      }),
    [progress, invalidate],
  );

  const place = (p: number) => {
    const b = blades.current;
    const e = edges.current;
    if (!b || !e) return;
    let n = 0;
    for (let i = 0; i < COLS * ROWS; i++) {
      const ix = i % COLS;
      const iz = Math.floor(i / COLS);
      const x = (ix - (COLS - 1) / 2) * 0.62;
      const z = -iz * 1.1 + 2;
      const y = Math.sin(ix * 0.6 + p * 6) * 0.08;
      dummy.position.set(x, y, z);
      dummy.updateMatrix();
      b.setMatrixAt(i, dummy.matrix);
      if (i % 7 === 3) {
        dummy.position.set(x, y + 0.03, z + 0.44);
        dummy.updateMatrix();
        e.setMatrixAt(n++, dummy.matrix);
      }
    }
    b.instanceMatrix.needsUpdate = true;
    e.instanceMatrix.needsUpdate = true;
  };

  useFrame(() => {
    const p = quality.reduce ? 0.5 : clamp01(progress?.get() ?? 0.5);
    camera.position.set((p - 0.5) * 0.6, 2.6 - p, 9 - p * 4);
    camera.lookAt(0, 0, -4);
    place(p);
  });

  return (
    <group>
      <instancedMesh ref={blades} args={[undefined, undefined, COLS * ROWS]} material={materials.chassis}>
        <boxGeometry args={[0.5, 0.05, 0.9]} />
      </instancedMesh>
      <instancedMesh ref={edges} args={[undefined, undefined, LIT.length]} material={materials.ledBeam}>
        <boxGeometry args={[0.46, 0.012, 0.02]} />
      </instancedMesh>
    </group>
  );
};

const CAMERAS: Record<Variant, { position: [number, number, number]; fov: number }> = {
  module: { position: [0, 0.4, 9.5], fov: 30 },
  stack: { position: [0, 0.6, 8], fov: 30 },
  lattice: { position: [0, 0, 6.5], fov: 30 },
  field: { position: [0, 2.1, 7], fov: 38 },
};

const AccentScene = ({ quality, onReady, onFail, variant, progress }: AccentSceneProps) => (
  <SceneCanvas
    quality={quality}
    onReady={onReady}
    onFail={onFail}
    mode={variant === "field" ? "demand" : "loop"}
    bloom={variant === "module" || variant === "stack"}
    fog={variant === "field" ? { color: INK_2, near: 6, far: 18 } : undefined}
    camera={CAMERAS[variant]}
  >
    <StudioLights tier={quality.tier} intensity={0.8} fill={variant === "module"} />
    {variant === "module" && <ModuleVariant quality={quality} />}
    {variant === "stack" && <StackVariant quality={quality} />}
    {variant === "lattice" && <LatticeVariant quality={quality} />}
    {variant === "field" && <FieldVariant quality={quality} progress={progress} />}
  </SceneCanvas>
);

export default AccentScene;
