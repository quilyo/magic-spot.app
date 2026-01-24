import { useEffect, useRef, useState } from 'react';
import { ParkingSpot } from '../types/parking';
import { Navigation, X } from 'lucide-react';
import { Button } from './ui/button';

interface ParkingMapProps {
  spots: ParkingSpot[];
  onSpotClick?: (spot: ParkingSpot) => void;
  availableCount?: number;
  occupiedCount?: number;
  resetTrigger?: number;
  isPreviewMode?: boolean;
}

export function ParkingMap({ spots, onSpotClick, availableCount = 0, occupiedCount = 0, resetTrigger = 0, isPreviewMode = false }: ParkingMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const markersRef = useRef<Map<string, any>>(new Map());
  const [selectedSpot, setSelectedSpot] = useState<ParkingSpot | null>(null);
  const [leafletLoaded, setLeafletLoaded] = useState(false);

  // Update selected spot when spots data changes (to show current status in popup)
  useEffect(() => {
    if (selectedSpot) {
      const updatedSpot = spots.find(s => s.id === selectedSpot.id);
      if (updatedSpot) {
        setSelectedSpot(updatedSpot);
      }
    }
  }, [spots]);

  // Load Leaflet from CDN
  useEffect(() => {
    // Check if already loaded
    if ((window as any).L) {
      setLeafletLoaded(true);
      return;
    }

    // Load CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
    link.crossOrigin = '';
    document.head.appendChild(link);

    // Load JS
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
    script.crossOrigin = '';
    script.onload = () => {
      setLeafletLoaded(true);
    };
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(link);
      document.head.removeChild(script);
    };
  }, []);

  // Initialize map
  useEffect(() => {
    if (!leafletLoaded || !mapRef.current || leafletMapRef.current) return;

    const L = (window as any).L;
    if (!L) return;

    // Calculate initial center
    const avgLat = spots.length > 0 
      ? spots.reduce((sum, spot) => sum + spot.lat, 0) / spots.length 
      : 40.7923;
    const avgLon = spots.length > 0 
      ? spots.reduce((sum, spot) => sum + spot.lon, 0) / spots.length 
      : -73.9369;

    // Reduced delay for faster initial render
    setTimeout(() => {
      if (!mapRef.current || leafletMapRef.current) return;

      try {
        // Create map
        const map = L.map(mapRef.current, {
          center: [avgLat, avgLon],
          zoom: 19,
          zoomControl: true,
          scrollWheelZoom: true,
          dragging: true,
          touchZoom: true,
          doubleClickZoom: true,
          boxZoom: true,
          tap: true,
          tapTolerance: 15,
        });

        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 20,
        }).addTo(map);

        leafletMapRef.current = map;

        // Immediate size invalidation
        map.invalidateSize();
      } catch (error) {
        console.error('Error initializing map:', error);
      }
    }, 50); // Reduced from 100ms to 50ms

    return () => {
      if (leafletMapRef.current) {
        try {
          leafletMapRef.current.remove();
        } catch (error) {
          console.error('Error removing map:', error);
        }
        leafletMapRef.current = null;
      }
    };
  }, [leafletLoaded, spots.length]);

  // Update markers when spots change (optimized to only update changed spots)
  useEffect(() => {
    if (!leafletLoaded) return;
    
    const L = (window as any).L;
    const map = leafletMapRef.current;
    if (!L || !map) return;

    const currentMarkers = markersRef.current;
    const newSpotIds = new Set(spots.map(s => s.id));

    // Remove markers for spots that no longer exist
    currentMarkers.forEach((marker, spotId) => {
      if (!newSpotIds.has(spotId)) {
        marker.remove();
        currentMarkers.delete(spotId);
      }
    });

    // Add or update markers with aligned positions and parking bay style
    spots.forEach(spot => {
      const existingMarker = currentMarkers.get(spot.id);
      const color = spot.occupied === 1 ? '#ef4444' : '#22c55e';
      const borderColor = spot.occupied === 1 ? '#991b1b' : '#166534';

      if (existingMarker) {
        // Remove and recreate marker if position or status changed
        existingMarker.remove();
        currentMarkers.delete(spot.id);
      }

      // Create circular marker
      const marker = L.circleMarker([spot.lat, spot.lon], {
        radius: 10,
        fillColor: color,
        color: borderColor,
        weight: 2,
        opacity: 1,
        fillOpacity: 0.9,
      });

      // Store spot ID, not the spot object, to avoid closure issues
      const spotId = spot.id;
      marker.on('click', () => {
        // Find the current spot data from the spots array
        const currentSpot = spots.find(s => s.id === spotId);
        if (currentSpot) {
          setSelectedSpot(currentSpot);
          if (onSpotClick) onSpotClick(currentSpot);
        }
      });

      marker.addTo(map);
      currentMarkers.set(spot.id, marker);
    });
  }, [leafletLoaded, spots, onSpotClick]);

  // Handle reset trigger (from logo click)
  useEffect(() => {
    if (!leafletLoaded) return;
    
    if (resetTrigger > 0 && leafletMapRef.current && spots.length > 0) {
      const avgLat = spots.reduce((sum, spot) => sum + spot.lat, 0) / spots.length;
      const avgLon = spots.reduce((sum, spot) => sum + spot.lon, 0) / spots.length;
      
      leafletMapRef.current.setView([avgLat, avgLon], 19);
    }
  }, [leafletLoaded, resetTrigger, spots]);

  // Handle window resize to fix rendering issues
  useEffect(() => {
    if (!leafletLoaded || !leafletMapRef.current) return;

    const handleResize = () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.invalidateSize();
      }
    };

    window.addEventListener('resize', handleResize);
    
    // Trigger initial resize fix
    handleResize();
    
    // One additional check after a short delay to ensure proper rendering
    const timeout = setTimeout(handleResize, 200);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeout);
    };
  }, [leafletLoaded]);

  if (!leafletLoaded) {
    return (
      <div className="w-full h-full rounded-lg overflow-hidden border-2 border-gray-300 shadow-lg relative bg-gray-200 flex items-center justify-center" style={{ minHeight: '500px' }}>
        <div className="text-gray-600">Loading map...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full rounded-lg overflow-hidden border-2 border-gray-300 shadow-lg relative" style={{ minHeight: '500px', height: '100%' }}>
      {/* Leaflet Map Container */}
      <div ref={mapRef} className="absolute inset-0" style={{ width: '100%', height: '100%' }} />

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 border border-gray-300 z-[1000] pointer-events-auto">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path
                d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"
                fill="#22c55e"
                stroke="#166534"
                strokeWidth="0.5"
              />
            </svg>
            <span className="text-sm text-gray-700 font-medium">Available: {availableCount}</span>
          </div>
          <div className="flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path
                d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"
                fill="#ef4444"
                stroke="#991b1b"
                strokeWidth="0.5"
              />
            </svg>
            <span className="text-sm text-gray-700 font-medium">Occupied: {occupiedCount}</span>
          </div>
        </div>
      </div>

      {/* Spot Details Popup */}
      {selectedSpot && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-2xl border-2 border-gray-300 p-4 z-[1001] min-w-64 pointer-events-auto">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-gray-900 font-semibold">
              {(selectedSpot.name || `Spot ${selectedSpot.id}`).replace(/Area(\d+)/g, 'A$1')}
            </h3>
            <button
              onClick={() => setSelectedSpot(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div
            className={`text-sm font-medium mb-3 ${
              selectedSpot.occupied === 1 ? 'text-red-600' : 'text-gray-900'
            }`}
          >
            {selectedSpot.occupied === 1 ? (
              <span className="text-red-600">🔴 Occupied</span>
            ) : (() => {
              if (selectedSpot.timestamp) {
                const now = new Date().getTime();
                const spotTime = new Date(selectedSpot.timestamp).getTime();
                const minutesAvailable = Math.floor((now - spotTime) / (1000 * 60));
                
                if (minutesAvailable >= 5) {
                  return (
                    <>
                      <span className="text-green-600">🟢 Available</span>{' '}
                      <span className="text-gray-900">+5 minutes ago</span>
                    </>
                  );
                } else if (minutesAvailable > 0) {
                  return (
                    <>
                      <span className="text-green-600">🟢 Available</span>{' '}
                      <span className="text-gray-900">{minutesAvailable} minute{minutesAvailable === 1 ? '' : 's'}</span>
                    </>
                  );
                } else {
                  return (
                    <>
                      <span className="text-green-600">🟢 Available</span>{' '}
                      <span className="text-gray-900">&lt;1 minute</span>
                    </>
                  );
                }
              }
              return <span className="text-green-600">🟢 Available</span>;
            })()}
          </div>
          <Button
            onClick={() => {
              const url = `https://www.google.com/maps/dir/?api=1&destination=${selectedSpot.lat},${selectedSpot.lon}`;
              window.open(url, '_blank');
            }}
            className="w-full bg-blue-600 text-white hover:bg-blue-700 font-medium shadow"
          >
            <Navigation className="w-4 h-4 mr-2" />
            Navigate to Spot
          </Button>
        </div>
      )}
    </div>
  );
}