-- COMPREHENSIVE FIX SCRIPT
-- This script handles:
-- 1. Ensuring the delivery_address column exists
-- 2. Ensuring the orders table exists
-- 3. Resetting RLS policies for orders to be permissive for authenticated users

-- 1. Add column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'delivery_address') THEN
        ALTER TABLE public.orders ADD COLUMN delivery_address TEXT DEFAULT 'Takeaway';
    END IF;
END $$;

-- 2. Explicitly Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 3. DROP ALL EXISTING POLICIES on orders to start fresh
DROP POLICY IF EXISTS "Users can insert their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Anyone can view orders" ON public.orders;

-- 4. Re-create Policies
-- Allow users to insert their own orders
CREATE POLICY "Users can insert their own orders"
ON public.orders FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Allow users to view their own orders, and Admins/Managers to view ALL
CREATE POLICY "Users can view their own orders"
ON public.orders FOR SELECT
USING (
  auth.uid() = user_id OR 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND (profiles.role IN ('ADMIN', 'MANAGER'))
  )
);

-- 5. Grant permissions (just in case)
GRANT ALL ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
