# 🚀 Magic Spot - Supabase Setup Guide

## Step 1: Run Database Setup

1. **Go to your Supabase project**: https://supabase.com/dashboard/project/cqkzgzqleulgiufuzjoh

2. **Open SQL Editor**:
   - Click `SQL Editor` in the left sidebar
   - Click `New Query`

3. **Run the setup script**:
   - Open the file `supabase_setup.sql` in your project
   - Copy all the SQL code
   - Paste it into the Supabase SQL Editor
   - Click `Run` (or press Ctrl+Enter)

4. **Verify the table was created**:
   - Go to `Table Editor` in the left sidebar
   - You should see `parking_spots` table with sample data

## Step 2: Enable Authentication

1. **Go to Authentication settings**:
   - Click `Authentication` in the left sidebar
   - Click `Providers`

2. **Enable Email Authentication**:
   - Find `Email` provider
   - Toggle it ON
   - Click `Save`

3. **Configure Email Settings** (optional):
   - Go to `Authentication` > `Email Templates`
   - Customize confirmation email if needed

## Step 3: Configure Your App

Your Supabase credentials are already configured in `src/utils/supabase/info.tsx`:
- Project ID: `cqkzgzqleulgiufuzjoh`
- Anon Key: Already set

**Everything is ready to go!** No `.env` file needed since credentials are already in the code.

## Step 4: Test Your App

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Test Login**:
   - Go to http://localhost:5173
   - Click "Sign up"
   - Create a new account
   - You should be logged in!

3. **Check Authentication**:
   - Go to Supabase Dashboard > Authentication > Users
   - You should see your new user

## Step 5: Understanding the Map Colors

The parking map displays spots with color coding:
- 🟢 **Green circles** = Available spots (occupied = 0)
- 🔴 **Red circles** = Occupied spots (occupied = 1)

## Step 6: Update Parking Data

### Option A: Manually in Supabase
1. Go to `Table Editor` > `parking_spots`
2. Click on any row to edit
3. Change `occupied` value (0 or 1)
4. Refresh your app to see the change

### Option B: Via External API (Arduino/IoT Device)

You'll need to create a service role key for your device:

1. **Get Service Role Key**:
   - Go to `Settings` > `API`
   - Copy the `service_role` key (⚠️ Keep this secret!)

2. **Update from your device**:
   ```python
   import requests
   
   url = "https://cqkzgzqleulgiufuzjoh.supabase.co/rest/v1/parking_spots"
   headers = {
       "apikey": "YOUR_SERVICE_ROLE_KEY",
       "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY",
       "Content-Type": "application/json",
       "Prefer": "return=minimal"
   }
   
   # Update spot P1 to occupied
   data = {
       "occupied": 1,
       "timestamp": "2026-01-24T12:00:00Z"
   }
   
   response = requests.patch(
       f"{url}?id=eq.P1",
       json=data,
       headers=headers
   )
   ```

## Troubleshooting

### Login not working?
- Check Supabase logs: Dashboard > Logs > Auth Logs
- Verify email provider is enabled
- Check browser console for errors

### Parking spots not showing?
- Verify data exists: Table Editor > parking_spots
- Check browser console for errors
- Ensure RLS policies are set correctly

### Map not displaying?
- Check that lat/lon coordinates are valid
- Zoom out to see if spots are far from center
- Check browser console for Leaflet errors

## What's Next?

✅ **Your app is fully connected to Supabase!**

- Login/Signup works with Supabase Auth
- Parking data is stored in Supabase database
- Map shows real-time spot status
- No backend server needed!

To deploy, just push to GitHub and your GitHub Actions will automatically deploy to GitHub Pages.
