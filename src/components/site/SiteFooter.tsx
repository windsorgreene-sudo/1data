import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight, Mail, MessageCircle } from "lucide-react";
import { useRef } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { EASE_OUT } from "@/lib/motion";
import { FOOTER_COLUMNS, GENERAL_MESSAGE, SITE, mailLink, whatsappLink } from "@/lib/site";
import { scrollToTarget } from "@/lib/scroll";
import { useSupportClock } from "@/hooks/useSupportClock";
import { Logo } from "./Logo";

const WORD = "beam";

const Wordmark = () => {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
  const y = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : ["38%", "0%"]);

  return (
    <div ref={ref} aria-hidden className="relative mt-20 select-none overflow-hidden">
      <motion.div
        style={{ y }}
        className="display flex justify-center whitespace-nowrap text-[30vw] font-bold leading-[0.74] tracking-[-0.07em] sm:text-[27vw]"
      >
        {WORD.split("").map((ch, i) => (
          <motion.span
            key={i}
            className="inline-block bg-gradient-to-b from-white/[0.11] via-white/[0.05] to-transparent bg-clip-text text-transparent"
            initial={reduce ? { opacity: 0 } : { y: "40%", opacity: 0 }}
            whileInView={{ y: "0%", opacity: 1 }}
            viewport={{ once: true, margin: "0px 0px -5% 0px" }}
            transition={{ duration: 1.2, ease: EASE_OUT, delay: i * 0.07 }}
          >
            {ch}
          </motion.span>
        ))}
      </motion.div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink to-transparent" />
    </div>
  );
};

export const SiteFooter = () => {
  const clock = useSupportClock();
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden border-t border-white/[0.07] bg-ink">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-beam/40 to-transparent" />
      <div className="shell pt-20">
        <div className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Logo />
            <p className="mt-6 max-w-sm text-[15px] leading-relaxed text-mute">
              Cloud VPS and Windows RDP across 25 locations. Priced in plain numbers and supported by people who
              actually reply.
            </p>
            <div className="mt-8 flex flex-wrap gap-2.5">
              <a
                href={whatsappLink(GENERAL_MESSAGE)}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex h-10 items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 text-sm text-bone/85 transition-colors hover:border-white/25 hover:text-bone"
              >
                <MessageCircle className="h-4 w-4 text-beam" />
                WhatsApp
              </a>
              <a
                href={mailLink()}
                className="group inline-flex h-10 items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 text-sm text-bone/85 transition-colors hover:border-white/25 hover:text-bone"
              >
                <Mail className="h-4 w-4 text-beam" />
                {SITE.email}
              </a>
            </div>
            <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-white/[0.08] px-3.5 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-mute">
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  clock.open ? "bg-signal shadow-[0_0_10px_hsl(var(--signal))]" : "bg-ember",
                )}
              />
              <span>
                Support desk {clock.open ? "open" : "closed"} · {clock.time} {clock.zone}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:col-span-7 lg:col-start-6">
            {FOOTER_COLUMNS.map((col) => (
              <div key={col.title}>
                <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-mute">{col.title}</p>
                <ul className="mt-5 space-y-3">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      {link.external ? (
                        <a
                          href={link.to}
                          target={link.to.startsWith("http") ? "_blank" : undefined}
                          rel="noopener noreferrer"
                          className="group inline-flex items-center gap-1 text-[15px] text-bone/75 transition-colors hover:text-bone"
                        >
                          <span className="link-underline">{link.label}</span>
                          <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:opacity-100" />
                        </a>
                      ) : (
                        <Link to={link.to} className="text-[15px] text-bone/75 transition-colors hover:text-bone">
                          <span className="link-underline">{link.label}</span>
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Wordmark />

      <div className="relative border-t border-white/[0.07]">
        <div className="shell flex flex-col gap-3 py-6 text-[13px] text-mute sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {SITE.name}. All rights reserved.
          </p>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em]">Built for people who SSH before coffee</p>
          <button
            type="button"
            onClick={() => scrollToTarget(0)}
            className="inline-flex items-center gap-2 self-start font-mono text-[11px] uppercase tracking-[0.2em] transition-colors hover:text-bone sm:self-auto"
          >
            Back to top
            <ArrowUpRight className="h-3.5 w-3.5 -rotate-45" />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
