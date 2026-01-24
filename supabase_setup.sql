-- ============================================
-- Magic Spot Parking - Supabase Database Setup
-- ============================================
-- Run this SQL in your Supabase SQL Editor
-- Dashboard > SQL Editor > New Query > Paste this code > Run

-- 1. Create parking_spots table
CREATE TABLE IF NOT EXISTS parking_spots (
  id TEXT PRIMARY KEY,
  name TEXT,
  lat FLOAT NOT NULL,
  lon FLOAT NOT NULL,
  occupied INTEGER DEFAULT 0 CHECK (occupied IN (0, 1)),
  area TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_parking_spots_occupied ON parking_spots(occupied);
CREATE INDEX IF NOT EXISTS idx_parking_spots_area ON parking_spots(area);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE parking_spots ENABLE ROW LEVEL SECURITY;

-- 4. Create policies

-- Policy: Everyone can view parking spots (even unauthenticated users)
CREATE POLICY "Anyone can view spots" 
ON parking_spots 
FOR SELECT 
USING (true);

-- Policy: Only authenticated users can insert spots
CREATE POLICY "Authenticated users can insert spots" 
ON parking_spots 
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- Policy: Only authenticated users can update spots
CREATE POLICY "Authenticated users can update spots" 
ON parking_spots 
FOR UPDATE 
TO authenticated
USING (true)
WITH CHECK (true);

-- Policy: Only authenticated users can delete spots
CREATE POLICY "Authenticated users can delete spots" 
ON parking_spots 
FOR DELETE 
TO authenticated
USING (true);

-- 5. Create function to update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Create trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_parking_spots_updated_at ON parking_spots;
CREATE TRIGGER update_parking_spots_updated_at
    BEFORE UPDATE ON parking_spots
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 7. Insert sample parking spots (optional - remove if you have real data)
INSERT INTO parking_spots (id, name, lat, lon, occupied, area) VALUES
  ('P1', 'Spot 1', 40.7923, -73.9369, 0, 'Area A'),
  ('P2', 'Spot 2', 40.7924, -73.9370, 1, 'Area A'),
  ('P3', 'Spot 3', 40.7925, -73.9371, 0, 'Area A'),
  ('P4', 'Spot 4', 40.7926, -73.9372, 1, 'Area B'),
  ('P5', 'Spot 5', 40.7927, -73.9373, 0, 'Area B')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- Setup Complete!
-- ============================================
-- Next steps:
-- 1. Go to Authentication > Settings
-- 2. Enable Email provider
-- 3. Configure email templates (optional)
-- 4. Test by signing up a user in your app
