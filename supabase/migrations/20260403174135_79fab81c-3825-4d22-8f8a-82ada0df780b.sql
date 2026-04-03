-- Fix donations default status from 'completed' to 'pending'
ALTER TABLE public.donations 
  ALTER COLUMN status SET DEFAULT 'pending';

-- Fix memberships default status from 'active' to 'pending'
ALTER TABLE public.memberships 
  ALTER COLUMN status SET DEFAULT 'pending';

-- Tighten contact_submissions INSERT policy
DROP POLICY IF EXISTS "Anyone can submit contact" ON public.contact_submissions;
CREATE POLICY "Public can submit contact"
  ON public.contact_submissions FOR INSERT
  TO public
  WITH CHECK (is_read = false);