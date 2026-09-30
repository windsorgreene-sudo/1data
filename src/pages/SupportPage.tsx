import { Mail, MessageCircle, Ticket } from "lucide-react";
import { cn } from "@/lib/utils";
import { GENERAL_MESSAGE, SITE, mailLink, whatsappLink } from "@/lib/site";
import { SUPPORT_FAQ } from "@/lib/faq";
import { useAuth } from "@/hooks/useAuth";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useSupportClock } from "@/hooks/useSupportClock";
import { PageHero } from "@/components/site/PageHero";
import { HoursCard } from "@/components/site/HoursCard";
import { SectionIntro } from "@/components/site/SectionIntro";
import { Faq } from "@/components/site/Faq";
import { Action } from "@/components/site/Action";
import { CTABand } from "@/components/site/CTABand";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { Spotlight } from "@/components/motion/Spotlight";

const SupportPage = () => {
  usePageMeta(
    "Support and FAQ",
    "Get help from Beam Server on WhatsApp, by email or through 24/7 portal tickets, plus answers to the questions we hear most.",
  );
  const { user } = useAuth();
  const clock = useSupportClock();

  const channels = [
    {
      icon: MessageCircle,
      name: "WhatsApp",
      text: "Best for orders, quick questions and anything you would rather say in a sentence than a form.",
      status: clock.open ? "Open now" : "Back during business hours",
      on: clock.open,
      action: (
        <Action href={whatsappLink(GENERAL_MESSAGE)} icon="external" className="w-full">
          Message {SITE.phoneDisplay}
        </Action>
      ),
    },
    {
      icon: Mail,
      name: "Email",
      text: "Best for details, attachments and billing. Replies usually land within 2 hours during business hours.",
      status: "Inbox always open",
      on: true,
      action: (
        <Action href={mailLink("Support request")} variant="secondary" icon="external" className="w-full">
          {SITE.email}
        </Action>
      ),
    },
    {
      icon: Ticket,
      name: "Portal tickets",
      text: "Best for technical issues on a running server. Tickets are tracked, threaded and watched around the clock.",
      status: "24/7",
      on: true,
      action: (
        <Action to={user ? "/portal" : "/auth"} variant="secondary" className="w-full">
          {user ? "Open the portal" : "Sign in to open a ticket"}
        </Action>
      ),
    },
  ];

  return (
    <>
      <PageHero
        eyebrow="Support"
        title={"Stuck?\n*Ask a human.*"}
        description="Three ways to reach the team, each suited to a different kind of problem. No bots and no phone trees."
      />

      <section className="relative pb-24 sm:pb-32">
        <div className="shell">
          <Stagger className="grid gap-3 lg:grid-cols-3">
            {channels.map((c) => (
              <StaggerItem key={c.name} className="h-full">
                <Spotlight className="panel flex h-full flex-col p-7 sm:p-8">
                  <div className="flex items-center justify-between">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 text-beam">
                      <c.icon className="h-5 w-5" />
                    </span>
                    <span className="inline-flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.16em] text-mute">
                      <span className={cn("h-1.5 w-1.5 rounded-full", c.on ? "bg-signal" : "bg-ember")} />
                      {c.status}
                    </span>
                  </div>
                  <h3 className="display mt-10 text-[2rem] font-semibold leading-none tracking-[-0.045em] text-bone">
                    {c.name}
                  </h3>
                  <p className="mt-4 flex-1 text-[15px] leading-relaxed text-mute">{c.text}</p>
                  <div className="mt-8">{c.action}</div>
                </Spotlight>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <section id="faq" className="relative scroll-mt-24 py-20 sm:py-28">
        <div className="shell grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-28">
              <SectionIntro
                layout="stack"
                eyebrow="FAQ"
                title={"Questions we\n*hear a lot.*"}
                description="If yours is not here, the team is one message away."
              />
              <Reveal delay={0.2} className="mt-8">
                <HoursCard />
              </Reveal>
            </div>
          </div>
          <div className="lg:col-span-8">
            <Faq items={SUPPORT_FAQ} />
          </div>
        </div>
      </section>

      <CTABand
        eyebrow="Still stuck?"
        title={"Tell us what broke.\n*We will take a look.*"}
        description="Send the details through the contact form and the right person picks it up. Include the plan code if you have one."
        primaryLabel="Open the contact form"
        primaryTo="/contact"
      />
    </>
  );
};

export default SupportPage;
