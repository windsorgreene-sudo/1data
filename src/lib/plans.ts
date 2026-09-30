export type Disk = "SSD" | "NVMe";
export type Family = "shared" | "dedicated";
export type Kind = "vps" | "rdp";

export interface Plan {
  code: string;
  vcpu: number;
  ram: number;
  storage: number;
  disk: Disk;
  transfer: number;
  vps: number;
  rdp: number | null;
}

export interface Category {
  id: string;
  family: Family;
  name: string;
  tagline: string;
  description: string;
  bestFor: string[];
  plans: Plan[];
}

const p = (
  code: string,
  vcpu: number,
  ram: number,
  storage: number,
  disk: Disk,
  transfer: number,
  vps: number,
  rdp: number | null,
): Plan => ({ code, vcpu, ram, storage, disk, transfer, vps, rdp });

export const CATEGORIES: Category[] = [
  {
    id: "cloud-compute",
    family: "shared",
    name: "Cloud Compute",
    tagline: "SSD-backed shared vCPU",
    description:
      "The sensible default. Enough for websites, bots, staging boxes and small databases, at the lowest price we sell.",
    bestFor: ["Websites and blogs", "Bots and small APIs", "Staging and CI runners"],
    plans: [
      p("vc2-2c-4gb", 2, 4, 80, "SSD", 3, 9, null),
      p("vc2-4c-8gb", 4, 8, 160, "SSD", 4, 17, 33),
      p("vc2-6c-16gb", 6, 16, 320, "SSD", 5, 31, 60),
      p("vc2-8c-32gb", 8, 32, 640, "SSD", 6, 56, 99),
    ],
  },
  {
    id: "high-frequency",
    family: "shared",
    name: "High Frequency",
    tagline: "Intel at 3 GHz and up, on NVMe",
    description:
      "Higher clock speeds for work that leans on a single thread: game servers, trading terminals, build jobs and busy PHP sites.",
    bestFor: ["Game servers", "Trading and automation", "Single-thread heavy apps"],
    plans: [
      p("vhf-2c-4gb", 2, 4, 128, "NVMe", 3, 13, null),
      p("vhf-4c-8gb", 4, 8, 256, "NVMe", 4, 23, 42),
      p("vhf-8c-16gb", 8, 16, 350, "NVMe", 6, 45, 75),
      p("vhf-12c-32gb", 12, 32, 768, "NVMe", 8, 80, 130),
    ],
  },
  {
    id: "high-performance",
    family: "shared",
    name: "High Performance",
    tagline: "AMD and Intel hosts on NVMe",
    description:
      "Newer AMD and Intel hosts with the biggest transfer allowance on shared CPU. Good for traffic-heavy apps and media.",
    bestFor: ["High traffic sites", "Media and downloads", "Containers"],
    plans: [
      p("vhp-2c-4gb", 2, 4, 100, "NVMe", 4, 14, null),
      p("vhp-4c-8gb", 4, 8, 200, "NVMe", 5, 25, 45),
      p("vhp-8c-16gb", 8, 16, 350, "NVMe", 7, 47, 82),
      p("vhp-16c-32gb", 16, 32, 512, "NVMe", 9, 85, 140),
    ],
  },
  {
    id: "general-purpose",
    family: "dedicated",
    name: "General Purpose",
    tagline: "Balanced dedicated cores",
    description:
      "Cores reserved for you alone, with a balanced amount of memory. Predictable performance for production work.",
    bestFor: ["Production web apps", "Business RDP desks", "Background workers"],
    plans: [
      p("voc-g-2c-4gb", 2, 4, 50, "NVMe", 4, 16, null),
      p("voc-g-2c-8gb", 2, 8, 50, "NVMe", 5, 21, 37),
      p("voc-g-4c-16gb", 4, 16, 80, "NVMe", 6, 41, 70),
      p("voc-g-8c-32gb", 8, 32, 160, "NVMe", 7, 78, 125),
    ],
  },
  {
    id: "cpu-optimized",
    family: "dedicated",
    name: "CPU Optimized",
    tagline: "Dedicated cores for compute",
    description:
      "Built for compute-bound jobs that keep every core busy: encoding, compiling, CI pipelines and number crunching.",
    bestFor: ["Video encoding", "Compiling and CI", "Batch jobs"],
    plans: [
      p("voc-c-2c-4gb", 2, 4, 50, "NVMe", 4, 18, null),
      p("voc-c-2c-8gb", 2, 8, 50, "NVMe", 5, 25, 43),
      p("voc-c-4c-16gb", 4, 16, 75, "NVMe", 6, 47, 80),
    ],
  },
  {
    id: "memory-optimized",
    family: "dedicated",
    name: "Memory Optimized",
    tagline: "8 GB of RAM for every core",
    description:
      "Eight gigabytes of memory behind every dedicated core. Made for databases, caches and in-memory analytics.",
    bestFor: ["PostgreSQL and MySQL", "Redis and caches", "In-memory analytics"],
    plans: [
      p("voc-m-1c-8gb", 1, 8, 50, "NVMe", 5, 23, 41),
      p("voc-m-2c-16gb", 2, 16, 100, "NVMe", 6, 43, 74),
      p("voc-m-4c-32gb", 4, 32, 200, "NVMe", 8, 76, 132),
    ],
  },
  {
    id: "storage-optimized",
    family: "dedicated",
    name: "Storage Optimized",
    tagline: "The most NVMe per core",
    description:
      "Up to 160 GB of NVMe for every dedicated core, for data that needs to sit right next to the compute.",
    bestFor: ["Data warehouses", "Backups and archives", "Search indexes"],
    plans: [
      p("voc-s-2c-8gb", 2, 8, 150, "NVMe", 4, 29, 48),
      p("voc-s-2c-16gb", 2, 16, 320, "NVMe", 6, 50, 86),
      p("voc-s-4c-32gb", 4, 32, 640, "NVMe", 7, 90, 148),
    ],
  },
];

