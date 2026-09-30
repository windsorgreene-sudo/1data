import { useEffect, useMemo } from "react";
import {
  AdditiveBlending,
  CanvasTexture,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  SRGBColorSpace,
  type Material,
} from "three";
import type { SceneTier } from "@/lib/quality";

export const BEAM = "#4de8ff";
export const NEBULA = "#9b6bff";
export const CHASSIS = "#171a24";
export const CHASSIS_EDGE = "#2a2f3d";
export const GLASS_TINT = "#9fb4c8";
export const INK = "#08080c";
export const INK_2 = "#0e0e13";

export interface BladeMaterials {
  chassis: Material;
  trim: Material;
  glass: Material;
  ledBeam: MeshStandardMaterial;
  ledNebula: MeshStandardMaterial;
  halo: MeshBasicMaterial;
}

let glow: CanvasTexture | null = null;

export const glowTexture = (): CanvasTexture => {
  if (glow) return glow;
  const c = document.createElement("canvas");
  c.width = 64;
  c.height = 64;
  const ctx = c.getContext("2d");
  if (ctx) {
    const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.4, "rgba(255,255,255,0.35)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 64, 64);
  }
  glow = new CanvasTexture(c);
  glow.colorSpace = SRGBColorSpace;
  return glow;
};

const led = (color: string) =>
  new MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 3, toneMapped: false });

const create = (tier: SceneTier): BladeMaterials => {
  const high = tier === "high";
  return {
    chassis: high
      ? new MeshPhysicalMaterial({ color: CHASSIS, metalness: 0.85, roughness: 0.32, clearcoat: 0.6, clearcoatRoughness: 0.25 })
      : new MeshStandardMaterial({ color: CHASSIS, metalness: 0.85, roughness: 0.32 }),
    trim: new MeshStandardMaterial({ color: CHASSIS_EDGE, metalness: 1, roughness: 0.2 }),
    glass: high
      ? new MeshPhysicalMaterial({ color: GLASS_TINT, transmission: 1, thickness: 0.35, roughness: 0.16, ior: 1.5, metalness: 0 })
      : new MeshStandardMaterial({ color: GLASS_TINT, transparent: true, opacity: 0.35, roughness: 0.1, metalness: 0.2 }),
    ledBeam: led(BEAM),
    ledNebula: led(NEBULA),
    halo: new MeshBasicMaterial({
      map: glowTexture(),
      color: BEAM,
      blending: AdditiveBlending,
      depthWrite: false,
      transparent: true,
      opacity: 0.55,
    }),
  };
};

export const useBladeMaterials = (tier: SceneTier): BladeMaterials => {
  const materials = useMemo(() => create(tier), [tier]);
  useEffect(
    () => () => {
      Object.values(materials).forEach((m) => m.dispose());
    },
    [materials],
  );
  return materials;
};
