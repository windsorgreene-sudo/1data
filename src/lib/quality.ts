import { useReducedMotion } from "framer-motion";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { isFinePointer, prefersReducedMotion } from "@/lib/motion";
import { hasWebGL } from "@/lib/webgl";

export type SceneTier = "high" | "low";

export interface SceneQuality {
  tier: SceneTier;
  reduce: boolean;
  webgl: boolean;
  finePointer: boolean;
}

export const resolveTier = (narrow: boolean, coarse: boolean): SceneTier => (narrow || coarse ? "low" : "high");

export const useSceneQuality = (): SceneQuality => {
  const narrow = useMediaQuery("(max-width: 767px)");
  const coarse = useMediaQuery("(hover: none) and (pointer: coarse)");
  const reduce = useReducedMotion() ?? prefersReducedMotion();
  return { tier: resolveTier(narrow, coarse), reduce, webgl: hasWebGL(), finePointer: isFinePointer() };
};
