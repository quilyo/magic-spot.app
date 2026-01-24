import { ParkingData, ParkingSpot } from '../types/parking';
import { supabase } from '../utils/supabase/client';

export const fetchParkingData = async (): Promise<ParkingData> => {
  try {
    // Fetch from normalized parking_spots table
    // This table is automatically synced from parking_status JSON by a database trigger
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

export const updateSpotName = async (id: string, name: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('parking_spots')
      .update({ name, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error updating spot name:', error);
    throw error;
  }
};

export const updateSpotStatus = async (id: string, occupied: number): Promise<void> => {
  try {
    const { error } = await supabase
      .from('parking_spots')
      .update({ 
        occupied, 
        timestamp: new Date().toISOString(),
        updated_at: new Date().toISOString() 
      })
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error updating spot status:', error);
    throw error;
  }
};

export const addSpot = async (id: string, lat: number, lon: number, name: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('parking_spots')
      .insert({
        id,
        name,
        lat,
        lon,
        occupied: 0,
        timestamp: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (error) throw error;
  } catch (error) {
    console.error('Error adding spot:', error);
    throw error;
  }
};

export const removeSpot = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('parking_spots')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error removing spot:', error);
    throw error;
  }
};