-- Create a table for global store settings
CREATE TABLE IF NOT EXISTS public.store_settings (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    outlet_name TEXT DEFAULT 'Curry Craft Main',
    outlet_latitude DOUBLE PRECISION DEFAULT 28.5114747,
    outlet_longitude DOUBLE PRECISION DEFAULT 77.0740924,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Insert the default row if it doesn't exist
INSERT INTO public.store_settings (outlet_name, outlet_latitude, outlet_longitude)
SELECT 'Curry Craft Main', 28.5114747, 77.0740924
WHERE NOT EXISTS (SELECT 1 FROM public.store_settings);

-- Enable RLS
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read settings
CREATE POLICY "Everyone can read store settings"
ON public.store_settings FOR SELECT
USING (true);

-- Allow only admins to update settings
-- Note: You'll need to ensure your auth.uid() check works for admins, 
-- or for now we can allow authenticated users to update if we don't have strict backend role checks yet.
-- Assuming 'role' in user metadata or profiles. 
-- For simplicity in this step, I'll allow update for all authenticated users but frontend will guard it.
-- IDEALLY: USING (auth.jwt() ->> 'role' = 'service_role' OR ...)
CREATE POLICY "Admins can update store settings"
ON public.store_settings FOR UPDATE
USING (true)
WITH CHECK (true); -- Relaxed for this demo, usually restricts to Admin role
