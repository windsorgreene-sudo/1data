import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { Check, Loader2, Mail, MessageCircle } from "lucide-react";
import { useRef, useState, type FormEvent, type ReactNode } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { EASE_OUT } from "@/lib/motion";
import { GENERAL_MESSAGE, SITE, mailLink, whatsappLink } from "@/lib/site";
import { supabase } from "@/integrations/supabase/client";
import { usePageMeta } from "@/hooks/usePageMeta";
import { SplitText } from "@/components/motion/SplitText";
import { Reveal } from "@/components/motion/Reveal";
import { Spotlight } from "@/components/motion/Spotlight";
import { Eyebrow } from "@/components/site/SectionIntro";
import { Action } from "@/components/site/Action";
import { HoursCard } from "@/components/site/HoursCard";

const schema = z.object({
  firstName: z.string().trim().min(1, "Please add your first name").max(100),
  lastName: z.string().trim().min(1, "Please add your last name").max(100),
  email: z.string().trim().email("That email does not look right").max(255),
  subject: z.string().trim().min(1, "Add a short subject").max(200),
  message: z.string().trim().min(1, "Tell us a little more").max(5000),
});

type Fields = z.infer<typeof schema>;
type Errors = Partial<Record<keyof Fields, string>>;

const TOPICS = ["Order a server", "Custom quote", "Technical issue", "Billing", "Something else"];

const Field = ({
  id,
  label,
  error,
  children,
  hint,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}) => (
  <div>
    <div className="mb-2 flex items-baseline justify-between">
      <label htmlFor={id} className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-mute">
        {label}
      </label>
      {hint && <span className="font-mono text-[10.5px] text-mute/70">{hint}</span>}
    </div>
    {children}
    <AnimatePresence>
      {error && (
        <motion.p
          id={`${id}-error`}
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-2 text-[13px] text-destructive"
        >
          {error}
        </motion.p>
      )}
    </AnimatePresence>
  </div>
);

const ContactForm = () => {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const parsed = schema.safeParse({
      firstName: data.get("firstName"),
      lastName: data.get("lastName"),
      email: data.get("email"),
      subject: data.get("subject"),
      message: data.get("message"),
    });
    if (!parsed.success) {
      const next: Errors = {};
      parsed.error.issues.forEach((issue) => {
        const key = issue.path[0] as keyof Fields;
        if (!next[key]) next[key] = issue.message;
      });
      setErrors(next);
      return;
    }
    setErrors({});
    setLoading(true);
    const v = parsed.data;
    try {
      const { error: dbError } = await supabase.from("contact_submissions").insert({
        first_name: v.firstName,
        last_name: v.lastName,
        email: v.email,
        subject: v.subject,
        message: v.message,
      });
      if (dbError) throw dbError;
      const { error: emailError } = await supabase.functions.invoke("send-email", {
        body: { ...v, timestamp: new Date().toISOString() },
      });
      if (emailError) console.error("send-email failed", emailError);
      form.reset();
      setSubject("");
      setMessage("");
      setSent(true);
      toast.success("Message sent", { description: "We usually reply within 2 hours during business hours." });
    } catch (err) {
      console.error("contact submit failed", err);
      toast.error("That did not go through", {
        description: `Please try again, or reach us on WhatsApp or at ${SITE.email}.`,
      });
    } finally {
      setLoading(false);
    }
  };

  const aria = (key: keyof Fields) => ({
    "aria-invalid": errors[key] ? true : undefined,
    "aria-describedby": errors[key] ? `${key}-error` : undefined,
  });

  return (
    <Spotlight className="panel relative overflow-hidden p-6 sm:p-9">
      <AnimatePresence mode="wait" initial={false}>
        {sent ? (
          <motion.div
            key="sent"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: EASE_OUT }}
            className="flex min-h-[520px] flex-col items-center justify-center text-center"
            role="status"
          >
            <motion.span
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", bounce: 0.45, duration: 0.8, delay: 0.1 }}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-beam text-ink shadow-[0_0_60px_-10px_hsl(var(--beam))]"
            >
              <Check className="h-7 w-7" strokeWidth={2.5} />
            </motion.span>
            <h2 className="display mt-8 text-[2.4rem] font-semibold leading-none tracking-[-0.045em] text-bone">
              Got it. Thank you.
            </h2>
            <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-mute">
              Your message is with the team. Expect a reply by email, usually within 2 hours during business hours.
            </p>
            <button
              type="button"
              onClick={() => setSent(false)}
              className="mt-8 font-mono text-[11px] uppercase tracking-[0.2em] text-beam hover:underline"
            >
              Send another message
            </button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            onSubmit={onSubmit}
            noValidate
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid gap-6"
          >
            <div className="grid gap-6 sm:grid-cols-2">
              <Field id="firstName" label="First name" error={errors.firstName}>
                <input id="firstName" name="firstName" autoComplete="given-name" maxLength={100} className="field" {...aria("firstName")} />
              </Field>
              <Field id="lastName" label="Last name" error={errors.lastName}>
                <input id="lastName" name="lastName" autoComplete="family-name" maxLength={100} className="field" {...aria("lastName")} />
              </Field>
            </div>
            <Field id="email" label="Email" error={errors.email}>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                maxLength={255}
                placeholder="you@company.com"
                className="field"
                {...aria("email")}
              />
            </Field>
            <Field id="subject" label="Subject" error={errors.subject}>
              <input
                id="subject"
                name="subject"
                maxLength={200}
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="What is this about?"
                className="field"
                {...aria("subject")}
              />
              <div className="mt-3 flex flex-wrap gap-2">
                {TOPICS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setSubject(t)}
                    className={cn(
                      "rounded-full border px-3 py-1 text-[12.5px] transition-colors duration-300",
                      subject === t
                        ? "border-beam/60 bg-beam/10 text-beam"
                        : "border-white/10 text-bone/60 hover:border-white/25 hover:text-bone",
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </Field>
            <Field id="message" label="Message" error={errors.message} hint={`${message.length} / 5000`}>
              <textarea
                id="message"
                name="message"
                rows={6}
                maxLength={5000}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Plan, location, workload, anything that helps us help you."
                className="field h-auto resize-y py-3 leading-relaxed"
                {...aria("message")}
              />
            </Field>
            <div className="flex flex-col-reverse items-start justify-between gap-4 sm:flex-row sm:items-center">
              <p className="text-[13px] text-mute">We only use your details to reply to this message.</p>
              <button
                type="submit"
                disabled={loading}
                className="group/action inline-flex h-12 items-center gap-2 rounded-full bg-bone px-7 text-[15px] font-medium text-ink transition-all duration-500 ease-out-expo hover:bg-white hover:shadow-[0_0_0_5px_hsl(var(--bone)/0.1)] disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending
                  </>
                ) : (
                  "Send message"
                )}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </Spotlight>
  );
};

