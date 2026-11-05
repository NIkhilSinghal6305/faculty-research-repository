const mongoose = require('mongoose');

// Fixed list of domains (the React client uses the same list for its dropdowns)
const DOMAINS = [
  'Computer Science',
  'Electronics',
  'Mechanical Engineering',
  'Civil Engineering',
  'Mathematics',
  'Physics',
  'Chemistry',
  'Management',
  'Other',
];

const researchSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Title is required'], trim: true, maxlength: 200 },
    abstract: { type: String, required: [true, 'Abstract is required'], trim: true, maxlength: 3000 },
    domain: { type: String, required: [true, 'Domain is required'], enum: { values: DOMAINS, message: 'Invalid domain' } },
    // Reference to the faculty user who owns this record
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    publicationYear: {
      type: Number,
      required: [true, 'Publication year is required'],
      min: [1900, 'Year must be 1900 or later'],
      max: [new Date().getFullYear() + 1, 'Year is too far in the future'],
    },
    journal: { type: String, required: [true, 'Journal or conference is required'], trim: true, maxlength: 200 },
    doiOrUrl: { type: String, trim: true, default: '' },
    keywords: { type: [String], default: [] },
    status: { type: String, enum: ['Draft', 'Published'], default: 'Draft' },
  },
  { timestamps: true }
);

// Compound index for the public listing: filter by status + domain + year
researchSchema.index({ status: 1, domain: 1, publicationYear: -1 });
// Index for "my records" queries
researchSchema.index({ author: 1, status: 1 });

module.exports = mongoose.model('Research', researchSchema);
module.exports.DOMAINS = DOMAINS;
