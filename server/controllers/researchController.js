const mongoose = require('mongoose');
const Research = require('../models/Research');
const User = require('../models/User');

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);
const AUTHOR_FIELDS = 'name email';

// Accept only the fields a user may set (author is never taken from the request body)
const pickFields = (body) => {
  const data = {};
  ['title', 'abstract', 'domain', 'publicationYear', 'journal', 'doiOrUrl', 'status'].forEach((f) => {
    if (typeof body[f] === 'string' || typeof body[f] === 'number') data[f] = body[f];
  });
  if (body.keywords !== undefined) {
    const list = Array.isArray(body.keywords) ? body.keywords : String(body.keywords).split(',');
    data.keywords = list.map((k) => String(k).trim()).filter(Boolean);
  }
  return data;
};

// A DOI (10.xxxx/...) or an http(s) URL; empty is fine because the field is optional
const isValidDoiOrUrl = (value) => !value || /^10\.\d{4,9}\/\S+$/.test(value) || /^https?:\/\/\S+$/i.test(value);
const BAD_LINK = 'Enter a valid DOI (10.xxxx/...) or http(s) URL';

// GET /api/research?q=&domain=&year=   (public, only Published)
const getPublicResearch = async (req, res, next) => {
  try {
    const { q, domain, year } = req.query;
    const filter = { status: 'Published' };

    if (domain) filter.domain = String(domain);
    if (year) {
      if (!/^\d{4}$/.test(String(year))) {
        return res.status(400).json({ success: false, message: 'Year must be a 4-digit number' });
      }
      filter.publicationYear = Number(year);
    }
    if (q && String(q).trim()) {
      const regex = new RegExp(escapeRegex(String(q).trim()), 'i');
      // authors live in another collection, so find matching users first
      const authors = await User.find({ name: regex }).select('_id');
      filter.$or = [{ title: regex }, { keywords: regex }, { author: { $in: authors.map((a) => a._id) } }];
    }

    const records = await Research.find(filter).populate('author', AUTHOR_FIELDS).sort({ publicationYear: -1, createdAt: -1 });
    res.json({ success: true, count: records.length, data: records });
  } catch (err) {
    next(err);
  }
};

// GET /api/research/mine  (own records + counts calculated with an aggregation)
const getMyResearch = async (req, res, next) => {
  try {
    const records = await Research.find({ author: req.user._id }).populate('author', AUTHOR_FIELDS).sort({ updatedAt: -1 });
    const grouped = await Research.aggregate([
      { $match: { author: req.user._id } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const stats = { total: records.length, published: 0, draft: 0 };
    grouped.forEach((g) => {
      if (g._id === 'Published') stats.published = g.count;
      if (g._id === 'Draft') stats.draft = g.count;
    });
    res.json({ success: true, data: records, stats });
  } catch (err) {
    next(err);
  }
};

// GET /api/research/:id  (Published = anyone; Draft = owner or admin only)
const getResearchById = async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid research ID' });
    }
    const record = await Research.findById(req.params.id).populate('author', AUTHOR_FIELDS);
    if (!record) return res.status(404).json({ success: false, message: 'Research not found' });

    if (record.status === 'Draft') {
      const isOwner = req.user && record.author && record.author._id.equals(req.user._id);
      const isAdmin = req.user && req.user.role === 'admin';
      if (!isOwner && !isAdmin) {
        // 404 (not 403) so drafts are not even revealed to exist
        return res.status(404).json({ success: false, message: 'Research not found' });
      }
    }
    res.json({ success: true, data: record });
  } catch (err) {
    next(err);
  }
};

// POST /api/research  (faculty or admin; author is always the logged-in user)
const createResearch = async (req, res, next) => {
  try {
    const data = pickFields(req.body);
    if (!isValidDoiOrUrl(data.doiOrUrl)) {
      return res.status(400).json({ success: false, message: BAD_LINK });
    }
    const record = await Research.create({ ...data, author: req.user._id });
    res.status(201).json({ success: true, data: record });
  } catch (err) {
    next(err);
  }
};

// PUT /api/research/:id  (owner or admin)
const updateResearch = async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid research ID' });
    }
    const record = await Research.findById(req.params.id);
    if (!record) return res.status(404).json({ success: false, message: 'Research not found' });

    const isOwner = record.author.equals(req.user._id);
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'You can only edit your own research' });
    }

    const data = pickFields(req.body);
    if (!isValidDoiOrUrl(data.doiOrUrl)) {
      return res.status(400).json({ success: false, message: BAD_LINK });
    }
    record.set(data);
    await record.save(); // runs the schema validators
    res.json({ success: true, data: record });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/research/:id  (owner or admin)
const deleteResearch = async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid research ID' });
    }
    const record = await Research.findById(req.params.id);
    if (!record) return res.status(404).json({ success: false, message: 'Research not found' });

    const isOwner = record.author.equals(req.user._id);
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'You can only delete your own research' });
    }
    await record.deleteOne();
    res.json({ success: true, message: 'Research deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getPublicResearch, getMyResearch, getResearchById, createResearch, updateResearch, deleteResearch };
