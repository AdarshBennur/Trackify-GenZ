const mongoose = require('mongoose');

const CurrencySchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Currency code is required'],
    trim: true,
    unique: true,
    uppercase: true,
    maxlength: [3, 'Currency code cannot be more than 3 characters']
  },
  name: {
    type: String,
    required: [true, 'Currency name is required'],
    trim: true
  },
  symbol: {
    type: String,
    required: [true, 'Currency symbol is required'],
    trim: true
  },
  rate: {
    type: Number,
    required: [true, 'Exchange rate is required'],
    min: [0, 'Exchange rate cannot be negative']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isBase: {
    type: Boolean,
    default: false
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Create indexes for querying
CurrencySchema.index({ code: 1 }, { unique: true });
CurrencySchema.index({ isActive: 1 });

module.exports = mongoose.model('Currency', CurrencySchema); 