const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// In production the API (Render) and client (Vercel) live on different domains,
// so the auth cookie must be cross-site: SameSite=None requires Secure=true.
// Locally we keep SameSite=Strict over plain http.
const isProd = process.env.NODE_ENV === 'production';
const cookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? 'none' : 'strict',
};

const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);
  const options = {
    ...cookieOptions,
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  };
  res.status(statusCode).cookie('token', token, options).json({
    success: true,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      sport: user.sport,
      city: user.city,
      avatar: user.avatar
    }
  });
};

// Register
router.post('/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Enter a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const { name, email, password, sport, city } = req.body;
      const userExists = await User.findOne({ email });
      if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
      }
      const user = await User.create({ name, email, password, sport, city });
      sendTokenResponse(user, 201, res);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Login
router.post('/login',
  [
    body('email').isEmail().withMessage('Enter a valid email'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email }).select('+password');
      if (!user || !(await user.matchPassword(password))) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
      sendTokenResponse(user, 200, res);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Logout
router.post('/logout', (req, res) => {
  res.cookie('token', '', {
    ...cookieOptions,
    expires: new Date(0),
  });
  res.status(200).json({ success: true, message: 'Logged out' });
});

// Get current user
router.get('/me', require('../middleware/auth').protect, async (req, res) => {
  res.status(200).json({ success: true, user: req.user });
});

// Update profile (name, city, avatar) — protected
router.put('/profile', require('../middleware/auth').protect, async (req, res) => {
  try {
    const { name, city, avatar } = req.body;
    const updates = {};
    if (typeof name === 'string' && name.trim()) updates.name = name.trim();
    if (typeof city === 'string') updates.city = city.trim();
    if (avatar !== undefined) {
      // avatar is a base64 data URI ('' clears it back to initials)
      if (avatar && !/^data:image\/(png|jpe?g|webp);base64,/.test(avatar)) {
        return res.status(400).json({ message: 'Invalid image format' });
      }
      if (avatar && avatar.length > 1500000) {
        return res.status(400).json({ message: 'Image too large (please use a smaller photo)' });
      }
      updates.avatar = avatar;
    }
    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;