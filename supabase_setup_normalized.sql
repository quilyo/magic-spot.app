-- ============================================
-- Magic Spot Parking - Normalized Schema Setup
-- ============================================
-- This schema reads from your existing parking_status table
-- and creates normalized spot records that the frontend can easily query
-- 
-- Run this SQL in your Supabase SQL Editor

-- 1. Create normalized parking_spots table
CREATE TABLE IF NOT EXISTS parking_spots (
  id TEXT PRIMARY KEY,
  spot_id INTEGER NOT NULL,
  area TEXT NOT NULL,
  lat FLOAT NOT NULL,
  lon FLOAT NOT NULL,
  occupied INTEGER DEFAULT 0 CHECK (occupied IN (0, 1)),
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_parking_spots_occupied ON parking_spots(occupied);
CREATE INDEX IF NOT EXISTS idx_parking_spots_area ON parking_spots(area);
CREATE INDEX IF NOT EXISTS idx_parking_spots_spot_id ON parking_spots(spot_id, area);

-- 3. Enable Row Level Security
ALTER TABLE parking_spots ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS Policies

-- Policy: Everyone can view parking spots (no auth required for map)
CREATE POLICY "Anyone can view spots" 
ON parking_spots 
FOR SELECT 
USING (true);

-- Policy: Only authenticated users can update spots
CREATE POLICY "Authenticated users can update spots" 
ON parking_spots 
FOR UPDATE 
TO authenticated
USING (true)
WITH CHECK (true);

-- 5. Create function to expand JSON and sync parking spots
-- This is a regular function that both the trigger and manual sync can call
CREATE OR REPLACE FUNCTION expand_parking_status_to_spots(p_areas JSONB, p_timestamp TIMESTAMPTZ)
RETURNS void AS $$
BEGIN
  -- Delete old spots before repopulating
  DELETE FROM parking_spots;
  
  -- Insert expanded spots from JSON
  INSERT INTO parking_spots (id, spot_id, area, lat, lon, occupied, timestamp, updated_at)
  SELECT
    area_name || '_' || (spot_obj->>'spot_id'),
    (spot_obj->>'spot_id')::INTEGER,
    area_name,
    (spot_obj->>'lat')::FLOAT,
    (spot_obj->>'lon')::FLOAT,
    (spot_obj->>'occupied')::INTEGER,
    p_timestamp,
    NOW()
  FROM jsonb_each(p_areas) AS areas(area_name, area_data)
  CROSS JOIN LATERAL jsonb_array_elements(area_data->'spots') AS spots(spot_obj);
END;
$$ LANGUAGE plpgsql;

-- 6. Create trigger function that calls the sync function
CREATE OR REPLACE FUNCTION sync_parking_spots_on_update()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM expand_parking_status_to_spots(NEW.areas, NEW.timestamp);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Create trigger to sync parking_status changes to parking_spots
DROP TRIGGER IF EXISTS sync_parking_status_trigger ON parking_status;
CREATE TRIGGER sync_parking_status_trigger
  AFTER INSERT OR UPDATE ON parking_status
  FOR EACH ROW
  EXECUTE FUNCTION sync_parking_spots_on_update();

-- 8. Manual sync function (can be called directly to resync)
CREATE OR REPLACE FUNCTION sync_parking_spots_manual()
RETURNS void AS $$
DECLARE
  latest_record parking_status;
BEGIN
  -- Get the latest parking_status record
  SELECT * INTO latest_record FROM parking_status 
  ORDER BY timestamp DESC LIMIT 1;
  
  -- Call the sync function if data exists
  IF latest_record IS NOT NULL THEN
    PERFORM expand_parking_status_to_spots(latest_record.areas, latest_record.timestamp);
  END IF;
END;
$$ LANGUAGE plpgsql;

-- 9. Run manual sync to populate from existing data
SELECT sync_parking_spots_manual();

-- ============================================
-- Setup Complete!
-- ============================================
-- Now when your backend updates the parking_status table,
-- the parking_spots table will automatically sync!
-- 
-- Your frontend queries parking_spots normally:
-- SELECT * FROM parking_spots WHERE area = 'Area1'
-- 
-- To manually resync if needed, run:
-- SELECT sync_parking_spots_manual();
