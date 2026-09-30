import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { SplitText } from "@/components/motion/SplitText";
import { Reveal } from "@/components/motion/Reveal";
import { MeshGrid } from "@/components/fx/MeshGrid";
import { Eyebrow } from "./SectionIntro";

interface PageHeroProps {
  eyebrow: string;
  title: string;
  description?: ReactNode;
  children?: ReactNode;
  aside?: ReactNode;
  background?: "mesh" | "grid" | "none";
  className?: string;
}

export const PageHero = ({
  eyebrow,
  title,
  description,
  children,
  aside,
  background = "grid",
  className,
}: PageHeroProps) => (
  <section className={cn("grain relative overflow-hidden pb-20 pt-36 sm:pt-44 lg:pb-28", className)}>
    <div aria-hidden className="pointer-events-none absolute inset-0">
      {background === "mesh" && <MeshGrid className="absolute inset-0 opacity-90 mask-fade-b" />}
      {background === "grid" && <div className="absolute inset-0 bg-grid opacity-60 mask-radial" />}
      <div className="absolute -top-40 left-1/2 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-beam/[0.07] blur-[120px]" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-ink to-transparent" />
    </div>
    <div className="shell relative">
      <div className={cn("grid gap-12", aside && "lg:grid-cols-12 lg:items-end")}>
        <div className={cn(aside && "lg:col-span-7")}>
          <Eyebrow label={eyebrow} line={false} />
          <SplitText
            as="h1"
            trigger="mount"
            delay={0.1}
            text={title}
            className={cn("display mt-7 max-w-5xl font-bold leading-[0.92] text-bone", aside ? "text-[clamp(2.7rem,5.8vw,5.4rem)]" : "text-[clamp(2.9rem,7.4vw,6.6rem)]")}
          />
          {description && (
            <Reveal delay={0.45} className="mt-8 max-w-2xl text-[18px] leading-relaxed text-mute sm:text-[19px]">
              {description}
            </Reveal>
          )}
          {children && (
            <Reveal delay={0.6} className="mt-10 flex flex-wrap items-center gap-3">
              {children}
            </Reveal>
          )}
        </div>
        {aside && (
          <Reveal delay={0.5} className="lg:col-span-5">
            {aside}
          </Reveal>
        )}
      </div>
    </div>
  </section>
);
