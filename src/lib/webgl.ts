let cached: boolean | null = null;

export const hasWebGL = (): boolean => {
  if (cached !== null) return cached;
  try {
    if (typeof document === "undefined") return false;
    const canvas = document.createElement("canvas");
    const gl = (canvas.getContext("webgl2") ?? canvas.getContext("webgl")) as WebGLRenderingContext | null;
    cached = !!gl;
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
  } catch {
    cached = false;
  }
  return cached;
};
