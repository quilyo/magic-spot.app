# 🚀 Magic Spot - Supabase Setup Guide

## ⚠️ Important: You Already Have Data!

Your backend is already writing parking status data to the `parking_status` table in Supabase with a JSON `areas` column. This setup will:

1. **Create a normalized `parking_spots` table** that the frontend can query easily
2. **Automatically sync** from your backend's `parking_status` table using a database trigger
3. **Expand the JSON data** into individual spot records with area, lat, lon, occupied status

## Step 1: Run Database Setup

1. **Go to your Supabase project**: https://supabase.com/dashboard/project/cqkzgzqleulgiufuzjoh

2. **Open SQL Editor**:
   - Click `SQL Editor` in the left sidebar
   - Click `New Query`

3. **Run the normalization setup script**:
   - Open the file `supabase_setup_normalized.sql` in your project
   - Copy all the SQL code
   - Paste it into the Supabase SQL Editor
   - Click `Run` (or press Ctrl+Enter)

4. **Verify the tables**:
   - Go to `Table Editor` in the left sidebar
   - You should see both `parking_status` (your backend's table) and `parking_spots` (new normalized table)
   - `parking_spots` should now contain all individual spots from all areas

## How It Works

```
Your Backend Updates parking_status:
    ↓
    └─→ parking_status.areas JSON contains all areas and spots
    ↓
Database Trigger (expand_parking_status_to_spots):
    ↓
    └─→ Automatically expands JSON into individual records
    ↓
parking_spots table:
    ├─ Area1_1: Area1, Spot 1, lat, lon, occupied
    ├─ Area1_2: Area1, Spot 2, lat, lon, occupied
    ├─ Area2_1: Area2, Spot 1, lat, lon, occupied
    └─ ... etc
    ↓
Frontend reads from parking_spots:
    └─→ App fetches and displays on map
```

## Step 2: Enable Authentication (for admin features)

1. **Go to Authentication settings**:
   - Click `Authentication` in the left sidebar
   - Click `Providers`

2. **Enable Email Authentication**:
   - Find `Email` provider
   - Toggle it ON
   - Click `Save`

## Step 3: Your App is Ready!

No additional configuration needed! The app already:
- Reads from `parking_spots` table
- Shows green (available) and red (occupied) spots
- Automatically updates when your backend updates `parking_status`

**Start the development server**:
```bash
npm run dev
```

## Real-Time Updates

Every time your backend updates the `parking_status` table:
1. The database trigger fires automatically
2. `parking_spots` table gets repopulated with the latest data
3. Frontend queries the fresh data from `parking_spots`

**Optional**: Add real-time subscriptions for live updates without polling:
```typescript
supabase
  .from('parking_spots')
  .on('*', payload => {
    // Update map immediately
    console.log('Parking spot changed:', payload);
  })
  .subscribe();
```

## Testing

1. **Check your data**:
   - Go to Supabase Dashboard > Table Editor > `parking_spots`
   - You should see spots from all areas (Area1_1, Area1_2, Area2_1, etc.)
   - Columns: id, spot_id, area, lat, lon, occupied, timestamp, updated_at

2. **Run the app**:
   - Go to http://localhost:5173
   - You should see the map with all parking spots
   - Green spots = available (occupied = 0)
   - Red spots = occupied (occupied = 1)

3. **Update from backend**:
   - When your backend pushes new data to `parking_status`
   - The trigger automatically syncs to `parking_spots`
   - Refresh your app to see the latest data

## If Something Goes Wrong

### No spots appearing on map?
- Check Supabase > Table Editor > `parking_spots` - does it have data?
- Check browser console for errors
- Make sure your Supabase credentials are correct

### Trigger not firing?
- Check Supabase > SQL Editor > look for any error messages
- Verify the `parking_status` table exists and has data
- Make sure the trigger function has correct syntax

### Want to manually resync?
- Go to SQL Editor in Supabase
- Run: `SELECT expand_parking_status_to_spots()`
- This manually triggers the expansion function

## FAQ

**Q: Do I need to change my backend code?**
A: No! Your backend continues updating `parking_status` exactly as before.

**Q: Is the data real-time?**
A: Yes! The trigger runs instantly when your backend updates the table.

**Q: Can I add more areas?**
A: Yes! The schema automatically handles any number of areas in the JSON.

**Q: Do I need fly.io?**
A: No! Everything runs on Supabase (database + auth).

