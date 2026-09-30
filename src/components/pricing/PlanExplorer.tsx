import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { EASE_OUT } from "@/lib/motion";
import {
  CATEGORIES,
  FAMILY_LABEL,
  FAMILY_NOTE,
  kindLabel,
  orderMessage,
  type Category,
  type Family,
  type Kind,
  type Plan,
} from "@/lib/plans";
import { whatsappLink } from "@/lib/site";
import { Segmented } from "@/components/site/Segmented";

const Price = ({ value, kind }: { value: number | null; kind: Kind }) => (
  <span className="relative inline-flex h-8 min-w-[5.5rem] items-center justify-end overflow-hidden">
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.span
        key={`${kind}-${value}`}
        initial={{ y: "110%", opacity: 0 }}
        animate={{ y: "0%", opacity: 1 }}
        exit={{ y: "-110%", opacity: 0 }}
        transition={{ duration: 0.45, ease: EASE_OUT }}
        className="inline-flex items-baseline gap-1"
      >
        {value === null ? (
          <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-mute">Needs 8 GB+</span>
        ) : (
          <>
            <span className="display text-[1.6rem] font-semibold leading-none tracking-[-0.04em] text-bone">${value}</span>
            <span className="text-[13px] text-mute">/mo</span>
          </>
        )}
      </motion.span>
    </AnimatePresence>
  </span>
);

const OrderButton = ({ plan, kind, price }: { plan: Plan; kind: Kind; price: number | null }) =>
  price === null ? (
    <span className="inline-flex h-9 items-center rounded-full border border-dashed border-white/10 px-4 text-[13px] text-mute">
      Linux only
    </span>
  ) : (
    <a
      href={whatsappLink(orderMessage(plan, kind))}
      target="_blank"
      rel="noopener noreferrer"
      className="group/order inline-flex h-9 items-center gap-1.5 rounded-full border border-white/[0.14] px-4 text-[13px] font-medium text-bone transition-all duration-300 hover:border-bone hover:bg-bone hover:text-ink"
      aria-label={`Order ${plan.code} as ${kindLabel(kind)} for $${price} a month on WhatsApp`}
    >
      Order
      <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover/order:-translate-y-0.5 group-hover/order:translate-x-0.5" />
    </a>
  );

const CategoryBlock = ({ c, kind, index }: { c: Category; kind: Kind; index: number }) => (
  <motion.section
    id={c.id}
    className="scroll-mt-40"
    initial={{ opacity: 0, y: 24 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.7, ease: EASE_OUT, delay: index * 0.08 }}
  >
    <div className="flex flex-col gap-3 border-b border-white/[0.08] pb-6 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="font-mono text-[11px] tracking-[0.2em] text-mute">0{index + 1}</p>
        <h3 className="display mt-2 text-[2.2rem] font-semibold leading-none tracking-[-0.045em] text-bone">{c.name}</h3>
        <p className="mt-2 text-[14px] text-beam/90">{c.tagline}</p>
      </div>
      <p className="max-w-md text-[14.5px] leading-relaxed text-mute md:text-right">{c.description}</p>
    </div>

    <div className="hidden md:block">
      <table className="w-full border-separate border-spacing-0 text-left">
        <thead>
          <tr className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-mute">
            <th className="py-4 pr-4 font-normal">Plan</th>
            <th className="py-4 pr-4 font-normal">vCPU</th>
            <th className="py-4 pr-4 font-normal">Memory</th>
            <th className="py-4 pr-4 font-normal">Storage</th>
            <th className="py-4 pr-4 font-normal">Transfer</th>
            <th className="py-4 pr-4 text-right font-normal">{kindLabel(kind)}</th>
            <th className="py-4 text-right font-normal">
              <span className="sr-only">Order</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {c.plans.map((p) => {
            const price = kind === "vps" ? p.vps : p.rdp;
            return (
              <tr
                key={p.code}
                className={cn(
                  "group/row text-[15px] transition-colors duration-300 [&>td]:border-t [&>td]:border-white/[0.06] hover:bg-white/[0.025]",
                  price === null && "opacity-55",
                )}
              >
                <td className="rounded-l-xl py-4 pl-3 pr-4 font-mono text-[13px] text-bone">
                  {kind === "rdp" && price !== null ? <span className="text-beam">rdp-</span> : null}
                  {p.code}
                </td>
                <td className="py-4 pr-4 text-bone/85">{p.vcpu}</td>
                <td className="py-4 pr-4 text-bone/85">{p.ram} GB</td>
                <td className="py-4 pr-4 text-bone/85">
                  {p.storage} GB <span className="text-mute">{p.disk}</span>
                </td>
                <td className="py-4 pr-4 text-bone/85">{p.transfer} TB</td>
                <td className="py-4 pr-4 text-right">
                  <Price value={price} kind={kind} />
                </td>
                <td className="rounded-r-xl py-4 pr-3 text-right">
                  <OrderButton plan={p} kind={kind} price={price} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>

    <div className="mt-5 grid gap-3 sm:grid-cols-2 md:hidden">
      {c.plans.map((p) => {
        const price = kind === "vps" ? p.vps : p.rdp;
        return (
          <div
            key={p.code}
            className={cn("rounded-2xl border border-white/[0.08] bg-ink-2 p-5", price === null && "opacity-60")}
          >
            <div className="flex items-start justify-between gap-3">
              <p className="font-mono text-[12.5px] text-bone">
                {kind === "rdp" && price !== null ? "rdp-" : ""}
                {p.code}
              </p>
              <Price value={price} kind={kind} />
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-[13.5px]">
              {[
                ["vCPU", `${p.vcpu}`],
                ["Memory", `${p.ram} GB`],
                ["Storage", `${p.storage} GB ${p.disk}`],
                ["Transfer", `${p.transfer} TB`],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-mute">{k}</dt>
                  <dd className="mt-0.5 text-bone/85">{v}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-5">
              <OrderButton plan={p} kind={kind} price={price} />
            </div>
          </div>
        );
      })}
    </div>
  </motion.section>
);

interface PlanExplorerProps {
  family: Family;
  kind: Kind;
  onFamily: (f: Family) => void;
  onKind: (k: Kind) => void;
}

export const PlanExplorer = ({ family, kind, onFamily, onKind }: PlanExplorerProps) => {
  const cats = CATEGORIES.filter((c) => c.family === family);
  return (
    <div>
      <div className="relative z-30">
        <div className="flex flex-col items-start justify-between gap-3 rounded-[1.4rem] border border-white/[0.08] bg-ink/80 p-2 backdrop-blur-xl sm:flex-row sm:items-center sm:rounded-full">
          <Segmented
            id="family"
            label="CPU type"
            value={family}
            onChange={onFamily}
            options={[
              { value: "shared", label: FAMILY_LABEL.shared },
              { value: "dedicated", label: FAMILY_LABEL.dedicated },
            ]}
          />
          <Segmented
            id="kind"
            label="Operating system"
            value={kind}
            onChange={onKind}
            options={[
              { value: "vps", label: "Linux VPS" },
              { value: "rdp", label: "Windows RDP" },
            ]}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={family}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.2 } }}
          className="mt-10"
        >
          <p className="text-[15px] text-mute">
            <span className="text-bone">{FAMILY_LABEL[family]}.</span> {FAMILY_NOTE[family]}
            {kind === "rdp" && " Windows plans need 8 GB of memory or more."}
          </p>
          <div className="mt-12 space-y-20">
            {cats.map((c, i) => (
              <CategoryBlock key={c.id} c={c} kind={kind} index={i} />
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
