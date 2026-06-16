// Demo data seeder — run with: node server/seed.js
// Creates demo users and a board of upcoming games across Mumbai.
// Safe to re-run: clears demo games (and any legacy docs) first.

const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

// Some local DNS resolvers refuse the SRV lookups mongodb+srv:// needs
const dns = require('node:dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const mongoose = require('mongoose');
const User = require('./models/User');
const Game = require('./models/Game');

const DEMO_USERS = [
  { name: 'Arjun Mehta', email: 'arjun@demo.pitchup.in', password: 'demo1234', city: 'Mumbai', sport: ['cricket', 'football'] },
  { name: 'Sneha Iyer', email: 'sneha@demo.pitchup.in', password: 'demo1234', city: 'Mumbai', sport: ['badminton', 'pickleball'] },
  { name: 'Rohan Kulkarni', email: 'rohan@demo.pitchup.in', password: 'demo1234', city: 'Mumbai', sport: ['football'] },
  { name: 'Priya Nair', email: 'priya@demo.pitchup.in', password: 'demo1234', city: 'Mumbai', sport: ['pickleball', 'badminton'] },
  { name: 'Kabir Shaikh', email: 'kabir@demo.pitchup.in', password: 'demo1234', city: 'Mumbai', sport: ['cricket'] },
];

const daysFromNow = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  d.setHours(0, 0, 0, 0);
  return d;
};

// coordinates are GeoJSON [longitude, latitude]
const GAMES = [
  { sport: 'cricket', title: 'Sunday Morning Tennis-Ball Cricket', venue: 'Oval Maidan', area: 'Churchgate', coordinates: [72.8286, 18.9290], date: daysFromNow(1), time: '07:00', totalPlayers: 22, contribution: 100, joiners: 8, description: 'Sunday morning tennis-ball cricket. All skill levels welcome. Bring whites if you have them!' },
  { sport: 'cricket', title: 'Season-Ball Nets + 15-Over Match', venue: 'Shivaji Park', area: 'Dadar', coordinates: [72.8424, 19.0276], date: daysFromNow(2), time: '06:30', totalPlayers: 16, contribution: 150, joiners: 11, description: 'Season-ball nets followed by a 15-over match. Pads and helmets provided.' },
  { sport: 'football', title: '7-a-side Under Lights', venue: "Neville D'Souza Turf", area: 'Bandra', coordinates: [72.8296, 19.0606], date: daysFromNow(1), time: '20:00', totalPlayers: 14, contribution: 150, joiners: 9, description: '7-a-side under lights. Turf charges split between players.' },
  { sport: 'football', title: 'Full-Pitch Sunday Friendly', venue: 'Cooperage Football Ground', area: 'Colaba', coordinates: [72.8270, 18.9165], date: daysFromNow(3), time: '18:00', totalPlayers: 22, contribution: 200, joiners: 5, description: 'Full-pitch friendly. Looking for a keeper and two defenders especially!' },
  { sport: 'badminton', title: 'Evening Doubles (Intermediate)', venue: 'Andheri Sports Complex', area: 'Andheri', coordinates: [72.8400, 19.1180], date: daysFromNow(1), time: '19:30', totalPlayers: 4, contribution: 200, joiners: 2, description: 'Doubles, intermediate level. Court booked for 2 hours, shuttles on me.' },
  { sport: 'badminton', title: 'Morning Doubles Session', venue: 'Matunga Gymkhana', area: 'Matunga', coordinates: [72.8490, 19.0270], date: daysFromNow(4), time: '07:30', totalPlayers: 4, contribution: 150, joiners: 4, description: 'Morning doubles session. Fast rallies, friendly crowd.' },
  { sport: 'pickleball', title: 'Beginner-Friendly Pickleball', venue: 'CCI Courts', area: 'Churchgate', coordinates: [72.8270, 18.9270], date: daysFromNow(2), time: '17:00', totalPlayers: 4, contribution: 250, joiners: 1, description: 'New to pickleball? Perfect for beginners. Friendly doubles, paddles available.' },
  { sport: 'pickleball', title: 'Competitive Doubles, Winners Stay', venue: 'Powai Sports Arena', area: 'Powai', coordinates: [72.9050, 19.1180], date: daysFromNow(5), time: '08:00', totalPlayers: 4, contribution: 200, joiners: 3, description: 'Competitive doubles. Winners stay on.' },
];

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  // Upsert demo users (create only if missing so password hashing runs once)
  const users = [];
  for (const u of DEMO_USERS) {
    let user = await User.findOne({ email: u.email });
    if (!user) user = await User.create(u);
    users.push(user);
  }
  console.log(`Demo users ready: ${users.length}`);

  // Reset demo games + any legacy docs that predate the current schema
  await Game.deleteMany({
    $or: [
      { organizer: { $in: users.map((u) => u._id) } },
      { organizer: { $exists: false } },
    ],
  });

  for (let i = 0; i < GAMES.length; i++) {
    const { joiners, coordinates, ...g } = GAMES[i];
    const organizer = users[i % users.length];
    // organizer + next N demo users fill the squad
    const players = [organizer._id];
    for (let j = 1; j < joiners && j < users.length; j++) {
      players.push(users[(i + j) % users.length]._id);
    }
    await Game.create({
      ...g,
      location: { type: 'Point', coordinates },
      organizer: organizer._id,
      players,
    });
  }
  console.log(`Seeded ${GAMES.length} games`);

  await mongoose.disconnect();
  console.log('Done');
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
