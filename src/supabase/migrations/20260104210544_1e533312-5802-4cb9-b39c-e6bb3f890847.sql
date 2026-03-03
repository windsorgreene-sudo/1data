-- Create testimonials table with spam protection
CREATE TABLE public.testimonials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_role TEXT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT NOT NULL CHECK (char_length(review_text) <= 500),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  is_featured BOOLEAN NOT NULL DEFAULT false,
  submission_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Rate limiting: max 1 review per user per day (spam protection)
CREATE UNIQUE INDEX unique_testimonial_per_user_per_day 
ON public.testimonials (user_id, submission_date);

-- Enable RLS
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- Anyone can view approved testimonials
CREATE POLICY "Anyone can view approved testimonials"
ON public.testimonials
FOR SELECT
USING (status = 'approved');

-- Authenticated users can insert their own testimonials
CREATE POLICY "Users can submit testimonials"
ON public.testimonials
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can view their own testimonials (any status)
CREATE POLICY "Users can view own testimonials"
ON public.testimonials
FOR SELECT
USING (auth.uid() = user_id);

-- Admins can view all testimonials
CREATE POLICY "Admins can view all testimonials"
ON public.testimonials
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'moderator'::app_role));

-- Admins can update testimonials
CREATE POLICY "Admins can update testimonials"
ON public.testimonials
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'moderator'::app_role));

-- Admins can delete testimonials
CREATE POLICY "Admins can delete testimonials"
ON public.testimonials
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_testimonials_updated_at
BEFORE UPDATE ON public.testimonials
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();