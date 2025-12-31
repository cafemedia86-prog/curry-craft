-- Add delivery details to orders table
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivery_provider TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS tracking_url TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS courier_details TEXT;

-- Update the Order interface in OrderContext or wherever defined to include these
-- This SQL just updates the DB.
