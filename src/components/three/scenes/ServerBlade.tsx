import { RoundedBox } from "@react-three/drei";
import { useLayoutEffect, useRef, type Ref } from "react";
import { Object3D, type Group, type InstancedMesh } from "three";
import type { SceneTier } from "@/lib/quality";
import type { BladeMaterials } from "./materials";

interface ServerBladeProps {
  materials: BladeMaterials;
  led: "beam" | "nebula";
  bays?: number;
  activeBay?: number;
  width?: number;
  tier: SceneTier;
  position?: [number, number, number];
  rotation?: [number, number, number];
  innerRef?: Ref<Group>;
}

const dummy = new Object3D();

export const ServerBlade = ({
  materials,
  led,
  bays = 8,
  activeBay = -1,
  width = 3.2,
  tier,
  position,
  rotation,
  innerRef,
}: ServerBladeProps) => {
  const bayMesh = useRef<InstancedMesh>(null);
  const ledMesh = useRef<InstancedMesh>(null);
  const activeMesh = useRef<InstancedMesh>(null);
  const hasActive = activeBay >= 0 && activeBay < bays;
  const span = width * 0.62;
  const x0 = -width / 2 + 0.28;
  const step = bays > 1 ? span / (bays - 1) : 0;

  useLayoutEffect(() => {
    const bm = bayMesh.current;
    const lm = ledMesh.current;
    if (!bm || !lm) return;
    let n = 0;
    for (let i = 0; i < bays; i++) {
      const x = x0 + i * step;
      dummy.position.set(x, 0.02, 1.02);
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      bm.setMatrixAt(i, dummy.matrix);
      if (i === activeBay) {
        dummy.position.set(x + 0.09, -0.02, 1.03);
        dummy.updateMatrix();
        activeMesh.current?.setMatrixAt(0, dummy.matrix);
        continue;
      }
      dummy.position.set(x + 0.09, -0.02, 1.03);
      dummy.updateMatrix();
      lm.setMatrixAt(n++, dummy.matrix);
    }
    lm.count = n;
    bm.instanceMatrix.needsUpdate = true;
    lm.instanceMatrix.needsUpdate = true;
    if (activeMesh.current) activeMesh.current.instanceMatrix.needsUpdate = true;
  }, [bays, activeBay, x0, step]);

  const strip = led === "beam" ? materials.ledBeam : materials.ledNebula;

  return (
    <group ref={innerRef} position={position} rotation={rotation}>
      <RoundedBox args={[width, 0.3, 2]} radius={0.035} smoothness={2} material={materials.chassis} />
      <mesh position={[0, 0.01, 1.005]} material={materials.glass}>
        <boxGeometry args={[width - 0.2, 0.2, 0.02]} />
      </mesh>
      <instancedMesh ref={bayMesh} args={[undefined, undefined, bays]} material={materials.trim}>
        <boxGeometry args={[0.26, 0.13, 0.015]} />
      </instancedMesh>
      <instancedMesh ref={ledMesh} args={[undefined, undefined, bays]} material={materials.ledBeam}>
        <boxGeometry args={[0.03, 0.03, 0.01]} />
      </instancedMesh>
      {hasActive && (
        <instancedMesh ref={activeMesh} args={[undefined, undefined, 1]} material={materials.ledNebula}>
          <boxGeometry args={[0.03, 0.03, 0.01]} />
        </instancedMesh>
      )}
      <mesh position={[0, -0.13, 1.012]} material={strip}>
        <boxGeometry args={[width - 0.3, 0.012, 0.012]} />
      </mesh>
      {tier === "low" && (
        <mesh position={[0, -0.13, 1.03]} material={materials.halo}>
          <planeGeometry args={[width, 0.25]} />
        </mesh>
      )}
    </group>
  );
};
