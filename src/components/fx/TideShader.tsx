import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { isFinePointer, prefersReducedMotion } from "@/lib/motion";

const VERT = `
attribute vec2 aPos;
void main() {
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;
uniform float uWarm;
uniform float uIntensity;
uniform float uFade;

float hash(vec2 p) {
  p = fract(p * vec2(233.34, 851.73));
  p += dot(p, p + 23.45);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p = m * p;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  float aspect = uRes.x / uRes.y;
  vec2 p = vec2((uv.x - 0.5) * aspect, uv.y - 0.5);
  vec2 m = vec2((uMouse.x - 0.5) * aspect, uMouse.y - 0.5);
  float t = uTime * 0.03;

  vec2 q = vec2(fbm(p * 1.25 + vec2(0.0, t * 2.0)), fbm(p * 1.25 + vec2(4.1, -t * 1.6)));
  vec2 r = vec2(
    fbm(p * 1.05 + 2.3 * q + vec2(1.7, 9.2) + t),
    fbm(p * 1.05 + 2.3 * q + vec2(8.3, 2.8) - t * 0.8)
  );
  float f = fbm(p + 1.9 * r + (m - p) * 0.06);

  vec3 ink = vec3(0.027, 0.027, 0.059);
  vec3 amber = vec3(0.26, 0.10, 0.48);
  vec3 ember = vec3(0.62, 0.36, 0.98);
  vec3 tide = vec3(0.04, 0.30, 0.55);
  vec3 foam = vec3(0.20, 0.90, 1.00);

  float side = smoothstep(-0.6, 0.6, p.x + (r.y - 0.5) * 1.1);
  side = mix(1.0, side, uWarm);
  vec3 warm = mix(amber, ember, smoothstep(0.4, 0.9, f));
  vec3 cool = mix(tide, foam, smoothstep(0.5, 0.98, f));
  vec3 col = mix(warm, cool, side);

  float glow = smoothstep(0.3, 0.95, f + length(r - 0.5) * 0.3);
  float edge = smoothstep(0.1, 1.0, abs(p.x) / (0.5 * aspect));
  float center = 1.0 - smoothstep(0.0, 0.62, length(p * vec2(0.62, 1.15)));
  float amount = glow * (0.3 + 0.7 * edge) * (1.0 - 0.6 * center) * uIntensity;
  col = mix(ink, col, clamp(amount, 0.0, 1.0));

  float ml = exp(-4.5 * length(p - m));
  col += mix(ember, foam, side) * ml * 0.05 * uIntensity;

  col = mix(ink, col, mix(1.0, smoothstep(0.0, 0.34, uv.y), uFade));

  vec2 cell = floor(gl_FragCoord.xy);
  float s = hash(cell * 0.731);
  float star = step(0.9978, s) * (0.45 + 0.55 * sin(uTime * (0.6 + s * 2.4) + s * 70.0));
  col += star * 0.5 * (1.0 - clamp(amount * 1.4, 0.0, 1.0)) * smoothstep(0.15, 0.55, uv.y);

  float g = hash(gl_FragCoord.xy + fract(uTime * 0.37) * 91.0) - 0.5;
  col += g * 0.035;

  gl_FragColor = vec4(col, 1.0);
}
`;

interface TideShaderProps {
  className?: string;
  warm?: number;
  intensity?: number;
  fadeBottom?: boolean;
}

const compile = (gl: WebGLRenderingContext, type: number, source: string) => {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
};

export const TideShader = ({ className, warm = 1, intensity = 1, fadeBottom = true }: TideShaderProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", {
      antialias: false,
      alpha: false,
      depth: false,
      stencil: false,
      premultipliedAlpha: false,
      powerPreference: "high-performance",
    });
    if (!gl) return;

    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return;
    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(program, "aPos");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(program, "uRes");
    const uTime = gl.getUniformLocation(program, "uTime");
    const uMouse = gl.getUniformLocation(program, "uMouse");
    const uWarm = gl.getUniformLocation(program, "uWarm");
    const uIntensity = gl.getUniformLocation(program, "uIntensity");
    const uFade = gl.getUniformLocation(program, "uFade");
    gl.uniform1f(uWarm, warm);
    gl.uniform1f(uIntensity, intensity);
    gl.uniform1f(uFade, fadeBottom ? 1 : 0);

    const reduce = prefersReducedMotion();
    const fine = isFinePointer();
    const scale = fine ? 0.5 : 0.34;
    const mouse = { x: 0.5, y: 0.6, tx: 0.5, ty: 0.6 };
    let visible = true;
    let raf = 0;
    let last = 0;
    const offset = Math.random() * 100;

    const resize = () => {
      const w = Math.max(1, Math.round(canvas.clientWidth * scale));
      const h = Math.max(1, Math.round(canvas.clientHeight * scale));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
      gl.uniform2f(uRes, w, h);
    };

    const draw = (time: number) => {
      mouse.x += (mouse.tx - mouse.x) * 0.04;
      mouse.y += (mouse.ty - mouse.y) * 0.04;
      gl.uniform1f(uTime, offset + time / 1000);
      gl.uniform2f(uMouse, mouse.x, mouse.y);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const loop = (time: number) => {
      raf = requestAnimationFrame(loop);
      if (!visible || document.hidden) return;
      if (!fine && time - last < 32) return;
      last = time;
      draw(time);
    };

    const onPointer = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      mouse.tx = (e.clientX - r.left) / r.width;
      mouse.ty = 1 - (e.clientY - r.top) / r.height;
    };

    const ro = new ResizeObserver(() => {
      resize();
      if (reduce) draw(0);
    });
    ro.observe(canvas);
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    io.observe(canvas);

    resize();
    if (reduce) {
      draw(0);
    } else {
      window.addEventListener("pointermove", onPointer, { passive: true });
      raf = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onPointer);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [warm, intensity, fadeBottom]);

  return <canvas ref={canvasRef} aria-hidden className={cn("block h-full w-full", className)} />;
};
