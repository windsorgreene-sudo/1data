import { useScroll } from "framer-motion";
import { useRef } from "react";
import { SplitText } from "@/components/motion/SplitText";
import { Reveal } from "@/components/motion/Reveal";
import { Magnetic } from "@/components/motion/Magnetic";
import { GENERAL_MESSAGE, whatsappLink } from "@/lib/site";
import { Action } from "./Action";
import { Eyebrow } from "./SectionIntro";
import { PageAccent } from "./PageAccent";

interface CTABandProps {
  eyebrow?: string;
  title?: string;
  description?: string;
  primaryLabel?: string;
  primaryTo?: string;
}

export const CTABand = ({
  eyebrow = "Ready when you are",
  title = "Your next server is\n*one message away.*",
  description = "Pick a plan, tap order, and WhatsApp opens with the details filled in. Most servers are handed over within 30 minutes of payment.",
  primaryLabel = "See every plan",
  primaryTo = "/pricing",
}: CTABandProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: cardRef, offset: ["start end", "end start"] });

  return (
    <section className="relative py-20 sm:py-28">
      <div className="shell">
        <div ref={cardRef} className="grain relative overflow-hidden rounded-[2rem] border border-white/[0.08] bg-ink-2">
          <PageAccent
            variant="field"
            progress={scrollYProgress}
            className="absolute inset-0 [mask-image:radial-gradient(58%_34%_at_50%_52%,transparent_60%,#000_100%)]"
          />
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_80%_at_50%_0%,hsl(var(--beam)/0.14),transparent_70%)]" />
          <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-ink-2 to-transparent" />
          <div className="relative flex flex-col items-center px-6 py-20 text-center sm:px-12 sm:py-28">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-[8%] inset-y-[6%] bg-[radial-gradient(closest-side,hsl(var(--ink-2)/0.7),transparent)]"
            />
            <Eyebrow label={eyebrow} line={false} className="relative" />
            <SplitText
              text={title}
              className="display relative mt-7 max-w-4xl text-[clamp(2.5rem,6.4vw,5.6rem)] font-bold leading-[0.93] text-bone"
            />
            <Reveal delay={0.2} className="relative mt-7 max-w-xl text-[17px] leading-relaxed text-mute">
              {description}
            </Reveal>
            <Reveal delay={0.35} className="relative mt-10 flex flex-wrap items-center justify-center gap-3">
              <Magnetic>
                <Action to={primaryTo} size="lg">
                  {primaryLabel}
                </Action>
              </Magnetic>
              <Magnetic>
                <Action href={whatsappLink(GENERAL_MESSAGE)} size="lg" variant="secondary" icon="external">
                  Chat on WhatsApp
                </Action>
              </Magnetic>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
};
