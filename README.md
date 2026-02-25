# Magic Spot App

Street Parking Monitoring - Full-Stack Solution

## Components

This project consists of two main components:

### Frontend (React/TypeScript)
A modern web application for viewing parking availability in real-time.

**Setup:**
```bash
npm install
npm run dev
```

### Backend (Python)
A computer vision system that detects parking space occupancy using AI models and camera feeds.

**Setup:**
```bash
cd backend
pip install -r requirements.txt
python main.py
```

## Features

- **Real-time Parking Detection**: AI-powered computer vision identifies occupied vs available parking spaces
- **Interactive Map**: Modern web interface showing parking availability with live updates
- **Camera Integration**: PTZ camera control and RTSP stream processing
- **Geofencing**: Polygon-based parking space definitions
- **Cloud Sync**: Real-time data synchronization with Supabase
- **Desktop GUI**: Local management interface for camera and detection settings

## Technology Stack

### Frontend
- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS + shadcn/ui components
- Leaflet for mapping
- Supabase for real-time data

### Backend
- Python 3.8+
- OpenCV for computer vision
- Roboflow for AI model inference
- ONVIF for camera control
- CustomTkinter for desktop GUI
- Supabase for data persistence

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

## Attributions

See [ATTRIBUTIONS.md](ATTRIBUTIONS.md) for a complete list of third-party libraries and their licenses.
