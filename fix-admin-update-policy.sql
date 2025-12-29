-- Enable Order Updates for Staff
-- This script adds the missing RLS policy to allow Admins and Managers to update orders.

-- 1. policy for UPDATE
DROP POLICY IF EXISTS "Staff can update orders" ON public.orders;

CREATE POLICY "Staff can update orders"
ON public.orders FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND (profiles.role IN ('ADMIN', 'MANAGER'))
  )
);
