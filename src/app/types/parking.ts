export interface ParkingSpot {
  id: string;
  occupied: number; // 1 for occupied, 0 for available
  lat: number;
  lon: number;
  name?: string;
  area?: string; // Area name that the spot belongs to
  timestamp?: string; // When the spot status last changed
}

export interface ParkingData {
  timestamp: string;
  total_spots: number;
  occupied_count: number;
  available_count: number;
  spots: ParkingSpot[];
}

export type UserRole = 'admin' | 'user';
