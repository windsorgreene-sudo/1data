import { useTestimonials } from "@/hooks/useTestimonials";
import { Marquee } from "@/components/motion/Marquee";
import { Stagger, StaggerItem } from "@/components/motion/Reveal";
import { SectionIntro } from "@/components/site/SectionIntro";
import { ReviewCard } from "@/components/site/ReviewCard";
import { Action } from "@/components/site/Action";

export const ReviewsStrip = () => {
  const { items } = useTestimonials();
  if (items.length === 0) return null;

  const avg = items.reduce((a, r) => a + r.rating, 0) / items.length;
  const half = Math.ceil(items.length / 2);

  return (
    <section className="relative py-20 sm:py-28">
      <div className="shell">
        <SectionIntro
          eyebrow="Reviews"
          title={"Heard from people\n*running on Beam.*"}
          description={`${avg.toFixed(1)} out of 5 across ${items.length} approved ${items.length === 1 ? "review" : "reviews"}, shown exactly as written.`}
        />
      </div>
      {items.length >= 4 ? (
        <div className="mt-14 space-y-3 sm:mt-20">
          <Marquee duration={60}>
            {items.slice(0, half).map((r) => (
              <div key={r.id} className="w-[340px] shrink-0 px-1.5 sm:w-[400px]">
                <ReviewCard review={r} />
              </div>
            ))}
          </Marquee>
          <Marquee duration={70} reverse>
            {items.slice(half).map((r) => (
              <div key={r.id} className="w-[340px] shrink-0 px-1.5 sm:w-[400px]">
                <ReviewCard review={r} />
              </div>
            ))}
          </Marquee>
        </div>
      ) : (
        <div className="shell">
          <Stagger className="mt-14 grid gap-3 md:grid-cols-3">
            {items.map((r) => (
              <StaggerItem key={r.id}>
                <ReviewCard review={r} />
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      )}
      <div className="shell mt-10 flex justify-center">
        <Action to="/testimonials" variant="secondary" size="sm">
          Read every review
        </Action>
      </div>
    </section>
  );
};