export const FAMILY_LABEL: Record<Family, string> = {
  shared: "Shared CPU",
  dedicated: "Dedicated CPU",
};

export const FAMILY_NOTE: Record<Family, string> = {
  shared: "Best value for websites, testing and lightweight workloads.",
  dedicated: "Reserved cores for production and high-load applications.",
};

export const ALL_PLANS = CATEGORIES.flatMap((c) => c.plans);

export const minPrice = (plans: Plan[], kind: Kind) => {
  const prices = plans.map((pl) => (kind === "vps" ? pl.vps : pl.rdp)).filter((v): v is number => v !== null);
  return prices.length ? Math.min(...prices) : null;
};

export const VPS_FROM = minPrice(ALL_PLANS, "vps") as number;
export const RDP_FROM = minPrice(ALL_PLANS, "rdp") as number;
export const DEDICATED_FROM = minPrice(
  CATEGORIES.filter((c) => c.family === "dedicated").flatMap((c) => c.plans),
  "vps",
) as number;

export const range = (values: number[]) => {
  const min = Math.min(...values);
  const max = Math.max(...values);
  return min === max ? `${min}` : `${min} to ${max}`;
};

export const specRange = (c: Category) => ({
  vcpu: range(c.plans.map((pl) => pl.vcpu)),
  ram: range(c.plans.map((pl) => pl.ram)),
  storage: range(c.plans.map((pl) => pl.storage)),
  transfer: range(c.plans.map((pl) => pl.transfer)),
  disk: c.plans[0].disk,
});

export const kindLabel = (kind: Kind) => (kind === "vps" ? "Linux VPS" : "Windows RDP");

