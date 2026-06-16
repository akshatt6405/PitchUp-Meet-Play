const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  sport: {
    type: String,
    required: [true, 'Sport is required'],
    enum: ['cricket', 'football', 'pickleball', 'badminton']
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  venue: {
    type: String,
    required: [true, 'Venue name is required'],
    trim: true
  },
  area: {
    type: String,
    required: [true, 'Area is required'],
    trim: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number] // [longitude, latitude] — optional
    }
  },
  date: {
    type: Date,
    required: [true, 'Date is required']
  },
  time: {
    type: String,
    required: [true, 'Time is required']
  },
  totalPlayers: {
    type: Number,
    required: [true, 'Total players required'],
    min: 2,
    max: 100
  },
  players: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  contribution: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['upcoming', 'full', 'cancelled', 'completed'],
    default: 'upcoming'
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  }
}, { timestamps: true });

gameSchema.index({ location: '2dsphere' });

// Keep status in sync with how full the squad is. Organizer-set
// 'cancelled' / 'completed' states are sticky and left untouched.
gameSchema.pre('save', function () {
  if (this.status === 'cancelled' || this.status === 'completed') return;
  this.status = this.players.length >= this.totalPlayers ? 'full' : 'upcoming';
});

module.exports = mongoose.model('Game', gameSchema);