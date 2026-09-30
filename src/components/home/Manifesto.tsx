import { FocusText } from "@/components/motion/FocusText";
import { Reveal } from "@/components/motion/Reveal";
import { Eyebrow } from "@/components/site/SectionIntro";

interface ManifestoProps {
  eyebrow?: string;
  text?: string;
  signature?: string;
}

export const Manifesto = ({
  eyebrow = "Why Beam",
  text = "A server should be fast on the first boot, priced like a *person* wrote the invoice, and backed by people who *reply.* Everything else is detail, and we sweat the detail too.",
  signature = "The Beam team",
}: ManifestoProps) => (
  <section className="relative py-20 sm:py-28">
    <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(40%_50%_at_50%_50%,hsl(var(--beam)/0.05),transparent_70%)]" />
    <div className="shell relative">
      <Eyebrow label={eyebrow} line={false} />
      <FocusText
        text={text}
        className="display mt-10 max-w-6xl text-[clamp(2rem,4.6vw,4.1rem)] font-semibold leading-[1.06] tracking-[-0.035em] text-bone"
      />
      <Reveal className="mt-12 flex items-center gap-4">
        <span className="h-px w-10 bg-beam/70" />
        <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-mute">{signature}</span>
      </Reveal>
    </div>
  </section>
);
