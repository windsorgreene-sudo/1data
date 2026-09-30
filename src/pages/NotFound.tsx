import { useLocation } from "react-router-dom";
import { usePageMeta } from "@/hooks/usePageMeta";
import { MeshGrid } from "@/components/fx/MeshGrid";
import { Scramble } from "@/components/motion/Scramble";
import { Reveal } from "@/components/motion/Reveal";
import { Action } from "@/components/site/Action";

const NotFound = () => {
  const location = useLocation();
  usePageMeta("Page not found");

  return (
    <section className="grain relative flex min-h-[100svh] items-center overflow-hidden">
      <MeshGrid className="absolute inset-0 opacity-80 mask-radial" />
      <div className="shell relative py-32 text-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-beam">
          <Scramble text="Error 404 · route not found" trigger="view" />
        </p>
        <h1 className="display mt-6 text-[clamp(7rem,26vw,20rem)] font-bold leading-[0.8] tracking-[-0.07em] text-gradient-beam">
          404
        </h1>
        <Reveal delay={0.2} className="mx-auto mt-8 max-w-md text-[17px] leading-relaxed text-mute">
          Nothing lives at <span className="font-mono text-bone">{location.pathname}</span>. It may have moved, or the
          link had a typo.
        </Reveal>
        <Reveal delay={0.3} className="mt-10 flex flex-wrap justify-center gap-3">
          <Action to="/">Back to home</Action>
          <Action to="/pricing" variant="secondary">
            See pricing
          </Action>
        </Reveal>
      </div>
    </section>
  );
};

export default NotFound;
