import { Environment, Lightformer } from "@react-three/drei";
import type { SceneTier } from "@/lib/quality";

interface StudioLightsProps {
  tier: SceneTier;
  intensity?: number;
  fill?: boolean;
}

export const StudioLights = ({ tier, intensity = 1, fill = false }: StudioLightsProps) => {
  const k = intensity;
  return (
    <>
      <Environment resolution={tier === "high" ? 256 : 128} frames={1}>
        <Lightformer form="rect" intensity={2.2 * k} color="#ffffff" position={[0, 5, -2]} scale={[10, 2, 1]} rotation-x={Math.PI / 2} />
        <Lightformer form="rect" intensity={3 * k} color="#4de8ff" position={[-5, 1, 1]} scale={[2, 6, 1]} rotation-y={Math.PI / 2} />
        <Lightformer form="rect" intensity={2.4 * k} color="#9b6bff" position={[5, 0.5, -1]} scale={[2, 6, 1]} rotation-y={-Math.PI / 2} />
        <Lightformer form="ring" intensity={1.2 * k} color="#ffffff" position={[0, 1, -6]} scale={4} />
        {fill && (
          <>
            <Lightformer form="rect" intensity={1.4 * k} color="#dfe9ff" position={[0, 2, 7]} scale={[9, 3, 1]} rotation-y={Math.PI} />
            <Lightformer form="rect" intensity={0.7 * k} color="#cfdcff" position={[0, 7, 1]} scale={[12, 8, 1]} rotation-x={Math.PI / 2} />
            <Lightformer form="rect" intensity={1.1 * k} color="#4de8ff" position={[6, 1.5, -5]} scale={[5, 3, 1]} rotation-y={-0.88} />
          </>
        )}
      </Environment>
      <ambientLight intensity={fill ? 0.3 : 0.12} />
      <directionalLight position={[3, 5, 4]} intensity={fill ? 0.9 : 0.6} />
      {fill && <directionalLight position={[-4, 2, -5]} intensity={0.5} color="#9b6bff" />}
    </>
  );
};
