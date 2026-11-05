// Creates (or promotes) the first administrator using values from server/.env
// Run:  npm run create-admin
require('dotenv').config();
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');

(async () => {
  try {
    const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
    if (!ADMIN_EMAIL || !ADMIN_PASSWORD || ADMIN_PASSWORD.length < 8) {
      throw new Error('Set ADMIN_EMAIL and ADMIN_PASSWORD (min 8 chars) in server/.env first');
    }
    await connectDB();
    const hashed = await bcrypt.hash(ADMIN_PASSWORD, 10);
    const email = ADMIN_EMAIL.toLowerCase().trim();
    const existing = await User.findOne({ email });
    if (existing) {
      existing.role = 'admin';
      existing.password = hashed;
      await existing.save();
      console.log('Existing user promoted to admin:', email);
    } else {
      await User.create({ name: ADMIN_NAME || 'Administrator', email, password: hashed, role: 'admin' });
      console.log('Admin created:', email);
    }
  } catch (err) {
    console.error(err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
})();
