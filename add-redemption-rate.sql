-- Simple migration to add redemption_rate column
-- Run this if you already have the loyalty_settings table

-- Add redemption_rate column if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'loyalty_settings' 
        AND column_name = 'redemption_rate'
    ) THEN 
        ALTER TABLE public.loyalty_settings 
        ADD COLUMN redemption_rate NUMERIC DEFAULT 1.0; 
    END IF; 
END $$;

-- Update existing row to have redemption_rate if it's null
UPDATE public.loyalty_settings 
SET redemption_rate = 1.0 
WHERE redemption_rate IS NULL;
