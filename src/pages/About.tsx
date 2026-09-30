import { motion, useScroll, useSpring } from "framer-motion";
import { useRef } from "react";
import { EASE_OUT } from "@/lib/motion";
import { SITE } from "@/lib/site";
import { usePageMeta } from "@/hooks/usePageMeta";
import { PageHero } from "@/components/site/PageHero";
import { SectionIntro } from "@/components/site/SectionIntro";
import { CTABand } from "@/components/site/CTABand";
import { Manifesto } from "@/components/home/Manifesto";
import { CountUp } from "@/components/motion/CountUp";
import { Reveal } from "@/components/motion/Reveal";

const STATS = [
  { to: 99.9, decimals: 1, suffix: "%", label: "Uptime SLA on every plan" },
  { to: 25, label: "Locations on six continents" },
  { to: 10, suffix: "K+", label: "Customers served" },
  { to: 24, suffix: "/7", label: "Technical support" },
];

const PRINCIPLES = [
  {
    title: "Fast by default",
    text: "NVMe on most plans, SSD on the rest, and current AMD EPYC and Intel Xeon hosts. Speed is part of every plan, not an upsell saved for the expensive ones.",
  },
  {
    title: "Secure without ceremony",
    text: "Every server is its own isolated machine with its own credentials, delivered to the email on your account. That part is not optional.",
  },
  {
    title: "People on the other end",
    text: "Message us on WhatsApp or email and a person replies. Technical tickets are watched around the clock, because servers do not keep office hours.",
  },
  {
    title: "Close to your users",
    text: "25 locations across six continents, so the right server is rarely far from the people who depend on it.",
  },
];

const TIMELINE = [
  {
    year: "2024",
    title: "Founded",
    text: "Beam Server opens with one idea: reliable cloud infrastructure at a price you can read in one glance.",
  },
  {
    year: "2025",
    title: "Expansion",
    text: "More services and new data centers around the world, so customers can grow without switching hosts.",
  },
  {
    year: "2026",
    title: "Next chapter",
    text: "More capacity, more regions and the same promise: fast machines, fair prices, real replies.",
  },
];

const Timeline = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.75", "end 0.6"] });
  const scaleY = useSpring(scrollYProgress, { stiffness: 90, damping: 24 });
  return (
    <div ref={ref} className="relative mt-14 sm:mt-20">
      <div aria-hidden className="absolute bottom-2 left-[7px] top-2 w-px bg-white/[0.08] md:left-1/2">
        <motion.div style={{ scaleY }} className="h-full w-px origin-top bg-beam" />
      </div>
      <ol className="space-y-16">
        {TIMELINE.map((t, i) => (
          <li key={t.year} className="relative grid gap-4 pl-10 md:grid-cols-2 md:gap-16 md:pl-0">
            <span
              aria-hidden
              className="absolute left-0 top-3 h-[15px] w-[15px] rounded-full border border-beam bg-ink shadow-[0_0_18px_hsl(var(--beam)/0.6)] md:left-1/2 md:-translate-x-1/2"
            />
            <motion.p
              initial={{ opacity: 0, x: i % 2 ? 30 : -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "0px 0px -10% 0px" }}
              transition={{ duration: 0.9, ease: EASE_OUT }}
              className={`display text-[clamp(4rem,9vw,7.5rem)] font-bold leading-[0.85] tracking-[-0.06em] text-bone/90 md:text-right ${
                i % 2 ? "md:order-2 md:text-left" : ""
              }`}
            >
              {t.year}
            </motion.p>
            <Reveal delay={0.1} className={i % 2 ? "md:order-1 md:text-right" : ""}>
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-beam">{t.title}</p>
              <p className="mt-3 max-w-md text-[17px] leading-relaxed text-bone/75 md:inline-block">{t.text}</p>
            </Reveal>
          </li>
        ))}
      </ol>
    </div>
  );
};

const About = () => {
  usePageMeta(
    "About",
    "Beam Server started in 2024 to make renting a fast server simple: publish the real price, keep the hardware quick, and answer messages like a person.",
  );
  return (
    <>
      <PageHero
        eyebrow={`About Beam · since ${SITE.founded}`}
        title={"Hosting without\n*the haggling.*"}
        description="Beam started with a simple rule: publish the real price, keep the hardware fast, and answer messages the way a person would. Everything on this site follows from that."
        visual="lattice"
      />

      <section className="relative pb-8">
        <div className="shell">
          <Reveal className="grid grid-cols-2 gap-px overflow-hidden rounded-[1.4rem] border border-white/[0.08] bg-white/[0.08] lg:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.label} className="bg-ink-2 p-6 sm:p-8">
                <p className="display text-[clamp(2.6rem,5vw,3.8rem)] font-bold leading-none tracking-[-0.05em] text-bone">
                  <CountUp to={s.to} decimals={s.decimals ?? 0} suffix={s.suffix ?? ""} />
                </p>
                <p className="mt-3 text-[14px] text-mute">{s.label}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      <Manifesto
        eyebrow="What we believe"
        text="Renting a server should feel like *buying a tool,* not signing up for a negotiation. Clear specs, a clear price, and a clear person to talk to when something is *not right.*"
        signature="Written by the people who run the fleet"
      />

      <section className="relative py-20 sm:py-28">
        <div className="shell">
          <SectionIntro
            eyebrow="Principles"
            title={"Four things\n*we will not trade.*"}
            description="They decide what we build, what we buy and how we answer when you message us."
          />
          <ol className="mt-14 border-t border-white/[0.08] sm:mt-20">
            {PRINCIPLES.map((p, i) => (
              <motion.li
                key={p.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "0px 0px -8% 0px" }}
                transition={{ duration: 0.8, ease: EASE_OUT, delay: i * 0.05 }}
                className="group relative grid gap-4 border-b border-white/[0.08] py-10 md:grid-cols-12 md:items-baseline"
              >
                <span className="pointer-events-none absolute inset-x-0 bottom-[-1px] h-px origin-left scale-x-0 bg-beam transition-transform duration-700 ease-out-expo group-hover:scale-x-100" />
                <span className="font-mono text-[12px] tracking-[0.2em] text-mute md:col-span-1">0{i + 1}</span>
                <h3 className="display text-[clamp(2rem,3.6vw,3rem)] font-semibold leading-none tracking-[-0.045em] text-bone transition-transform duration-700 ease-out-expo group-hover:translate-x-2 md:col-span-5">
                  {p.title}
                </h3>
                <p className="max-w-xl text-[16px] leading-relaxed text-mute md:col-span-6">{p.text}</p>
              </motion.li>
            ))}
          </ol>
        </div>
      </section>

      <section className="relative py-20 sm:py-28">
        <div className="shell">
          <SectionIntro
            eyebrow="Timeline"
            title={"Short history,\n*long roadmap.*"}
            description="We are young and we like it that way. Here is where we have been so far."
          />
          <Timeline />
        </div>
      </section>

      <CTABand />
    </>
  );
};

export default About;
