# Quick Start Guide

Get MagicSpot running locally in 5 minutes!

## Prerequisites

- Node.js 16+ installed
- Git installed
- A Supabase account (free at [supabase.com](https://supabase.com))

## Step 1: Clone or Download

If you have this from GitHub:
```bash
git clone https://github.com/YOUR_USERNAME/magic-spot.app.git
cd magic-spot.app
```

If you have the files locally, navigate to the directory:
```bash
cd magic-spot.app
```

## Step 2: Install Dependencies

```bash
npm install
```

## Step 3: Configure Environment Variables

```bash
# Copy the example file
cp .env.example .env
```

Now edit `.env` and add your Supabase credentials:

```env
VITE_SUPABASE_PROJECT_ID=your-actual-project-id
VITE_SUPABASE_ANON_KEY=your-actual-anon-key
```

**How to get your Supabase credentials:**

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project (or create a new one)
3. Go to **Settings** → **API**
4. Copy the **Project ID** (from the Project URL: `https://[PROJECT_ID].supabase.co`)
5. Copy the **anon/public key** from the API Keys section
6. Paste these values into your `.env` file

## Step 4: Start the Development Server

```bash
npm run dev
```

✅ Frontend is now running on http://localhost:3000

## Step 5: Test the App

1. Open your browser to http://localhost:3000
2. You should see the MagicSpot app with an interactive map
3. If you see an error about missing Supabase credentials, verify your `.env` file

## What's Running?

You should now have the development server running with:
- **Frontend**: React app on http://localhost:3000
- **Backend**: Supabase (cloud-hosted)

## Troubleshooting

### "Missing Supabase credentials" error

Make sure:
- `.env` file exists in the project root directory
- The file contains both `VITE_SUPABASE_PROJECT_ID` and `VITE_SUPABASE_ANON_KEY`
- The values are actual credentials, not placeholder text
- You've restarted the dev server after creating/editing `.env`

### "Module not found" errors

```bash
npm install
```

### Port already in use

If port 3000 is already in use, Vite will automatically choose another port (usually 3001, 3002, etc.). Check the terminal output for the actual URL.

### App loads but doesn't connect to Supabase

1. Verify your Supabase project is active
2. Check your credentials are correct
3. Open browser console (F12) for detailed error messages
4. Ensure your Supabase project has the necessary tables and authentication enabled

## Next Steps

- ✅ App is running locally
- 🔧 Customize your Supabase database schema
- 🚀 Ready to deploy? See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
- 📖 Need more info? See [README.md](README.md)

## Stop Everything

When you're done, press `Ctrl+C` in the terminal to stop the development server.

To start again later, just run `npm run dev`!

---

**Having issues?** Check the full [README.md](README.md) or [DEPLOYMENT.md](../DEPLOYMENT.md) for detailed documentation.
