-- Create the offers table
CREATE TABLE IF NOT EXISTS public.offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    subtitle TEXT,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('PERCENTAGE', 'FIXED')),
    discount_value NUMERIC NOT NULL,
    min_order_value NUMERIC DEFAULT 0,
    max_discount_value NUMERIC,
    valid_from TIMESTAMPTZ DEFAULT now(),
    valid_until TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;

-- Policies
-- Everyone can read active offers (for the home page banners)
CREATE POLICY "Enable read access for all to active offers" ON public.offers
    FOR SELECT USING (is_active = true AND (valid_until IS NULL OR valid_until > now()));

-- Admins and Managers can read all offers
CREATE POLICY "Enable read access for staff to all offers" ON public.offers
    FOR SELECT TO authenticated
    USING ((auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' IN ('ADMIN', 'MANAGER'));

-- Admins and Managers can insert/update/delete offers
CREATE POLICY "Enable write access for staff" ON public.offers
    FOR ALL TO authenticated
    USING ((auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' IN ('ADMIN', 'MANAGER'))
    WITH CHECK ((auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' IN ('ADMIN', 'MANAGER'));

-- Add 'applied_offer_code' to orders table to track usage (optional but good)
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS applied_offer_code TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS discount_amount NUMERIC DEFAULT 0;

-- Function to validate and apply a coupon
CREATE OR REPLACE FUNCTION public.validate_coupon(
    coupon_code TEXT,
    cart_total NUMERIC
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    offer_record RECORD;
    calculated_discount NUMERIC;
BEGIN
    -- Find the offer
    SELECT * INTO offer_record FROM public.offers 
    WHERE code = coupon_code 
    AND is_active = true 
    AND (valid_until IS NULL OR valid_until > now());

    IF NOT FOUND THEN
        RETURN jsonb_build_object('valid', false, 'message', 'Invalid or expired coupon code');
    END IF;

    -- Check min order value
    IF cart_total < offer_record.min_order_value THEN
        RETURN jsonb_build_object('valid', false, 'message', 'Minimum order value of ₹' || offer_record.min_order_value || ' not met');
    END IF;

    -- Calculate discount
    IF offer_record.discount_type = 'PERCENTAGE' THEN
        calculated_discount := (cart_total * offer_record.discount_value) / 100;
        -- Apply cap if exists
        IF offer_record.max_discount_value IS NOT NULL AND calculated_discount > offer_record.max_discount_value THEN
            calculated_discount := offer_record.max_discount_value;
        END IF;
    ELSE
        calculated_discount := offer_record.discount_value;
    END IF;

    -- Ensure discount doesn't exceed total (unlikely but safe)
    IF calculated_discount > cart_total THEN
        calculated_discount := cart_total;
    END IF;

    RETURN jsonb_build_object(
        'valid', true, 
        'discount_amount', calculated_discount,
        'message', 'Coupon applied successfully!',
        'code', offer_record.code,
        'type', offer_record.discount_type
    );
END;
$$;
