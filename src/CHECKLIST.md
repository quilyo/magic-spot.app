# MagicSpot Deployment Checklist

Use this checklist to ensure your app is properly set up and deployed.

## ☐ Local Development Setup

### Backend Setup
- [ ] Python 3.9+ installed and verified (`python --version`)
- [ ] Created virtual environment (`cd backend && python -m venv venv`)
- [ ] Activated virtual environment (`source venv/bin/activate`)
- [ ] Installed dependencies (`pip install -r requirements.txt`)
- [ ] Created `.env` file from `.env.example`
- [ ] Set `SECRET_KEY` in `.env`
- [ ] Set `JWT_SECRET_KEY` in `.env`
- [ ] Backend starts successfully (`python app.py`)
- [ ] Health check works (`curl http://localhost:5000/health`)

### Frontend Setup
- [ ] Node.js 16+ installed and verified (`node --version`)
- [ ] Installed dependencies (`npm install`)
- [ ] Created `.env` file from `.env.example`
- [ ] Set `VITE_API_URL=http://localhost:5000` in `.env`
- [ ] Frontend starts successfully (`npm run dev`)
- [ ] Can access app at http://localhost:5173

### Testing Locally
- [ ] Can sign up for a new account
- [ ] Can log in with created account
- [ ] Map displays with OpenStreetMap tiles
- [ ] Can see parking spots on map
- [ ] Spots show correct colors (green/red)
- [ ] Can click spots to see popups
- [ ] Navigation button opens Google Maps
- [ ] Legend shows correct counts
- [ ] Refresh button works
- [ ] Auto-refresh works (every 10s)
- [ ] Can log out successfully

### Data Sender
- [ ] `send_parking_data.py` script runs without errors
- [ ] Script successfully sends data to backend
- [ ] Data appears on frontend map after sending
- [ ] Custom GPS coordinates added to `parking_status.json`

## ☐ GitHub Setup

- [ ] Git repository initialized (`git init`)
- [ ] GitHub repository created
- [ ] Remote added (`git remote add origin ...`)
- [ ] `.gitignore` file in place
- [ ] All code committed (`git add . && git commit -m "Initial commit"`)
- [ ] Code pushed to GitHub (`git push -u origin main`)
- [ ] Repository is public (or private if preferred)
- [ ] README.md displays correctly on GitHub

## ☐ Backend Deployment (Fly.io)

### Fly.io Setup
- [ ] Fly.io CLI installed (`flyctl version`)
- [ ] Logged into Fly.io (`flyctl auth login`)
- [ ] Fly.io account verified and active

### Backend Deployment
- [ ] Navigated to backend directory (`cd backend`)
- [ ] Launched app (`flyctl launch`)
- [ ] App name chosen (e.g., `magicspot-backend`)
- [ ] Region selected
- [ ] PostgreSQL database created and attached
- [ ] Generated strong `SECRET_KEY`
- [ ] Generated strong `JWT_SECRET_KEY`
- [ ] Set secrets (`flyctl secrets set SECRET_KEY="..." JWT_SECRET_KEY="..."`)
- [ ] Deployed app (`flyctl deploy`)
- [ ] Deployment successful (no errors)
- [ ] Health check works (`curl https://YOUR-APP.fly.dev/health`)
- [ ] Backend URL noted for frontend config

### Backend Verification
- [ ] Can access `/health` endpoint
- [ ] Can sign up via API
- [ ] Can login via API
- [ ] Can send parking data via API
- [ ] Can retrieve parking data via API
- [ ] Database persists data correctly
- [ ] Logs are clean (`flyctl logs`)

## ☐ Frontend Deployment

### Choose Platform
- [ ] Decided on Vercel or Netlify (or other)

### Vercel Deployment
- [ ] Connected GitHub repository to Vercel
- [ ] Build settings auto-detected (Vite)
- [ ] Added environment variable: `VITE_API_URL=https://YOUR-BACKEND.fly.dev`
- [ ] Deployed successfully
- [ ] No build errors
- [ ] Frontend URL noted

### Netlify Deployment (Alternative)
- [ ] Connected GitHub repository to Netlify
- [ ] Set build command: `npm run build`
- [ ] Set publish directory: `dist`
- [ ] Added environment variable: `VITE_API_URL=https://YOUR-BACKEND.fly.dev`
- [ ] Deployed successfully
- [ ] No build errors
- [ ] Frontend URL noted

### Frontend Verification
- [ ] Can access deployed frontend URL
- [ ] Sign up works
- [ ] Login works
- [ ] Map displays correctly
- [ ] Parking spots appear
- [ ] Data refreshes properly
- [ ] Navigation buttons work
- [ ] Logout works
- [ ] No console errors in browser

## ☐ Data Pipeline Setup

### Data Sender Configuration
- [ ] Updated `BACKEND_URL` in `send_parking_data.py` to production URL
- [ ] Script successfully sends data to production backend
- [ ] Data appears on production frontend
- [ ] Decided on hosting for data sender script (local/VPS/cloud)

### Production Data Sender (Choose One)

