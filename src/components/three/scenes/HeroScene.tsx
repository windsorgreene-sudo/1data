import { ContactShadows } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import type { MotionValue } from "framer-motion";
import { useRef } from "react";
import { MathUtils, type Group } from "three";
import type { SceneQuality } from "@/lib/quality";
import { SceneCanvas } from "./SceneCanvas";
import { StudioLights } from "./StudioLights";
import { ServerBlade } from "./ServerBlade";
import { useBladeMaterials } from "./materials";
import { usePointer } from "./usePointer";

interface HeroSceneProps {
  quality: SceneQuality;
  onReady: () => void;
  onFail: () => void;
  scroll: MotionValue<number>;
}

const LEDS: ("beam" | "nebula")[] = ["beam", "beam", "nebula", "beam"];
const ACTIVE = [2, 5, 3, 6];
const BASE_RX = 0.22;
const BASE_RY = -0.62;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

const Stack = ({ quality, scroll }: { quality: SceneQuality; scroll: MotionValue<number> }) => {
  const materials = useBladeMaterials(quality.tier);
  const count = quality.tier === "high" ? 4 : 3;
  const scrollRig = useRef<Group>(null);
  const stack = useRef<Group>(null);
  const blades = useRef<(Group | null)[]>([]);
  const clock = useRef({ t: 0 });
  const parallax = quality.finePointer && !quality.reduce;
  const pointer = usePointer({ enabled: parallax });
  const size = useThree((s) => s.size);
  const wide = size.width / size.height >= 1.2;
  const z = wide ? 8 : 9.5;
  const x0 = wide ? 0.4 : 0;

  useFrame((state, dt) => {
    const d = Math.min(dt, 1 / 30);
    clock.current.t += d;
    const t = clock.current.t;
    const still = quality.reduce;
    const p = still ? 0 : clamp01(scroll.get());
    const camera = state.camera;

    blades.current.forEach((b, i) => {
      if (!b) return;
      const float = still ? 0 : Math.sin(t * 0.7 + i * 0.9) * 0.035;
      b.position.y = -0.63 + i * (0.42 + p * 0.5) + float;
      b.rotation.z = still ? 0 : Math.sin(t * 0.5 + i) * 0.01;
    });

    if (scrollRig.current) {
      scrollRig.current.position.x = x0;
      scrollRig.current.position.y = -p * 0.6;
    }

    const s = stack.current;
    if (s) {
      s.position.y = still ? 0 : Math.sin(t * 0.45) * 0.08;
      const tx = BASE_RX + (parallax ? pointer.current.y * 0.12 : 0);
      const ty = BASE_RY + p * 0.5 + (parallax ? pointer.current.x * 0.28 : 0);
      if (parallax) {
        s.rotation.x = MathUtils.damp(s.rotation.x, tx, 4, d);
        s.rotation.y = MathUtils.damp(s.rotation.y, ty, 4, d);
      } else {
        s.rotation.x = tx;
        s.rotation.y = ty;
      }
    }

    if (parallax) {
      camera.position.x = MathUtils.damp(camera.position.x, pointer.current.x * 0.45, 4, d);
      camera.position.y = MathUtils.damp(camera.position.y, 0.6 + pointer.current.y * 0.25, 4, d);
      camera.position.z = MathUtils.damp(camera.position.z, z, 4, d);
    } else {
      camera.position.set(0, 0.6, z);
    }
    camera.lookAt(x0, 0, 0);
  });

  return (
    <group ref={scrollRig} position-x={x0}>
      <group ref={stack} rotation={[BASE_RX, BASE_RY, 0]}>
        {Array.from({ length: count }, (_, i) => (
          <ServerBlade
            key={i}
            innerRef={(g) => {
              blades.current[i] = g;
            }}
            materials={materials}
            tier={quality.tier}
            led={LEDS[i]}
            activeBay={ACTIVE[i]}
            position={[0, -0.63 + i * 0.42, 0]}
          />
        ))}
      </group>
      <ContactShadows
        position={[0, -1.25, 0]}
        scale={7}
        blur={2.6}
        opacity={0.55}
        far={3}
        resolution={quality.tier === "high" ? 256 : 128}
        frames={1}
      />
    </group>
  );
};

const HeroScene = ({ quality, onReady, onFail, scroll }: HeroSceneProps) => (
  <SceneCanvas quality={quality} onReady={onReady} onFail={onFail} mode="loop" bloom camera={{ position: [0, 0.6, 8], fov: 30 }}>
    <StudioLights tier={quality.tier} />
    <Stack quality={quality} scroll={scroll} />
  </SceneCanvas>
);

export default HeroScene;
