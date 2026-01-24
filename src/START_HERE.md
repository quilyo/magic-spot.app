# 🚀 START HERE - MagicSpot Setup & Deployment

Welcome to MagicSpot! This guide will help you get started quickly.

## 📋 What is MagicSpot?

MagicSpot is a **real-time parking spot monitoring web application** that shows parking availability on an interactive map. It consists of:

- **Frontend**: React app with interactive map (Leaflet.js)
- **Backend**: Python Flask API with JWT authentication
- **Data Pipeline**: Python script that sends parking data updates

**💰 Total Cost**: $0/month on free tiers!

## 🎯 Choose Your Path

### Path 1: Just Want to See It Work? (5 minutes)
→ Go to **[QUICK_START.md](QUICK_START.md)**

Quick setup to run locally:
```bash
# Option 1: Use setup script (easiest)
chmod +x setup.sh && ./setup.sh  # macOS/Linux
# Or: setup.bat on Windows

# Option 2: Manual setup
cd backend && python -m venv venv && source venv/bin/activate
pip install -r requirements.txt && python app.py
# Then in new terminal: npm install && npm run dev
```

### Path 2: Ready to Deploy to Production?
→ Go to **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)**

Deploy to Fly.io (backend) + Vercel/Netlify (frontend):
- Backend: Free on Fly.io
- Frontend: Free on Vercel/Netlify
- Total cost: **$0/month** 🎉

### Path 3: Want to Understand Everything?
→ Go to **[README.md](README.md)** and **[ARCHITECTURE.md](ARCHITECTURE.md)**

Complete documentation with:
- Architecture overview
- API reference
- Customization guide
- Troubleshooting

### Path 4: Migrating from Supabase?
→ Go to **[MIGRATION_SUMMARY.md](MIGRATION_SUMMARY.md)**

Details about what changed and why.

## 📚 All Documentation

| Document | Purpose | When to Use |
|----------|---------|-------------|
| **[START_HERE.md](START_HERE.md)** | You are here! Quick navigation | First stop |
| **[QUICK_START.md](QUICK_START.md)** | Get running locally in 5 minutes | First time setup |
| **[README.md](README.md)** | Complete project documentation | Understanding the app |
| **[ARCHITECTURE.md](ARCHITECTURE.md)** | System architecture & diagrams | Understanding structure |
| **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** | Step-by-step deployment | Going to production |
| **[CHECKLIST.md](CHECKLIST.md)** | Deployment checklist | Track your progress |
| **[MIGRATION_SUMMARY.md](MIGRATION_SUMMARY.md)** | Migration details | Understanding changes |
| **[PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)** | File organization | Finding specific files |

## ⚡ Quick Reference

### Key Commands

**Backend**:
```bash
cd backend
source venv/bin/activate  # Windows: venv\Scripts\activate
python app.py             # Start server
python test_api.py        # Test all endpoints
python send_parking_data.py  # Send parking data
```

**Frontend**:
```bash
npm install      # Install dependencies
npm run dev      # Start dev server
npm run build    # Build for production
```

**Deployment**:
```bash
# Backend (Fly.io)
cd backend && flyctl deploy

# Frontend (auto-deploy on git push to Vercel/Netlify)
git push origin main
```

### Important Files to Customize

1. **`.env`** - Set Supabase credentials (copy from `.env.example`)
2. **Supabase Dashboard** - Configure your database and authentication

### Project Structure (Simplified)

```
magic-spot.app/
├── src/                 # React frontend
│   ├── App.tsx          # Main app component
│   ├── components/      # UI components
│   └── utils/           # Utilities including Supabase client
├── .env.example         # Environment variable template
└── vite.config.ts       # Vite configuration
```

## 🎬 Getting Started in 3 Steps

### Step 1: Setup (First Time Only)

**Install dependencies:**
```bash
npm install
```

**Configure environment variables:**
```bash
# Copy the example file
cp .env.example .env

# Edit .env and add your Supabase credentials
# Get these from https://supabase.com/dashboard/project/_/settings/api
```

Your `.env` file should look like:
```env
VITE_SUPABASE_PROJECT_ID=your-actual-project-id
VITE_SUPABASE_ANON_KEY=your-actual-anon-key
```

### Step 2: Run Locally

```bash
npm run dev
```

Visit: **http://localhost:3000**

### Step 3: Deploy to Production

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for complete instructions.

