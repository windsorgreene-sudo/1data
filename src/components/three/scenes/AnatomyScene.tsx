import { ContactShadows } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import type { MotionValue } from "framer-motion";
import { useContext, useEffect, useMemo, useRef } from "react";
import { MathUtils, Vector3 } from "three";
import { POSES, createPose, framing, poseAt, stageFocus } from "@/lib/anatomy";
import type { SceneQuality } from "@/lib/quality";
import { ActiveContext, SceneCanvas } from "./SceneCanvas";
import { StudioLights } from "./StudioLights";
import { AnatomyModel, type AnatomyApi } from "./AnatomyModel";
import { useBladeMaterials } from "./materials";
import { usePointer } from "./usePointer";

interface AnatomySceneProps {
  quality: SceneQuality;
  onReady: () => void;
  onFail: () => void;
  progress?: MotionValue<number>;
  staticPose?: number;
  total: number;
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

interface RigProps {
  quality: SceneQuality;
  progress?: MotionValue<number>;
  staticPose?: number;
  total: number;
}

const Rig = ({ quality, progress, staticPose, total }: RigProps) => {
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  const invalidate = useThree((s) => s.invalidate);
  const active = useContext(ActiveContext);
  const materials = useBladeMaterials(quality.tier);
  const api = useRef<AnatomyApi | null>(null);
  const pose = useMemo(createPose, []);
  const vec = useMemo(() => ({ target: new Vector3(), desired: new Vector3() }), []);
  const state = useRef({ current: 0, init: false, px: 0, py: 0 });
  const pointer = usePointer({
    enabled: quality.finePointer && !quality.reduce && quality.tier === "high",
    onMove: invalidate,
  });

  useEffect(() => progress?.on("change", () => invalidate()), [progress, invalidate]);

  const target = () =>
    staticPose != null ? stageFocus(clamp(staticPose, 0, 4)) : clamp(progress?.get() ?? 0, 0, 1);

  useFrame((_, dt) => {
    const d = Math.min(dt, 1 / 30);
    const st = state.current;
    const goalP = target();
    st.current = st.init ? MathUtils.damp(st.current, goalP, 6, d) : goalP;
    poseAt(st.current, pose);

    const f = framing(size.width / size.height);
    vec.target.set(pose.target[0], pose.target[1] - f.drop, pose.target[2]);
    vec.desired
      .set(pose.cam[0] - pose.target[0], pose.cam[1] - pose.target[1], pose.cam[2] - pose.target[2])
      .multiplyScalar(f.scale)
      .add(vec.target);
    const px = st.init ? MathUtils.damp(st.px, pointer.current.x * 0.2, 5, d) : 0;
    const py = st.init ? MathUtils.damp(st.py, pointer.current.y * 0.12, 5, d) : 0;
    st.px = px;
    st.py = py;
    camera.position.set(vec.desired.x + px, vec.desired.y + py, vec.desired.z);
    camera.lookAt(vec.target);
    st.init = true;

    api.current?.apply(pose, d, !quality.reduce);

    const moving =
      Math.abs(st.current - goalP) > 1e-4 ||
      Math.abs(px - pointer.current.x * 0.2) > 1e-3 ||
      Math.abs(py - pointer.current.y * 0.12) > 1e-3;
    const orbiting = pose.orbit > 0.01 && !quality.reduce && active;
    if (moving || orbiting) invalidate();
  });

  return (
    <>
      <AnatomyModel materials={materials} total={total} api={api} />
      <ContactShadows
        position={[0, -0.4, 0]}
        scale={7}
        blur={2.6}
        opacity={0.55}
        far={3}
        resolution={quality.tier === "high" ? 256 : 128}
        frames={1}
      />
    </>
  );
};

const AnatomyScene = ({ quality, onReady, onFail, progress, staticPose, total }: AnatomySceneProps) => (
  <SceneCanvas
    quality={quality}
    onReady={onReady}
    onFail={onFail}
    mode="demand"
    bloom
    camera={{ position: POSES[0].cam, fov: 32 }}
  >
    <StudioLights tier={quality.tier} fill />
    <Rig quality={quality} progress={progress} staticPose={staticPose} total={total} />
  </SceneCanvas>
);

export default AnatomyScene;
