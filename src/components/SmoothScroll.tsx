import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Lenis from "lenis";

const SmoothScroll = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const lenisRef = useRef<Lenis | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.5,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1.1,
      touchMultiplier: 1.5,
      infinite: false,
    });

    lenisRef.current = lenis;
    (window as any).__lenis = lenis;

    const raf = (time: number) => {
      lenis.raf(time);
      rafRef.current = requestAnimationFrame(raf);
    };
    rafRef.current = requestAnimationFrame(raf);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lenis.destroy();
      lenisRef.current = null;
      (window as any).__lenis = null;
    };
  }, []);

  useEffect(() => {
    const state = location.state as { scrollTo?: string } | null;
    const targetId = state?.scrollTo ?? (location.hash ? location.hash.slice(1) : null);

    if (state?.scrollTo) {
      navigate(location.pathname, { replace: true, state: null });
    }
    if (location.hash) {
      window.history.replaceState({}, "", location.pathname);
    }

    if (targetId) {
      let attempts = 0;
      const MAX = 30;
      const tryScroll = () => {
        const el = document.getElementById(targetId);
        if (el) {
          lenisRef.current?.scrollTo(el, { offset: -80, duration: 1.4, easing: (t) => 1 - Math.pow(1 - t, 4) });
        } else if (attempts < MAX) {
          attempts++;
          setTimeout(tryScroll, 100);
        }
      };
      setTimeout(tryScroll, 350);
    } else {
      lenisRef.current?.scrollTo(0, { immediate: true });
    }
  }, [location.key, navigate]);

  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest('a[href^="#"]');
      if (anchor) {
        e.preventDefault();
        const id = anchor.getAttribute("href")?.slice(1);
        const el = document.getElementById(id || "");
        if (el) lenisRef.current?.scrollTo(el, { offset: -80, duration: 1.4, easing: (t) => 1 - Math.pow(1 - t, 4) });
      }
    };
    document.addEventListener("click", handleAnchorClick);
    return () => document.removeEventListener("click", handleAnchorClick);
  }, []);

  return null;
};

export default SmoothScroll;
