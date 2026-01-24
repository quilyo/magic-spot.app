# Quick Start Guide

Get MagicSpot running locally in 5 minutes!

## Prerequisites

- Python 3.9+ installed
- Node.js 16+ installed
- Git installed

## Step 1: Clone or Download

If you have this from GitHub:
```bash
git clone https://github.com/YOUR_USERNAME/magicspot.git
cd magicspot
```

If you have the files locally, navigate to the directory:
```bash
cd magicspot
```

## Step 2: Start the Backend

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the backend
python app.py
```

✅ Backend is now running on http://localhost:5000

**Keep this terminal open!**

## Step 3: Start the Frontend

Open a **NEW terminal window**:

```bash
# Navigate to project root (if not already there)
cd magicspot

# Install dependencies (first time only)
npm install

# Start the frontend
npm run dev
```

✅ Frontend is now running on http://localhost:5173

**Keep this terminal open too!**

## Step 4: Test the App

1. Open your browser to http://localhost:5173
2. You should see the MagicSpot login screen with a map in the background
3. Click "Sign Up" and create an account:
   - Name: Test User
   - Email: test@example.com
   - Password: Test1234
4. Click "Sign Up"
5. You should now see the map with parking spots!

## Step 5: Send Parking Data

Open a **THIRD terminal window**:

```bash
# Navigate to backend directory
cd backend

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Run the data sender
python send_parking_data.py
```

✅ You should see:
```
✓ Backend is online
Starting data updates... (Press Ctrl+C to stop)
✓ Successfully sent data: 30 spots across 6 areas
```

The data will auto-update every 10 seconds!

## What's Running?

You should now have 3 terminals open:

1. **Terminal 1**: Backend server (http://localhost:5000)
2. **Terminal 2**: Frontend dev server (http://localhost:5173)
3. **Terminal 3**: Data sender script (updates every 10s)

## Customize Your Data

Edit `backend/parking_status.json` to add your real parking spots:

```json
{
  "timestamp": "2025-01-23T10:30:00",
  "areas": {
    "Area1": {
      "available": 3,
      "occupied": 2,
      "spots": [
        {
          "spot_id": "s1",
          "occupied": 0,
          "lat": 37.7749,
          "lon": -122.4194
        }
      ]
    }
  },
  "summary": {
    "total_spots": 30,
    "total_available": 18,
    "total_occupied": 12
  }
}
```

**Pro Tip**: Use [Google Maps](https://www.google.com/maps) to find GPS coordinates:
1. Right-click on a location
2. Click the coordinates to copy them
3. Format: First number is latitude, second is longitude

## Troubleshooting

### "Connection refused" error in frontend

- Make sure backend is running on port 5000
- Check terminal 1 for errors

### "Module not found" errors

**Backend:**
```bash
cd backend
pip install -r requirements.txt
```

**Frontend:**
```bash
npm install
```

### Port already in use

**Backend (port 5000):**
```bash
# Find and kill the process
# On macOS/Linux:
lsof -ti:5000 | xargs kill -9
# On Windows:
netstat -ano | findstr :5000
taskkill /PID <PID_NUMBER> /F
```

**Frontend (port 5173):**
```bash
# Kill the process or the dev server will auto-choose another port
```

### Data not showing up

1. Check terminal 3 - should show "✓ Successfully sent data"
2. Refresh the frontend page
3. Check browser console (F12) for errors

## Next Steps

- ✅ App is running locally
- 📍 Add your real parking spot coordinates
- 🚀 Ready to deploy? See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
- 📖 Need more info? See [README.md](README.md)

## Stop Everything

When you're done:

1. **Terminal 3** (data sender): Press `Ctrl+C`
2. **Terminal 2** (frontend): Press `Ctrl+C`
3. **Terminal 1** (backend): Press `Ctrl+C`

To start again later, just repeat Steps 2-5!

---

**Having issues?** Check the full [README.md](README.md) for detailed documentation.
