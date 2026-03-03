import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface LoadingSkeletonProps {
  className?: string;
  variant?: "text" | "title" | "card" | "avatar" | "button" | "image";
  count?: number;
  animated?: boolean;
}

const variantClasses = {
  text: "h-4 w-full rounded",
  title: "h-8 w-3/4 rounded-lg",
  card: "h-64 w-full rounded-2xl",
  avatar: "h-12 w-12 rounded-full",
  button: "h-10 w-24 rounded-lg",
  image: "h-48 w-full rounded-xl",
};

// Shimmer animation component
const ShimmerSkeleton = ({ className }: { className?: string }) => (
  <div className={cn("relative overflow-hidden", className)}>
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-foreground/5 to-transparent animate-shimmer" />
  </div>
);

// Pulse skeleton with smooth animation
const PulseSkeleton = ({ className }: { className?: string }) => (
  <motion.div
    className={cn("bg-muted/50", className)}
    animate={{ opacity: [0.5, 1, 0.5] }}
    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
  />
);

export const LoadingSkeleton = ({
  className,
  variant = "text",
  count = 1,
  animated = true,
}: LoadingSkeletonProps) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={index}
          className={cn(
            "relative overflow-hidden bg-muted/30 backdrop-blur-sm",
            variantClasses[variant],
            className
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: index * 0.1 }}
        >
          {animated && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-foreground/5 to-transparent"
              animate={{ x: ["-100%", "100%"] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: index * 0.1,
              }}
            />
          )}
        </motion.div>
      ))}
    </>
  );
};

// Service card skeleton with staggered animation
export const ServiceCardSkeleton = ({ delay = 0 }: { delay?: number }) => (
  <motion.div
    className="bg-gradient-card backdrop-blur-xl border-glass rounded-2xl p-6 sm:p-8 h-full flex flex-col"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
  >
    <div className="flex flex-col items-center text-center space-y-4">
      <LoadingSkeleton variant="avatar" className="w-20 h-20 rounded-3xl" />
      <LoadingSkeleton variant="title" className="w-2/3" />
      <LoadingSkeleton variant="text" className="w-full" />
      <LoadingSkeleton variant="text" className="w-4/5" />
    </div>
    <div className="mt-6 space-y-3 flex-1">
      <LoadingSkeleton variant="text" className="w-5/6" />
      <LoadingSkeleton variant="text" className="w-4/5" />
      <LoadingSkeleton variant="text" className="w-5/6" />
      <LoadingSkeleton variant="text" className="w-3/4" />
    </div>
    <div className="mt-6 pt-6 border-t border-glass">
      <LoadingSkeleton variant="title" className="w-1/2 mx-auto mb-4" />
      <LoadingSkeleton variant="button" className="w-full h-12" />
    </div>
  </motion.div>
);

// Feature card skeleton
export const FeatureCardSkeleton = ({ delay = 0 }: { delay?: number }) => (
  <motion.div
    className="p-6 sm:p-8 rounded-3xl bg-gradient-card backdrop-blur-xl border-glass"
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay, duration: 0.4 }}
  >
    <LoadingSkeleton variant="avatar" className="w-16 h-16 rounded-2xl mb-6" />
    <LoadingSkeleton variant="title" className="w-3/4 mb-4" />
    <LoadingSkeleton variant="text" className="w-full mb-2" />
    <LoadingSkeleton variant="text" className="w-5/6" />
  </motion.div>
);

// Support card skeleton
export const SupportCardSkeleton = ({ delay = 0 }: { delay?: number }) => (
  <motion.div
    className="bg-glass border-border rounded-xl p-4 sm:p-6 text-center"
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }}
  >
    <LoadingSkeleton variant="avatar" className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl mx-auto mb-3 sm:mb-4" />
    <LoadingSkeleton variant="title" className="w-3/4 mx-auto mb-2 h-6" />
    <LoadingSkeleton variant="text" className="w-full mb-3" />
    <LoadingSkeleton variant="text" className="w-1/2 mx-auto mb-4" />
    <LoadingSkeleton variant="button" className="w-full h-10" />
  </motion.div>
);

