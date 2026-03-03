import { useEffect, useState, useRef, useCallback } from "react";
import BeamLogo from "@/components/BeamLogo";

const LoadingScreen = ({ onComplete }: { onComplete: () => void }) => {
  const [phase, setPhase] = useState<"init" | "logo" | "text" | "bar" | "done" | "exit">("init");
  const [progress, setProgress] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const progressRef = useRef(0);

  useEffect(() => {
    const t0 = setTimeout(() => setPhase("logo"), 120);
    const t1 = setTimeout(() => setPhase("text"), 680);
    const t2 = setTimeout(() => setPhase("bar"), 1100);
    const t3 = setTimeout(() => setPhase("done"), 3200);
    const t4 = setTimeout(() => setPhase("exit"), 3600);
    const t5 = setTimeout(() => onComplete(), 4400);
    return () => [t0, t1, t2, t3, t4, t5].forEach(clearTimeout);
  }, [onComplete]);

  useEffect(() => {
    if (phase === "bar") {
      const iv = setInterval(() => {
        progressRef.current = Math.min(progressRef.current + Math.random() * 4.5 + 1.5, 100);
        setProgress(Math.round(progressRef.current));
        if (progressRef.current >= 100) clearInterval(iv);
      }, 75);
      return () => clearInterval(iv);
    }
  }, [phase]);

  // Canvas: particles + grid beams + data streams
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = canvas.width = window.innerWidth;
    let H = canvas.height = window.innerHeight;

    const onResize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize);

    // Particles
    const pts = Array.from({ length: 55 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 1.5 + 0.3,
      c: Math.random() > 0.55 ? "#00e5ff" : Math.random() > 0.5 ? "#7c3aed" : "#c026d3",
      a: Math.random() * 0.45 + 0.08,
    }));

    // Horizontal scan beams
    const hBeams = Array.from({ length: 10 }, (_, i) => ({
      y: (H / 10) * i,
      speed: 0.12 + Math.random() * 0.22,
      a: 0.02 + Math.random() * 0.055,
      c: i % 3 === 0 ? "#00e5ff" : i % 3 === 1 ? "#7c3aed" : "#c026d3",
      w: 0.6 + Math.random() * 0.8,
    }));

    // Vertical scan beams
    const vBeams = Array.from({ length: 7 }, (_, i) => ({
      x: (W / 7) * i,
      speed: 0.08 + Math.random() * 0.18,
      a: 0.015 + Math.random() * 0.04,
      c: i % 2 === 0 ? "#00e5ff" : "#7c3aed",
    }));

    // Falling data streams (matrix style - vertical)
    const streams = Array.from({ length: 14 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H - H,
      speed: 0.4 + Math.random() * 0.9,
      len: 40 + Math.random() * 80,
      a: 0.025 + Math.random() * 0.04,
      c: Math.random() > 0.5 ? "#00e5ff" : "#7c3aed",
    }));

    const hex = (n: number) => Math.round(Math.max(0, Math.min(255, n * 255))).toString(16).padStart(2, "0");

    const draw = () => {
      ctx.clearRect(0, 0, W, H);

      // H beams
      hBeams.forEach(b => {
        b.y = (b.y + b.speed) % H;
        const g = ctx.createLinearGradient(0, b.y, W, b.y);
        g.addColorStop(0, "transparent");
        g.addColorStop(0.25, b.c + hex(b.a));
        g.addColorStop(0.75, b.c + hex(b.a));
        g.addColorStop(1, "transparent");
        ctx.beginPath();
        ctx.strokeStyle = g;
        ctx.lineWidth = b.w;
        ctx.moveTo(0, b.y);
        ctx.lineTo(W, b.y);
        ctx.stroke();
      });

      // V beams
      vBeams.forEach(vb => {
        vb.x = (vb.x + vb.speed) % W;
        const g = ctx.createLinearGradient(vb.x, 0, vb.x, H);
        g.addColorStop(0, "transparent");
        g.addColorStop(0.3, vb.c + hex(vb.a));
        g.addColorStop(0.7, vb.c + hex(vb.a));
        g.addColorStop(1, "transparent");
        ctx.beginPath();
        ctx.strokeStyle = g;
        ctx.lineWidth = 0.7;
        ctx.moveTo(vb.x, 0);
        ctx.lineTo(vb.x, H);
        ctx.stroke();
      });

      // Data streams
      streams.forEach(s => {
        s.y += s.speed;
        if (s.y - s.len > H) { s.y = -s.len; s.x = Math.random() * W; }
        const g = ctx.createLinearGradient(s.x, s.y - s.len, s.x, s.y);
        g.addColorStop(0, "transparent");
        g.addColorStop(0.6, s.c + hex(s.a * 0.5));
        g.addColorStop(1, s.c + hex(s.a));
        ctx.beginPath();
        ctx.strokeStyle = g;
        ctx.lineWidth = 1;
        ctx.moveTo(s.x, s.y - s.len);
        ctx.lineTo(s.x, s.y);
        ctx.stroke();
        // tip dot
        ctx.beginPath();
        ctx.arc(s.x, s.y, 1.2, 0, Math.PI * 2);
        ctx.fillStyle = s.c + "cc";
        ctx.fill();
      });

      // Particles + connections
      pts.forEach(p => {
        p.x = (p.x + p.vx + W) % W;
        p.y = (p.y + p.vy + H) % H;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.c + hex(p.a);
        ctx.fill();
      });

      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x;
          const dy = pts[i].y - pts[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 110) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(0,229,255,${(1 - d / 110) * 0.1})`;
            ctx.lineWidth = 0.4;
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.stroke();
          }
        }
      }

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const logoVisible = phase !== "init";
  const textVisible = ["text", "bar", "done", "exit"].includes(phase);
  const barVisible = ["bar", "done", "exit"].includes(phase);
  const exiting = phase === "exit";
  const done = phase === "done" || phase === "exit";

  const statusTexts = [
    "Initializing core systems...",
    "Connecting edge nodes...",
    "Establishing secure tunnel...",
    "Syncing global infrastructure...",
    "Experience ready.",
  ];
  const statusIdx = Math.min(Math.floor(progress / 22), statusTexts.length - 1);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        background: "#05060f",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        transition: "opacity 0.8s cubic-bezier(0.4,0,0.2,1)",
        opacity: exiting ? 0 : 1,
        pointerEvents: exiting ? "none" : "all",
        userSelect: "none",
      }}
    >
      {/* Canvas background */}
      <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, pointerEvents: "none" }} />

      {/* Deep center radial glow */}
      <div style={{
        position: "absolute",
        top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        width: 900, height: 600,
        background: "radial-gradient(ellipse at center, rgba(0,229,255,0.07) 0%, rgba(124,58,237,0.04) 40%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* Vignette */}
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)",
        pointerEvents: "none",
      }} />

      {/* === CORNER BRACKETS === */}
      {([
        { t: 20, l: 20, r: 0 },
        { t: 20, r: 20, ro: 90 },
        { b: 20, r: 20, ro: 180 },
        { b: 20, l: 20, ro: 270 },
      ] as any[]).map((pos, i) => (
        <svg key={i} width="36" height="36" viewBox="0 0 36 36" fill="none"
          style={{
            position: "absolute",
            top: pos.t, left: pos.l, right: pos.r, bottom: pos.b,
            transform: `rotate(${pos.ro || 0}deg)`,
            opacity: barVisible ? 0.7 : 0,
            transition: `opacity 0.6s ease ${i * 0.08}s`,
          }}
        >
          <path d="M2 18 L2 3 L18 3" stroke="#00e5ff" strokeWidth="1.5" strokeLinecap="round" opacity="0.8">
            <animate attributeName="opacity" values="0.8;1;0.8" dur="2.5s" begin={`${i * 0.6}s`} repeatCount="indefinite" />
          </path>
          <circle cx="2" cy="3" r="2.2" fill="#00e5ff">
            <animate attributeName="r" values="2.2;3;2.2" dur="2.5s" begin={`${i * 0.6}s`} repeatCount="indefinite" />
          </circle>
        </svg>
      ))}

      {/* === SIDE TICK MARKS === */}
      {barVisible && (
        <>
          <div style={{
            position: "absolute", left: 20, top: "50%", transform: "translateY(-50%)",
            display: "flex", flexDirection: "column", gap: 8, opacity: 0.3,
            transition: "opacity 0.5s ease",
          }}>
            {[12, 6, 4, 6, 12].map((w, i) => (
              <div key={i} style={{
                width: w, height: 1,
                background: "linear-gradient(90deg, #00e5ff, transparent)",
              }} />
            ))}
          </div>
          <div style={{
            position: "absolute", right: 20, top: "50%", transform: "translateY(-50%)",
            display: "flex", flexDirection: "column", gap: 8, opacity: 0.3,
            transition: "opacity 0.5s ease",
          }}>
            {[12, 6, 4, 6, 12].map((w, i) => (
              <div key={i} style={{
                width: w, height: 1,
                background: "linear-gradient(270deg, #c026d3, transparent)",
              }} />
            ))}
          </div>
        </>
      )}

      {/* === MAIN CONTENT === */}
      <div style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 48,
      }}>

        {/* Logo + Brand row */}
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>

          {/* Logo */}
          <div style={{
            transition: "opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.8s cubic-bezier(0.16,1,0.3,1)",
            opacity: logoVisible ? 1 : 0,
            transform: logoVisible ? "scale(1) rotate(0deg)" : "scale(0.1) rotate(-30deg)",
            filter: [
              "drop-shadow(0 0 16px rgba(0,229,255,0.9))",
              "drop-shadow(0 0 40px rgba(124,58,237,0.55))",
              "drop-shadow(0 0 80px rgba(0,229,255,0.18))",
            ].join(" "),
          }}>
            <BeamLogo size={80} />
          </div>

          {/* Brand text */}
          <div style={{
            display: "flex", flexDirection: "column", gap: 6,
            opacity: textVisible ? 1 : 0,
            transform: textVisible ? "translateX(0)" : "translateX(-30px)",
            transition: "opacity 0.6s ease 0.05s, transform 0.65s cubic-bezier(0.16,1,0.3,1) 0.05s",
          }}>
            {/* BEAM SERVER */}
            <div style={{ display: "flex", alignItems: "baseline", gap: 0, lineHeight: 1 }}>
              <span style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 900,
                fontSize: "3.4rem",
                letterSpacing: "-0.04em",
                background: "linear-gradient(135deg, #ffffff 0%, #d1d5db 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>BEAM</span>
              <span style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 900,
                fontSize: "3.4rem",
                letterSpacing: "-0.04em",
                background: "linear-gradient(135deg, #00e5ff 0%, #7c3aed 55%, #c026d3 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                textShadow: "none",
                filter: "drop-shadow(0 0 20px rgba(0,229,255,0.4))",
              }}>SERVER</span>
            </div>

            {/* Tagline with animated dots */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 20, height: 1, background: "linear-gradient(90deg, transparent, rgba(0,229,255,0.5))" }} />
              <span style={{
                fontFamily: "'Instrument Sans', sans-serif",
                fontSize: "0.6rem",
                fontWeight: 600,
                letterSpacing: "0.38em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.22)",
              }}>Cloud Infrastructure</span>
              <div style={{ width: 20, height: 1, background: "linear-gradient(270deg, transparent, rgba(124,58,237,0.5))" }} />
            </div>
          </div>
        </div>

        {/* === PROGRESS SECTION === */}
        <div style={{
          width: 420,
          display: "flex",
          flexDirection: "column",
          gap: 14,
          opacity: barVisible ? 1 : 0,
          transform: barVisible ? "translateY(0)" : "translateY(16px)",
          transition: "opacity 0.55s ease, transform 0.55s cubic-bezier(0.16,1,0.3,1)",
        }}>

          {/* Status + percentage row */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {/* Status dot */}
              <div style={{
                width: 5, height: 5, borderRadius: "50%",
                background: done ? "#22c55e" : "#00e5ff",
                boxShadow: `0 0 8px ${done ? "#22c55e" : "#00e5ff"}`,
                transition: "background 0.4s ease, box-shadow 0.4s ease",
                animation: done ? "none" : "pulse-dot 1.2s ease-in-out infinite",
              }} />
              <span style={{
                fontFamily: "'Instrument Sans', sans-serif",
                fontSize: "0.72rem",
                color: done ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.3)",
                letterSpacing: "0.05em",
                transition: "color 0.4s ease",
              }}>
                {statusTexts[statusIdx]}
              </span>
            </div>
            <span style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "0.82rem",
              fontWeight: 700,
              background: progress >= 100
                ? "linear-gradient(135deg, #22c55e, #16a34a)"
                : "linear-gradient(135deg, #00e5ff, #7c3aed)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              filter: `drop-shadow(0 0 8px ${progress >= 100 ? "rgba(34,197,94,0.8)" : "rgba(0,229,255,0.8)"})`,
              letterSpacing: "0.02em",
              transition: "filter 0.4s ease",
              minWidth: 38,
              textAlign: "right",
            }}>
              {progress}%
            </span>
          </div>

          {/* Progress bar track */}
          <div style={{
            position: "relative",
            width: "100%",
            height: 3,
            borderRadius: 999,
            background: "rgba(255,255,255,0.05)",
            overflow: "visible",
          }}>
            {/* Track border glow */}
            <div style={{
              position: "absolute", inset: "-1px",
              borderRadius: 999,
              background: "transparent",
              boxShadow: "0 0 0 0.5px rgba(255,255,255,0.08)",
            }} />

            {/* Fill */}
            <div style={{
              position: "absolute",
              left: 0, top: 0,
              height: "100%",
              borderRadius: 999,
              width: `${progress}%`,
              background: progress >= 100
                ? "linear-gradient(90deg, #22c55e, #16a34a)"
                : "linear-gradient(90deg, #00e5ff 0%, #7c3aed 60%, #c026d3 100%)",
              boxShadow: progress >= 100
                ? "0 0 12px rgba(34,197,94,0.9), 0 0 24px rgba(34,197,94,0.4)"
                : "0 0 10px rgba(0,229,255,1), 0 0 22px rgba(0,229,255,0.5), 0 0 40px rgba(124,58,237,0.3)",
              transition: "width 0.07s linear, background 0.5s ease, box-shadow 0.5s ease",
            }}>
              {/* Moving glow tip */}
              {progress > 1 && progress < 100 && (
                <div style={{
                  position: "absolute",
                  right: -1, top: "50%",
                  transform: "translateY(-50%)",
                  width: 8, height: 8,
                  borderRadius: "50%",
                  background: "#00e5ff",
                  boxShadow: "0 0 0 2px rgba(0,229,255,0.3), 0 0 16px #00e5ff, 0 0 30px rgba(0,229,255,0.6)",
                }} />
              )}
            </div>

            {/* Shimmer sweep on track */}
            <div style={{
              position: "absolute", inset: 0, borderRadius: 999,
              background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.06) 50%, transparent 100%)",
              backgroundSize: "200% 100%",
              animation: "barShimmer 2.5s linear infinite",
              pointerEvents: "none",
            }} />
          </div>

          {/* Milestone markers */}
          <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 2 }}>
            {[0, 25, 50, 75, 100].map(step => {
              const active = progress >= step;
              return (
                <div key={step} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                  <div style={{
                    width: active ? 7 : 4,
                    height: active ? 7 : 4,
                    borderRadius: "50%",
                    background: active
                      ? progress >= 100 ? "#22c55e" : "linear-gradient(135deg, #00e5ff, #7c3aed)"
                      : "rgba(255,255,255,0.1)",
                    boxShadow: active ? `0 0 ${active ? 10 : 0}px rgba(0,229,255,0.9)` : "none",
                    transition: "all 0.35s cubic-bezier(0.16,1,0.3,1)",
                  }} />
                  <span style={{
                    fontFamily: "'Instrument Sans', sans-serif",
                    fontSize: "0.55rem",
                    color: active ? "rgba(0,229,255,0.5)" : "rgba(255,255,255,0.12)",
                    letterSpacing: "0.04em",
                    transition: "color 0.3s ease",
                  }}>{step}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* === BOTTOM SCAN LINE === */}
      <div style={{
        position: "absolute",
        bottom: 0, left: 0, right: 0,
        height: 2,
        background: `linear-gradient(90deg, transparent 0%, #00e5ff ${Math.min(progress * 0.6, 50)}%, #7c3aed ${Math.min(progress * 0.85, 75)}%, transparent ${Math.min(progress, 100)}%)`,
        opacity: barVisible ? 0.8 : 0,
        transition: "opacity 0.4s ease",
        boxShadow: "0 0 8px rgba(0,229,255,0.6)",
      }} />

      {/* === BOTTOM FOOTER === */}
      <div style={{
        position: "absolute",
        bottom: 28,
        display: "flex",
        alignItems: "center",
        gap: 24,
        opacity: barVisible ? 0.35 : 0,
        transition: "opacity 0.6s ease 0.3s",
      }}>
        {["99.9% Uptime", "Global CDN", "Global Locations", "Zero Latency"].map((label, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {i > 0 && <div style={{ width: 1, height: 9, background: "rgba(255,255,255,0.12)" }} />}
            <span style={{
              fontFamily: "'Instrument Sans', sans-serif",
              fontSize: "0.58rem",
              color: "rgba(255,255,255,0.3)",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}>{label}</span>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes pulse-dot {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.6); opacity: 0.5; }
        }
        @keyframes barShimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;
