const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Game = require('../models/Game');
const Message = require('../models/Message');
const { protect } = require('../middleware/auth');

const SPORTS = ['cricket', 'football', 'pickleball', 'badminton'];

// Approx centre of each Mumbai-region locality as GeoJSON [longitude, latitude].
// Fallback pin when a request doesn't send exact coords. Kept in sync with the
// client's AREA_COORDS (client/src/lib/constants.js).
const AREA_COORDS = {
  Colaba: [72.8146, 18.9067], 'Cuffe Parade': [72.8186, 18.9090], 'Nariman Point': [72.8230, 18.9256],
  Churchgate: [72.8270, 18.9322], Fort: [72.8360, 18.9340], 'Marine Lines': [72.8230, 18.9430],
  Girgaon: [72.8170, 18.9560], 'Charni Road': [72.8190, 18.9510], 'Grant Road': [72.8155, 18.9620],
  'Malabar Hill': [72.7950, 18.9540], 'Breach Candy': [72.8050, 18.9680], Tardeo: [72.8120, 18.9690],
  'Mumbai Central': [72.8210, 18.9710], Mahalaxmi: [72.8230, 18.9820], Byculla: [72.8330, 18.9760],
  Mazgaon: [72.8420, 18.9660], Worli: [72.8170, 19.0176], 'Lower Parel': [72.8300, 18.9960],
  Prabhadevi: [72.8270, 19.0150], Parel: [72.8390, 18.9990], Sewri: [72.8560, 18.9930],
  Wadala: [72.8620, 19.0170],
  Dadar: [72.8424, 19.0176], Matunga: [72.8500, 19.0270], Mahim: [72.8400, 19.0410], Sion: [72.8650, 19.0430],
  Bandra: [72.8296, 19.0606], Khar: [72.8370, 19.0700], Santacruz: [72.8410, 19.0810],
  'Vile Parle': [72.8470, 19.0990], Juhu: [72.8265, 19.1075], Versova: [72.8120, 19.1330],
  Andheri: [72.8470, 19.1136], Jogeshwari: [72.8490, 19.1370], Goregaon: [72.8490, 19.1640],
  Malad: [72.8480, 19.1860], Kandivali: [72.8510, 19.2095], Borivali: [72.8567, 19.2307],
  Dahisar: [72.8600, 19.2540],
  Chembur: [72.8990, 19.0522], Govandi: [72.9180, 19.0530], Mankhurd: [72.9300, 19.0500],
  Kurla: [72.8790, 19.0726], Ghatkopar: [72.9081, 19.0860], Vidyavihar: [72.8970, 19.0790],
  Vikhroli: [72.9260, 19.1090], Powai: [72.9050, 19.1176], Kanjurmarg: [72.9320, 19.1290],
  Bhandup: [72.9370, 19.1440], Mulund: [72.9560, 19.1720],
  Vashi: [72.9986, 19.0760], Sanpada: [73.0110, 19.0640], Nerul: [73.0180, 19.0330],
  Seawoods: [73.0190, 19.0190], 'CBD Belapur': [73.0358, 19.0235], Kharghar: [73.0700, 19.0470],
  Panvel: [73.1100, 18.9890], 'Kopar Khairane': [73.0070, 19.1040], Ghansoli: [73.0010, 19.1230],
  Airoli: [72.9990, 19.1590],
  Thane: [72.9781, 19.2183], Kalwa: [72.9920, 19.1930], Mumbra: [73.0230, 19.1880],
  Dombivli: [73.0870, 19.2150], Kalyan: [73.1300, 19.2400], 'Mira Road': [72.8710, 19.2810],
  Bhayandar: [72.8510, 19.3010], Vasai: [72.8260, 19.3910], Virar: [72.8120, 19.4550],
};

// ─── GET /api/games  (public – with optional filters) ────────────────────────
// Query params: sport, area, status, lat, lng, radius (metres)
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.sport) filter.sport = req.query.sport;
    if (req.query.area)  filter.area  = { $regex: req.query.area, $options: 'i' };
    if (req.query.status) filter.status = req.query.status;
    else filter.status = { $nin: ['completed', 'cancelled'] }; // hide closed games by default

    // Only show today's / upcoming games
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    filter.date = { $gte: today };

    // Optional geospatial "near me" search (uses the 2dsphere index)
    const { lat, lng } = req.query;
    const useNear = lat !== undefined && lng !== undefined;
    if (useNear) {
      filter.location = {
        $near: {
          $geometry: { type: 'Point', coordinates: [Number(lng), Number(lat)] },
          $maxDistance: req.query.radius ? Number(req.query.radius) : 15000,
        },
      };
    }

    // List stays lean — names only (cards show initials), no avatar payloads
    let q = Game.find(filter)
      .populate('organizer', 'name')
      .populate('players', 'name');
    if (!useNear) q = q.sort({ date: 1 }); // $near already sorts by distance

    const games = await q;
    res.json({ success: true, count: games.length, data: games });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── GET /api/games/:id ───────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const game = await Game.findById(req.params.id)
      .populate('organizer', 'name avatar')
      .populate('players', 'name avatar');
    if (!game) return res.status(404).json({ message: 'Game not found' });
    res.json({ success: true, data: game });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── POST /api/games  (protected) ────────────────────────────────────────────
