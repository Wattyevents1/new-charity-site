
-- 1. Storage policies for "home" bucket
CREATE POLICY "Public can view home files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'home');

CREATE POLICY "Admins can upload home files"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'home' AND public.is_admin_or_manager());

CREATE POLICY "Admins can update home files"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'home' AND public.is_admin_or_manager());

CREATE POLICY "Admins can delete home files"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'home' AND public.is_admin_or_manager());

-- 2. Remove volunteers from Realtime publication (no IF EXISTS syntax)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'volunteers'
  ) THEN
    ALTER PUBLICATION supabase_realtime DROP TABLE public.volunteers;
  END IF;
END $$;

-- 3. Tighten INSERT policies

-- Memberships: only allow pending status
DROP POLICY IF EXISTS "Anyone can insert membership" ON public.memberships;
CREATE POLICY "Public can insert pending membership"
  ON public.memberships FOR INSERT
  TO public
  WITH CHECK (status = 'pending');

-- Donations: only allow pending status
DROP POLICY IF EXISTS "Anyone can insert donations" ON public.donations;
CREATE POLICY "Public can insert pending donations"
  ON public.donations FOR INSERT
  TO public
  WITH CHECK (status = 'pending');

-- Volunteers: only allow pending status
DROP POLICY IF EXISTS "Anyone can submit volunteer application" ON public.volunteers;
CREATE POLICY "Public can submit pending volunteer"
  ON public.volunteers FOR INSERT
  TO public
  WITH CHECK (status = 'pending');

-- Item donations: only allow pending status
DROP POLICY IF EXISTS "Anyone can submit item donation" ON public.item_donations;
CREATE POLICY "Public can submit pending item donation"
  ON public.item_donations FOR INSERT
  TO public
  WITH CHECK (status = 'pending');
