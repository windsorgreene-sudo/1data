import type { FaqItem } from "@/components/site/Faq";

export const FAQ: Record<string, FaqItem> = {
  speed: {
    q: "How fast will my server be ready?",
    a: "Once your payment is confirmed we build the server and email you the login details. That usually takes less than 30 minutes, and often a lot less.",
  },
  order: {
    q: "How do I order?",
    a: "Pick a plan on the pricing page and tap Order. WhatsApp opens with the plan details already filled in. We confirm the location and payment with you, then start provisioning straight away.",
  },
  locations: {
    q: "Which locations can I choose?",
    a: "25 locations across North America, South America, Europe, the Middle East, Africa, Asia and Oceania, including New York, London, Frankfurt, Singapore, Tokyo and Sydney. The network page has the full list.",
  },
  upgrade: {
    q: "Can I upgrade later?",
    a: "Yes. You can move to a bigger plan with more CPU, memory, storage or transfer at any time. Upgrades need very little downtime and you only pay the difference for the rest of the billing period.",
  },
  os: {
    q: "Which operating systems are available?",
    a: "Linux servers run Ubuntu, Debian, AlmaLinux or CentOS. Cloud RDP comes with Windows Server 2019 or 2022, ready to use, with full Administrator access.",
  },
  rdp: {
    q: "Why do some plans have no Windows price?",
    a: "Windows Server needs room to breathe, so Cloud RDP is only offered on plans with 8 GB of memory or more. Every Linux plan can be ordered in any size.",
  },
  contract: {
    q: "Is there a contract?",
    a: "No. Billing is monthly and you can stop at the end of any month. If you run several servers, ask us about volume pricing.",
  },
  custom: {
    q: "Do you build custom or enterprise setups?",
    a: "Yes. We put together custom RDP configurations, VPS clusters and dedicated setups with priority support and flexible billing. Tell us what you need and we will come back with a quote.",
  },
  help: {
    q: "How do I get help?",
    a: "Message us on WhatsApp or email during business hours, or open a ticket in your customer portal at any time for technical problems. Email replies usually arrive within 2 hours during business hours.",
  },
  different: {
    q: "What makes Beam different?",
    a: "Fast NVMe storage on most plans, a 99.9% uptime SLA on every plan, prices that match the invoice, and real people answering messages. We would rather be the host you forget about because nothing breaks.",
  },
};

export const SUPPORT_FAQ = [
  FAQ.different,
  FAQ.speed,
  FAQ.order,
  FAQ.locations,
  FAQ.os,
  FAQ.upgrade,
  FAQ.help,
  FAQ.custom,
  FAQ.contract,
];

export const PRICING_FAQ = [FAQ.order, FAQ.speed, FAQ.rdp, FAQ.upgrade, FAQ.contract, FAQ.custom];
