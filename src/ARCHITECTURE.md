# MagicSpot Architecture

Visual overview of the MagicSpot application architecture.

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        MagicSpot System                          │
│                                                                   │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────────┐  │
│  │   Frontend   │◄────►│   Backend    │◄────►│   Database   │  │
│  │   (React)    │ HTTP │   (Flask)    │ SQL  │ (PostgreSQL) │  │
│  └──────────────┘      └──────────────┘      └──────────────┘  │
│         ▲                      ▲                                 │
│         │                      │                                 │
│         │                      │                                 │
│    [User Browser]      [Data Sender Script]                     │
│                         (Python)                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Component Architecture

### Frontend (React)

```
┌─────────────────────────────────────────────────────────────┐
│                     React Frontend                           │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐                                            │
│  │   App.tsx    │  Main component                            │
│  └──────┬───────┘                                            │
│         │                                                     │
│  ┌──────▼────────────────────────────────────────┐          │
│  │           Component Layer                      │          │
│  ├────────────────────────────────────────────────┤          │
│  │  • LoginScreen    - Authentication UI          │          │
│  │  • ParkingMap     - Interactive map            │          │
│  │  • Logo           - Branding                   │          │
│  │  • UI Components  - Buttons, inputs, etc.     │          │
│  └────────┬───────────────────────────────────────┘          │
│           │                                                   │
│  ┌────────▼───────────────────────────────────────┐          │
│  │           Service Layer                         │          │
│  ├─────────────────────────────────────────────────┤          │
│  │  • auth.ts   - Authentication (JWT)            │          │
│  │  • api.ts    - API client (fetch)              │          │
│  └────────┬────────────────────────────────────────┘          │
│           │                                                   │
│           ▼                                                   │
│      [Backend API]                                           │
└─────────────────────────────────────────────────────────────┘
```

### Backend (Flask)

```
┌─────────────────────────────────────────────────────────────┐
│                     Flask Backend                            │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────────────────────────────┐           │
│  │           Route Layer (app.py)                │           │
│  ├───────────────────────────────────────────────┤           │
│  │  Authentication Routes:                       │           │
│  │    POST /auth/signup     - Create account     │           │
│  │    POST /auth/login      - Get JWT token      │           │
│  │    GET  /auth/me         - Get user info      │           │
│  │                                                │           │
│  │  Parking Data Routes:                         │           │
│  │    POST /parking-data    - Receive updates    │           │
│  │    GET  /parking-data    - Fetch latest       │           │
│  │                                                │           │
│  │  Spot Config Routes:                          │           │
│  │    GET    /spots/config  - Get all configs    │           │
│  │    POST   /spots/:id/name - Update name       │           │
│  │    POST   /spots         - Add spot           │           │
│  │    DELETE /spots/:id     - Remove spot        │           │
│  └──────────┬───────────────────────────────────┘           │
│             │                                                 │
│  ┌──────────▼───────────────────────────────────┐           │
│  │           Business Logic                      │           │
│  ├───────────────────────────────────────────────┤           │
│  │  • Password hashing (bcrypt)                  │           │
│  │  • JWT token generation/validation            │           │
│  │  • Data transformation (area → flat)          │           │
│  │  • Rate limiting (in-memory)                  │           │
│  └──────────┬───────────────────────────────────┘           │
│             │                                                 │
│  ┌──────────▼───────────────────────────────────┐           │
│  │           Data Layer (SQLAlchemy)             │           │
│  ├───────────────────────────────────────────────┤           │
│  │  Models:                                      │           │
│  │    • User          - Authentication           │           │
│  │    • ParkingData   - Latest parking state     │           │
│  │    • SpotConfig    - Custom spot names        │           │
│  └──────────┬───────────────────────────────────┘           │
│             │                                                 │
│             ▼                                                 │
│      [PostgreSQL Database]                                   │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                        Data Flow Diagram                          │
└──────────────────────────────────────────────────────────────────┘

1. User Signup/Login Flow:
   ┌──────┐         ┌─────────┐         ┌──────────┐
   │ User │────────>│ Frontend│────────>│ Backend  │
   └──────┘  Enter  └─────────┘  POST   └──────────┘
             creds              /auth/login      │
                                                  │
                                            ┌─────▼─────┐
                                            │  Validate │
                                            │ Password  │
                                            └─────┬─────┘
                                                  │
                                            ┌─────▼─────┐
                                            │ Generate  │
                                            │ JWT Token │
                                            └─────┬─────┘
                                                  │
   ┌──────┐         ┌─────────┐         ┌────────▼──┐
   │ User │<────────│ Frontend│<────────│  Return   │
   └──────┘  Show   └─────────┘  JSON   │  Token    │
             map                         └───────────┘

2. Parking Data Update Flow:
   ┌──────────────┐         ┌─────────┐         ┌──────────┐
   │ parking_     │────────>│ Backend │────────>│ Database │
   │ status.json  │  POST   └─────────┘  Store  └──────────┘
   └──────────────┘ /parking-data
                         │
   ┌──────────────┐      │
   │ Data Sender  │──────┘
   │ Script       │ (Every 10s)
   └──────────────┘

3. Map Display Flow:
   ┌──────┐         ┌─────────┐         ┌─────────┐         ┌──────────┐
   │ User │────────>│ Frontend│────────>│ Backend │────────>│ Database │
   └──────┘  View   └─────────┘  GET    └─────────┘  Query  └──────────┘
             map                /parking-data              │
                                    ▲                       │
                                    │         JSON          │
                                    └───────────────────────┘
                                            │
   ┌──────┐         ┌─────────┐         ┌──▼──────┐
   │ User │<────────│ Render  │<────────│ Transform│
   └──────┘  See    │ Markers │         │ Data     │
             spots  └─────────┘         └──────────┘
```

