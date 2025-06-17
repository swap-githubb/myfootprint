const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  url: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  summary: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['article', 'video', 'tutorial', 'news', 'other'],
    default: 'other'
  },
  contentType: {
    type: String,
    enum: ['article', 'video'],
    default: 'article'
  },
  qualityScore: {
    type: Number,
    min: 1,
    max: 10,
    default: 7
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

contentSchema.index({ user: 1, createdAt: -1 });
contentSchema.index({ user: 1, url: 1 }, { unique: true });

module.exports = mongoose.model('Content', contentSchema);