-- Add delivery_address column to orders table if it doesn't exist
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS delivery_address TEXT;

-- Update existing orders to have a default value if needed
UPDATE public.orders 
SET delivery_address = 'Self Pickup' 
WHERE delivery_address IS NULL;
