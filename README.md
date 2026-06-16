# PitchUp Pickup Sports in Mumbai

Find open cricket, football, badminton, and pickleball games near you, join in one click, and chat with your squad in real time.

---

## Features

- **Browse & filter games** by sport, area, or status  only today's and upcoming games are shown
- **Create a game** with venue, date, time, squad size, and per-head contribution
- **Join / leave** in one click  spots update live for everyone on the page
- **Interactive maps**  every game is pinned on a Leaflet/OpenStreetMap map, no paid API
- **Squad chat** real-time group chat per game, visible only to players who have joined
- **Profile pictures**  upload a photo that appears on your profile and in the chat
- **69 Mumbai localities**  from Colaba to Virar, Vashi to Thane

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, React Router 7, Axios, Leaflet |
| Backend | Node.js, Express 5, Socket.IO 4 |
| Database | MongoDB Atlas (Mongoose 9) |
| Auth | JWT in httpOnly cookie (7-day expiry) |
| Maps | Leaflet 1.9.4 + OpenStreetMap (free, no API key) |
| Realtime | Socket.IO rooms — per-game chat + live spot counts |

---

## Local Setup

### Prerequisites

- Node.js 18+
- A MongoDB Atlas cluster (free tier works)

### 1. Clone the repo

```bash
git clone https://github.com/akshatt6405/PitchUp-Meet-Play.git
cd PitchUp-Meet-Play
```

### 2. Backend

```bash
cd server
cp .env.example .env
# Fill in MONGO_URI and JWT_SECRET in .env
npm install
npm run dev        # starts on port 5000 with nodemon
```

### 3. Frontend

```bash
cd client
npm install
npm start          # starts on port 3000, proxies /api to port 5000
```

### 4. Seed demo data (optional)

```bash
node server/seed.js
```

Creates 5 demo users (`*@demo.pitchup.in` / `demo1234`) and 8 games across Mumbai.

---

## Deployment

Backend → **Render** (persistent Node server, required for Socket.IO)  
Frontend → **Vercel** (static React build)

See [DEPLOYMENT.md](DEPLOYMENT.md) for the full step-by-step guide including environment variables and CORS setup.

---

## Project Structure

```
PitchUp-Meet-Play/
├── client/                  # React SPA
│   ├── public/
│   └── src/
│       ├── components/      # Navbar, GameCard, Chat, VenueMap, Avatar, Icons
│       ├── context/         # AuthContext (axios + JWT)
│       ├── hooks/           # useSocket (Socket.IO client)
│       ├── lib/             # constants — AREA_COORDS, SPORT_META, formatters
│       └── pages/           # Home, GameDetail, CreateGame, Profile, Login, Register
└── server/
    ├── config/              # MongoDB connection
    ├── middleware/           # JWT auth, sanitizer
    ├── models/              # User, Game, Message
    ├── routes/              # auth.js, games.js (incl. chat endpoints)
    └── server.js            # Express + Socket.IO
```

---

## Environment Variables

### Server (`server/.env`)

| Variable | Description |
|---|---|
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret for signing JWTs |
| `CLIENT_URL` | Frontend URL for CORS (e.g. `https://your-app.vercel.app`) |
| `NODE_ENV` | `development` or `production` |
| `PORT` | Server port (default 5000) |

### Client (`client/.env`)

| Variable | Description |
|---|---|
| `REACT_APP_API_URL` | Backend URL in production (e.g. `https://your-api.onrender.com`) — leave unset for local dev |
