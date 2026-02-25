# Magic Spot App

Street Parking Monitoring - Frontend Application

## Architecture

This repository contains the **frontend application only**. The backend computer vision system is proprietary and runs separately.

```
┌─────────────────┐    ┌─────────────────┐
│   Frontend      │◄──►│   Backend API   │
│   (Open Source) │    │   (Proprietary) │
│   MIT License   │    │   Private       │
└─────────────────┘    └─────────────────┘
```

### Frontend (React/TypeScript)
A modern web application for viewing parking availability in real-time.

**Setup:**
```bash
npm install
npm run dev
```

### Backend (Python - Not Included)
The computer vision system that detects parking space occupancy using AI models and camera feeds.

**Note:** The backend is proprietary and not included in this open source release. It provides a REST API that the frontend connects to.

## Features

- **Real-time Parking Detection**: View parking availability from AI-powered computer vision
- **Interactive Map**: Modern web interface showing parking availability with live updates
- **User Authentication**: Secure login and account management
- **Subscription Management**: Beta access and future paid tiers
- **Responsive Design**: Works on desktop and mobile devices

## Technology Stack

### Frontend
- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS + shadcn/ui components
- Leaflet for mapping
- Supabase for authentication and real-time data

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

**Note:** Only the frontend code is open source. The backend computer vision system is proprietary.

## Attributions

See [ATTRIBUTIONS.md](ATTRIBUTIONS.md) for a complete list of third-party libraries used in the frontend.
