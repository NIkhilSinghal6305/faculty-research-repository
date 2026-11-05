const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const makeToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

const userResponse = (user) => ({ id: user._id, name: user.name, email: user.email, role: user.role });

// POST /api/auth/register  (roles allowed here: student, faculty - NEVER admin)
const register = async (req, res, next) => {
  try {
    const { name, email, password, role = 'student', facultyCode } = req.body;

    if (!name || !email || !password || typeof name !== 'string' || typeof email !== 'string') {
      return res.status(400).json({ success: false, message: 'Name, email and password are required' });
    }
    if (typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }
    if (!['student', 'faculty'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Role must be student or faculty' });
    }
    // Faculty accounts need the secret invite code (controlled workflow)
    if (role === 'faculty') {
      if (!process.env.FACULTY_INVITE_CODE || facultyCode !== process.env.FACULTY_INVITE_CODE) {
        return res.status(403).json({ success: false, message: 'Invalid faculty invite code' });
      }
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed, role });
    res.status(201).json({ success: true, data: { token: makeToken(user._id), user: userResponse(user) } });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    const ok = user && (await bcrypt.compare(password, user.password));
    if (!ok) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    res.json({ success: true, data: { token: makeToken(user._id), user: userResponse(user) } });
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/me
const me = (req, res) => {
  res.json({ success: true, data: { user: userResponse(req.user) } });
};

module.exports = { register, login, me };