router.post(
  '/',
  protect,
  [
    body('sport').isIn(SPORTS).withMessage('Invalid sport'),
    body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 100 }),
    body('venue').trim().notEmpty().withMessage('Venue is required'),
    body('area').trim().notEmpty().withMessage('Area is required'),
    body('date').isISO8601().withMessage('Valid date is required'),
    body('time').notEmpty().withMessage('Time is required'),
    body('totalPlayers').isInt({ min: 2, max: 100 }).withMessage('totalPlayers must be between 2 and 100'),
    body('contribution').optional().isInt({ min: 0 }).withMessage('Contribution must be ≥ 0'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { sport, title, venue, area, date, time, totalPlayers, contribution, description, lat, lng } = req.body;

      // Use exact coords if sent, otherwise fall back to the area's centre
      const coordinates = (lat !== undefined && lng !== undefined)
        ? [Number(lng), Number(lat)]
        : AREA_COORDS[area];

      const game = await Game.create({
        sport,
        title,
        venue,
        area,
        date,
        time,
        totalPlayers,
        contribution: contribution || 0,
        description,
        ...(coordinates ? { location: { type: 'Point', coordinates } } : {}),
        organizer: req.user._id,
        players: [req.user._id], // organizer auto-joins
      });

      const populated = await game.populate([
        { path: 'organizer', select: 'name avatar' },
        { path: 'players', select: 'name avatar' },
      ]);

      const io = req.app.get('io');
      if (io) io.emit('game:created', populated);

      res.status(201).json({ success: true, data: populated });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// ─── PUT /api/games/:id/join  (protected) ────────────────────────────────────
router.put('/:id/join', protect, async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);
    if (!game) return res.status(404).json({ message: 'Game not found' });
    if (game.status === 'full') return res.status(400).json({ message: 'Game is already full' });
    if (game.status === 'completed' || game.status === 'cancelled') {
      return res.status(400).json({ message: 'This game is closed' });
    }

    const alreadyJoined = game.players.some((p) => p.toString() === req.user._id.toString());
    if (alreadyJoined) return res.status(400).json({ message: 'You already joined this game' });

    game.players.push(req.user._id);
    await game.save(); // pre-save hook flips status to 'full' when squad fills

    const populated = await game.populate([
      { path: 'organizer', select: 'name avatar' },
      { path: 'players', select: 'name avatar' },
    ]);

    const io = req.app.get('io');
    if (io) io.emit('game:updated', populated);

    res.json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── PUT /api/games/:id/leave  (protected) ───────────────────────────────────
router.put('/:id/leave', protect, async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);
    if (!game) return res.status(404).json({ message: 'Game not found' });

    const isOrganizer = game.organizer.toString() === req.user._id.toString();
    if (isOrganizer) return res.status(400).json({ message: 'Organizer cannot leave. Delete the game instead.' });

    const idx = game.players.findIndex((p) => p.toString() === req.user._id.toString());
    if (idx === -1) return res.status(400).json({ message: 'You have not joined this game' });

    game.players.splice(idx, 1);
    await game.save(); // pre-save hook re-opens status to 'upcoming'

    const populated = await game.populate([
      { path: 'organizer', select: 'name avatar' },
      { path: 'players', select: 'name avatar' },
    ]);

    const io = req.app.get('io');
    if (io) io.emit('game:updated', populated);

    res.json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── DELETE /api/games/:id  (protected – organizer only) ─────────────────────
router.delete('/:id', protect, async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);
    if (!game) return res.status(404).json({ message: 'Game not found' });
    if (game.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorised to delete this game' });
    }

    await game.deleteOne();

    const io = req.app.get('io');
    if (io) io.emit('game:deleted', { gameId: req.params.id });

    res.json({ success: true, message: 'Game deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Per-game chat ───────────────────────────────────────────────────────────
// Only players (and the organizer) of a game may read or post in its chat.
const assertMember = (game, userId) =>
  game.organizer.toString() === userId.toString() ||
  game.players.some((p) => p.toString() === userId.toString());

// GET /api/games/:id/messages  — chat history (protected, members only)
router.get('/:id/messages', protect, async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);
    if (!game) return res.status(404).json({ message: 'Game not found' });
    if (!assertMember(game, req.user._id)) {
      return res.status(403).json({ message: 'Join the game to see its chat' });
    }

    const messages = await Message.find({ game: game._id })
      .populate('sender', 'name avatar')
      .sort({ createdAt: 1 });

    res.json({ success: true, count: messages.length, data: messages });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/games/:id/messages  — send a message (protected, members only)
router.post(
  '/:id/messages',
  protect,
  [body('text').trim().notEmpty().withMessage('Message cannot be empty').isLength({ max: 500 })],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const game = await Game.findById(req.params.id);
      if (!game) return res.status(404).json({ message: 'Game not found' });
      if (!assertMember(game, req.user._id)) {
        return res.status(403).json({ message: 'Join the game to chat' });
      }

      let message = await Message.create({
        game: game._id,
        sender: req.user._id,
        text: req.body.text,
      });
      message = await message.populate('sender', 'name avatar');

      // Push to everyone currently in this game's chat room
      const io = req.app.get('io');
      if (io) io.to(`game:${game._id}`).emit('chat:message', message);

      res.status(201).json({ success: true, data: message });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

module.exports = router;
