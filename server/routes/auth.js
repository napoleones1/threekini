const router = require('express').Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// GET /api/auth/status — health check
router.get('/status', (req, res) => res.json({ status: 'ok' }));

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ message: 'Username atau password salah.' });

    const valid = await user.comparePassword(password);
    if (!valid) return res.status(401).json({ message: 'Username atau password salah.' });

    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES }
    );

    res.json({ token, user: { id: user._id, username: user.username, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// POST /api/auth/register (hanya untuk setup awal, bisa dinonaktifkan)
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    const exists = await User.findOne({ $or: [{ username }, { email }] });
    if (exists) return res.status(400).json({ message: 'Username atau email sudah digunakan.' });

    const user = await User.create({ username, email, password, role: role || 'admin' });
    res.status(201).json({ message: 'Akun berhasil dibuat.', userId: user._id });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;
