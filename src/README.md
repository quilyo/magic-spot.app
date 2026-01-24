# MagicSpot - Real-Time Parking Spot Monitoring

A full-stack web application that displays real-time parking spot availability on an interactive map using OpenStreetMap and Leaflet.js.

## Features

- 🗺️ Interactive map with OpenStreetMap tiles
- 🅿️ Real-time parking spot status (available/occupied)
- 🔐 User authentication with JWT
- 📍 GPS-accurate spot positioning
- 🧭 Google Maps navigation integration
- 📊 Live availability statistics
- 🔄 Auto-refresh every 10 seconds
- 📱 Responsive design

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite
- Leaflet.js for maps
- Tailwind CSS
- Lucide React (icons)
- Sonner (toast notifications)

### Backend
- Python 3.9+
- Flask
- Flask-JWT-Extended (authentication)
- SQLAlchemy (ORM)
- PostgreSQL (production) / SQLite (development)

## Project Structure

```
magicspot/
├── backend/                    # Python Flask backend
│   ├── app.py                 # Main Flask application
│   ├── requirements.txt       # Python dependencies
│   ├── fly.toml              # Fly.io deployment config
│   ├── send_parking_data.py  # Script to send parking data
│   └── parking_status.json   # Example parking data
├── src/                       # React frontend
│   ├── App.tsx               # Main app component
│   ├── components/           # React components
│   ├── services/             # API and auth services
│   └── types/                # TypeScript types
└── README.md
```

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create a `.env` file:
```bash
cp .env.example .env
```

5. Edit `.env` and set your secret keys:
```env
SECRET_KEY=your-random-secret-key-here
JWT_SECRET_KEY=your-random-jwt-secret-key-here
DATABASE_URL=sqlite:///magicspot.db
```

6. Run the backend:
```bash
python app.py
```

The backend will start on `http://localhost:5000`

### Frontend Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory:
```bash
cp .env.example .env
```

3. Edit `.env`:
```env
VITE_API_URL=http://localhost:5000
```

4. Start the development server:
```bash
npm run dev
```

The frontend will start on `http://localhost:5173`

## Deployment

### Deploy Backend to Fly.io

1. Install the [Fly CLI](https://fly.io/docs/hands-on/install-flyctl/)

2. Login to Fly.io:
```bash
flyctl auth login
```

3. Navigate to backend directory:
```bash
cd backend
```

4. Launch the app:
```bash
flyctl launch
```

5. Set environment secrets:
```bash
flyctl secrets set SECRET_KEY=your-random-secret-key
flyctl secrets set JWT_SECRET_KEY=your-random-jwt-secret-key
```

6. Create and attach PostgreSQL database:
```bash
flyctl postgres create
flyctl postgres attach --app magicspot-backend
```

7. Deploy:
```bash
flyctl deploy
```

Your backend will be available at `https://magicspot-backend.fly.dev`

### Deploy Frontend

#### Option 1: Vercel

1. Push your code to GitHub
2. Connect your repository to [Vercel](https://vercel.com)
3. Set environment variable: `VITE_API_URL=https://magicspot-backend.fly.dev`
4. Deploy

#### Option 2: Netlify

1. Push your code to GitHub
2. Connect your repository to [Netlify](https://netlify.com)
3. Set build command: `npm run build`
4. Set publish directory: `dist`
5. Set environment variable: `VITE_API_URL=https://magicspot-backend.fly.dev`
6. Deploy

## Sending Parking Data

Use the included Python script to send parking data to the backend:

```bash
cd backend
python send_parking_data.py
```

This will continuously read from `parking_status.json` and send updates every 10 seconds.

### Data Format

The backend expects data in the following format:

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

## API Endpoints

### Authentication
- `POST /auth/signup` - Create new user account
- `POST /auth/login` - Login and get JWT token
- `GET /auth/me` - Get current user info (requires auth)

### Parking Data
- `POST /parking-data` - Receive parking data updates
- `GET /parking-data` - Get latest parking data

### Spot Configuration
- `GET /spots/config` - Get all spot configurations
- `POST /spots/:id/name` - Update spot name (requires auth)
- `POST /spots` - Add new spot (requires auth)
- `DELETE /spots/:id` - Remove spot (requires auth)

## Environment Variables

### Backend
- `SECRET_KEY` - Flask secret key
- `JWT_SECRET_KEY` - JWT signing key
- `DATABASE_URL` - Database connection string
- `PORT` - Server port (default: 5000)
- `FLASK_ENV` - Environment (development/production)

### Frontend
- `VITE_API_URL` - Backend API URL

## Development Tips

1. **Local Development**: Make sure both backend and frontend are running
2. **CORS**: Backend is configured to allow all origins for development
3. **Database**: SQLite is used for local development, PostgreSQL for production
4. **Authentication**: JWT tokens are stored in localStorage
5. **Auto-refresh**: Parking data refreshes every 10 seconds when logged in

## License

MIT

## Support

For issues or questions, please open an issue on GitHub.
