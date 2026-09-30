import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from "react";
import * as THREE from "three";
import type { MotionValue } from "framer-motion";
import { cn } from "@/lib/utils";
import { isFinePointer, prefersReducedMotion } from "@/lib/motion";
import type { Location } from "@/lib/locations";
import { isLand } from "./landMask";

export interface GlobeHandle {
  focus: (lat: number, lng: number) => void;
}

interface ParticleGlobeProps {
  locations: Location[];
  arcs?: [string, string][];
  className?: string;
  labels?: boolean;
  initialLng?: number;
  initialLat?: number;
  activeCode?: string | null;
  tilt?: MotionValue<number>;
  satellites?: boolean;
}

const DEG = Math.PI / 180;
const NO_ARCS: [string, string][] = [];
const R = 1.5;

const toVec = (lat: number, lng: number, r = R) => {
  const phi = (90 - lat) * DEG;
  const theta = (lng + 180) * DEG;
  return new THREE.Vector3(-r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta));
};

const DOT_VERT = `
uniform float uSize;
uniform float uPixelRatio;
attribute float aRand;
varying float vFacing;
varying float vRand;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vec3 n = normalize(normalMatrix * normalize(position));
  vFacing = n.z;
  vRand = aRand;
  gl_PointSize = uSize * uPixelRatio * (6.0 / -mv.z);
  gl_Position = projectionMatrix * mv;
}
`;

const DOT_FRAG = `
uniform vec3 uColor;
uniform float uTime;
varying float vFacing;
varying float vRand;
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c);
  if (d > 0.5) discard;
  float a = smoothstep(0.5, 0.15, d);
  float facing = smoothstep(-0.15, 0.55, vFacing);
  float twinkle = 0.78 + 0.22 * sin(uTime * 1.2 + vRand * 6.2831);
  gl_FragColor = vec4(uColor, a * mix(0.07, 0.92, facing) * twinkle);
}
`;

const MARKER_VERT = `
uniform float uPixelRatio;
uniform float uTime;
attribute float aSize;
attribute float aPulse;
attribute float aPhase;
attribute float aActive;
varying float vFacing;
varying float vPulse;
varying float vLife;
varying float vActive;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vec3 n = normalize(normalMatrix * normalize(position));
  vFacing = n.z;
  vPulse = aPulse;
  vActive = aActive;
  float life = fract(uTime * 0.45 + aPhase);
  vLife = life;
  float size = aPulse > 0.5 ? aSize * (1.0 + life * 3.2) : aSize * (1.0 + aActive * 0.9);
  gl_PointSize = size * uPixelRatio * (6.0 / -mv.z);
  gl_Position = projectionMatrix * mv;
}
`;

const MARKER_FRAG = `
uniform vec3 uColor;
uniform vec3 uHot;
varying float vFacing;
varying float vPulse;
varying float vLife;
varying float vActive;
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c);
  if (d > 0.5) discard;
  float facing = smoothstep(0.0, 0.35, vFacing);
  vec3 color = mix(uColor, uHot, vActive);
  if (vPulse > 0.5) {
    float ring = smoothstep(0.5, 0.42, d) * smoothstep(0.3, 0.4, d);
    gl_FragColor = vec4(color, ring * (1.0 - vLife) * 0.8 * facing);
  } else {
    float core = smoothstep(0.5, 0.0, d);
    float glow = pow(core, 1.6);
    gl_FragColor = vec4(mix(color, vec3(1.0), smoothstep(0.25, 0.0, d) * 0.6), glow * facing);
  }
}
`;

const ARC_VERT = `
attribute float aT;
varying float vT;
varying float vFacing;
void main() {
  vT = aT;
  vec3 n = normalize(normalMatrix * normalize(position));
  vFacing = n.z;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const ARC_FRAG = `