## Database Schema

```
┌────────────────────────────────────────────────────────────┐
│                     Database Tables                         │
├────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────────────┐                               │
│  │      User Table         │                               │
│  ├─────────────────────────┤                               │
│  │ id          INTEGER PK  │                               │
│  │ email       VARCHAR     │  Unique                       │
│  │ password    VARCHAR     │  Hashed (bcrypt)              │
│  │ name        VARCHAR     │                               │
│  │ created_at  TIMESTAMP   │                               │
│  └─────────────────────────┘                               │
│                                                              │
│  ┌─────────────────────────┐                               │
│  │   ParkingData Table     │                               │
│  ├─────────────────────────┤                               │
│  │ id          INTEGER PK  │                               │
│  │ timestamp   TIMESTAMP   │                               │
│  │ data        JSON        │  Full parking state           │
│  └─────────────────────────┘                               │
│                                                              │
│  ┌─────────────────────────┐                               │
│  │   SpotConfig Table      │                               │
│  ├─────────────────────────┤                               │
│  │ id          VARCHAR PK  │  "Area1-s1"                   │
│  │ name        VARCHAR     │  Custom name                  │
│  │ lat         FLOAT       │  GPS coordinate               │
│  │ lon         FLOAT       │  GPS coordinate               │
│  │ created_at  TIMESTAMP   │                               │
│  └─────────────────────────┘                               │
│                                                              │
└────────────────────────────────────────────────────────────┘
```

## Authentication Flow

```
┌────────────────────────────────────────────────────────────┐
│                  JWT Authentication                         │
└────────────────────────────────────────────────────────────┘

1. Login:
   ┌─────────┐                              ┌─────────┐
   │ Client  │                              │ Server  │
   └────┬────┘                              └────┬────┘
        │                                        │
        │  POST /auth/login                     │
        │  {email, password}                    │
        ├──────────────────────────────────────>│
        │                                        │
        │                              Validate credentials
        │                              Generate JWT token
        │                                        │
        │  200 OK                               │
        │  {access_token, user}                 │
        │<──────────────────────────────────────┤
        │                                        │
   Store token in localStorage                  │
        │                                        │

2. Authenticated Request:
   ┌─────────┐                              ┌─────────┐
   │ Client  │                              │ Server  │
   └────┬────┘                              └────┬────┘
        │                                        │
        │  GET /parking-data                    │
        │  Authorization: Bearer <token>        │
        ├──────────────────────────────────────>│
        │                                        │
        │                              Verify JWT token
        │                              Extract user ID
        │                              Process request
        │                                        │
        │  200 OK                               │
        │  {parking data}                       │
        │<──────────────────────────────────────┤
        │                                        │
```