#### Option A: Local Machine
- [ ] Script runs continuously
- [ ] Computer/server stays on 24/7
- [ ] Added to startup scripts (optional)

#### Option B: Linux Server (systemd)
- [ ] Created systemd service file
- [ ] Service enabled (`systemctl enable`)
- [ ] Service started (`systemctl start`)
- [ ] Service running (`systemctl status`)
- [ ] Logs are clean

#### Option C: Windows Server (Task Scheduler)
- [ ] Created scheduled task
- [ ] Task runs at startup
- [ ] Task runs continuously
- [ ] Verified task is running

#### Option D: Cloud Function/Cron Job
- [ ] Set up cron job or cloud function
- [ ] Scheduled to run every X minutes
- [ ] Verified execution logs
- [ ] Data updates correctly

## ☐ Final Production Testing

### End-to-End Tests
- [ ] Visit production frontend URL
- [ ] Sign up with real email
- [ ] Login successfully
- [ ] Map displays with correct center point
- [ ] All parking spots appear
- [ ] Spot colors are correct (green/red)
- [ ] Click spot to see popup
- [ ] Popup shows correct info
- [ ] Navigation button opens Google Maps
- [ ] Legend shows correct counts
- [ ] Refresh button works
- [ ] Auto-refresh works (wait 10s)
- [ ] Logout and login again
- [ ] Session persists (if "Keep me logged in" checked)

### Cross-Browser Testing
- [ ] Chrome/Edge - Works
- [ ] Firefox - Works
- [ ] Safari - Works
- [ ] Mobile Chrome - Works
- [ ] Mobile Safari - Works

### Performance Testing
- [ ] Map loads quickly (< 3 seconds)
- [ ] Spots render smoothly
- [ ] No lag when interacting
- [ ] Memory usage is reasonable
- [ ] Backend responds quickly

## ☐ Monitoring & Maintenance

### Backend Monitoring
- [ ] Set up Fly.io monitoring alerts
- [ ] Check backend logs regularly (`flyctl logs`)
- [ ] Monitor database size
- [ ] Check for errors in logs
- [ ] Verify uptime

### Frontend Monitoring
- [ ] Check Vercel/Netlify deployment status
- [ ] Monitor build logs
- [ ] Check for runtime errors
- [ ] Verify analytics (if enabled)

### Data Pipeline Monitoring
- [ ] Verify data sender is running
- [ ] Check data sender logs
- [ ] Confirm data updates regularly
- [ ] Monitor for connection errors

## ☐ Documentation

- [ ] README.md is up to date
- [ ] Backend URL documented
- [ ] Frontend URL documented
- [ ] Environment variables documented
- [ ] Deployment process documented
- [ ] Troubleshooting guide available

## ☐ Security

- [ ] Strong `SECRET_KEY` set (32+ characters)
- [ ] Strong `JWT_SECRET_KEY` set (32+ characters)
- [ ] Keys are not in Git repository
- [ ] HTTPS enabled (automatic on Fly.io/Vercel/Netlify)
- [ ] CORS configured correctly
- [ ] Rate limiting enabled (5 signups/hour)
- [ ] Password requirements enforced
- [ ] SQL injection protected (SQLAlchemy ORM)
- [ ] JWT tokens expire (30 days default)

## ☐ Backup & Recovery

- [ ] Fly.io PostgreSQL backups enabled (automatic)
- [ ] Git repository backed up (on GitHub)
- [ ] Environment variables documented securely
- [ ] Database connection string saved securely
- [ ] Recovery procedure documented

## ☐ Optional Enhancements

- [ ] Custom domain configured
- [ ] SSL certificate installed (auto on custom domain)
- [ ] Error tracking (e.g., Sentry)
- [ ] Analytics (e.g., Google Analytics)
- [ ] Email notifications (future feature)
- [ ] Admin dashboard (future feature)
- [ ] Mobile app (future feature)

## ☐ Launch Preparation

- [ ] All tests passing
- [ ] All critical bugs fixed
- [ ] Documentation complete
- [ ] Team trained (if applicable)
- [ ] Support plan in place
- [ ] Monitoring configured
- [ ] Backup verified

## ☐ Launch!

- [ ] 🎉 App is LIVE!
- [ ] URL shared with users
- [ ] Announcement made
- [ ] Monitoring active
- [ ] Ready for feedback

---

## Quick Reference

**Backend URL**: `https://your-app.fly.dev`  
**Frontend URL**: `https://your-app.vercel.app`  
**GitHub Repo**: `https://github.com/YOUR_USERNAME/magicspot`

**Key Commands**:
```bash
# Deploy backend
cd backend && flyctl deploy

# View backend logs
flyctl logs

# Update frontend (Vercel/Netlify)
git push origin main  # Auto-deploys

# Run data sender
cd backend && python send_parking_data.py
```

**Emergency Contacts**:
- Fly.io Support: https://community.fly.io
- Vercel Support: https://vercel.com/support
- Netlify Support: https://www.netlify.com/support

---

**Status**: ☐ Not Started | ☑ Complete | ⚠ Issues

**Overall Progress**: ____%

**Notes**:
_Add any important notes or issues here_
