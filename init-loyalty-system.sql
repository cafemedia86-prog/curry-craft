-- Complete Loyalty System Initialization Script
-- Run this in Supabase SQL Editor to set up everything

-- Step 1: Ensure loyalty_points column exists in profiles
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'loyalty_points'
    ) THEN 
        ALTER TABLE public.profiles ADD COLUMN loyalty_points INT DEFAULT 0; 
    END IF; 
END $$;

-- Step 2: Create loyalty_settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.loyalty_settings (
    id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    points_per_rupee NUMERIC DEFAULT 0.1,
    min_redemption_points INT DEFAULT 100,
    redemption_rate NUMERIC DEFAULT 1.0,
    tiers JSONB DEFAULT '[
        {"name": "Bronze", "minPoints": 0, "multiplier": 1}, 
        {"name": "Silver", "minPoints": 500, "multiplier": 1.1}, 
        {"name": "Gold", "minPoints": 2000, "multiplier": 1.25}
    ]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 3: Add redemption_rate column if it doesn't exist (for existing tables)
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

-- Step 4: Insert default settings (will not overwrite if exists)
INSERT INTO public.loyalty_settings (id, points_per_rupee, min_redemption_points, redemption_rate) 
VALUES (1, 0.1, 100, 1.0) 
ON CONFLICT (id) DO UPDATE 
SET redemption_rate = COALESCE(loyalty_settings.redemption_rate, 1.0);

-- Step 5: Enable RLS
ALTER TABLE public.loyalty_settings ENABLE ROW LEVEL SECURITY;

-- Step 6: Drop and recreate policies
DROP POLICY IF EXISTS "Read Loyalty Settings" ON public.loyalty_settings;
CREATE POLICY "Read Loyalty Settings" 
ON public.loyalty_settings FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Manage Loyalty Settings" ON public.loyalty_settings;
CREATE POLICY "Manage Loyalty Settings" 
ON public.loyalty_settings FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role IN ('ADMIN', 'MANAGER')
    )
);

-- Verify the setup
SELECT * FROM public.loyalty_settings;
