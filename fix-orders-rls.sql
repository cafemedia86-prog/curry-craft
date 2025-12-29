-- Fix RLS Policies for Orders and Profile Sync

-- 1. Ensure Orders Table allows INSERTs for authenticated users
DROP POLICY IF EXISTS "Users can insert their own orders" ON public.orders;

CREATE POLICY "Users can insert their own orders"
ON public.orders FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 2. Ensure Profiles are synced correctly (if missing)
-- This function ensures that if a user exists in auth.users but not in public.profiles, they get created.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', COALESCE(new.raw_user_meta_data->>'role', 'USER'))
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-attach trigger if needed (idempotent)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
