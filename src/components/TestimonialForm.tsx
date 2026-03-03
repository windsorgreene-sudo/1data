import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface TestimonialFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const TestimonialForm = ({ open, onOpenChange, onSuccess }: TestimonialFormProps) => {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(false);
  const [canSubmit, setCanSubmit] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      checkRateLimit();
      prefillName();
    }
  }, [open]);

  const prefillName = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", session.user.id)
        .single();
      
      if (profile?.full_name) {
        setName(profile.full_name);
      }
    }
  };

  const checkRateLimit = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setCanSubmit(false);
      return;
    }

    // Check if user already submitted today
    const today = new Date().toISOString().split("T")[0];
    const { data } = await supabase
      .from("testimonials")
      .select("id")
      .eq("user_id", session.user.id)
      .eq("submission_date", today);

    setCanSubmit(!data || data.length === 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!canSubmit) {
      toast({
        title: "Rate Limited",
        description: "You've already submitted a review today. Please try again tomorrow.",
        variant: "destructive",
      });
      return;
    }

    if (!name.trim() || !review.trim()) {
      toast({
        title: "Missing Fields",
        description: "Please fill in your name and review.",
        variant: "destructive",
      });
      return;
    }

    if (review.length > 500) {
      toast({
        title: "Review Too Long",
        description: "Please keep your review under 500 characters.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Not Logged In",
          description: "Please login to submit a review.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase.from("testimonials").insert({
        user_id: session.user.id,
        customer_name: name.trim(),
        customer_role: role.trim() || null,
        rating,
        review_text: review.trim(),
      });

      if (error) {
        if (error.code === "23505") {
          toast({
            title: "Already Submitted",
            description: "You've already submitted a review today.",
            variant: "destructive",
          });
        } else {
          throw error;
        }
        return;
      }

      // Reset form
      setRating(5);
      setName("");
      setRole("");
      setReview("");
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit review.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Leave a Review</DialogTitle>
          <DialogDescription>
            Share your experience with our services. Your review will be visible after approval.
          </DialogDescription>
        </DialogHeader>

        {!canSubmit ? (
          <div className="py-6 text-center">
            <p className="text-muted-foreground">
              You've already submitted a review today. Please try again tomorrow.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Star Rating */}
            <div className="space-y-2">
              <Label>Rating</Label>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }, (_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setRating(i + 1)}
                    onMouseEnter={() => setHoverRating(i + 1)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-0.5 transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-7 h-7 transition-colors ${
                        i < (hoverRating || rating)
                          ? "text-yellow-500 fill-yellow-500"
                          : "text-muted-foreground"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Your Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                maxLength={100}
                required
              />
            </div>

            {/* Role/Company */}
            <div className="space-y-2">
              <Label htmlFor="role">Role / Company (Optional)</Label>
              <Input
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="Developer at Acme Inc."
                maxLength={100}
              />
            </div>

            {/* Review */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="review">Your Review *</Label>
                <span className={`text-xs ${review.length > 450 ? "text-destructive" : "text-muted-foreground"}`}>
                  {review.length}/500
                </span>
              </div>
              <Textarea
                id="review"
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="Share your experience with our services..."
                rows={4}
                maxLength={500}
                required
              />
            </div>

            {/* Submit Button */}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Submitting..." : "Submit Review"}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
