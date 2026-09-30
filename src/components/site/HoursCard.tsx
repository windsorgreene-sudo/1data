import { cn } from "@/lib/utils";
import { HOURS } from "@/lib/site";
import { useSupportClock } from "@/hooks/useSupportClock";

export const HoursCard = ({ className }: { className?: string }) => {
  const clock = useSupportClock();
  return (
    <div className={cn("panel p-6", className)}>
      <div className="flex items-center justify-between">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-mute">Business hours</p>
        <span className="inline-flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.16em] text-mute">
          <span className={cn("h-1.5 w-1.5 rounded-full", clock.open ? "bg-signal" : "bg-ember")} />
          {clock.open ? "Open" : "Closed"} · {clock.time} {clock.zone}
        </span>
      </div>
      <dl className="mt-5 divide-y divide-white/[0.06]">
        {HOURS.map((h) => (
          <div key={h.days} className="flex items-center justify-between py-3 text-[15px]">
            <dt className="text-bone/80">{h.days}</dt>
            <dd className={cn("font-mono text-[13px]", h.time === "Closed" ? "text-mute" : "text-bone")}>{h.time}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-4 text-[13.5px] leading-relaxed text-mute">
        Pacific Time. Technical problems can be raised through portal tickets 24/7.
      </p>
    </div>
  );
};
