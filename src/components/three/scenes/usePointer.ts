import { useEffect, useRef } from "react";

interface PointerOptions {
  onMove?: () => void;
  enabled?: boolean;
}

export const usePointer = ({ onMove, enabled = true }: PointerOptions = {}) => {
  const pointer = useRef({ x: 0, y: 0 });
  const moveRef = useRef(onMove);
  moveRef.current = onMove;

  useEffect(() => {
    if (!enabled) {
      pointer.current.x = 0;
      pointer.current.y = 0;
      return;
    }
    const handler = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
      moveRef.current?.();
    };
    window.addEventListener("pointermove", handler, { passive: true });
    return () => window.removeEventListener("pointermove", handler);
  }, [enabled]);

  return pointer;
};
