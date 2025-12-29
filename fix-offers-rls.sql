-- Drop existing policies on offers table to avoid conflicts
DROP POLICY IF EXISTS "Enable read access for all to active offers" ON public.offers;
DROP POLICY IF EXISTS "Enable read access for staff to all offers" ON public.offers;
DROP POLICY IF EXISTS "Enable write access for staff" ON public.offers;
DROP POLICY IF EXISTS "Public Read Active Offers" ON public.offers;
DROP POLICY IF EXISTS "Staff Read All Offers" ON public.offers;
DROP POLICY IF EXISTS "Staff Manage Offers" ON public.offers;

-- Ensure RLS is enabled
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;

-- 1. Public Read (Anyone can see active offers)
CREATE POLICY "Public Read Active Offers"
ON public.offers FOR SELECT
USING (is_active = true);

-- 2. Staff Manage (Admins/Managers can Insert, Update, Delete)
CREATE POLICY "Staff Manage Offers"
ON public.offers FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('ADMIN', 'MANAGER')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('ADMIN', 'MANAGER')
  )
);
