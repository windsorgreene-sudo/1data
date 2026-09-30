import type Lenis from "lenis";

let instance: Lenis | null = null;

declare global {
  interface Window {
    __lenis?: Lenis | null;
  }
}

export const setLenis = (lenis: Lenis | null) => {
  instance = lenis;
  window.__lenis = lenis;
};

export const getLenis = () => instance;

type Target = number | string | HTMLElement;

export const scrollToTarget = (target: Target, options: { offset?: number; immediate?: boolean } = {}) => {
  const offset = options.offset ?? -96;
  if (instance) {
    instance.scrollTo(target, {
      offset,
      immediate: options.immediate,
      duration: 1.25,
      easing: (t: number) => 1 - Math.pow(1 - t, 4),
      force: true,
    });
    return;
  }
  let top = 0;
  if (typeof target === "number") top = target;
  else {
    const el = typeof target === "string" ? document.querySelector<HTMLElement>(target) : target;
    if (!el) return;
    top = el.getBoundingClientRect().top + window.scrollY + offset;
  }
  window.scrollTo({ top, behavior: options.immediate ? "auto" : "smooth" });
};

let locks = 0;

export const lockScroll = (locked: boolean) => {
  locks = Math.max(0, locks + (locked ? 1 : -1));
  const on = locks > 0;
  if (on) instance?.stop();
  else instance?.start();
  document.documentElement.style.overflow = on ? "hidden" : "";
};
