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
    }));

    const occupiedCount = parkingSpots.filter(s => s.occupied === 1).length;
    const availableCount = parkingSpots.filter(s => s.occupied === 0).length;

    return {
      timestamp: new Date().toISOString(),
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
