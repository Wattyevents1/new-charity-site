-- Revoke EXECUTE on internal SECURITY DEFINER helpers from API roles.
-- These are used only inside RLS policies / triggers and must not be callable directly.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_admin_or_manager() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- get_project_donation_totals is intentionally callable by anon (used on public pages).
GRANT EXECUTE ON FUNCTION public.get_project_donation_totals() TO anon, authenticated;

-- Drop the broad SELECT policy that lets clients list every file in the 'home' bucket.
-- The bucket remains public, so files are still readable via their public URL.
DROP POLICY IF EXISTS "Public can view home files" ON storage.objects;