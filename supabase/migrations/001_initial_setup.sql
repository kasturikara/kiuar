-- Supabase SQL functions for QR Code application
-- Run these in Supabase SQL Editor

-- Function to increment scan count on qr_items table
CREATE OR REPLACE FUNCTION increment_scan_count(item_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.qr_items
  SET scan_count = scan_count + 1
  WHERE id = item_id;
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security (RLS) for public access
ALTER TABLE public.qr_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_scans ENABLE ROW LEVEL SECURITY;

-- Policies for public read/write access (adjust as needed)
-- qr_batches policies
CREATE POLICY "Allow public read access on qr_batches" ON public.qr_batches
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert on qr_batches" ON public.qr_batches
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update on qr_batches" ON public.qr_batches
  FOR UPDATE USING (true);

-- qr_items policies
CREATE POLICY "Allow public read access on qr_items" ON public.qr_items
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert on qr_items" ON public.qr_items
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update on qr_items" ON public.qr_items
  FOR UPDATE USING (true);

-- qr_scans policies
CREATE POLICY "Allow public read access on qr_scans" ON public.qr_scans
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert on qr_scans" ON public.qr_scans
  FOR INSERT WITH CHECK (true);

-- Index for faster short_code lookups
CREATE INDEX IF NOT EXISTS idx_qr_items_short_code ON public.qr_items(short_code);

-- Index for faster batch lookups
CREATE INDEX IF NOT EXISTS idx_qr_items_batch_id ON public.qr_items(batch_id);

-- Index for faster scan lookups by item
CREATE INDEX IF NOT EXISTS idx_qr_scans_qr_item_id ON public.qr_scans(qr_item_id);
