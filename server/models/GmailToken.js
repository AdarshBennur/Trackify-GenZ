const mongoose = require('mongoose');

const GmailTokenSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  encryptedAccessToken: {
    type: String,
    required: true,
    select: false // Don't return by default
  },
  encryptedRefreshToken: {
    type: String,
    required: true,
    select: false // Don't return by default
  },
  tokenExpiry: {
    type: Date,
    required: true
  },
  lastFetchAt: {
    type: Date,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient lookups
GmailTokenSchema.index({ user: 1 });

// Update timestamp on save
GmailTokenSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('GmailToken', GmailTokenSchema);
