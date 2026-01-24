# MagicSpot Project Structure

Complete overview of all files and directories in the MagicSpot application.

## Root Directory

```
magicspot/
├── 📁 backend/                    # Python Flask backend
├── 📁 src/                        # React frontend source
├── 📁 components/                 # React components
├── 📁 services/                   # API and auth services
├── 📁 types/                      # TypeScript type definitions
├── 📁 styles/                     # Global styles
├── 📁 utils/                      # Utility functions
├── 📁 .github/                    # GitHub configuration
│   └── 📁 workflows/             # CI/CD workflows
├── 📄 README.md                   # Main documentation
├── 📄 QUICK_START.md              # 5-minute setup guide
├── 📄 DEPLOYMENT_GUIDE.md         # Deployment instructions
├── 📄 MIGRATION_SUMMARY.md        # Migration details
├── 📄 CHECKLIST.md                # Deployment checklist
├── 📄 PROJECT_STRUCTURE.md        # This file
├── 📄 .gitignore                  # Git ignore rules
├── 📄 .env.example                # Frontend env template
├── 📄 .env.production.example     # Production env template
├── 📄 setup.sh                    # Setup script (Unix)
└── 📄 setup.bat                   # Setup script (Windows)
```

## Backend Directory (`/backend/`)

### Main Application
```
backend/
├── 📄 app.py                      # Main Flask application
│   ├── Flask app initialization
│   ├── Database models (User, ParkingData, SpotConfig)
│   ├── Authentication routes (/auth/*)
│   ├── Parking data routes (/parking-data)
│   ├── Spot management routes (/spots/*)
│   └── Rate limiting and CORS
```

### Configuration & Dependencies
```
backend/
├── 📄 requirements.txt            # Python dependencies
│   ├── Flask, Flask-CORS
│   ├── Flask-SQLAlchemy, Flask-JWT-Extended
│   ├── psycopg2-binary (PostgreSQL)
│   └── gunicorn (production server)
│
├── 📄 fly.toml                    # Fly.io deployment config
│   ├── App name and region
│   ├── Build settings
│   ├── Environment variables
│   └── Health check configuration
│
├── 📄 Procfile                    # Process file for deployment
├── 📄 runtime.txt                 # Python version specification
├── 📄 .env.example                # Environment template
└── 📄 .gitignore                  # Backend-specific ignores
```

### Scripts & Data
```
backend/
├── 📄 send_parking_data.py        # Data sender script
│   ├── Reads parking_status.json
│   ├── Sends to /parking-data endpoint
│   ├── Continuous mode (default)
│   └── Single-send mode (--once flag)
│
├── 📄 test_api.py                 # API testing script
│   ├── Tests all endpoints
│   ├── Validates responses
│   ├── Colored output
│   └── Returns pass/fail status
│
├── 📄 parking_status.json         # Example parking data
│   ├── 6 areas (Area1-Area6)
│   ├── 30 total spots (5 per area)
│   ├── GPS coordinates
│   └── Occupancy status
│
└── 📄 README.md                   # Backend documentation
```

### Runtime Files (Generated)
```
backend/
├── 📁 venv/                       # Virtual environment (gitignored)
├── 📄 .env                        # Environment variables (gitignored)
├── 📄 magicspot.db                # SQLite database (gitignored)
└── 📁 __pycache__/               # Python cache (gitignored)
```

## Frontend Directory (`/src/`)

### Main Application
```
src/
├── 📄 App.tsx                     # Main app component
│   ├── Authentication state
│   ├── Parking data state
│   ├── Auto-refresh logic
│   ├── Login/logout handlers
│   └── Layout (header + map)
│
├── 📄 main.tsx                    # App entry point
└── 📄 index.html                  # HTML template
```

### Components (`/components/`)

#### Main Components
```
components/
├── 📄 ParkingMap.tsx              # Interactive Leaflet map
│   ├── OpenStreetMap tiles
│   ├── Spot markers (green/red)
│   ├── Popup with navigation
│   ├── Legend with counts
│   └── Preview mode support
│
├── 📄 LoginScreen.tsx             # Login/signup form
│   ├── Tab switching (login/signup)
│   ├── Form validation
│   ├── Error handling
│   └── Loading states
│
├── 📄 Logo.tsx                    # App logo component
├── 📄 TopBanner.tsx               # Header banner
└── 📄 AdminPanel.tsx              # Admin features (future)
```

#### UI Components (`/components/ui/`)
```
components/ui/
├── 📄 button.tsx                  # Button component
├── 📄 input.tsx                   # Input field
├── 📄 label.tsx                   # Form label
├── 📄 card.tsx                    # Card container
├── 📄 dropdown-menu.tsx           # Dropdown menu
├── 📄 tabs.tsx                    # Tab navigation
├── 📄 checkbox.tsx                # Checkbox input
├── 📄 sonner.tsx                  # Toast notifications
└── ... (30+ UI components)
```

### Services (`/services/`)

```
services/
├── 📄 auth.ts                     # Authentication service
│   ├── signup() - Create account
│   ├── login() - Get JWT token
│   ├── logout() - Clear session
│   ├── getSession() - Verify token
│   └── getAuthHeaders() - Token headers
│
├── 📄 api.ts                      # API client service
│   ├── fetchParkingData() - Get spots
│   ├── updateSpotName() - Update config
│   ├── addSpot() - Add new spot
│   └── removeSpot() - Remove spot
│
└── 📄 mockApi.ts                  # Mock data (dev only)
```