export const orderMessage = (plan: Plan, kind: Kind) => {
  const price = kind === "vps" ? plan.vps : plan.rdp;
  const code = kind === "rdp" ? `rdp-${plan.code}` : plan.code;
  return `Hi Beam, I'd like to order ${code} (${plan.vcpu} vCPU, ${plan.ram} GB RAM, ${plan.storage} GB ${plan.disk}) as a ${kindLabel(kind)} at $${price}/mo.`;
};

export interface Tier {
  name: string;
  price: number;
  code: string;
  blurb: string;
  popular?: boolean;
  specs: { label: string; value: string }[];
  features: { label: string; value: boolean | string }[];
}

export const TIERS: Tier[] = [
  {
    name: "Starter",
    price: 9,
    code: "vc2-2c-4gb",
    blurb: "A first server for a site, a bot or a side project.",
    specs: [
      { label: "vCPU", value: "2" },
      { label: "Memory", value: "4 GB" },
      { label: "Storage", value: "80 GB SSD" },
      { label: "Transfer", value: "3 TB" },
    ],
    features: [
      { label: "Full root access", value: true },
      { label: "99.9% uptime SLA", value: true },
      { label: "Support", value: "Email" },
      { label: "Automated backups", value: false },
      { label: "Custom ISO", value: false },
      { label: "Private network", value: false },
      { label: "Load balancer", value: false },
    ],
  },
  {
    name: "Pro",
    price: 17,
    code: "vc2-4c-8gb",
    blurb: "Room for real traffic, plus backups and your own ISO.",
    popular: true,
    specs: [
      { label: "vCPU", value: "4" },
      { label: "Memory", value: "8 GB" },
      { label: "Storage", value: "160 GB SSD" },
      { label: "Transfer", value: "4 TB" },
    ],
    features: [
      { label: "Full root access", value: true },
      { label: "99.9% uptime SLA", value: true },
      { label: "Support", value: "Priority" },
      { label: "Automated backups", value: true },
      { label: "Custom ISO", value: true },
      { label: "Private network", value: false },
      { label: "Load balancer", value: false },
    ],
  },
  {
    name: "Enterprise",
    price: 56,
    code: "vc2-8c-32gb",
    blurb: "Serious memory, a private network and a load balancer.",
    specs: [
      { label: "vCPU", value: "8" },
      { label: "Memory", value: "32 GB" },
      { label: "Storage", value: "640 GB SSD" },
      { label: "Transfer", value: "6 TB" },
    ],
    features: [
      { label: "Full root access", value: true },
      { label: "99.9% uptime SLA", value: true },
      { label: "Support", value: "Dedicated" },
      { label: "Automated backups", value: true },
      { label: "Custom ISO", value: true },
      { label: "Private network", value: true },
      { label: "Load balancer", value: true },
    ],
  },
];

export const tierMessage = (tier: Tier) =>
  `Hi Beam, I'm interested in the ${tier.name} plan (${tier.code}) at $${tier.price}/mo. Can you tell me more?`;

export const INCLUDED = [
  { title: "99.9% uptime SLA", text: "Written into every plan, cheapest one included." },
  { title: "IPv4 and IPv6", text: "Both stacks from the first boot." },
  { title: "Full root or admin", text: "Your machine, your rules, unlimited logins." },
  { title: "Monthly billing", text: "No contracts. Stop when you want to." },
  { title: "Upgrade any time", text: "Move up a plan and pay only the difference." },
  { title: "No hidden fees", text: "The price on this page is the price you pay." },
];

export const OPERATING_SYSTEMS = [
  { name: "Ubuntu", detail: "LTS releases", kind: "vps" as Kind },
  { name: "Debian", detail: "Stable releases", kind: "vps" as Kind },
  { name: "AlmaLinux", detail: "RHEL compatible", kind: "vps" as Kind },
  { name: "Windows Server 2022", detail: "Cloud RDP", kind: "rdp" as Kind },
  { name: "Windows Server 2019", detail: "Cloud RDP", kind: "rdp" as Kind },
];