## Deployment Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                    Production Deployment                        │
└────────────────────────────────────────────────────────────────┘

                          Internet
                             │
                ┌────────────┴────────────┐
                │                         │
        ┌───────▼────────┐       ┌───────▼────────┐
        │   Vercel/      │       │   Fly.io       │
        │   Netlify      │       │   (Backend)    │
        │   (Frontend)   │       └────────┬───────┘
        └───────┬────────┘                │
                │                         │
          Static files              ┌─────▼──────┐
          (React app)                │ PostgreSQL │
                                     │  Database  │
                                     └────────────┘
                │
                │
        ┌───────▼────────┐
        │  Data Sender   │
        │  Script        │
        │  (Your server) │
        └────────────────┘

DNS Records:
  • Frontend: your-app.vercel.app (or custom domain)
  • Backend:  your-app.fly.dev (or custom domain)

SSL/TLS:
  • Automatically provided by Vercel/Netlify/Fly.io
  • All traffic is HTTPS

CDN:
  • Frontend assets served via Vercel/Netlify CDN
  • Global distribution for fast loading
```

## Technology Stack

```
┌─────────────────────────────────────────────────────────────┐
│                     Technology Stack                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Frontend:                                                   │
│    • React 18          - UI framework                        │
│    • TypeScript        - Type safety                         │
│    • Vite              - Build tool                          │
│    • Tailwind CSS      - Styling                             │
│    • Leaflet.js        - Interactive maps                    │
│    • React Leaflet     - React bindings                      │
│    • Lucide React      - Icons                               │
│    • Sonner            - Toast notifications                 │
│                                                               │
│  Backend:                                                    │
│    • Python 3.11       - Programming language                │
│    • Flask             - Web framework                       │
│    • SQLAlchemy        - ORM                                 │
│    • Flask-JWT-Extended - JWT authentication                 │
│    • Flask-CORS        - CORS handling                       │
│    • Gunicorn          - WSGI server                         │
│                                                               │
│  Database:                                                   │
│    • PostgreSQL        - Production (Fly.io)                 │
│    • SQLite            - Development (local)                 │
│                                                               │
│  Deployment:                                                 │
│    • Fly.io            - Backend hosting                     │
│    • Vercel/Netlify    - Frontend hosting                    │
│    • GitHub            - Version control                     │
│    • GitHub Actions    - CI/CD                               │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Security Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Security Measures                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Authentication:                                             │
│    • JWT tokens (30-day expiration)                          │
│    • bcrypt password hashing                                 │
│    • Password requirements (8+ chars, upper, lower, number)  │
│                                                               │
│  API Security:                                               │
│    • Rate limiting (5 signups/hour per IP)                   │
│    • CORS enabled (all origins in dev, restricted in prod)   │
│    • SQL injection protection (SQLAlchemy ORM)               │
│    • XSS protection (React escapes by default)               │
│                                                               │
│  Data Security:                                              │
│    • HTTPS only (enforced by hosting platforms)              │
│    • Environment variables for secrets                       │
│    • No secrets in code or Git                               │
│    • Database backups (automatic on Fly.io)                  │
│                                                               │
│  Frontend Security:                                          │
│    • Token stored in localStorage (XSS risk - consider       │
│      httpOnly cookies for production)                        │
│    • Input validation                                        │
│    • Error messages don't leak sensitive info                │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Scaling Considerations

```
Current Architecture:
  • Single backend instance
  • Single database instance
  • In-memory rate limiting
  • Suitable for: 100-1000 concurrent users

Future Scaling Options:
  1. Horizontal Scaling:
     • Add more Fly.io instances
     • Use Redis for rate limiting
     • Add load balancer

  2. Database Optimization:
     • Add indexes for common queries
     • Implement caching (Redis)
     • Database read replicas

  3. Frontend Optimization:
     • Lazy loading components
     • Service worker for offline support
     • Image optimization

  4. Monitoring:
     • Add error tracking (Sentry)
     • Add performance monitoring (New Relic)
     • Set up alerts
```

## Next Steps

For implementation details, see:
- **Frontend Code**: `/src/` directory
- **Backend Code**: `/backend/app.py`
- **Deployment**: [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
- **API Reference**: [README.md](README.md)

---

For a quick overview of all files, see [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md).
