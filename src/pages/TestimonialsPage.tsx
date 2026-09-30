import { PenLine } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useTestimonials } from "@/hooks/useTestimonials";
import { PageHero } from "@/components/site/PageHero";
import { Action } from "@/components/site/Action";
import { CTABand } from "@/components/site/CTABand";
import { ReviewCard, Stars } from "@/components/site/ReviewCard";
import { TestimonialForm } from "@/components/TestimonialForm";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";

const Skeleton = () => (
  <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="shimmer panel h-56" />
    ))}
  </div>
);

const TestimonialsPage = () => {
  usePageMeta("Reviews", "Approved reviews from Beam Server customers, published exactly as written.");
  const { user } = useAuth();
  const { items, loading } = useTestimonials();
  const [open, setOpen] = useState(false);

  const avg = useMemo(
    () => (items.length ? items.reduce((a, r) => a + r.rating, 0) / items.length : 0),
    [items],
  );

  const write = user ? (
    <Action onClick={() => setOpen(true)} icon="none">
      <span className="inline-flex items-center gap-2">
        <PenLine className="h-4 w-4" />
        Write a review
      </span>
    </Action>
  ) : (
    <Action to="/auth">Sign in to write a review</Action>
  );

  return (
    <>
      <PageHero
        eyebrow="Reviews"
        title={"In their words,\n*not ours.*"}
        description="Every review here comes from a signed-in customer and is published exactly as written once a person on the team approves it."
        aside={
          items.length > 0 ? (
            <div className="panel p-7">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-mute">Average rating</p>
              <p className="display mt-4 text-[4.5rem] font-bold leading-none tracking-[-0.06em] text-bone">
                {avg.toFixed(1)}
                <span className="text-[1.6rem] text-mute"> / 5</span>
              </p>
              <Stars rating={Math.round(avg)} className="mt-4" />
              <p className="mt-4 text-[14px] text-mute">
                From {items.length} approved {items.length === 1 ? "review" : "reviews"}
              </p>
            </div>
          ) : undefined
        }
      >
        {write}
      </PageHero>

      <section className="relative pb-24 sm:pb-32">
        <div className="shell">
          {loading ? (
            <Skeleton />
          ) : items.length === 0 ? (
            <Reveal className="panel flex flex-col items-center px-6 py-20 text-center">
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-mute">No reviews yet</span>
              <p className="display mt-6 max-w-xl text-[clamp(2rem,4vw,3rem)] font-semibold leading-[1.02] tracking-[-0.04em] text-bone">
                The first review on this page could be yours.
              </p>
              <p className="mt-4 max-w-md text-[15px] leading-relaxed text-mute">
                Running a server with us? Tell other people how it is going, good or bad.
              </p>
              <div className="mt-8">{write}</div>
            </Reveal>
          ) : (
            <Stagger className="columns-1 gap-3 md:columns-2 lg:columns-3 [&>*]:mb-3 [&>*]:break-inside-avoid" gap={0.05}>
              {items.map((r) => (
                <StaggerItem key={r.id}>
                  <ReviewCard review={r} />
                </StaggerItem>
              ))}
            </Stagger>
          )}
        </div>
      </section>

      <CTABand />

      <TestimonialForm
        open={open}
        onOpenChange={setOpen}
        onSuccess={() => {
          setOpen(false);
          toast.success("Review submitted", { description: "Thank you. It will appear here once it is approved." });
        }}
      />
    </>
  );
};

export default TestimonialsPage;
