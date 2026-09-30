import { Check, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { TIERS, tierMessage } from "@/lib/plans";
import { whatsappLink } from "@/lib/site";
import { Tilt, TiltLayer } from "@/components/motion/Tilt";
import { Stagger, StaggerItem } from "@/components/motion/Reveal";
import { Action } from "./Action";

export const TierCards = ({ className }: { className?: string }) => (
  <Stagger className={cn("grid gap-3 lg:grid-cols-3", className)} gap={0.1}>
    {TIERS.map((tier) => (
      <StaggerItem key={tier.name} className="h-full [perspective:1600px]">
        <Tilt depth perspective={false} max={7} lift={0.015} className="relative flex h-full flex-col rounded-[1.6rem] p-7 sm:p-8">
          <div
            aria-hidden
            className={cn(
              "tilt-surface pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit] border",
              tier.popular
                ? "border-beam/35 bg-[linear-gradient(180deg,hsl(var(--beam)/0.09),hsl(var(--ink-2))_45%)]"
                : "border-white/[0.08] bg-ink-2",
            )}
          >
            {tier.popular && (
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-beam to-transparent" />
            )}
          </div>
          {tier.popular && (
            <TiltLayer z={-20} className="pointer-events-none absolute inset-6 rounded-[inherit] bg-beam/[0.12] blur-3xl" />
          )}
          <TiltLayer z={0} className="flex items-center justify-between">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-mute">{tier.name}</p>
            {tier.popular && (
              <span className="rounded-full bg-beam px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.16em] text-ink">
                Most popular
              </span>
            )}
          </TiltLayer>
          <TiltLayer z={40} className="mt-6 flex items-baseline gap-1.5">
            <span className="display text-[4.2rem] font-bold leading-none tracking-[-0.06em] text-bone">
              ${tier.price}
            </span>
            <span className="text-mute">/mo</span>
          </TiltLayer>
          <TiltLayer z={24}>
            <p className="mt-3 min-h-[3rem] text-[15px] leading-relaxed text-mute">{tier.blurb}</p>

            <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-white/[0.07] bg-white/[0.07]">
              {tier.specs.map((s) => (
                <div key={s.label} className="bg-ink-2/95 px-4 py-3">
                  <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-mute">{s.label}</dt>
                  <dd className="mt-1 text-[15px] text-bone">{s.value}</dd>
                </div>
              ))}
            </dl>
          </TiltLayer>

          <TiltLayer z={12}>
            <ul className="mt-6 space-y-2.5 text-[14px]">
              {tier.features.map((f) => (
                <li key={f.label} className="flex items-center gap-3">
                  {f.value === false ? (
                    <Minus className="h-4 w-4 shrink-0 text-mute/50" aria-label="Not included" />
                  ) : (
                    <Check className="h-4 w-4 shrink-0 text-beam" aria-label="Included" />
                  )}
                  <span className={f.value === false ? "text-mute/60" : "text-bone/85"}>
                    {f.label}
                    {typeof f.value === "string" && <span className="text-mute">: {f.value}</span>}
                  </span>
                </li>
              ))}
            </ul>
          </TiltLayer>

          <TiltLayer z={30} className="mt-auto pt-8">
            <Action
              href={whatsappLink(tierMessage(tier))}
              variant={tier.popular ? "primary" : "secondary"}
              icon="external"
              className="w-full"
            >
              Order {tier.name}
            </Action>
            <p className="mt-3 text-center font-mono text-[10.5px] uppercase tracking-[0.16em] text-mute">
              Plan code {tier.code}
            </p>
          </TiltLayer>
        </Tilt>
      </StaggerItem>
    ))}
  </Stagger>
);
