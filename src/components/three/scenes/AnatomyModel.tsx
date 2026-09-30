import { useEffect, useLayoutEffect, useMemo, useRef, type MutableRefObject } from "react";
import { DoubleSide, MeshBasicMaterial, MeshStandardMaterial, Object3D, type Group, type InstancedMesh } from "three";
import { LID_LIFT, LID_SLIDE, LID_TILT, ORBIT_RADIUS, type Pose } from "@/lib/anatomy";
import type { BladeMaterials } from "./materials";
import { BEAM } from "./materials";

export interface AnatomyApi {
  apply: (pose: Pose, d: number, spin: boolean) => void;
}

interface AnatomyModelProps {
  materials: BladeMaterials;
  total: number;
  api: MutableRefObject<AnatomyApi | null>;
}

const FINS = 14;
const CORES = 8;
const STICKS = 4;
const VENTS = 9;
const RIBS = 7;
const dummy = new Object3D();

export const AnatomyModel = ({ materials, total, api }: AnatomyModelProps) => {
  const count = Math.min(64, Math.max(1, Math.round(total)));
  const lid = useRef<Group>(null);
  const heatsink = useRef<Group>(null);
  const fins = useRef<InstancedMesh>(null);
  const cores = useRef<InstancedMesh>(null);
  const sticks = useRef<InstancedMesh>(null);
  const traces = useRef<InstancedMesh>(null);
  const nic = useRef<Group>(null);
  const orbit = useRef<Group>(null);
  const dots = useRef<InstancedMesh>(null);
  const vents = useRef<InstancedMesh>(null);
  const ribs = useRef<InstancedMesh>(null);

  const coreMat = useMemo(() => materials.ledBeam.clone() as MeshStandardMaterial, [materials]);
  const ringMat = useMemo(
    () => new MeshBasicMaterial({ color: BEAM, transparent: true, opacity: 0.12, side: DoubleSide, depthWrite: false }),
    [],
  );
  useEffect(() => () => coreMat.dispose(), [coreMat]);
  const finMat = useMemo(
    () => new MeshStandardMaterial({ color: "#6b7890", metalness: 0.75, roughness: 0.28, emissive: BEAM, emissiveIntensity: 0.04 }),
    [],
  );
  const wallMat = useMemo(
    () => new MeshStandardMaterial({ color: "#0f121a", metalness: 0.55, roughness: 0.62 }),
    [],
  );
  useEffect(() => () => wallMat.dispose(), [wallMat]);
  const bezelMat = useMemo(
    () => new MeshStandardMaterial({ color: "#0b0e15", metalness: 0.7, roughness: 0.3, transparent: true, opacity: 0.82 }),
    [],
  );
  useEffect(() => () => bezelMat.dispose(), [bezelMat]);
  useEffect(() => () => ringMat.dispose(), [ringMat]);
  useEffect(() => () => finMat.dispose(), [finMat]);

  useLayoutEffect(() => {
    const f = fins.current;
    if (f) {
      for (let i = 0; i < FINS; i++) {
        dummy.position.set(0, 0, -0.42 + (i * 0.84) / (FINS - 1));
        dummy.rotation.set(0, 0, 0);
        dummy.scale.set(1, 1, 1);
        dummy.updateMatrix();
        f.setMatrixAt(i, dummy.matrix);
      }
      f.instanceMatrix.needsUpdate = true;
    }
    const v = vents.current;
    if (v) {
      for (let i = 0; i < VENTS * 2; i++) {
        dummy.position.set(i < VENTS ? -0.95 : 0.95, 0.024, -0.8 + ((i % VENTS) * 1.6) / (VENTS - 1));
        dummy.updateMatrix();
        v.setMatrixAt(i, dummy.matrix);
      }
      v.instanceMatrix.needsUpdate = true;
    }
    const r = ribs.current;
    if (r) {
      for (let i = 0; i < RIBS * 2; i++) {
        dummy.position.set(i < RIBS ? -1.752 : 1.752, -0.04, -1.02 + ((i % RIBS) * 2.04) / (RIBS - 1));
        dummy.updateMatrix();
        r.setMatrixAt(i, dummy.matrix);
      }
      r.instanceMatrix.needsUpdate = true;
    }
    const c = cores.current;
    if (c) {
      for (let i = 0; i < CORES; i++) {
        dummy.position.set(-0.6 - 0.27 + (i % 4) * 0.18, -0.18, -0.1 + Math.floor(i / 4) * 0.2);
        dummy.updateMatrix();
        c.setMatrixAt(i, dummy.matrix);
      }
      c.instanceMatrix.needsUpdate = true;
    }
    const o = dots.current;
    if (o) {
      for (let i = 0; i < count; i++) {
        const a = (i / count) * Math.PI * 2;
        dummy.position.set(Math.cos(a) * ORBIT_RADIUS, 0, Math.sin(a) * ORBIT_RADIUS);
        dummy.updateMatrix();
        o.setMatrixAt(i, dummy.matrix);
      }
      o.instanceMatrix.needsUpdate = true;
    }
  }, [count]);

  useLayoutEffect(() => {
    api.current = {
      apply: (pose, d, spin) => {
        if (lid.current) {
          lid.current.position.y = 0.33 + pose.lid * LID_LIFT;
          lid.current.position.z = -pose.lid * LID_SLIDE;
          lid.current.rotation.x = -pose.lid * LID_TILT;
        }
        if (heatsink.current) heatsink.current.position.y = -0.015 + pose.cpu * 0.7;
        coreMat.emissiveIntensity = 0.3 + pose.cpu * 3.2;
        const s = sticks.current;
        const tr = traces.current;
        if (s && tr) {
          for (let i = 0; i < STICKS; i++) {
            const x = 0.45 + i * 0.3;
            const y = -0.27 + pose.nvme * i * 0.12;
            const z = 0.5 + pose.nvme * (0.9 + i * 0.25);
            dummy.position.set(x, y, z);
            dummy.updateMatrix();
            s.setMatrixAt(i, dummy.matrix);
            dummy.position.set(x, y + 0.013, z);
            dummy.updateMatrix();
            tr.setMatrixAt(i, dummy.matrix);
          }
          s.instanceMatrix.needsUpdate = true;
          tr.instanceMatrix.needsUpdate = true;
        }
        if (nic.current) {
          nic.current.position.y = -0.02 + pose.nic * 0.6;
          nic.current.position.z = -0.9 - pose.nic * 1.2;
          nic.current.rotation.x = pose.nic * 0.35;
        }
        const g = orbit.current;
        if (g) {
          const k = pose.orbit;
          g.visible = k > 0.001;
          g.scale.setScalar(Math.max(k, 0.001));
          if (spin) g.rotation.y += d * 0.15 * pose.spin;
        }
      },
    };
    return () => {
      api.current = null;
    };
  }, [api, coreMat]);

  return (
    <group>
      <mesh position={[0, -0.32, 0]} material={wallMat}>
        <boxGeometry args={[3.6, 0.06, 2.4]} />
      </mesh>
      <mesh position={[-1.78, -0.02, 0]} material={wallMat}>
        <boxGeometry args={[0.04, 0.6, 2.4]} />
      </mesh>
      <mesh position={[1.78, -0.02, 0]} material={wallMat}>
        <boxGeometry args={[0.04, 0.6, 2.4]} />
      </mesh>
      <instancedMesh ref={ribs} args={[undefined, undefined, RIBS * 2]} material={materials.trim}>
        <boxGeometry args={[0.016, 0.46, 0.05]} />
      </instancedMesh>
      <mesh position={[-1.754, 0.16, 0]} material={materials.trim}>
        <boxGeometry args={[0.012, 0.03, 2.3]} />
      </mesh>
      <mesh position={[1.754, 0.16, 0]} material={materials.trim}>
        <boxGeometry args={[0.012, 0.03, 2.3]} />
      </mesh>
      <mesh position={[-1.754, -0.2, 0]} material={materials.ledBeam}>
        <boxGeometry args={[0.006, 0.008, 2.1]} />
      </mesh>
      <mesh position={[1.754, -0.2, 0]} material={materials.ledNebula}>
        <boxGeometry args={[0.006, 0.008, 2.1]} />
      </mesh>
      <mesh position={[0, -0.02, 1.18]} material={bezelMat}>
        <boxGeometry args={[3.6, 0.6, 0.04]} />
      </mesh>
      <mesh position={[0, -0.27, 1.21]} material={materials.ledBeam}>
        <boxGeometry args={[3.3, 0.012, 0.012]} />
      </mesh>

      <group ref={lid} position={[0, 0.33, 0]}>
        <mesh material={materials.chassis}>
          <boxGeometry args={[3.6, 0.04, 2.4]} />
        </mesh>
        <instancedMesh ref={vents} args={[undefined, undefined, VENTS * 2]} material={materials.trim}>
          <boxGeometry args={[1.2, 0.01, 0.06]} />
        </instancedMesh>
        <mesh position={[0, 0.026, 1.16]} material={materials.trim}>
          <boxGeometry args={[3.6, 0.012, 0.08]} />
        </mesh>
        <mesh position={[0, 0.026, -1.16]} material={materials.trim}>
          <boxGeometry args={[3.6, 0.012, 0.08]} />
        </mesh>
        <mesh position={[0, 0.034, 1.1]} material={materials.ledBeam}>
          <boxGeometry args={[3.1, 0.008, 0.012]} />
        </mesh>
        <mesh position={[0, 0.026, 0]} material={materials.glass}>
          <boxGeometry args={[0.46, 0.012, 1.7]} />
        </mesh>
        <mesh position={[0, -0.026, 1.08]} material={materials.ledNebula}>
          <boxGeometry args={[3.1, 0.008, 0.012]} />
        </mesh>
      </group>

      <mesh position={[-0.6, -0.2, 0]} material={materials.trim}>
        <boxGeometry args={[0.9, 0.03, 0.9]} />
      </mesh>
      <instancedMesh ref={cores} args={[undefined, undefined, CORES]} material={coreMat}>
        <boxGeometry args={[0.16, 0.01, 0.16]} />
      </instancedMesh>
      <group ref={heatsink} position={[-0.6, -0.015, 0]}>
        <instancedMesh ref={fins} args={[undefined, undefined, FINS]} material={finMat}>
          <boxGeometry args={[0.9, 0.34, 0.02]} />
        </instancedMesh>
      </group>

      <instancedMesh ref={sticks} args={[undefined, undefined, STICKS]} material={materials.trim}>
        <boxGeometry args={[0.22, 0.02, 0.9]} />
      </instancedMesh>
      <instancedMesh ref={traces} args={[undefined, undefined, STICKS]} material={materials.ledBeam}>
        <boxGeometry args={[0.02, 0.005, 0.8]} />
      </instancedMesh>

      <group ref={nic} position={[1.0, -0.02, -0.9]}>
        <mesh material={materials.chassis}>
          <boxGeometry args={[1.3, 0.5, 0.04]} />
        </mesh>
        <mesh position={[-0.25, 0.05, -0.08]} material={materials.trim}>
          <boxGeometry args={[0.22, 0.14, 0.12]} />
        </mesh>
        <mesh position={[0.25, 0.05, -0.08]} material={materials.trim}>
          <boxGeometry args={[0.22, 0.14, 0.12]} />
        </mesh>
        <mesh position={[-0.25, 0.15, -0.145]} material={materials.ledBeam}>
          <boxGeometry args={[0.12, 0.03, 0.01]} />
        </mesh>
        <mesh position={[0.25, 0.15, -0.145]} material={materials.ledNebula}>
          <boxGeometry args={[0.12, 0.03, 0.01]} />
        </mesh>
        <mesh position={[0, 0.245, -0.025]} material={materials.ledBeam}>
          <boxGeometry args={[1.2, 0.01, 0.012]} />
        </mesh>
        <mesh position={[0, -0.05, -0.025]} material={materials.glass}>
          <boxGeometry args={[1.1, 0.2, 0.012]} />
        </mesh>
      </group>

      <group rotation-x={0.35}>
        <group ref={orbit} visible={false} scale={0.001}>
          <instancedMesh ref={dots} args={[undefined, undefined, count]} material={materials.ledBeam}>
            <icosahedronGeometry args={[0.035, 0]} />
          </instancedMesh>
          <mesh rotation-x={-Math.PI / 2} material={ringMat}>
            <ringGeometry args={[ORBIT_RADIUS - 0.012, ORBIT_RADIUS + 0.012, 128]} />
          </mesh>
        </group>
      </group>
    </group>
  );
};
