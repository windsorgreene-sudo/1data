import { AnimatePresence } from "framer-motion";
import { Suspense, useEffect } from "react";
import { useLocation, useOutlet } from "react-router-dom";
import PageTransition from "@/components/PageTransition";
import { scrollToTarget } from "@/lib/scroll";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { SmoothScroll } from "./SmoothScroll";
import { FloatingChat } from "./FloatingChat";

export const PageLoading = () => (
  <div className="flex min-h-[80vh] items-center justify-center">
    <span className="h-px w-40 overflow-hidden bg-white/10">
      <span className="block h-full w-1/3 animate-[shimmerMove_1.1s_ease-in-out_infinite] bg-beam" />
    </span>
  </div>
);

export const SiteLayout = () => {
  const location = useLocation();
  const outlet = useOutlet();

  useEffect(() => {
    if (!location.hash) return;
    let tries = 0;
    let timer = 0;
    const attempt = () => {
      const el = document.getElementById(decodeURIComponent(location.hash.slice(1)));
      if (el) scrollToTarget(el, { offset: -88 });
      else if (tries++ < 40) timer = window.setTimeout(attempt, 100);
    };
    timer = window.setTimeout(attempt, 700);
    return () => window.clearTimeout(timer);
  }, [location.pathname, location.hash, location.key]);

  return (
    <>
      <a
        href="#main"
        className="fixed left-4 top-3 z-[100] -translate-y-24 rounded-full bg-bone px-4 py-2 text-sm font-medium text-ink focus:translate-y-0"
      >
        Skip to content
      </a>
      <SmoothScroll />
      <SiteHeader />
      <AnimatePresence
        mode="wait"
        initial={false}
        onExitComplete={() => scrollToTarget(0, { immediate: true })}
      >
        <PageTransition key={location.pathname}>
          <main id="main">
            <Suspense fallback={<PageLoading />}>{outlet}</Suspense>
          </main>
          <SiteFooter />
        </PageTransition>
      </AnimatePresence>
      <FloatingChat />
    </>
  );
};

export default SiteLayout;
