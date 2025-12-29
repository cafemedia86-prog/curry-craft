-- 1. Create Addresses Table
CREATE TABLE IF NOT EXISTS public.addresses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    label TEXT NOT NULL,
    address_line TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable RLS for Addresses
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies for Addresses
CREATE POLICY "Users can only see their own addresses" 
ON public.addresses FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own addresses" 
ON public.addresses FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own addresses" 
ON public.addresses FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own addresses" 
ON public.addresses FOR DELETE 
USING (auth.uid() = user_id);

-- 4. Update Orders Table for Delivery Address
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS delivery_address TEXT DEFAULT 'Takeaway';

-- 5. RLS for Orders (Ensure user privacy but allow staff access)
-- Note: Assuming orders table already exists with basic policies.
-- Let's ensure Managers and Admins can see all orders.

DROP POLICY IF EXISTS "Anyone can view orders" ON public.orders; -- Clean up old general policies if any

CREATE POLICY "Users can view their own orders"
ON public.orders FOR SELECT
USING (
  auth.uid() = user_id OR 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND (profiles.role = 'ADMIN' OR profiles.role = 'MANAGER')
  )
);
