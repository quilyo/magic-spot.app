#!/usr/bin/env python3
"""
Example Python script to send parking data to MagicSpot web application.
This script reads parking_status.json and posts it to the Supabase server.

IMPORTANT: Replace the SUPABASE_PROJECT_ID and SUPABASE_ANON_KEY with your actual values.
You can find these in your Supabase project settings or in /utils/supabase/info.tsx
"""

import json
import requests
from datetime import datetime

# REPLACE THESE WITH YOUR ACTUAL VALUES
SUPABASE_PROJECT_ID = "your-project-id-here"  # Get from /utils/supabase/info.tsx
SUPABASE_ANON_KEY = "your-anon-key-here"      # Get from /utils/supabase/info.tsx

# API endpoint
API_URL = f"https://{SUPABASE_PROJECT_ID}.supabase.co/functions/v1/make-server-34bbc245/parking-data"

def send_parking_data(json_file_path):
    """
    Read parking data from JSON file and send to MagicSpot server.
    
    Expected JSON format:
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
    """
    try:
        # Read the JSON file
        with open(json_file_path, 'r') as f:
            parking_data = json.load(f)
        
        # Add/update timestamp
        parking_data['timestamp'] = datetime.utcnow().isoformat() + 'Z'
        
        # Prepare headers
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {SUPABASE_ANON_KEY}'
        }
        
        # Send POST request
        response = requests.post(API_URL, json=parking_data, headers=headers)
        
        # Check response
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Success! Sent {result.get('received', 0)} spots across {result.get('areas', 0)} areas")
            return True
        else:
            print(f"❌ Error {response.status_code}: {response.text}")
            return False
            
    except FileNotFoundError:
        print(f"❌ Error: File '{json_file_path}' not found")
        return False
    except json.JSONDecodeError as e:
        print(f"❌ Error: Invalid JSON format - {e}")
        return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Error: Failed to send request - {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

if __name__ == "__main__":
    # Path to your parking_status.json file
    JSON_FILE = "parking_status.json"
    
    print("📡 Sending parking data to MagicSpot...")
    send_parking_data(JSON_FILE)
