import * as Accordion from "@radix-ui/react-accordion";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Stagger, StaggerItem } from "@/components/motion/Reveal";

export interface FaqItem {
  q: string;
  a: string;
}

export const Faq = ({ items, className }: { items: FaqItem[]; className?: string }) => (
  <Accordion.Root type="single" collapsible className={cn("border-t border-white/[0.08]", className)}>
    <Stagger gap={0.05}>
      {items.map((item, i) => (
        <StaggerItem key={item.q} y={14}>
          <Accordion.Item value={`q-${i}`} className="group border-b border-white/[0.08]">
            <Accordion.Header>
              <Accordion.Trigger className="flex w-full items-center gap-6 py-6 text-left">
                <span className="font-mono text-[11px] tracking-[0.2em] text-mute">{String(i + 1).padStart(2, "0")}</span>
                <span className="flex-1 text-[17px] text-bone/90 transition-colors duration-300 group-hover:text-bone sm:text-[19px]">
                  {item.q}
                </span>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 text-bone/70 transition-all duration-500 ease-out-expo group-hover:border-white/25 group-data-[state=open]:rotate-45 group-data-[state=open]:border-beam/50 group-data-[state=open]:text-beam">
                  <Plus className="h-4 w-4" />
                </span>
              </Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
              <p className="max-w-3xl pb-7 pl-[3.35rem] pr-12 text-[15.5px] leading-relaxed text-mute">{item.a}</p>
            </Accordion.Content>
          </Accordion.Item>
        </StaggerItem>
      ))}
    </Stagger>
  </Accordion.Root>
);
