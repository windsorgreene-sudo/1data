import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Quote, ChevronLeft, ChevronRight, MessageSquarePlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { TiltCard } from "./TiltCard";
import { TestimonialForm } from "./TestimonialForm";
import { useToast } from "@/hooks/use-toast";
import { TextReveal, ParagraphReveal } from "./TextReveal";

interface Testimonial {
  id: string;
  customer_name: string;
  customer_role: string | null;
  rating: number;
  review_text: string;
  created_at: string;
}

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchTestimonials();
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setIsLoggedIn(!!session);
  };

  const fetchTestimonials = async () => {
    const { data, error } = await supabase
      .from("testimonials")
      .select("id, customer_name, customer_role, rating, review_text, created_at")
      .eq("status", "approved")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setTestimonials(data);
    }
  };

  const handleLeaveReview = () => {
    if (!isLoggedIn) {
      toast({
        title: "Login Required",
        description: "Please login to submit a review.",
        variant: "destructive",
      });
      return;
    }
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    toast({
      title: "Review Submitted!",
      description: "Thank you! Your review is pending approval.",
    });
  };

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % Math.max(1, testimonials.length));
  }, [testimonials.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % Math.max(1, testimonials.length));
  }, [testimonials.length]);

  // Auto-scroll every 5 seconds
  useEffect(() => {
    if (testimonials.length <= 1) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [nextSlide]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground"
        }`}
      />
    ));
  };

  // Get visible testimonials (show 1 on mobile, 3 on desktop)
  const getVisibleTestimonials = () => {
    if (testimonials.length === 0) return [];
    const items = [];
    for (let i = 0; i < Math.min(3, testimonials.length); i++) {
      const index = (currentIndex + i) % testimonials.length;
      items.push(testimonials[index]);
    }
    return items;
  };

  return (
      <section className="py-12 sm:py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 aurora-bg opacity-30" />
        
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-8 sm:mb-12"
            >
              <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full glass-heavy text-primary text-xs sm:text-sm font-medium mb-3 sm:mb-4">
                <Quote className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Customer Reviews
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 gradient-text-animated">
                What Our Clients Say
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base md:text-lg">
                Real feedback from businesses and developers who trust our infrastructure
              </p>
            </motion.div>

          {/* Testimonials Carousel */}
          {testimonials.length > 0 ? (
            <div className="relative">
              {/* Navigation Buttons */}
              {testimonials.length > 1 && (
                <>
                  <button
                    onClick={prevSlide}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-card border shadow-lg hover:bg-muted transition-colors -translate-x-4 hidden md:flex"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={nextSlide}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-card border shadow-lg hover:bg-muted transition-colors translate-x-4 hidden md:flex"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Cards Container */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 px-2 sm:px-4 md:px-8">
                <AnimatePresence mode="wait">
                  {getVisibleTestimonials().map((testimonial, idx) => (
                    <motion.div
                      key={testimonial.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.4, delay: idx * 0.1 }}
                      className={idx > 0 ? "hidden md:block" : ""}
                    >
                      <TiltCard tiltAmount={5} className="h-full group">
                        <div className="h-full p-4 sm:p-6 rounded-xl frosted-card">
                          {/* Quote Icon */}
                          <Quote className="w-6 h-6 sm:w-8 sm:h-8 text-primary/20 mb-3 sm:mb-4" />

                          {/* Review Text */}
                          <p className="text-foreground/90 mb-4 sm:mb-6 line-clamp-4 text-sm sm:text-base">
                            "{testimonial.review_text}"
                          </p>

                          {/* Rating */}
                          <div className="flex items-center gap-1 mb-3 sm:mb-4">
                            {renderStars(testimonial.rating)}
                          </div>

                          {/* Author */}
                          <div className="flex items-center gap-2.5 sm:gap-3">
                            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs sm:text-sm">
                              {getInitials(testimonial.customer_name)}
                            </div>
                            <div>
                              <p className="font-medium text-foreground text-sm sm:text-base">
                                {testimonial.customer_name}
                              </p>
                              {testimonial.customer_role && (
                                <p className="text-xs sm:text-sm text-muted-foreground">
                                  {testimonial.customer_role}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </TiltCard>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Dots Indicator */}
              {testimonials.length > 1 && (
                <div className="flex justify-center gap-2 mt-6 sm:mt-8">
                  {testimonials.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentIndex(idx)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        idx === currentIndex
                          ? "bg-primary w-6"
                          : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 sm:py-12 text-muted-foreground">
              <Quote className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 opacity-30" />
              <p className="text-sm sm:text-base">No reviews yet. Be the first to share your experience!</p>
            </div>
          )}

          {/* Leave Review Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-center mt-8 sm:mt-12"
          >
            <Button
              onClick={handleLeaveReview}
              size="lg"
              className="gap-2 bg-gradient-primary text-primary-foreground hover:shadow-glow"
            >
              <MessageSquarePlus className="w-4 h-4 sm:w-5 sm:h-5" />
              Leave a Review
            </Button>
          </motion.div>

          {/* Testimonial Form Modal */}
          <TestimonialForm
            open={showForm}
            onOpenChange={setShowForm}
            onSuccess={handleFormSuccess}
          />
        </div>
      </section>
    );
};

export default Testimonials;