Quick version:
```bash
# 1. Push to GitHub
git add . && git commit -m "Initial deployment"
git push origin main

# 2. Deploy to Vercel/Netlify/GitHub Pages (connect GitHub repo)
# Set environment variables:
# - VITE_SUPABASE_PROJECT_ID=your-project-id
# - VITE_SUPABASE_ANON_KEY=your-anon-key
```

## 🔧 Common Tasks

### Configure Supabase Credentials

Edit `.env` file:
```env
VITE_SUPABASE_PROJECT_ID=your-actual-project-id
VITE_SUPABASE_ANON_KEY=your-actual-anon-key
```

Get credentials from [Supabase Dashboard](https://supabase.com/dashboard/project/_/settings/api)

### Test Everything is Working

```bash
npm run dev
```

Open http://localhost:3000 and check:
- App loads without errors
- You can see the map
- Authentication works

### Check Browser Console

Press F12 to open developer tools and check the Console tab for any error messages.

### Update After Making Changes

```bash
git add .
git commit -m "Your changes"
git push origin main
# Auto-deploys on GitHub Pages/Vercel/Netlify
```

## 🆘 Troubleshooting

### "Missing Supabase credentials" error
- Check that `.env` file exists in the project root
- Verify `.env` contains `VITE_SUPABASE_PROJECT_ID` and `VITE_SUPABASE_ANON_KEY`
- Make sure values are not placeholder text
- Restart the dev server: `npm run dev`

### App won't start
- Check Node.js version: `node --version` (need 16+)
- Install dependencies: `npm install`
- Check for error messages in terminal

### Can't connect to Supabase
- Verify your Supabase credentials are correct
- Check network connectivity
- Check browser console (F12) for errors
- Verify your Supabase project is active

### Build fails
- Ensure `.env` has valid credentials during build
- Check all dependencies are installed: `npm install`
- Check for TypeScript errors: `npm run build`

For more help, see the "Troubleshooting" section in [README.md](README.md).

## 📊 What You Get

### Features
✅ Interactive map with OpenStreetMap  
✅ Real-time parking spot updates  
✅ Color-coded availability (green/red)  
✅ Google Maps navigation integration  
✅ User authentication with Supabase  
✅ Auto-refresh every 10 seconds  
✅ Responsive design  
✅ Preview mode for logged-out users  

### Tech Stack
- **Frontend**: React, TypeScript, Tailwind CSS, Leaflet.js
- **Backend**: Supabase (PostgreSQL, Auth, Realtime)
- **Deployment**: GitHub Pages / Vercel / Netlify

### Cost
**$0/month** on free tiers! 🎉

## 📝 Deployment Checklist

Use [CHECKLIST.md](CHECKLIST.md) to track your progress:

- [ ] ✅ Local setup complete
- [ ] ✅ Backend deployed to Fly.io
- [ ] ✅ Frontend deployed to Vercel/Netlify
- [ ] ✅ Data sender running
- [ ] ✅ Real GPS coordinates added
- [ ] ✅ Everything tested and working

## 🎉 Success! What's Next?

Once everything is working:

1. **Customize** - Add your branding and styling
2. **Expand** - Add more parking spots
3. **Monitor** - Check logs regularly
4. **Share** - Give access to users
5. **Iterate** - Add new features!

## 🔗 Quick Links

- **Frontend (local)**: http://localhost:5173
- **Backend (local)**: http://localhost:5000
- **Health Check**: http://localhost:5000/health
- **Backend Repo**: `./backend/`
- **Frontend Source**: `./src/`

## 💡 Pro Tips

1. **Use the setup script** - It does everything automatically
2. **Test locally first** - Before deploying to production
3. **Read QUICK_START.md** - It's really just 5 minutes
4. **Use CHECKLIST.md** - To track deployment progress
5. **Check logs often** - Catches issues early

## 🤝 Need Help?

1. **Quick issues**: Check [QUICK_START.md](QUICK_START.md) troubleshooting
2. **Deployment help**: See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
3. **API questions**: Check [README.md](README.md) API reference
4. **Understanding code**: See [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)

## 🚀 Ready to Begin?

1. **Just want to test locally?**
   → Open [QUICK_START.md](QUICK_START.md) and follow the 5-minute guide

2. **Ready to deploy?**
   → Open [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) and start deploying

3. **Want to understand everything?**
   → Open [README.md](README.md) for complete documentation

---

**🎯 Most people start with [QUICK_START.md](QUICK_START.md)**

**Happy coding!** 🎉