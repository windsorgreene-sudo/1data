import Lenis from "lenis";
import { useEffect } from "react";
import { prefersReducedMotion } from "@/lib/motion";
import { setLenis } from "@/lib/scroll";

const PREVENT = '[data-lenis-prevent], [role="dialog"], [role="listbox"], [role="menu"], [data-radix-popper-content-wrapper]';

export const SmoothScroll = () => {
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.4,
      autoRaf: true,
      allowNestedScroll: true,
      stopInertiaOnNavigate: true,
      prevent: (node) => Boolean(node?.closest?.(PREVENT)),
    });
    setLenis(lenis);

    const sync = () => {
      const locked =
        document.body.hasAttribute("data-scroll-locked") || document.documentElement.style.overflow === "hidden";
      if (locked) lenis.stop();
      else lenis.start();
    };
    const mo = new MutationObserver(sync);
    mo.observe(document.body, { attributes: true, attributeFilter: ["data-scroll-locked", "style"] });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["style"] });

    return () => {
      mo.disconnect();
      lenis.destroy();
      setLenis(null);
    };
  }, []);

  return null;
};