// Pricing card skeleton
export const PricingCardSkeleton = ({ delay = 0 }: { delay?: number }) => (
  <motion.div
    className="bg-gradient-card backdrop-blur-xl border-glass rounded-2xl p-6 sm:p-8"
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
  >
    <div className="text-center mb-6">
      <LoadingSkeleton variant="title" className="w-1/2 mx-auto mb-4 h-6" />
      <LoadingSkeleton variant="title" className="w-2/3 mx-auto h-10" />
    </div>
    <div className="space-y-3 mb-6">
      {Array.from({ length: 5 }).map((_, i) => (
        <LoadingSkeleton key={i} variant="text" className="w-full" />
      ))}
    </div>
    <LoadingSkeleton variant="button" className="w-full h-12" />
  </motion.div>
);

// Testimonial card skeleton
export const TestimonialCardSkeleton = ({ delay = 0 }: { delay?: number }) => (
  <motion.div
    className="bg-gradient-card backdrop-blur-xl border-glass rounded-2xl p-6"
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay, duration: 0.4 }}
  >
    <div className="flex items-center gap-4 mb-4">
      <LoadingSkeleton variant="avatar" className="w-12 h-12" />
      <div className="flex-1">
        <LoadingSkeleton variant="text" className="w-1/2 mb-2" />
        <LoadingSkeleton variant="text" className="w-1/3 h-3" />
      </div>
    </div>
    <LoadingSkeleton variant="text" className="w-full mb-2" />
    <LoadingSkeleton variant="text" className="w-full mb-2" />
    <LoadingSkeleton variant="text" className="w-3/4" />
  </motion.div>
);

// Hero skeleton
export const HeroSkeleton = () => (
  <div className="relative min-h-screen flex items-center justify-center pt-16 bg-gradient-surface">
    <div className="container mx-auto px-6 text-center">
      <div className="max-w-4xl mx-auto space-y-6">
        <LoadingSkeleton variant="title" className="h-12 sm:h-16 w-3/4 mx-auto" />
        <LoadingSkeleton variant="title" className="h-10 sm:h-12 w-2/3 mx-auto" />
        <div className="space-y-2 max-w-3xl mx-auto">
          <LoadingSkeleton variant="text" className="h-5 w-full" />
          <LoadingSkeleton variant="text" className="h-5 w-4/5 mx-auto" />
        </div>
        <div className="flex gap-4 justify-center pt-4">
          <LoadingSkeleton variant="button" className="w-32 h-12" />
          <LoadingSkeleton variant="button" className="w-36 h-12" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-5xl mx-auto pt-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <motion.div
              key={i}
              className="rounded-2xl bg-gradient-card backdrop-blur-xl border border-glass p-6 sm:p-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15 }}
            >
              <LoadingSkeleton variant="avatar" className="w-12 h-12 mx-auto mb-4" />
              <LoadingSkeleton variant="title" className="w-3/4 mx-auto mb-3 h-6" />
              <LoadingSkeleton variant="text" className="w-full" />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// Globe/Map skeleton
export const GlobeSkeleton = () => (
  <div className="py-16 relative overflow-hidden">
    <div className="container mx-auto px-4 max-w-7xl">
      <div className="text-center mb-8">
        <LoadingSkeleton variant="title" className="h-10 sm:h-12 w-2/3 mx-auto mb-3" />
        <LoadingSkeleton variant="text" className="h-5 w-1/2 mx-auto" />
      </div>
      <motion.div
        className="overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm rounded-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <LoadingSkeleton variant="image" className="h-[600px] rounded-lg" />
      </motion.div>
      <div className="mt-8 text-center">
        <LoadingSkeleton variant="text" className="h-4 w-1/3 mx-auto" />
      </div>
    </div>
  </div>
);

// Section loading wrapper
export const SectionLoader = ({
  children,
  isLoading,
  skeleton,
}: {
  children: React.ReactNode;
  isLoading: boolean;
  skeleton: React.ReactNode;
}) => {
  return (
    <motion.div
      initial={false}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {isLoading ? skeleton : children}
    </motion.div>
  );
};

// Grid of skeleton cards
export const SkeletonGrid = ({
  count = 3,
  type = "feature",
}: {
  count?: number;
  type?: "feature" | "service" | "pricing" | "testimonial" | "support";
}) => {
  const SkeletonComponent = {
    feature: FeatureCardSkeleton,
    service: ServiceCardSkeleton,
    pricing: PricingCardSkeleton,
    testimonial: TestimonialCardSkeleton,
    support: SupportCardSkeleton,
  }[type];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonComponent key={i} delay={i * 0.1} />
      ))}
    </div>
  );
};