const path = require('path');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('./middleware/sanitize');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');

dotenv.config({ path: path.join(__dirname, '.env') });
connectDB();

const app = express();
// Render/Vercel sit behind a reverse proxy; trust it so secure cookies work.
app.set('trust proxy', 1);
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Make io accessible in routes via req.app.get('io')
app.set('io', io);

// Security middleware
app.use(helmet());
app.use(mongoSanitize);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests, please try again later',
});
app.use('/api/', limiter);

// Body parser (raised limit so base64 profile pictures fit)
app.use(express.json({ limit: '2mb' }));
app.use(cookieParser());

// CORS
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  })
);

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'PitchUp API is running' });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/games', require('./routes/games'));

// Socket.io connection
io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  // Per-game chat rooms: a client joins a game's room to receive its messages
  socket.on('chat:join', (gameId) => socket.join(`game:${gameId}`));
  socket.on('chat:leave', (gameId) => socket.leave(`game:${gameId}`));

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
