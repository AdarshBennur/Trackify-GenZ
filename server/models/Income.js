const mongoose = require('mongoose');

const IncomeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  amount: {
    type: Number,
    required: [true, 'Please add an amount'],
    min: [0, 'Amount must be at least 0']
  },
  category: {
    type: String,
    required: [true, 'Please add a category'],
    enum: [
      'Salary',
      'Business',
      'Freelance',
      'Investments',
      'Dividends',
      'Rental',
      'Interest',
      'Gift',
      'Refund',
      'Other'
    ]
  },
  date: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot be more than 500 characters']
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  frequency: {
    type: String,
    default: 'one-time',
    enum: ['one-time', 'weekly', 'bi-weekly', 'monthly', 'quarterly', 'annually']
  },
  currency: {
    code: {
      type: String,
      default: 'USD'
    },
    symbol: {
      type: String,
      default: '$'
    },
    rate: {
      type: Number,
      default: 1
    }
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { 
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Calculate amountInBaseCurrency before saving
IncomeSchema.pre('save', function(next) {
  // Only calculate if rate exists, otherwise default to amount
  if (this.currency && this.currency.rate) {
    this.amountInBaseCurrency = this.amount * this.currency.rate;
  } else {
    this.amountInBaseCurrency = this.amount;
  }
  next();
});

// Create index for faster queries
IncomeSchema.index({ user: 1, date: -1 });

module.exports = mongoose.model('Income', IncomeSchema); 