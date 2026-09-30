import type { MotionValue } from "framer-motion";
import { lazy } from "react";
import { useSceneQuality } from "@/lib/quality";
import { SceneMount } from "@/components/three/SceneMount";
import { AccentFallback, FieldFallback } from "@/components/three/fallbacks";

const AccentScene = lazy(() => import("@/components/three/scenes/AccentScene"));

interface PageAccentProps {
  variant: "module" | "stack" | "lattice" | "field";
  progress?: MotionValue<number>;
  className?: string;
}

export const PageAccent = ({ variant, progress, className }: PageAccentProps) => {
  const quality = useSceneQuality();
  return (
    <SceneMount
      className={className}
      disabled={quality.tier === "low"}
      fallback={variant === "field" ? <FieldFallback progress={progress} /> : <AccentFallback variant={variant} />}
    >
      {(ctx) => <AccentScene {...ctx} variant={variant} progress={progress} />}
    </SceneMount>
  );
};
