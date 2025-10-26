-- Create storage bucket for PDF reports
INSERT INTO storage.buckets (id, name, public)
VALUES ('reports', 'reports', true);

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read reports (public bucket)
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'reports');

-- Policy: Authenticated users can upload reports
CREATE POLICY "Authenticated users can upload reports"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'reports' AND auth.role() = 'authenticated');

-- Policy: Authenticated users can update their reports
CREATE POLICY "Authenticated users can update reports"
ON storage.objects FOR UPDATE
USING (bucket_id = 'reports' AND auth.role() = 'authenticated');

-- Policy: Authenticated users can delete reports
CREATE POLICY "Authenticated users can delete reports"
ON storage.objects FOR DELETE
USING (bucket_id = 'reports' AND auth.role() = 'authenticated');
