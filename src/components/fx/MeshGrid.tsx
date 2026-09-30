import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { isFinePointer, prefersReducedMotion } from "@/lib/motion";

interface MeshGridProps {
  className?: string;
  spacing?: number;
  radius?: number;
  strength?: number;
}

export const MeshGrid = ({ className, spacing = 36, radius = 190, strength = 26 }: MeshGridProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduce = prefersReducedMotion();
    const fine = isFinePointer();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;
    let cols = 0;
    let rows = 0;
    let ox = 0;
    let oy = 0;
    const pointer = { x: -9999, y: -9999, tx: -9999, ty: -9999, inside: false };
    let visible = true;
    let raf = 0;
    let px: Float32Array = new Float32Array(0);
    let py: Float32Array = new Float32Array(0);
    let pf: Float32Array = new Float32Array(0);

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = Math.max(1, Math.round(w * dpr));
      canvas.height = Math.max(1, Math.round(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(w / spacing) + 2;
      rows = Math.ceil(h / spacing) + 2;
      ox = (w - (cols - 1) * spacing) / 2;
      oy = (h - (rows - 1) * spacing) / 2;
      px = new Float32Array(cols * rows);
      py = new Float32Array(cols * rows);
      pf = new Float32Array(cols * rows);
    };

    const draw = (time: number) => {
      const t = time / 1000;
      if (!pointer.inside) {
        pointer.tx = w * (0.5 + 0.32 * Math.sin(t * 0.23));
        pointer.ty = h * (0.5 + 0.28 * Math.sin(t * 0.31 + 1.3));
      }
      if (pointer.x < -9000) {
        pointer.x = pointer.tx;
        pointer.y = pointer.ty;
      }
      pointer.x += (pointer.tx - pointer.x) * 0.08;
      pointer.y += (pointer.ty - pointer.y) * 0.08;

      const sigma2 = 2 * radius * radius;
      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          const k = j * cols + i;
          const x = ox + i * spacing;
          const y = oy + j * spacing;
          const dx = x - pointer.x;
          const dy = y - pointer.y;
          const d2 = dx * dx + dy * dy;
          const f = Math.exp(-d2 / sigma2);
          const d = Math.sqrt(d2) || 1;
          const wave = Math.sin(x * 0.012 + t * 0.8) * Math.cos(y * 0.01 - t * 0.6) * 1.6;
          px[k] = x + (dx / d) * f * strength;
          py[k] = y + (dy / d) * f * strength + wave;
          pf[k] = f;
        }
      }

      ctx.clearRect(0, 0, w, h);
      ctx.lineWidth = 1;
      ctx.strokeStyle = "rgba(255,255,255,0.055)";
      ctx.beginPath();
      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          const k = j * cols + i;
          if (i === 0) ctx.moveTo(px[k], py[k]);
          else ctx.lineTo(px[k], py[k]);
        }
      }
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const k = j * cols + i;
          if (j === 0) ctx.moveTo(px[k], py[k]);
          else ctx.lineTo(px[k], py[k]);
        }
      }
      ctx.stroke();

      for (let k = 0; k < px.length; k++) {
        const f = pf[k];
        if (f < 0.04) continue;
        ctx.fillStyle = `rgba(111,227,245,${(f * 0.85).toFixed(3)})`;
        const s = 1 + f * 1.6;
        ctx.fillRect(px[k] - s / 2, py[k] - s / 2, s, s);
      }

      const g = ctx.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, radius * 1.1);
      g.addColorStop(0, "rgba(111,227,245,0.10)");
      g.addColorStop(1, "rgba(111,227,245,0)");
      ctx.fillStyle = g;
      ctx.fillRect(pointer.x - radius * 1.2, pointer.y - radius * 1.2, radius * 2.4, radius * 2.4);
    };

    const loop = (time: number) => {
      raf = requestAnimationFrame(loop);
      if (!visible || document.hidden) return;
      draw(time);
    };

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      pointer.inside = x >= 0 && y >= 0 && x <= r.width && y <= r.height;
      if (pointer.inside) {
        pointer.tx = x;
        pointer.ty = y;
      }
    };

    const ro = new ResizeObserver(() => {
      resize();
      if (reduce) draw(0);
    });
    ro.observe(canvas);
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    io.observe(canvas);
    resize();

    if (reduce) {
      draw(0);
    } else {
      if (fine) window.addEventListener("pointermove", onMove, { passive: true });
      raf = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
    };
  }, [spacing, radius, strength]);

  return <canvas ref={canvasRef} aria-hidden className={cn("block h-full w-full", className)} />;
};
