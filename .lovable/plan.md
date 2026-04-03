

# Security Scan Results and Fix Plan

The new scan found **17 findings** across 3 scanners. Here is the breakdown and proposed fixes.

## Current Findings

### Errors (2) — Must Fix
1. **Donations table: default status is 'completed' but RLS requires 'pending'** — The `donations.status` column defaults to `'completed'`, so an insert without specifying status bypasses the RLS `WITH CHECK (status = 'pending')` policy. Fix: change the column default to `'pending'`.
2. **Memberships table: default status is 'active' but RLS requires 'pending'** — Same issue. The `memberships.status` column defaults to `'active'`. Fix: change the column default to `'pending'`.

### Warnings (15) — Assess and Address
3. **RLS Policy Always True** — The `contact_submissions` INSERT policy uses `WITH CHECK (true)`. This is intentional (anyone can submit a contact form), but we can scope it to only allow `is_read = false` to prevent abuse.
4. **Anonymous Access Policies (11 tables)** — These are flagged because policies apply to `{public}` role which includes anonymous users. Since anonymous sign-ins are disabled, these are informational. The admin-only policies (`is_admin()`, `is_admin_or_manager()`) already gate access properly. These can be marked as acceptable.
5. **Leaked Password Protection Disabled** — Enable via auth settings.
6. **Privilege escalation via user_roles** — The `is_admin()` function is `SECURITY DEFINER`, so the INSERT policy on `user_roles` is safe. Only existing admins can insert. Mark as acceptable.
7. **No INSERT policy on profiles** — Profile creation is handled via a database trigger on `auth.users`. This is intentional. Mark as acceptable.

## Planned Changes

### Migration SQL
- Change `donations.status` default from `'completed'` to `'pending'`
- Change `memberships.status` default from `'active'` to `'pending'`
- Update `contact_submissions` INSERT policy to restrict `is_read = false`

### Auth Settings
- Enable leaked password protection (HIBP check)

### Security Findings Management
- Mark anonymous access warnings as acceptable (anonymous sign-ins are disabled)
- Mark privilege escalation and profiles INSERT warnings as acceptable
- Delete resolved error findings after fixes

## Technical Details

```sql
-- Fix donations default status
ALTER TABLE public.donations 
  ALTER COLUMN status SET DEFAULT 'pending';

-- Fix memberships default status  
ALTER TABLE public.memberships 
  ALTER COLUMN status SET DEFAULT 'pending';

-- Tighten contact_submissions INSERT policy
DROP POLICY IF EXISTS "Anyone can submit contact" ON public.contact_submissions;
CREATE POLICY "Public can submit contact"
  ON public.contact_submissions FOR INSERT
  TO public
  WITH CHECK (is_read = false);
```

The Pesapal edge function inserts donations with explicit `status: 'pending'`, so the default change is safe. The membership page will need verification that it also sends `status: 'pending'` explicitly.

