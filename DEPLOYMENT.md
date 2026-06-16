# PitchUp – Deployment Guide

## ⚠️ Important: Why NOT Vercel for the backend

Vercel is **serverless** — each request spins up a new function instance and dies.  
Socket.io requires a **persistent connection** (WebSocket). The two are incompatible.

**Plan:**
| Part | Host | Why |
|------|------|-----|
| React frontend | **Vercel** | Perfect for static/SPA builds |
| Express + Socket.io backend | **Render** (free tier) | Persistent server, free |

---

## Step 1 – Push to GitHub

```bash
# From the project root
git add .
git commit -m "feat: complete PitchUp MVP"
git push origin master
```

---

## Step 2 – Deploy Backend on Render

1. Go to https://render.com → New → **Web Service**
2. Connect your GitHub repo, select the **`server`** folder as Root Directory
3. Build command: `npm install`
4. Start command: `node server.js`
5. Add Environment Variables:
   - `MONGO_URI` → your Atlas connection string
   - `JWT_SECRET` → any long random string
   - `CLIENT_URL` → your Vercel frontend URL (set this after Step 3)
   - `NODE_ENV` → `production`
6. Deploy. Copy the Render URL (e.g. `https://pitchup-api.onrender.com`)

---

## Step 3 – Deploy Frontend on Vercel

1. Go to https://vercel.com → New Project → Import your GitHub repo
2. Set **Root Directory** to `client`
3. Framework: **Create React App**
4. Add Environment Variable:
   - `REACT_APP_API_URL` → your Render backend URL from Step 2
5. Deploy.

---

## Step 4 – Update CORS on Render

Go back to Render → your web service → Environment → update `CLIENT_URL` to your Vercel URL → Redeploy.

---

## Local Development

```bash
# Terminal 1 – Backend
cd server && npm run dev

# Terminal 2 – Frontend  
cd client && npm start
```

The React app proxies `/api/*` to `http://localhost:5000` (set in client/package.json).
