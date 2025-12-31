
-- 1. Create Reviews Table
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    dish_id UUID REFERENCES public.dishes(id) ON DELETE CASCADE NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Add Columns to Dishes Table
ALTER TABLE public.dishes ADD COLUMN IF NOT EXISTS rating NUMERIC(3, 1) DEFAULT 0;
ALTER TABLE public.dishes ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;

-- 3. Enable RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- 4. Policies
DROP POLICY IF EXISTS "Public reviews are viewable by everyone" ON public.reviews;
CREATE POLICY "Public reviews are viewable by everyone" ON public.reviews FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create reviews" ON public.reviews;
CREATE POLICY "Users can create reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 5. Function to update dish rating automatically
CREATE OR REPLACE FUNCTION update_dish_rating()
RETURNS TRIGGER AS $$
DECLARE
    target_dish_id UUID;
BEGIN
    IF (TG_OP = 'DELETE') THEN
        target_dish_id := OLD.dish_id;
    ELSE
        target_dish_id := NEW.dish_id;
    END IF;

    UPDATE public.dishes
    SET 
        rating = (SELECT COALESCE(ROUND(AVG(rating), 1), 0) FROM public.reviews WHERE dish_id = target_dish_id),
        review_count = (SELECT COUNT(*) FROM public.reviews WHERE dish_id = target_dish_id)
    WHERE id = target_dish_id;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 6. Trigger
DROP TRIGGER IF EXISTS on_review_change ON public.reviews;
CREATE TRIGGER on_review_change
AFTER INSERT OR UPDATE OR DELETE ON public.reviews
FOR EACH ROW EXECUTE FUNCTION update_dish_rating();
