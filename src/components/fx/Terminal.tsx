import { useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export interface TermLine {
  kind: "cmd" | "out" | "ok" | "dim";
  text: string;
}

interface TerminalProps {
  lines: TermLine[];
  title?: string;
  prompt?: string;
  className?: string;
  speed?: number;
  startDelay?: number;
  badge?: string;
}

const lineClass: Record<TermLine["kind"], string> = {
  cmd: "text-bone",
  out: "text-bone/70",
  ok: "text-signal",
  dim: "text-mute",
};

export const Terminal = ({
  lines,
  title = "root@beam-fra-01",
  prompt = "root@beam-fra-01:~#",
  className,
  speed = 34,
  startDelay = 500,
  badge = "SSH",
}: TerminalProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -15% 0px" });
  const reduce = useReducedMotion();
  const [count, setCount] = useState(0);
  const [typed, setTyped] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      setCount(lines.length);
      setDone(true);
      return;
    }
    let cancelled = false;
    const timers: number[] = [];
    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        timers.push(window.setTimeout(resolve, ms));
      });

    const run = async () => {
      await wait(startDelay);
      for (let i = 0; i < lines.length; i++) {
        if (cancelled) return;
        const line = lines[i];
        if (line.kind === "cmd") {
          for (let c = 1; c <= line.text.length; c++) {
            if (cancelled) return;
            setTyped(line.text.slice(0, c));
            await wait(speed + Math.random() * speed * 0.9);
          }
          await wait(260);
          setTyped("");
          setCount(i + 1);
          await wait(180);
        } else {
          setCount(i + 1);
          await wait(110);
        }
      }
      setDone(true);
    };
    run();
    return () => {
      cancelled = true;
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, [inView, reduce, lines, speed, startDelay]);

  const typingIndex = count < lines.length && lines[count]?.kind === "cmd" ? count : -1;

  return (
    <div
      ref={ref}
      className={cn(
        "overflow-hidden rounded-2xl border border-white/[0.08] bg-[#07080a]/95 shadow-lift backdrop-blur-xl",
        className,
      )}
    >
      <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span className="h-2 w-2 rounded-full bg-signal shadow-[0_0_10px_hsl(var(--signal))]" />
          <span className="font-mono text-[11px] tracking-[0.08em] text-bone/75">{title}</span>
        </div>
        <span className="rounded-md border border-white/10 px-1.5 py-0.5 font-mono text-[10px] tracking-[0.14em] text-mute">
          {badge}
        </span>
      </div>
      <div className="min-h-[18.5rem] px-4 py-4 font-mono text-[12.5px] leading-[1.75] sm:px-5 sm:text-[13px]">
        {lines.slice(0, count).map((line, i) => (
          <div key={i} className={cn("whitespace-pre-wrap break-words", lineClass[line.kind])}>
            {line.kind === "cmd" ? (
              <>
                <span className="text-beam">{prompt}</span> {line.text}
              </>
            ) : (
              line.text
            )}
          </div>
        ))}
        {(typingIndex >= 0 || done || count === 0) && (
          <div className="whitespace-pre-wrap break-words text-bone">
            <span className="text-beam">{prompt}</span> {typingIndex >= 0 ? typed : ""}
            <span className="ml-0.5 inline-block h-[1.05em] w-[0.55em] translate-y-[0.18em] animate-blink bg-beam/90" />
          </div>
        )}
      </div>
    </div>
  );
};
