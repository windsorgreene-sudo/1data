export interface AnatomyStat {
  value: number;
  decimals?: number;
  suffix?: string;
  prefix?: string;
  caption: string;
}

export interface AnatomyStage {
  id: string;
  index: string;
  label: string;
  title: string;
  body: string;
  stat?: AnatomyStat;
}

export const STAGES: AnatomyStage[] = [
  {
    id: "chassis",
    index: "01",
    label: "Chassis",
    title: "Inside every Beam server.",
    body: "Scroll to take one apart. Every part here is on the spec sheet.",
  },
  {
    id: "compute",
    index: "02",
    label: "Compute",
    title: "AMD EPYC and Intel Xeon.",
    body: "Current hosts on every line. Dedicated CPU plans reserve the cores for you, so no neighbors share them.",
  },
  {
    id: "storage",
    index: "03",
    label: "Storage",
    title: "NVMe that reads at up to 7,000 MB/s.",
    body: "High Frequency, High Performance and every Dedicated line run on NVMe.",
    stat: { value: 7000, suffix: " MB/s", caption: "Read speed, up to" },
  },
  {
    id: "network",
    index: "04",
    label: "Network",
    title: "IPv4 and IPv6 from the first boot.",
    body: "Both stacks are live on every plan, with nothing extra to request.",
  },
  {
    id: "uptime",
    index: "05",
    label: "Uptime",
    title: "99.9% uptime SLA in {total} locations.",
    body: "About 43 minutes of downtime a month at most, and we treat every one of them like a bug.",
    stat: { value: 99.9, decimals: 1, suffix: "%", caption: "Uptime SLA" },
  },
];

export interface Pose {
  cam: [number, number, number];
  target: [number, number, number];
  lid: number;
  cpu: number;
  nvme: number;
  nic: number;
  orbit: number;
  spin: number;
}

export const POSES: Pose[] = [
  { cam: [4.6, 2.7, 6.2], target: [0, 0, 0], lid: 0, cpu: 0, nvme: 0, nic: 0, orbit: 0, spin: 0 },
  { cam: [2.6, 5.0, 6.3], target: [-0.1, 0.8, 0.1], lid: 1, cpu: 1, nvme: 0, nic: 0, orbit: 0, spin: 0 },
  { cam: [4.4, 1.9, 5.8], target: [0.6, 0, 1.0], lid: 1, cpu: 0.25, nvme: 1, nic: 0, orbit: 0, spin: 0 },
  { cam: [3.4, 3.3, -5.9], target: [0.7, 0.3, -1.3], lid: 0, cpu: 0, nvme: 0.3, nic: 1, orbit: 0, spin: 0 },
  { cam: [0, 3.0, 9.8], target: [0, 0, 0], lid: 0, cpu: 0, nvme: 0, nic: 0, orbit: 1, spin: 1 },
];

export const STAGE_COUNT = STAGES.length;
export const ORBIT_RADIUS = 2.5;
export const LID_LIFT = 1.7;
export const LID_SLIDE = 0.6;
export const LID_TILT = 0.28;

const HALF = 0.28;
const DOLLY = 0.3;

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

const smoothstep = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

interface Orbit {
  r: number;
  az: number;
  el: number;
}

const ORBITS: Orbit[] = POSES.map(({ cam, target }) => {
  const x = cam[0] - target[0];
  const y = cam[1] - target[1];
  const z = cam[2] - target[2];
  const r = Math.hypot(x, y, z);
  return { r, az: Math.atan2(x, z), el: Math.asin(y / r) };
});

const unit = (p: number) => clamp(p, 0, 1) * STAGE_COUNT;

export const createPose = (): Pose => ({
  cam: [0, 0, 0],
  target: [0, 0, 0],
  lid: 0,
  cpu: 0,
  nvme: 0,
  nic: 0,
  orbit: 0,
  spin: 0,
});

export const poseAt = (p: number, out: Pose): Pose => {
  const u = unit(p);
  const i = clamp(Math.floor(u - 0.5), 0, STAGE_COUNT - 2);
  const e = smoothstep(i + 1 - HALF, i + 1 + HALF, u);
  const a = POSES[i];
  const b = POSES[i + 1];
  const oa = ORBITS[i];
  const ob = ORBITS[i + 1];
  for (let k = 0; k < 3; k++) out.target[k] = lerp(a.target[k], b.target[k], e);
  const r = lerp(oa.r, ob.r, e) * (1 + DOLLY * Math.sin(Math.PI * e));
  const az = lerp(oa.az, ob.az, e);
  const el = lerp(oa.el, ob.el, e);
  const flat = r * Math.cos(el);
  out.cam[0] = out.target[0] + flat * Math.sin(az);
  out.cam[1] = out.target[1] + r * Math.sin(el);
  out.cam[2] = out.target[2] + flat * Math.cos(az);
  out.lid = lerp(a.lid, b.lid, e);
  out.cpu = lerp(a.cpu, b.cpu, e);
  out.nvme = lerp(a.nvme, b.nvme, e);
  out.nic = lerp(a.nic, b.nic, e);
  out.orbit = lerp(a.orbit, b.orbit, e);
  out.spin = lerp(a.spin, b.spin, e);
  return out;
};

export const framing = (aspect: number) => ({
  scale: aspect < 1 ? 1.25 / Math.max(aspect, 0.3) : 1,
  drop: aspect < 1 ? 0.3 : 0,
});

export const stageAt = (p: number): number => Math.min(Math.floor(unit(p)), STAGE_COUNT - 1);

export const segmentFill = (p: number, k: number): number => clamp(unit(p) - k, 0, 1);

export const railFill = (p: number): number => clamp(unit(p) / (STAGE_COUNT - 1), 0, 1);

export const stageFocus = (i: number): number => clamp((i + 0.5) / STAGE_COUNT, 0, 1);

export const stageTitle = (stage: AnatomyStage, total: number): string =>
  stage.title.replace("{total}", String(total));
