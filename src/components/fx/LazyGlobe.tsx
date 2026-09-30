import { useInView } from "framer-motion";
import { forwardRef, lazy, Suspense, useRef, type ComponentProps } from "react";
import { cn } from "@/lib/utils";
import type { GlobeHandle } from "./ParticleGlobe";

const ParticleGlobe = lazy(() => import("./ParticleGlobe"));

type Props = ComponentProps<typeof ParticleGlobe>;

const Placeholder = () => (
  <div className="absolute inset-0 flex items-center justify-center">
    <div className="aspect-square w-[72%] rounded-full border border-white/[0.06] bg-[radial-gradient(circle_at_40%_35%,hsl(var(--beam)/0.08),transparent_60%)]" />
  </div>
);

export const LazyGlobe = forwardRef<GlobeHandle, Props>(({ className, ...props }, ref) => {
  const wrap = useRef<HTMLDivElement>(null);
  const near = useInView(wrap, { once: true, margin: "400px 0px 400px 0px" });
  return (
    <div ref={wrap} className={cn("relative", className)}>
      {near ? (
        <Suspense fallback={<Placeholder />}>
          <ParticleGlobe ref={ref} {...props} className="absolute inset-0" />
        </Suspense>
      ) : (
        <Placeholder />
      )}
    </div>
  );
});

LazyGlobe.displayName = "LazyGlobe";