const ContactPage = () => {
  usePageMeta(
    "Contact",
    "Talk to Beam Server about orders, custom quotes, billing or a technical issue. WhatsApp, email or the contact form.",
  );
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const x = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : ["0%", "-18%"]);

  return (
    <>
      <section ref={ref} className="grain relative overflow-hidden pb-24 pt-36 sm:pb-32 sm:pt-44">
        <motion.div
          aria-hidden
          style={{ x }}
          className="display text-outline pointer-events-none absolute left-[-2vw] top-24 select-none whitespace-nowrap text-[24vw] font-bold leading-none tracking-[-0.06em]"
        >
          Contact
        </motion.div>
        <div aria-hidden className="pointer-events-none absolute -top-40 right-0 h-[520px] w-[700px] rounded-full bg-beam/[0.07] blur-[120px]" />

        <div className="shell relative">
          <Eyebrow label="Contact" line={false} />
          <SplitText
            as="h1"
            trigger="mount"
            delay={0.1}
            text={"Say hello.\n*We read everything.*"}
            className="display mt-7 text-[clamp(2.9rem,7.4vw,6.6rem)] font-bold leading-[0.92] text-bone"
          />
          <Reveal delay={0.4} className="mt-8 max-w-xl text-[18px] leading-relaxed text-mute">
            Orders, quotes, billing or a server acting strange. Use the form, or pick the channel you already live in.
          </Reveal>

          <div className="mt-16 grid gap-3 lg:grid-cols-12">
            <Reveal delay={0.5} className="lg:col-span-7">
              <ContactForm />
            </Reveal>
            <div className="grid content-start gap-3 lg:col-span-5">
              <Reveal delay={0.6}>
                <Spotlight className="panel p-6">
                  <div className="flex items-center justify-between">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-beam">
                      <MessageCircle className="h-4 w-4" />
                    </span>
                    <span className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-mute">Fastest</span>
                  </div>
                  <p className="display mt-6 text-[1.7rem] font-semibold leading-none tracking-[-0.04em] text-bone">
                    WhatsApp
                  </p>
                  <p className="mt-2 font-mono text-[14px] text-bone/80">{SITE.phoneDisplay}</p>
                  <div className="mt-6">
                    <Action href={whatsappLink(GENERAL_MESSAGE)} icon="external" size="sm">
                      Start a chat
                    </Action>
                  </div>
                </Spotlight>
              </Reveal>
              <Reveal delay={0.7}>
                <Spotlight className="panel p-6">
                  <div className="flex items-center justify-between">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-beam">
                      <Mail className="h-4 w-4" />
                    </span>
                    <span className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-mute">2 hour replies</span>
                  </div>
                  <p className="display mt-6 text-[1.7rem] font-semibold leading-none tracking-[-0.04em] text-bone">Email</p>
                  <a href={mailLink()} className="link-underline mt-2 inline-block font-mono text-[14px] text-bone/80">
                    {SITE.email}
                  </a>
                </Spotlight>
              </Reveal>
              <Reveal delay={0.8}>
                <HoursCard />
              </Reveal>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ContactPage;
