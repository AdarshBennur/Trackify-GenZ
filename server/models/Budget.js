const mongoose = require('mongoose');

const BudgetSchema = new mongoose.Schema({
  category: {
    type: String,
    required: [true, 'Please add a category'],
    enum: [
      'Housing',
      'Transportation',
      'Food',
      'Utilities',
      'Healthcare',
      'Insurance',
      'Personal',
      'Entertainment',
      'Education',
      'Savings',
      'Debt',
      'Other'
    ]
  },
  amount: {
    type: Number,
    required: [true, 'Please add a budget amount'],
    min: [0, 'Budget amount must be at least 0']
  },
  period: {
    type: String,
    required: [true, 'Please specify a budget period'],
    enum: ['monthly', 'quarterly', 'yearly'],
    default: 'monthly'
  },
  currency: {
    code: {
      type: String,
      default: 'USD'
    },
    symbol: {
      type: String,
      default: '$'
    }
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  startDate: {
    type: Date,
    required: [true, 'Please provide a start date'],
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Prevent users from creating more than one budget for the same category and period
BudgetSchema.index({ user: 1, category: 1, period: 1 }, { unique: true });

module.exports = mongoose.model('Budget', BudgetSchema); 