import { ParkingData } from '../types/parking';

// Mock data based on the user's example
const mockParkingData: ParkingData = {
  timestamp: "2025-11-23 13:08:57",
  total_spots: 13,
  occupied_count: 13,
  available_count: 0,
  spots: [
    {
      id: "1",
      occupied: 1,
      lat: 40.79232885665191,
      lon: -73.93685182737023,
      name: "Spot 1"
    },
    {
      id: "2",
      occupied: 1,
      lat: 40.79211765767187,
      lon: -73.93700783246611,
      name: "Spot 2"
    },
    {
      id: "3",
      occupied: 1,
      lat: 40.79207237412739,
      lon: -73.93705240043813,
      name: "Spot 3"
    },
    {
      id: "4",
      occupied: 1,
      lat: 40.79201079175239,
      lon: -73.93709646095112,
      name: "Spot 4"
    },
    {
      id: "5",
      occupied: 1,
      lat: 40.79193267236509,
      lon: -73.93714925524402,
      name: "Spot 5"
    },
    {
      id: "6",
      occupied: 1,
      lat: 40.79186792000575,
      lon: -73.93719199522323,
      name: "Spot 6"
    },
    {
      id: "7",
      occupied: 1,
      lat: 40.79230877191897,
      lon: -73.93680883512326,
      name: "Spot 7"
    },
    {
      id: "8",
      occupied: 1,
      lat: 40.79222388072905,
      lon: -73.93686033139463,
      name: "Spot 8"
    },
    {
      id: "9",
      occupied: 1,
      lat: 40.79216012324977,
      lon: -73.93690252711644,
      name: "Spot 9"
    },
    {
      id: "10",
      occupied: 1,
      lat: 40.79209625021385,
      lon: -73.93696128590251,
      name: "Spot 10"
    },
    {
      id: "11",
      occupied: 1,
      lat: 40.79205038912318,
      lon: -73.93699471735779,
      name: "Spot 11"
    },
    {
      id: "12",
      occupied: 1,
      lat: 40.79198688693215,
      lon: -73.93704127674604,
      name: "Spot 12"
    },
    {
      id: "13",
      occupied: 1,
      lat: 40.79191036461167,
      lon: -73.9370961026802,
      name: "Spot 13"
    }
  ]
};

// Simulate API calls
export const fetchParkingData = async (): Promise<ParkingData> => {
  // In production, replace with: fetch('YOUR_API_ENDPOINT')
  return new Promise((resolve) => {
    setTimeout(() => {
      // Randomly update some spots for demo purposes
      const updatedSpots = mockParkingData.spots.map(spot => ({
        ...spot,
        occupied: Math.random() > 0.5 ? 1 : 0
      }));
      
      const occupied = updatedSpots.filter(s => s.occupied === 1).length;
      const available = updatedSpots.filter(s => s.occupied === 0).length;
      
      resolve({
        ...mockParkingData,
        timestamp: new Date().toISOString(),
        occupied_count: occupied,
        available_count: available,
        spots: updatedSpots
      });
    }, 500);
  });
};

export const updateSpotName = async (id: string, name: string): Promise<void> => {
  // Mock implementation - in production, send to API
  const spot = mockParkingData.spots.find(s => s.id === id);
  if (spot) {
    spot.name = name;
  }
};

export const addSpot = async (lat: number, lon: number, name: string): Promise<void> => {
  // Mock implementation - in production, send to API
  const newId = (mockParkingData.spots.length + 1).toString();
  mockParkingData.spots.push({
    id: newId,
    occupied: 0,
    lat,
    lon,
    name
  });
  mockParkingData.total_spots++;
};

export const removeSpot = async (id: string): Promise<void> => {
  // Mock implementation - in production, send to API
  const index = mockParkingData.spots.findIndex(s => s.id === id);
  if (index !== -1) {
    mockParkingData.spots.splice(index, 1);
    mockParkingData.total_spots--;
  }
};
