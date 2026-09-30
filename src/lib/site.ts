export const SITE = {
  name: "Beam Server",
  short: "Beam",
  email: "supportbeam@gmail.com",
  phoneDisplay: "+1 (778) 851-7393",
  whatsappNumber: "17788517393",
  founded: 2024,
  slaLabel: "99.9%",
  timezone: "PST",
};

export const HOURS = [
  { days: "Monday to Friday", time: "9:00 to 18:00" },
  { days: "Saturday", time: "10:00 to 16:00" },
  { days: "Sunday", time: "Closed" },
];

export const whatsappLink = (message?: string) => {
  const base = `https://wa.me/${SITE.whatsappNumber}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
};

export const mailLink = (subject?: string) =>
  subject ? `mailto:${SITE.email}?subject=${encodeURIComponent(subject)}` : `mailto:${SITE.email}`;

export const GENERAL_MESSAGE = "Hi Beam, I have a question about your servers.";

export type NavItem = { label: string; to: string; note?: string };

export const NAV: NavItem[] = [
  { label: "Servers", to: "/servers", note: "Seven machine types" },
  { label: "Pricing", to: "/pricing", note: "From $9 a month" },
  { label: "Network", to: "/network", note: "25 locations" },
  { label: "About", to: "/about", note: "Why Beam exists" },
  { label: "Support", to: "/support", note: "FAQ and help" },
  { label: "Contact", to: "/contact", note: "Talk to a person" },
];

export const FOOTER_COLUMNS: { title: string; links: { label: string; to: string; external?: boolean }[] }[] = [
  {
    title: "Servers",
    links: [
      { label: "Cloud Compute", to: "/servers#cloud-compute" },
      { label: "High Frequency", to: "/servers#high-frequency" },
      { label: "Dedicated CPU", to: "/servers#general-purpose" },
      { label: "Cloud RDP", to: "/servers#rdp" },
      { label: "Pricing", to: "/pricing" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", to: "/about" },
      { label: "Network", to: "/network" },
      { label: "Reviews", to: "/testimonials" },
      { label: "Contact", to: "/contact" },
    ],
  },
  {
    title: "Help",
    links: [
      { label: "Support and FAQ", to: "/support" },
      { label: "Customer portal", to: "/portal" },
      { label: "WhatsApp", to: whatsappLink(GENERAL_MESSAGE), external: true },
      { label: "Email us", to: mailLink(), external: true },
    ],
  },
];
