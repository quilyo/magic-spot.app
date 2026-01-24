# MagicSpot External API Integration Guide

## Problem: No Parking Spots Showing on Map

Your web app is working correctly, but it's not receiving any parking data yet. The app expects your **external Python script** to send parking data via HTTP POST requests.

## Solution

Your Python script needs to POST parking data to the MagicSpot server endpoint.

---

## API Endpoint Details

**Endpoint URL:**
```
https://cqkzgzqleulgiufuzjoh.supabase.co/functions/v1/make-server-34bbc245/parking-data
```

**Method:** POST

**Headers:**
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxa3pnenFsZXVsZ2l1ZnV6am9oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5MTEwNTcsImV4cCI6MjA3OTQ4NzA1N30.r_Tgt1dWBkw6wgsAHjrrvFOESB9hzlt8o7RYEGf12lo"
}
```

---

## Expected JSON Format

Your `parking_status.json` should follow this structure:

```json
{
  "timestamp": "2026-01-13T12:00:00.000Z",
  "areas": {
    "AreaA": {
      "total_spots": 3,
      "occupied_count": 1,
      "available_count": 2,
      "spots": [
        {
          "spot_id": 1,
          "occupied": 0,
          "lat": 40.7923,
          "lon": -73.9369
        },
        {
          "spot_id": 2,
          "occupied": 1,
          "lat": 40.7924,
          "lon": -73.9370
        },
        {
          "spot_id": 3,
          "occupied": 0,
          "lat": 40.7925,
          "lon": -73.9371
        }
      ]
    },
    "AreaB": {
      "total_spots": 2,
      "occupied_count": 0,
      "available_count": 2,
      "spots": [
        {
          "spot_id": 1,
          "occupied": 0,
          "lat": 40.7926,
          "lon": -73.9372
        },
        {
          "spot_id": 2,
          "occupied": 0,
          "lat": 40.7927,
          "lon": -73.9373
        }
      ]
    }
  },
  "summary": {
    "total_spots": 5,
    "total_occupied": 1,
    "total_available": 4
  }
}
```

### Format Requirements:

1. **timestamp**: ISO 8601 format (e.g., "2026-01-13T12:00:00.000Z")
2. **areas**: Object with area names as keys (e.g., "AreaA", "AreaB")
3. **spots**: Each spot must have:
   - `spot_id`: Integer (1, 2, 3, etc.)
   - `occupied`: Integer (0 = available, 1 = occupied)
   - `lat`: Float (latitude with full precision)
   - `lon`: Float (longitude with full precision)
4. **summary**: Overall statistics across all areas

---

## Python Script Example

See `/send_parking_data_example.py` for a complete Python script.

### Quick Python Example:

```python
import json
import requests
from datetime import datetime

API_URL = "https://cqkzgzqleulgiufuzjoh.supabase.co/functions/v1/make-server-34bbc245/parking-data"
ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxa3pnenFsZXVsZ2l1ZnV6am9oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5MTEwNTcsImV4cCI6MjA3OTQ4NzA1N30.r_Tgt1dWBkw6wgsAHjrrvFOESB9hzlt8o7RYEGf12lo"

# Read your parking_status.json
with open('parking_status.json', 'r') as f:
    data = json.load(f)

# Update timestamp
data['timestamp'] = datetime.utcnow().isoformat() + 'Z'

# Send to server
response = requests.post(
    API_URL,
    json=data,
    headers={
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {ANON_KEY}'
    }
)

print(response.json())
```

---

## Testing with cURL

```bash
curl -X POST \
  https://cqkzgzqleulgiufuzjoh.supabase.co/functions/v1/make-server-34bbc245/parking-data \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxa3pnenFsZXVsZ2l1ZnV6am9oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5MTEwNTcsImV4cCI6MjA3OTQ4NzA1N30.r_Tgt1dWBkw6wgsAHjrrvFOESB9hzlt8o7RYEGf12lo" \
  -d @parking_status.json
```

---

## Expected Server Response

**Success (200 OK):**
```json
{
  "success": true,
  "received": 5,
  "areas": 2
}
```

**Error (400 Bad Request):**
```json
{
  "error": "Invalid data format"
}
```

---

## How It Works

1. Your Python script reads `parking_status.json` from your local file
2. Script sends POST request to the MagicSpot server endpoint
3. Server stores the data in Supabase database (KV store)
4. Web app fetches this data every 10 seconds and displays on map
5. Spots appear as colored circles (green = available, red = occupied)

---

## Troubleshooting

### No spots appearing?
- Check your JSON file format matches the expected structure
- Verify latitude/longitude values are correct
- Ensure `occupied` field is 0 or 1 (not true/false)
- Check server logs for errors

### Test with sample data:
Use the `/parking_status_sample.json` file to test the integration.

### Verify data was received:
The web app should show spots immediately after sending data (refresh if needed).

---

## Spot Naming

Spots will be displayed with names like:
- "A1", "A2", "A3" for spots in AreaA
- "B1", "B2" for spots in AreaB

The format is: `{First letter of area}{spot_id}`

Example:
- AreaA spot_id 1 → "A1"
- AreaB spot_id 2 → "B2"
