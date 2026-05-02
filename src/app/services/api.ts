import { ParkingData, ParkingSpot } from '@/app/types/parking';
import { supabase } from '@/utils/supabase/client';


export const fetchParkingData = async (): Promise<ParkingData> => {
  try {
    // Fetch from normalized parking_spots table
    const { data: spots, error } = await supabase
      .from('parking_spots')
      .select('*')
      .order('area, spot_id');

    if (error) throw error;

    const parkingSpots: ParkingSpot[] = (spots || []).map((spot: any) => ({
      id: spot.id,
      occupied: spot.occupied,
      lat: spot.lat,
      lon: spot.lon,
      name: spot.name || `${spot.area} Spot ${spot.spot_id}`,
      area: spot.area,
      timestamp: spot.timestamp,
      updated_at: spot.updated_at,
    }));

    const occupiedCount = parkingSpots.filter(s => s.occupied === 1).length;
    const availableCount = parkingSpots.filter(s => s.occupied === 0).length;

    // Use updated_at (set by Supabase trigger on every backend write) as the
    // authoritative "last data push" time. Falls back to spot.timestamp if needed.
    const latestWriteTime = parkingSpots
      .map(s => s.updated_at ? new Date(s.updated_at).getTime() : (s.timestamp ? new Date(s.timestamp).getTime() : 0))
      .reduce((max, t) => (t > max ? t : max), 0);
    const dataTimestamp = latestWriteTime > 0
      ? new Date(latestWriteTime).toISOString()
      : new Date().toISOString();

    return {
      timestamp: dataTimestamp,
      total_spots: parkingSpots.length,
      occupied_count: occupiedCount,
      available_count: availableCount,
      spots: parkingSpots,
    };
  } catch (error) {
    console.error('Error fetching parking data:', error);
    throw error;
  }
};