### Types (`/types/`)

```
types/
└── 📄 parking.ts                  # TypeScript types
    ├── ParkingSpot interface
    ├── ParkingData interface
    └── API response types
```

### Styles (`/styles/`)

```
styles/
└── 📄 globals.css                 # Global styles
    ├── Tailwind imports
    ├── CSS variables
    ├── Custom animations
    └── Typography defaults
```

### Utilities (`/utils/`)

```
utils/
└── 📁 supabase/                   # Legacy (can be removed)
    ├── 📄 client.tsx
    ├── 📄 info.tsx
    └── (Not used in new version)
```

## GitHub Configuration (`/.github/`)

```
.github/
└── 📁 workflows/
    └── 📄 deploy.yml              # CI/CD workflow
        ├── Auto-deploy on push to main
        ├── Builds and deploys backend
        └── Requires FLY_API_TOKEN secret
```

## Documentation Files

### Getting Started
```
📄 README.md                       # Complete documentation
   ├── Features overview
   ├── Tech stack
   ├── Setup instructions
   ├── Deployment guide
   ├── API reference
   └── Troubleshooting

📄 QUICK_START.md                  # 5-minute guide
   ├── Prerequisites
   ├── Step-by-step setup
   ├── Testing instructions
   └── Troubleshooting
```

### Deployment
```
📄 DEPLOYMENT_GUIDE.md             # Detailed deployment
   ├── GitHub setup
   ├── Fly.io deployment
   ├── Vercel/Netlify deployment
   ├── Data sender setup
   └── Monitoring

📄 CHECKLIST.md                    # Deployment checklist
   ├── Local setup tasks
   ├── Backend deployment tasks
   ├── Frontend deployment tasks
   ├── Testing tasks
   └── Security tasks
```

### Migration & Reference
```
📄 MIGRATION_SUMMARY.md            # Migration details
   ├── What changed
   ├── Architecture comparison
   ├── Benefits
   └── Next steps

📄 PROJECT_STRUCTURE.md            # This file
   ├── Complete file tree
   ├── File descriptions
   └── Directory organization
```

## Configuration Files

### Environment Files
```
📄 .env.example                    # Frontend env template
📄 .env.production.example         # Production env template
📄 backend/.env.example            # Backend env template
📄 .env                            # Actual env (gitignored)
📄 backend/.env                    # Backend env (gitignored)
```

### Git Configuration
```
📄 .gitignore                      # Root ignore rules
   ├── node_modules/
   ├── dist/
   ├── .env files
   └── Build outputs

📄 backend/.gitignore              # Backend ignore rules
   ├── venv/
   ├── __pycache__/
   ├── *.db files
   └── .env file
```

### Build Configuration
```
📄 vite.config.ts                  # Vite configuration (auto-generated)
📄 tsconfig.json                   # TypeScript config (auto-generated)
📄 package.json                    # Node dependencies (auto-generated)
```

## File Size Summary

### Large Directories (gitignored)
- `node_modules/` - ~200MB (npm dependencies)
- `backend/venv/` - ~50MB (Python dependencies)
- `dist/` - ~5MB (build output)

### Important Small Files
- `backend/app.py` - ~15KB (main backend logic)
- `src/App.tsx` - ~8KB (main frontend logic)
- `components/ParkingMap.tsx` - ~12KB (map component)

### Total Project Size
- Source code: ~5MB
- With dependencies: ~250MB
- Deployed (backend): ~150MB
- Deployed (frontend): ~5MB

## Key Dependencies

### Backend (Python)
```
Flask                  - Web framework
Flask-CORS            - CORS handling
Flask-SQLAlchemy      - ORM
Flask-JWT-Extended    - JWT authentication
psycopg2-binary       - PostgreSQL driver
gunicorn              - Production server
```

### Frontend (JavaScript/TypeScript)
```
react                 - UI library
leaflet               - Map library
react-leaflet         - React bindings for Leaflet
lucide-react          - Icons
sonner                - Toast notifications
tailwindcss           - CSS framework
```

## Important URLs

### Local Development
- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- Backend Health: http://localhost:5000/health

### Production (Example)
- Frontend: https://magicspot.vercel.app
- Backend: https://magicspot-backend.fly.dev
- Backend Health: https://magicspot-backend.fly.dev/health

## Next Steps After Setup

1. ✅ Review this file to understand the structure
2. 📝 Update `backend/parking_status.json` with real coordinates
3. 🚀 Follow QUICK_START.md to run locally
4. 🌐 Follow DEPLOYMENT_GUIDE.md to deploy
5. ✓ Use CHECKLIST.md to track progress

## Notes

- **Protected files**: `/utils/supabase/` can be deleted (legacy)
- **Optional cleanup**: Remove `/components/AdminPanel.tsx` if not using
- **Custom modifications**: Add your own components in `/components/`
- **API extensions**: Add new routes in `backend/app.py`

---

For detailed information about any file, see the main README.md or the file's inline comments.
