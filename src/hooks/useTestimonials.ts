import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Testimonial {
  id: string;
  customer_name: string;
  customer_role: string | null;
  rating: number;
  review_text: string;
  created_at: string;
}

export const useTestimonials = () => {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("testimonials")
        .select("id, customer_name, customer_role, rating, review_text, created_at")
        .eq("status", "approved")
        .order("created_at", { ascending: false });
      if (!error && data) setItems(data);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { items, loading, reload: load };
};