uniform vec3 uColor;
uniform float uTime;
uniform float uOffset;
varying float vT;
varying float vFacing;
void main() {
  float head = fract(uTime * 0.16 + uOffset) * 1.4 - 0.2;
  float d = vT - head;
  float trail = smoothstep(-0.28, 0.0, d) * (1.0 - smoothstep(0.0, 0.015, d));
  float facing = smoothstep(-0.35, 0.25, vFacing);
  float a = (0.08 + trail * 0.95) * facing;
  gl_FragColor = vec4(uColor, a);
}
`;

const HALO_VERT = `
varying vec3 vNormal;
void main() {
  vNormal = normalize(normalMatrix * normal);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const HALO_FRAG = `
uniform vec3 uColor;
uniform float uPower;
uniform float uStrength;
uniform float uBias;
varying vec3 vNormal;
void main() {
  float i = pow(max(uBias - dot(vNormal, vec3(0.0, 0.0, 1.0)), 0.0), uPower);
  gl_FragColor = vec4(uColor, i * uStrength);
}
`;

const SAT_VERT = `
uniform float uPixelRatio;
uniform float uSize;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = uSize * uPixelRatio * (6.0 / -mv.z);
  gl_Position = projectionMatrix * mv;
}
`;

const SAT_FRAG = `
uniform vec3 uColor;
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c);
  if (d > 0.5) discard;
  float glow = pow(smoothstep(0.5, 0.0, d), 1.8);
  vec3 col = mix(uColor, vec3(1.0), smoothstep(0.18, 0.0, d));
  gl_FragColor = vec4(col, glow);
}
`;

const SAT_TILT = [0.5, -0.9, 1.25];
const SAT_RADII = [1.32, 1.45, 1.6];
const SAT_SPEED = [0.35, -0.25, 0.18];
const SAT_PHASE = [0.4, 2.1, 4.3];

const shortest = (from: number, to: number) => {
  let d = (to - from) % (Math.PI * 2);
  if (d > Math.PI) d -= Math.PI * 2;
  if (d < -Math.PI) d += Math.PI * 2;
  return from + d;
};

export const ParticleGlobe = forwardRef<GlobeHandle, ParticleGlobeProps>(
  ({ locations, arcs = NO_ARCS, className, labels = true, initialLng = -30, initialLat = 18, activeCode = null, tilt, satellites = false }, ref) => {
    const wrapRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const labelRefs = useRef<(HTMLDivElement | null)[]>([]);
    const api = useRef<{ focus: (lat: number, lng: number) => void; setActive: (code: string | null) => void }>();

    useImperativeHandle(ref, () => ({
      focus: (lat, lng) => api.current?.focus(lat, lng),
    }));

    const tiltRef = useRef<MotionValue<number> | undefined>(tilt);
    tiltRef.current = tilt;

    const initial = useRef({ lng: initialLng, lat: initialLat });
    const activeRef = useRef(activeCode);

    useEffect(() => {
      activeRef.current = activeCode;
      api.current?.setActive(activeCode);
    }, [activeCode]);

    const hubs = useMemo(() => locations.filter((l) => l.hub && l.code !== "FRA"), [locations]);

    useEffect(() => {
      const wrap = wrapRef.current;
      const canvas = canvasRef.current;
      if (!wrap || !canvas) return;

      let renderer: THREE.WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
      } catch {
        return;
      }

      const fine = isFinePointer();
      const reduce = prefersReducedMotion();
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      renderer.setPixelRatio(pixelRatio);
      renderer.setClearColor(0x000000, 0);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
      camera.position.set(0, 0, 6.9);

      const rig = new THREE.Group();
      rig.rotation.set(0.12, 0, -0.16);
      scene.add(rig);
      const globe = new THREE.Group();
      rig.add(globe);

      const step = fine ? 1.3 : 1.8;
      const positions: number[] = [];
      const rands: number[] = [];
      let row = 0;
      for (let lat = -58; lat <= 83; lat += step) {
        const count = Math.max(1, Math.floor((360 / step) * Math.cos(lat * DEG)));
        const shift = row % 2 ? 0.5 : 0;
        for (let i = 0; i < count; i++) {
          const lng = -180 + ((i + shift) / count) * 360;
          if (!isLand(lat, lng)) continue;
          const v = toVec(lat, lng);
          positions.push(v.x, v.y, v.z);
          rands.push(Math.random());
        }
        row++;
      }

      const core = new THREE.Mesh(
        new THREE.SphereGeometry(R * 0.985, 64, 64),
        new THREE.MeshBasicMaterial({ color: new THREE.Color("#07070f") }),
      );
      globe.add(core);

      const dotGeo = new THREE.BufferGeometry();
      dotGeo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
      dotGeo.setAttribute("aRand", new THREE.Float32BufferAttribute(rands, 1));
      const dotMat = new THREE.ShaderMaterial({
        vertexShader: DOT_VERT,
        fragmentShader: DOT_FRAG,
        transparent: true,
        depthWrite: false,
        uniforms: {
          uSize: { value: fine ? 2.3 : 2.6 },
          uPixelRatio: { value: pixelRatio },
          uColor: { value: new THREE.Color("#e9e5dc") },
          uTime: { value: 0 },
        },
      });
      const dots = new THREE.Points(dotGeo, dotMat);
      globe.add(dots);

      const halo = new THREE.Mesh(
        new THREE.SphereGeometry(R * 1.16, 64, 64),
        new THREE.ShaderMaterial({
          vertexShader: HALO_VERT,
          fragmentShader: HALO_FRAG,
          side: THREE.BackSide,
          transparent: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
          uniforms: {
            uColor: { value: new THREE.Color("#5fd6ee") },
            uPower: { value: 3.0 },
            uStrength: { value: 0.55 },
            uBias: { value: 0.7 },
          },
        }),
      );
      rig.add(halo);

      const rim = new THREE.Mesh(
        new THREE.SphereGeometry(R * 1.002, 64, 64),
        new THREE.ShaderMaterial({
          vertexShader: HALO_VERT,
          fragmentShader: HALO_FRAG,
          transparent: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
          uniforms: {
            uColor: { value: new THREE.Color("#8fe9f7") },
            uPower: { value: 3.2 },
            uStrength: { value: 0.35 },
            uBias: { value: 1.0 },
          },
        }),
      );
      globe.add(rim);

      const markerPos: number[] = [];
      const markerSize: number[] = [];
      const markerPulse: number[] = [];
      const markerPhase: number[] = [];
      const markerActive: number[] = [];
      const markerCodes: string[] = [];
      locations.forEach((l, i) => {
        const v = toVec(l.lat, l.lng, R * 1.004);
        markerPos.push(v.x, v.y, v.z);
        markerSize.push(l.hub ? 7.5 : 4.6);
        markerPulse.push(0);
        markerPhase.push(0);
        markerActive.push(0);
        markerCodes.push(l.code);
        if (l.hub) {
          markerPos.push(v.x, v.y, v.z);
          markerSize.push(6.5);
          markerPulse.push(1);
          markerPhase.push((i * 0.137) % 1);
          markerActive.push(0);
          markerCodes.push(l.code);
        }
      });
      const markerGeo = new THREE.BufferGeometry();
      markerGeo.setAttribute("position", new THREE.Float32BufferAttribute(markerPos, 3));
      markerGeo.setAttribute("aSize", new THREE.Float32BufferAttribute(markerSize, 1));
      markerGeo.setAttribute("aPulse", new THREE.Float32BufferAttribute(markerPulse, 1));
      markerGeo.setAttribute("aPhase", new THREE.Float32BufferAttribute(markerPhase, 1));
      const activeAttr = new THREE.Float32BufferAttribute(markerActive, 1);
      markerGeo.setAttribute("aActive", activeAttr);
      const markerMat = new THREE.ShaderMaterial({
        vertexShader: MARKER_VERT,
        fragmentShader: MARKER_FRAG,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uPixelRatio: { value: pixelRatio },
          uTime: { value: 0 },
          uColor: { value: new THREE.Color("#4de8ff") },
          uHot: { value: new THREE.Color("#b98cff") },
        },
      });
      const markers = new THREE.Points(markerGeo, markerMat);
      globe.add(markers);

      const byCode = new Map(locations.map((l) => [l.code, l]));
      const arcMats: THREE.ShaderMaterial[] = [];
      const arcGeos: THREE.BufferGeometry[] = [];
      arcs.forEach(([a, b], idx) => {
        const la = byCode.get(a);
        const lb = byCode.get(b);
        if (!la || !lb) return;
        const va = toVec(la.lat, la.lng).normalize();
        const vb = toVec(lb.lat, lb.lng).normalize();
        const angle = va.angleTo(vb);
        const lift = 0.06 + angle * 0.16;
        const segs = 96;
        const pts: number[] = [];
        const ts: number[] = [];
        for (let i = 0; i <= segs; i++) {
          const t = i / segs;
          const v = va.clone().lerp(vb, t).normalize();
          v.multiplyScalar(R * (1.004 + Math.sin(Math.PI * t) * lift));
          pts.push(v.x, v.y, v.z);
          ts.push(t);
        }
        const g = new THREE.BufferGeometry();
        g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
        g.setAttribute("aT", new THREE.Float32BufferAttribute(ts, 1));
        const m = new THREE.ShaderMaterial({
          vertexShader: ARC_VERT,
          fragmentShader: ARC_FRAG,
          transparent: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
          uniforms: {
            uColor: { value: new THREE.Color(idx % 3 === 1 ? "#b98cff" : "#5ff0ff") },
            uTime: { value: 0 },
            uOffset: { value: (idx * 0.29) % 1 },
          },
        });
        arcGeos.push(g);
        arcMats.push(m);
        globe.add(new THREE.Line(g, m));
      });

      const satGeos: THREE.BufferGeometry[] = [];
      const satMats: THREE.Material[] = [];
      const sats: { point: THREE.Points; radius: number; index: number }[] = [];
      if (satellites) {
        const ringCount = fine ? 3 : 2;
        for (let i = 0; i < ringCount; i++) {
          const radius = R * SAT_RADII[i];
          const orbit = new THREE.Group();
          orbit.rotation.set(SAT_TILT[i], i * 0.9, 0);
          const pts: number[] = [];
          for (let k = 0; k < 128; k++) {
            const a = (k / 128) * Math.PI * 2;
            pts.push(Math.cos(a) * radius, 0, Math.sin(a) * radius);
          }
          const ringGeo = new THREE.BufferGeometry();
          ringGeo.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
          const ringMat = new THREE.LineBasicMaterial({
            color: new THREE.Color("#4de8ff"),
            transparent: true,
            opacity: 0.1,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
          });
          orbit.add(new THREE.LineLoop(ringGeo, ringMat));
          const satGeo = new THREE.BufferGeometry();
          satGeo.setAttribute("position", new THREE.Float32BufferAttribute([0, 0, 0], 3));
          const satMat = new THREE.ShaderMaterial({
            vertexShader: SAT_VERT,
            fragmentShader: SAT_FRAG,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            uniforms: {
              uPixelRatio: { value: pixelRatio },
              uSize: { value: 7 },
              uColor: { value: new THREE.Color(i === 1 ? "#9b6bff" : "#4de8ff") },
            },
          });
          const point = new THREE.Points(satGeo, satMat);
          orbit.add(point);
          rig.add(orbit);
          satGeos.push(ringGeo, satGeo);
          satMats.push(ringMat, satMat);
          sats.push({ point, radius, index: i });
        }
      }

      const placeSats = (t: number) => {
        sats.forEach(({ point, radius, index }) => {
          const a = t * SAT_SPEED[index] + SAT_PHASE[index];
          point.position.set(Math.cos(a) * radius, 0, Math.sin(a) * radius);
        });
      };
      placeSats(0);

      const baseLat = initial.current.lat * DEG * 0.6;
      const baseY = -(initial.current.lng + 90) * DEG;
      const state = {
        rotY: baseY,
        rotX: baseLat,
        targetY: baseY,
        targetX: baseLat,
        velocity: 0,
        dragging: false,
        lastX: 0,
        lastY: 0,
        idleUntil: 0,
        focusing: false,
      };
      globe.rotation.set(state.rotX, state.rotY, 0);

      const setActive = (code: string | null) => {
        for (let i = 0; i < markerCodes.length; i++) activeAttr.setX(i, markerCodes[i] === code ? 1 : 0);
        activeAttr.needsUpdate = true;
      };

      api.current = {
        focus: (lat, lng) => {
          state.targetY = shortest(state.rotY, -(lng + 90) * DEG);
          state.targetX = Math.max(-0.7, Math.min(0.7, lat * DEG * 0.85));
          state.focusing = true;
          state.velocity = 0;
          state.idleUntil = performance.now() + 5000;
        },
        setActive,
      };
      setActive(activeRef.current);

      const resize = () => {
        const w = wrap.clientWidth;
        const h = wrap.clientHeight;
        if (!w || !h) return;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.position.z = w / h < 0.9 ? 6.9 / Math.max(w / h, 0.62) : 6.9;
        camera.updateProjectionMatrix();
      };

      const onDown = (e: PointerEvent) => {
        state.dragging = true;
        state.focusing = false;
        state.lastX = e.clientX;
        state.lastY = e.clientY;
        state.velocity = 0;
        canvas.setPointerCapture?.(e.pointerId);
      };
      const onMove = (e: PointerEvent) => {
        if (!state.dragging) return;
        const dx = e.clientX - state.lastX;
        const dy = e.clientY - state.lastY;
        state.lastX = e.clientX;
        state.lastY = e.clientY;
        state.rotY += dx * 0.0055;
        state.targetY = state.rotY;
        state.velocity = dx * 0.0055;
        if (e.pointerType === "mouse") {
          state.rotX = Math.max(-0.7, Math.min(0.7, state.rotX + dy * 0.0035));
          state.targetX = state.rotX;
        }
      };
      const onUp = () => {
        state.dragging = false;
        state.idleUntil = performance.now() + 2500;
      };

      canvas.addEventListener("pointerdown", onDown);
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
      window.addEventListener("pointercancel", onUp);

      let visible = true;
      const io = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
      });
      io.observe(wrap);
      const ro = new ResizeObserver(resize);
      ro.observe(wrap);
      resize();

      const proj = new THREE.Vector3();
      const world = new THREE.Vector3();
      const normal = new THREE.Vector3();
      const hubVectors = locations.filter((l) => l.hub && l.code !== "FRA").map((h) => toVec(h.lat, h.lng, R * 1.02));

      const sizes = hubVectors.map(() => ({ w: 0, h: 0 }));
      const slots = hubVectors.map(() => ({ x: 0, y: 0, facing: 0, alpha: 0 }));
      const order = hubVectors.map((_, i) => i);
      const placed: { l: number; t: number; r: number; b: number }[] = [];

      const updateLabels = () => {
        if (!labels) return;
        const w = wrap.clientWidth;
        const h = wrap.clientHeight;
        hubVectors.forEach((v, i) => {
          world.copy(v).applyMatrix4(globe.matrixWorld);
          normal.copy(world).normalize();
          const s = slots[i];
          s.facing = normal.dot(proj.copy(camera.position).normalize());
          proj.copy(world).project(camera);
          s.x = (proj.x * 0.5 + 0.5) * w;
          s.y = (-proj.y * 0.5 + 0.5) * h;
          s.alpha = Math.max(0, Math.min(1, (s.facing - 0.25) * 3));
        });
        order.sort((a, b) => slots[b].facing - slots[a].facing);
        placed.length = 0;
        for (const i of order) {
          const el = labelRefs.current[i];
          if (!el) continue;
          const size = sizes[i];
          if (!size.w) {
            const tag = el.firstElementChild as HTMLElement | null;
            size.w = tag?.offsetWidth ?? 0;
            size.h = tag?.offsetHeight ?? 0;
          }
          const s = slots[i];
          let left = s.x;
          if (left + 10 + size.w > w - 4) left = s.x - size.w - 20;
          left = Math.max(-8, left);
          const box = { l: left + 6, t: s.y - 14, r: left + size.w + 14, b: s.y - 6 + size.h };
          let alpha = s.alpha;
          if (alpha > 0.05) {
            if (placed.some((p) => box.l < p.r && box.r > p.l && box.t < p.b && box.b > p.t)) alpha = 0;
            else placed.push(box);
          }
          el.style.transform = `translate3d(${left.toFixed(1)}px, ${s.y.toFixed(1)}px, 0)`;
          el.style.opacity = alpha.toFixed(2);
        }
      };

      let raf = 0;
      let prev = performance.now();
      const clock = { t: 0 };
      const satClock = { t: 0 };
      const loop = (now: number) => {
        raf = requestAnimationFrame(loop);
        const dt = Math.min(0.05, (now - prev) / 1000);
        prev = now;
        if (!visible || document.hidden) return;
        clock.t += dt;

        if (!state.dragging) {
          if (state.focusing) {
            state.rotY += (state.targetY - state.rotY) * 0.06;
            state.rotX += (state.targetX - state.rotX) * 0.06;
            if (Math.abs(state.targetY - state.rotY) < 0.001) state.focusing = false;
          } else {
            state.velocity *= 0.94;
            state.rotY += state.velocity;
            if (now > state.idleUntil && !reduce) state.rotY += dt * 0.07;
            if (now > state.idleUntil) state.rotX += (baseLat - state.rotX) * 0.01;
          }
        }
        globe.rotation.set(state.rotX, state.rotY, 0);

        const tv = reduce ? 0.5 : (tiltRef.current?.get() ?? 0.5);
        rig.rotation.x += (0.12 + (tv - 0.5) * 0.35 - rig.rotation.x) * 0.08;
        rig.rotation.z += (-0.16 + (tv - 0.5) * 0.12 - rig.rotation.z) * 0.08;
        camera.position.y += ((0.5 - tv) * 0.6 - camera.position.y) * 0.08;
        camera.lookAt(0, 0, 0);

        if (sats.length) {
          if (!reduce) satClock.t += dt;
          placeSats(satClock.t);
        }

        dotMat.uniforms.uTime.value = clock.t;
        markerMat.uniforms.uTime.value = clock.t;
        arcMats.forEach((m) => (m.uniforms.uTime.value = clock.t));
        renderer.render(scene, camera);
        updateLabels();
      };
      raf = requestAnimationFrame(loop);

      return () => {
        cancelAnimationFrame(raf);
        io.disconnect();
        ro.disconnect();
        canvas.removeEventListener("pointerdown", onDown);
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        window.removeEventListener("pointercancel", onUp);
        dotGeo.dispose();
        dotMat.dispose();
        markerGeo.dispose();
        markerMat.dispose();
        core.geometry.dispose();
        (core.material as THREE.Material).dispose();
        halo.geometry.dispose();
        (halo.material as THREE.Material).dispose();
        rim.geometry.dispose();
        (rim.material as THREE.Material).dispose();
        arcGeos.forEach((g) => g.dispose());
        arcMats.forEach((m) => m.dispose());
        satGeos.forEach((g) => g.dispose());
        satMats.forEach((m) => m.dispose());
        renderer.dispose();
        renderer.forceContextLoss();
        api.current = undefined;
      };
    }, [locations, arcs, labels, satellites]);

    return (
      <div ref={wrapRef} className={cn("relative h-full w-full select-none", className)}>
        <canvas
          ref={canvasRef}
          aria-label="Interactive globe of Beam Server locations. Drag to rotate."
          role="img"
          className="absolute inset-0 h-full w-full cursor-grab touch-pan-y active:cursor-grabbing"
        />
        {labels && (
          <div aria-hidden className="pointer-events-none absolute inset-0">
            {hubs.map((h, i) => (
              <div
                key={h.code}
                ref={(el) => {
                  labelRefs.current[i] = el;
                }}
                className="absolute left-0 top-0 opacity-0 will-change-transform"
              >
                <span
                  className={cn(
                    "ml-2.5 -mt-2.5 inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-white/10 bg-ink/70 px-2 py-0.5 font-mono text-[10px] tracking-[0.14em] text-bone/85 backdrop-blur-md",
                    activeCode === h.code && "border-ember/50 text-ember",
                  )}
                >
                  {h.code}
                  <span className="text-mute">{h.name}</span>
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  },
);

ParticleGlobe.displayName = "ParticleGlobe";

export default ParticleGlobe;
