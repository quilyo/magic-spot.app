import { ParkingData } from '../types/parking';
import { getAuthHeaders } from './auth';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const fetchParkingData = async (): Promise<ParkingData> => {
  try {
    const response = await fetch(`${API_BASE}/parking-data`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch parking data: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching parking data:', error);
    throw error;
  }
};

export const updateSpotName = async (id: string, name: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE}/spots/${id}/name`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ name }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update spot name');
    }
  } catch (error) {
    console.error('Error updating spot name:', error);
    throw error;
  }
};

export const addSpot = async (id: string, lat: number, lon: number, name: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE}/spots`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ id, name, lat, lon }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to add spot');
    }
  } catch (error) {
    console.error('Error adding spot:', error);
    throw error;
  }
};

export const removeSpot = async (id: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE}/spots/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to remove spot');
    }
  } catch (error) {
    console.error('Error removing spot:', error);
    throw error;
  }
};