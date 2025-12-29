-- Attempt to create the bucket (if this fails, create it in the UI)
INSERT INTO storage.buckets (id, name, public)
VALUES ('offer-images', 'offer-images', true)
ON CONFLICT (id) DO NOTHING;

-- Policies --
-- 1. Public Access
CREATE POLICY "Public Access Offer Images"
ON storage.objects FOR SELECT
USING ( bucket_id = 'offer-images' );

-- 2. Staff Upload
CREATE POLICY "Staff Upload Offer Images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'offer-images' );

-- 3. Staff Update
CREATE POLICY "Staff Update Offer Images"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'offer-images' );

-- 4. Staff Delete
CREATE POLICY "Staff Delete Offer Images"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'offer-images' );
