#!/usr/bin/env python3
"""
Example Python script to send parking data to MagicSpot web application.
This script writes parking data directly to the Supabase parking_status table.

SECURITY NOTICE:
================
This script requires the SUPABASE SERVICE ROLE KEY (not the anon key) to write
to the parking_status table, which is protected by Row Level Security (RLS).

The service role key has full database access and MUST be kept secret:
- Use it ONLY on your backend server, never in client-side code
- Store it in environment variables, never commit it to version control
- Rotate it immediately if it's ever exposed

IMPORTANT: Replace the SUPABASE_PROJECT_ID and SUPABASE_SERVICE_ROLE_KEY with your actual values.
You can find these in your Supabase project settings at https://supabase.com/dashboard/project/_/settings/api

For better security, use environment variables:
    import os
    SUPABASE_PROJECT_ID = os.getenv('SUPABASE_PROJECT_ID')
    SUPABASE_SERVICE_ROLE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

Or use python-dotenv to load from a .env file:
    from dotenv import load_dotenv
    load_dotenv()
    SUPABASE_PROJECT_ID = os.getenv('SUPABASE_PROJECT_ID')
    SUPABASE_SERVICE_ROLE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
"""

import json
import requests
from datetime import datetime

# REPLACE THESE WITH YOUR ACTUAL VALUES
# CRITICAL: Use SERVICE ROLE KEY (not anon key) for backend operations
# Or use environment variables as shown in the docstring above
SUPABASE_PROJECT_ID = "your-project-id-here"
SUPABASE_SERVICE_ROLE_KEY = "your-service-role-key-here"  # NOT the anon key!

# Supabase REST API endpoint for parking_status table
API_URL = f"https://{SUPABASE_PROJECT_ID}.supabase.co/rest/v1/parking_status"

def send_parking_data(json_file_path):
    """
    Read parking data from JSON file and write it to Supabase parking_status table.
    
    Expected JSON format:
    {
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
      }
    }
    
    The timestamp will be added automatically.
    """
    try:
        # Read the JSON file
        with open(json_file_path, 'r') as f:
            parking_data = json.load(f)
        
        # Prepare the payload for Supabase
        # The parking_status table expects: areas (JSONB), timestamp (TIMESTAMPTZ)
        timestamp = datetime.utcnow().isoformat() + 'Z'
        payload = {
            'areas': parking_data.get('areas', {}),
            'timestamp': timestamp
        }
        
        # Prepare headers with SERVICE ROLE KEY for authentication
        # This allows writing to the RLS-protected parking_status table
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {SUPABASE_SERVICE_ROLE_KEY}',
            'apikey': SUPABASE_SERVICE_ROLE_KEY,
            'Prefer': 'return=representation'  # Return the inserted row
        }
        
        # Send POST request to Supabase REST API
        response = requests.post(API_URL, json=payload, headers=headers)
        
        # Check response
        # Supabase REST API returns 201 for successful inserts with 'Prefer: return=representation'
        # We also accept 200 for compatibility with different Supabase configurations
        if response.status_code in [200, 201]:
            result = response.json()
            if isinstance(result, list) and len(result) > 0:
                print(f"✅ Success! Parking data written to database")
                print(f"   Timestamp: {timestamp}")
                print(f"   Database will automatically sync to parking_spots table")
                return True
            else:
                print(f"⚠️  Warning: Data sent but unexpected response: {result}")
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
