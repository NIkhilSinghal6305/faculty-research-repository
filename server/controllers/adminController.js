const mongoose = require('mongoose');
const User = require('../models/User');
const Research = require('../models/Research');

// GET /api/admin/users
const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, data: users });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/research  (all records including drafts)
const getAllResearch = async (req, res, next) => {
  try {
    const records = await Research.find().populate('author', 'name email').sort({ updatedAt: -1 });
    res.json({ success: true, count: records.length, data: records });
  } catch (err) {
    next(err);
  }
};

// PUT /api/admin/users/:id/role   body: { role: 'student' | 'faculty' }
const changeUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID' });
    }
    // The admin role can never be granted through the API
    if (!['student', 'faculty'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Role must be student or faculty' });
    }
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.role === 'admin') {
      return res.status(403).json({ success: false, message: 'Administrator roles cannot be changed here' });
    }
    user.role = role;
    await user.save();
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/admin/users/:id  (also deletes that user's research so no orphan records remain)
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID' });
    }
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.role === 'admin') {
      return res.status(403).json({ success: false, message: 'Administrator accounts cannot be deleted here' });
    }
    const removed = await Research.deleteMany({ author: user._id });
    await user.deleteOne();
    res.json({ success: true, message: `User deleted along with ${removed.deletedCount} research record(s)` });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/stats  (aggregation pipelines)
const getStats = async (req, res, next) => {
  try {
    const [userGroups, researchGroups] = await Promise.all([
      User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
      Research.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    ]);
    const stats = { totalUsers: 0, students: 0, faculty: 0, admins: 0, totalResearch: 0, published: 0, draft: 0 };
    userGroups.forEach((g) => {
      stats.totalUsers += g.count;
      if (g._id === 'student') stats.students = g.count;
      if (g._id === 'faculty') stats.faculty = g.count;
      if (g._id === 'admin') stats.admins = g.count;
    });
    researchGroups.forEach((g) => {
      stats.totalResearch += g.count;
      if (g._id === 'Published') stats.published = g.count;
      if (g._id === 'Draft') stats.draft = g.count;
    });
    res.json({ success: true, data: stats });
  } catch (err) {
    next(err);
  }
};

module.exports = { getUsers, getAllResearch, changeUserRole, deleteUser, getStats };
