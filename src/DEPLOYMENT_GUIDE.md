# MagicSpot Deployment Guide

Complete guide to deploy MagicSpot to production.

## Prerequisites

- [Fly.io CLI](https://fly.io/docs/hands-on/install-flyctl/) installed
- [Git](https://git-scm.com/) installed
- Fly.io account (free tier available)
- GitHub account

## Step 1: Prepare Your Repository

### 1.1 Initialize Git Repository

```bash
git init
git add .
git commit -m "Initial commit"
```

### 1.2 Create GitHub Repository

1. Go to [GitHub](https://github.com/new)
2. Create a new repository named `magicspot`
3. Don't initialize with README (we already have one)

### 1.3 Push to GitHub

```bash
git remote add origin https://github.com/YOUR_USERNAME/magicspot.git
git branch -M main
git push -u origin main
```

## Step 2: Deploy Backend to Fly.io

### 2.1 Install Fly CLI

**macOS/Linux:**
```bash
curl -L https://fly.io/install.sh | sh
```

**Windows (PowerShell):**
```powershell
iwr https://fly.io/install.ps1 -useb | iex
```

### 2.2 Login to Fly.io

```bash
flyctl auth login
```

### 2.3 Navigate to Backend Directory

```bash
cd backend
```

### 2.4 Launch Your App

```bash
flyctl launch
```

When prompted:
- **App name**: Enter `magicspot-backend` (or your preferred name)
- **Region**: Choose closest to your users
- **PostgreSQL**: Yes (select "Development" for free tier)
- **Deploy now**: No (we need to set secrets first)

### 2.5 Set Environment Secrets

Generate random secret keys:
```bash
# On Linux/macOS
python3 -c "import secrets; print(secrets.token_urlsafe(32))"

# On Windows
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

Set the secrets:
```bash
flyctl secrets set SECRET_KEY="your-generated-secret-1"
flyctl secrets set JWT_SECRET_KEY="your-generated-secret-2"
```

### 2.6 Deploy Backend

```bash
flyctl deploy
```

### 2.7 Verify Backend is Running

```bash
flyctl open
```

This should open your backend URL in a browser. You should see a 404 page (that's normal - it means the server is running).

Test the health endpoint:
```bash
curl https://magicspot-backend.fly.dev/health
```

You should see:
```json
{"status":"ok","timestamp":"2025-01-23T..."}
```

### 2.8 Note Your Backend URL

Your backend will be available at:
```
https://magicspot-backend.fly.dev
```

Save this URL - you'll need it for the frontend!

## Step 3: Deploy Frontend

### Option A: Deploy to Vercel (Recommended)

#### 3.1 Go to Vercel

Visit [vercel.com](https://vercel.com) and sign in with GitHub

#### 3.2 Import Project

1. Click "New Project"
2. Import your `magicspot` repository
3. Vercel will auto-detect it's a Vite project

#### 3.3 Configure Environment Variables

In the "Environment Variables" section, add:
```
Name: VITE_API_URL
Value: https://magicspot-backend.fly.dev
```

#### 3.4 Deploy

Click "Deploy" and wait for the build to complete.

#### 3.5 Your App is Live!

Vercel will give you a URL like:
```
https://magicspot.vercel.app
```

### Option B: Deploy to Netlify

#### 3.1 Go to Netlify

Visit [netlify.com](https://netlify.com) and sign in with GitHub

#### 3.2 Import Project

1. Click "Add new site" → "Import an existing project"
2. Select your `magicspot` repository
3. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`

#### 3.3 Configure Environment Variables

In "Site settings" → "Environment variables", add:
```
Key: VITE_API_URL
Value: https://magicspot-backend.fly.dev
```

#### 3.4 Deploy

Click "Deploy site" and wait for the build to complete.

#### 3.5 Your App is Live!

Netlify will give you a URL like:
```
https://magicspot.netlify.app
```

## Step 4: Set Up Data Sending Script

### 4.1 Update Backend URL in Script

On your local machine or server where you'll run the data script:

```bash
cd backend
```

Edit `send_parking_data.py` and update the `BACKEND_URL`:

```python
BACKEND_URL = "https://magicspot-backend.fly.dev"
```

### 4.2 Run the Script

```bash
python send_parking_data.py
```

This will continuously send parking data updates to your backend.

### 4.3 (Optional) Run as Background Service

#### On Linux (using systemd):

Create a service file:
```bash
sudo nano /etc/systemd/system/magicspot-data.service
```

Add:
```ini
[Unit]
Description=MagicSpot Data Sender
After=network.target

[Service]
Type=simple
User=your-username
WorkingDirectory=/path/to/backend
ExecStart=/path/to/venv/bin/python send_parking_data.py
Restart=always

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable magicspot-data.service
sudo systemctl start magicspot-data.service
```

#### On Windows (using Task Scheduler):

1. Open Task Scheduler
2. Create Basic Task
3. Trigger: At startup
4. Action: Start a program
5. Program: `C:\path\to\venv\Scripts\python.exe`
6. Arguments: `send_parking_data.py`
7. Start in: `C:\path\to\backend`

## Step 5: Test Your Deployment

### 5.1 Test Backend

```bash
curl https://magicspot-backend.fly.dev/health
```

### 5.2 Test Data Flow

Send test data:
```bash
cd backend
python send_parking_data.py --once
```

Check if data was received:
```bash
curl https://magicspot-backend.fly.dev/parking-data
```

### 5.3 Test Frontend

1. Visit your frontend URL
2. Sign up for a new account
3. Login
4. Verify parking spots appear on the map

## Monitoring & Maintenance

### View Backend Logs

```bash
flyctl logs
```

### View Backend Status

```bash
flyctl status
```

### Scale Backend (if needed)

```bash
flyctl scale vm shared-cpu-1x --memory 512
```

### Update Backend

```bash
cd backend
git pull
flyctl deploy
```

### Update Frontend

- **Vercel**: Push to GitHub, auto-deploys
- **Netlify**: Push to GitHub, auto-deploys

## Troubleshooting

### Backend Issues

**Problem**: "Connection refused"
```bash
flyctl logs
```
Look for errors in startup

**Problem**: Database connection errors
```bash
flyctl postgres list
flyctl postgres attach --app magicspot-backend
```

### Frontend Issues

**Problem**: "Failed to fetch parking data"
- Check `VITE_API_URL` is set correctly
- Verify backend is running: `curl https://your-backend.fly.dev/health`

**Problem**: CORS errors
- Backend should already have CORS enabled
- Check browser console for specific errors

### Data Script Issues

**Problem**: "Connection error"
- Verify backend URL is correct
- Test: `curl https://your-backend.fly.dev/health`

**Problem**: "Invalid data format"
- Verify `parking_status.json` follows the correct format
- Check backend logs: `flyctl logs`

## Cost Estimates

### Fly.io (Backend)
- Free tier: Includes 3 shared-cpu VMs (enough for this app)
- PostgreSQL: Free "Development" tier available
- **Estimated cost**: $0/month (free tier)

### Vercel/Netlify (Frontend)
- Free tier: More than enough for personal projects
- **Estimated cost**: $0/month (free tier)

### Total Estimated Cost: **$0/month** 🎉

## Security Recommendations

1. **Change Default Secrets**: Use strong random keys in production
2. **Enable HTTPS**: Fly.io provides this automatically
3. **Rate Limiting**: Already implemented in backend
4. **Password Requirements**: Already enforced (8+ chars, uppercase, lowercase, number)
5. **Regular Updates**: Keep dependencies updated

## Next Steps

1. ✅ Backend deployed to Fly.io
2. ✅ Frontend deployed to Vercel/Netlify
3. ✅ Data script running
4. 🎯 Add your real GPS coordinates to `parking_status.json`
5. 🎯 Customize the app with your branding
6. 🎯 Add more features!

## Support

- **Fly.io Docs**: https://fly.io/docs
- **Vercel Docs**: https://vercel.com/docs
- **Netlify Docs**: https://docs.netlify.com

For app-specific issues, check the main README.md or open an issue on GitHub.
