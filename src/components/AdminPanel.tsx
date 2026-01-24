import { useState } from 'react';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ParkingSpot } from '../types/parking';
import { Card } from './ui/card';

interface AdminPanelProps {
  spots: ParkingSpot[];
  onUpdateSpotName: (id: string, name: string) => void;
  onAddSpot: (id: string, lat: number, lon: number, name: string) => void;
  onRemoveSpot: (id: string) => void;
}

export function AdminPanel({ spots, onUpdateSpotName, onAddSpot, onRemoveSpot }: AdminPanelProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSpot, setNewSpot] = useState({ lat: '', lon: '', name: '' });

  const handleSaveEdit = (id: string) => {
    onUpdateSpotName(id, editName);
    setEditingId(null);
    setEditName('');
  };

  const handleStartEdit = (spot: ParkingSpot) => {
    setEditingId(spot.id);
    setEditName(spot.name || `Spot ${spot.id}`);
  };

  const handleAddSpot = () => {
    const lat = parseFloat(newSpot.lat);
    const lon = parseFloat(newSpot.lon);
    
    if (!isNaN(lat) && !isNaN(lon) && newSpot.name) {
      // Generate new ID based on existing spots
      const maxId = Math.max(...spots.map(s => parseInt(s.id) || 0), 0);
      const newId = (maxId + 1).toString();
      
      onAddSpot(newId, lat, lon, newSpot.name);
      setNewSpot({ lat: '', lon: '', name: '' });
      setShowAddForm(false);
    }
  };

  return (
    <div className="bg-gray-50 border-l-2 border-gray-300 p-6 overflow-y-auto shadow-lg">
      <div className="mb-6">
        <h2 className="text-gray-900 mb-4">Developer Panel</h2>
        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          className="w-full bg-gray-900 text-white hover:bg-gray-800 font-medium shadow"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Spot
        </Button>
      </div>

      {showAddForm && (
        <Card className="p-4 mb-6 bg-white border-2 border-gray-900 shadow">
          <h3 className="text-gray-900 mb-3">New Parking Spot</h3>
          <div className="space-y-3">
            <Input
              placeholder="Spot Name"
              value={newSpot.name}
              onChange={(e) => setNewSpot({ ...newSpot, name: e.target.value })}
              className="bg-white text-gray-900 border-gray-300"
            />
            <Input
              placeholder="Latitude (e.g., 40.79232885665191)"
              value={newSpot.lat}
              onChange={(e) => setNewSpot({ ...newSpot, lat: e.target.value })}
              className="bg-white text-gray-900 border-gray-300"
            />
            <Input
              placeholder="Longitude (e.g., -73.93685182737023)"
              value={newSpot.lon}
              onChange={(e) => setNewSpot({ ...newSpot, lon: e.target.value })}
              className="bg-white text-gray-900 border-gray-300"
            />
            <div className="flex gap-2">
              <Button
                onClick={handleAddSpot}
                className="flex-1 bg-gray-900 text-white hover:bg-gray-800 font-medium shadow"
              >
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
              <Button
                onClick={() => setShowAddForm(false)}
                variant="outline"
                className="flex-1 text-gray-900 border-gray-900 hover:bg-gray-100"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      <div className="space-y-3">
        <h3 className="text-gray-900 mb-3">Manage Spots ({spots.length})</h3>
        {spots.map((spot) => (
          <Card key={spot.id} className="p-3 bg-white border border-gray-300 shadow">
            {editingId === spot.id ? (
              <div className="space-y-2">
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="bg-white text-gray-900 border-gray-300"
                />
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleSaveEdit(spot.id)}
                    size="sm"
                    className="flex-1 bg-gray-900 text-white hover:bg-gray-800 font-medium"
                  >
                    <Save className="w-3 h-3 mr-1" />
                    Save
                  </Button>
                  <Button
                    onClick={() => setEditingId(null)}
                    size="sm"
                    variant="outline"
                    className="flex-1 text-gray-900 border-gray-900 hover:bg-gray-100"
                  >
                    <X className="w-3 h-3 mr-1" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="text-gray-900 font-medium">{spot.name || `Spot ${spot.id}`}</div>
                  <div className="text-xs text-gray-600">
                    {spot.lat.toFixed(8)}, {spot.lon.toFixed(8)}
                  </div>
                  <div className={`text-xs font-medium ${spot.occupied === 1 ? 'text-red-600' : 'text-green-600'}`}>
                    {spot.occupied === 1 ? 'Occupied' : 'Available'}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleStartEdit(spot)}
                    size="sm"
                    variant="outline"
                    className="text-gray-900 border-gray-900 hover:bg-gray-100"
                  >
                    <Edit2 className="w-3 h-3" />
                  </Button>
                  <Button
                    onClick={() => onRemoveSpot(spot.id)}
                    size="sm"
                    variant="outline"
                    className="text-red-600 border-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}