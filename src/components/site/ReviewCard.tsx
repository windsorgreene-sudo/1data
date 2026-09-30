import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Testimonial } from "@/hooks/useTestimonials";
import { trackPointer } from "@/components/motion/Spotlight";

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

export const Stars = ({ rating, className }: { rating: number; className?: string }) => (
  <span className={cn("inline-flex items-center gap-0.5", className)} aria-label={`${rating} out of 5 stars`}>
    {Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={cn("h-3.5 w-3.5", i < rating ? "fill-ember text-ember" : "text-white/15")}
        strokeWidth={1.5}
      />
    ))}
  </span>
);

export const ReviewCard = ({ review, className }: { review: Testimonial; className?: string }) => (
  <figure
    onPointerMove={trackPointer}
    className={cn("spotlight panel flex h-full flex-col p-6 sm:p-7", className)}
  >
    <Stars rating={review.rating} />
    <blockquote className="mt-5 flex-1 text-[16px] leading-relaxed text-bone/85">“{review.review_text}”</blockquote>
    <figcaption className="mt-6 flex items-center gap-3 border-t border-white/[0.07] pt-5">
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.06] font-mono text-[11px] text-bone">
        {initials(review.customer_name)}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-[14px] text-bone">{review.customer_name}</span>
        {review.customer_role && <span className="block truncate text-[13px] text-mute">{review.customer_role}</span>}
      </span>
      <span className="ml-auto font-mono text-[10.5px] uppercase tracking-[0.14em] text-mute">
        {new Date(review.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
      </span>
    </figcaption>
  </figure>
);
