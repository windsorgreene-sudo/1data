import { Bloom, EffectComposer, ToneMapping } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";

const BloomPass = () => (
  <EffectComposer multisampling={4}>
    <Bloom mipmapBlur luminanceThreshold={1} intensity={0.85} radius={0.6} />
    <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
  </EffectComposer>
);

export default BloomPass;
