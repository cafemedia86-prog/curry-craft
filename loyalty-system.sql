CREATE TABLE IF NOT EXISTS public.loyalty_settings (
    id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1), -- Singleton enforce
    points_per_rupee NUMERIC DEFAULT 0.1,
    min_redemption_points INT DEFAULT 100,
    redemption_rate NUMERIC DEFAULT 1.0, -- How much ₹ value per point (1.0 = 1 point = ₹1, 0.1 = 100 points = ₹10)
    tiers JSONB DEFAULT '[
        {"name": "Bronze", "minPoints": 0, "multiplier": 1}, 
        {"name": "Silver", "minPoints": 500, "multiplier": 1.1}, 
        {"name": "Gold", "minPoints": 2000, "multiplier": 1.25}
    ]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure profiles has loyalty_points column
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'loyalty_points') THEN 
        ALTER TABLE public.profiles ADD COLUMN loyalty_points INT DEFAULT 0; 
    END IF; 
END $$;

-- Insert default settings if not exists
INSERT INTO public.loyalty_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE public.loyalty_settings ENABLE ROW LEVEL SECURITY;

-- Policies for Settings
DROP POLICY IF EXISTS "Read Loyalty Settings" ON public.loyalty_settings;
CREATE POLICY "Read Loyalty Settings" ON public.loyalty_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Manage Loyalty Settings" ON public.loyalty_settings;
CREATE POLICY "Manage Loyalty Settings" ON public.loyalty_settings FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'MANAGER'))
);

-- 2. Trigger to Award Points on Delivery
CREATE OR REPLACE FUNCTION public.award_loyalty_points()
RETURNS TRIGGER AS $$
DECLARE
    order_total NUMERIC;
    points_to_award NUMERIC;
    setting_record RECORD;
BEGIN
    -- Only award when status changes to 'Delivered'
    IF NEW.status = 'Delivered' AND OLD.status != 'Delivered' THEN
        
        -- Get settings
        SELECT * INTO setting_record FROM public.loyalty_settings WHERE id = 1;
        
        -- Calculate points (Total * Multiplier)
        -- Note: ideally we'd check user tier too, but for simplicity starting with base multiplier
        points_to_award := FLOOR(NEW.total * setting_record.points_per_rupee);

        -- Update user profile
        UPDATE public.profiles
        SET loyalty_points = COALESCE(loyalty_points, 0) + points_to_award
        WHERE id = NEW.user_id;
        
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_order_delivered_award_points ON public.orders;
CREATE TRIGGER on_order_delivered_award_points
AFTER UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.award_loyalty_points();

-- 3. RPC to Redeem Points (Securely called from Checkout)
CREATE OR REPLACE FUNCTION public.redeem_points(points_to_redeem INT)
RETURNS JSONB AS $$
DECLARE
    user_points INT;
    discount_amount NUMERIC;
    current_setting RECORD;
BEGIN
    -- Get current user points
    SELECT loyalty_points INTO user_points FROM public.profiles WHERE id = auth.uid();
    
    IF user_points IS NULL OR user_points < points_to_redeem THEN
        RETURN jsonb_build_object('success', false, 'message', 'Insufficient points');
    END IF;

    -- Get settings
    SELECT * INTO current_setting FROM public.loyalty_settings WHERE id = 1;

    IF points_to_redeem < current_setting.min_redemption_points THEN
         RETURN jsonb_build_object('success', false, 'message', 'Below minimum redemption limit');
    END IF;

    -- Calculate Discount using configurable redemption rate
    discount_amount := points_to_redeem * current_setting.redemption_rate; 

    -- Deduct points
    UPDATE public.profiles 
    SET loyalty_points = loyalty_points - points_to_redeem
    WHERE id = auth.uid();

    RETURN jsonb_build_object('success', true, 'discount', discount_amount);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
