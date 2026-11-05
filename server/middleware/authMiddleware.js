const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Reads "Authorization: Bearer <token>" and returns the user (or null)
const getUserFromRequest = async (req) => {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) return null;
  const token = header.split(' ')[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET); // throws if invalid/expired
  return User.findById(decoded.id); // password is excluded by select:false
};

// Route requires a valid login
const protect = async (req, res, next) => {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Not logged in. Please log in first.' });
    }
    req.user = user;
    next();
  } catch (err) {
    next(err); // JWT errors are converted to 401 in errorMiddleware
  }
};

// Login optional: sets req.user if a valid token is sent, otherwise continues as a public user
const optionalAuth = async (req, res, next) => {
  try {
    req.user = await getUserFromRequest(req);
  } catch (err) {
    req.user = null;
  }
  next();
};

module.exports = { protect, optionalAuth };
