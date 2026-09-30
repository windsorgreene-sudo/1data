import { motion, useInView } from "framer-motion";
import { Suspense, useCallback, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { EASE_OUT } from "@/lib/motion";
import { useSceneQuality, type SceneQuality } from "@/lib/quality";
import { SceneBoundary } from "./SceneBoundary";

export interface SceneContext {
  quality: SceneQuality;
  onReady: () => void;
  onFail: () => void;
}

interface SceneMountProps {
  fallback: ReactNode;
  className?: string;
  margin?: string;
  immediate?: boolean;
  disabled?: boolean;
  children: (ctx: SceneContext) => ReactNode;
}

export const SceneMount = ({
  fallback,
  className,
  margin = "300px 0px 300px 0px",
  immediate = false,
  disabled = false,
  children,
}: SceneMountProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const quality = useSceneQuality();
  const inView = useInView(ref, { once: true, margin: margin as `${number}px` });
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const warned = useRef(false);

  const onReady = useCallback(() => setReady(true), []);
  const onFail = useCallback(() => {
    if (!warned.current) {
      warned.current = true;
      console.warn("[scene] context lost");
    }
    setFailed(true);
  }, []);
  const onError = useCallback(() => setFailed(true), []);

  const mount = (immediate || inView) && !disabled && quality.webgl && !failed;
  const shown = mount && ready;

  return (
    <div ref={ref} className={cn("relative", className)}>
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        initial={false}
        animate={{ opacity: shown ? 0 : 1 }}
        transition={{ duration: 0.7, ease: EASE_OUT }}
      >
        {fallback}
      </motion.div>
      {mount && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: ready ? 1 : 0 }}
          transition={{ duration: 0.7, ease: EASE_OUT }}
        >
          <SceneBoundary fallback={null} onError={onError}>
            <Suspense fallback={null}>{children({ quality, onReady, onFail })}</Suspense>
          </SceneBoundary>
        </motion.div>
      )}
    </div>
  );
};
