import { Check } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { INCLUDED, RDP_FROM, VPS_FROM, type Family, type Kind } from "@/lib/plans";
import { PRICING_FAQ } from "@/lib/faq";
import { GENERAL_MESSAGE, whatsappLink } from "@/lib/site";
import { usePageMeta } from "@/hooks/usePageMeta";
import { PageHero } from "@/components/site/PageHero";
import { SectionIntro } from "@/components/site/SectionIntro";
import { TierCards } from "@/components/site/TierCards";
import { Faq } from "@/components/site/Faq";
import { CTABand } from "@/components/site/CTABand";
import { Action } from "@/components/site/Action";
import { PlanExplorer } from "@/components/pricing/PlanExplorer";
import { Stagger, StaggerItem } from "@/components/motion/Reveal";
import { Spotlight } from "@/components/motion/Spotlight";

const Pricing = () => {
  usePageMeta(
    "Pricing",
    `Every Beam Server plan and price. Linux VPS from $${VPS_FROM} and Windows RDP from $${RDP_FROM} a month, billed monthly with no contract.`,
  );
  const [params, setParams] = useSearchParams();
  const family: Family = params.get("family") === "dedicated" ? "dedicated" : "shared";
  const kind: Kind = params.get("kind") === "rdp" ? "rdp" : "vps";

  const update = (key: string, value: string, fallback: string) => {
    const next = new URLSearchParams(params);
    if (value === fallback) next.delete(key);
    else next.set(key, value);
    setParams(next, { replace: true, preventScrollReset: true });
  };

  return (
    <>
      <PageHero
        eyebrow="Pricing"
        title={"Every plan.\n*Every price.*"}
        description={`Linux VPS from $${VPS_FROM} and Windows RDP from $${RDP_FROM} a month. Billed monthly, no contract, nothing hidden. Tap order on any row and WhatsApp opens with the plan filled in.`}
      />

      <section className="relative pb-24 sm:pb-32">
        <div className="shell">
          <PlanExplorer
            family={family}
            kind={kind}
            onFamily={(f) => update("family", f, "shared")}
            onKind={(k) => update("kind", k, "vps")}
          />
        </div>
      </section>

      <section className="relative py-20 sm:py-28">
        <div className="shell">
          <SectionIntro
            eyebrow="Every plan includes"
            title={"The same promises\n*at every price.*"}
            description="The cheapest server gets the same SLA, the same network and the same people as the biggest one."
          />
          <Stagger className="mt-14 grid gap-px overflow-hidden rounded-[1.6rem] border border-white/[0.08] bg-white/[0.08] sm:grid-cols-2 lg:grid-cols-3">
            {INCLUDED.map((item) => (
              <StaggerItem key={item.title} className="h-full">
                <Spotlight className="flex h-full gap-4 bg-ink-2 p-7">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-beam/30 text-beam">
                    <Check className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-[17px] text-bone">{item.title}</p>
                    <p className="mt-1 text-[14.5px] leading-relaxed text-mute">{item.text}</p>
                  </div>
                </Spotlight>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <section id="compare" className="relative scroll-mt-24 py-20 sm:py-28">
        <div className="shell">
          <SectionIntro
            eyebrow="Starter, Pro, Enterprise"
            title={"Not sure where\n*to start?*"}
            description="Most people land on one of these three Cloud Compute plans. The extras stack up as you go."
          />
          <TierCards className="mt-14 sm:mt-20" />
        </div>
      </section>

      <section className="relative py-20 sm:py-28">
        <div className="shell grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SectionIntro
              layout="stack"
              eyebrow="Billing questions"
              title={"Before you\n*order.*"}
              description="The short answers. Anything else, just ask."
            />
            <div className="mt-8">
              <Action href={whatsappLink(GENERAL_MESSAGE)} variant="secondary" icon="external">
                Ask on WhatsApp
              </Action>
            </div>
          </div>
          <div className="lg:col-span-8">
            <Faq items={PRICING_FAQ} />
          </div>
        </div>
      </section>

      <CTABand
        eyebrow="Need something custom?"
        title={"Bigger fleet?\n*Let's talk numbers.*"}
        description="Several servers, a cluster or a custom Windows build. Send us the shape of the workload and we will come back with a quote."
        primaryLabel="Request a quote"
        primaryTo="/contact"
      />
    </>
  );
};

export default Pricing;
