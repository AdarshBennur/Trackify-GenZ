const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
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
  date: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot be more than 500 characters']
  },
  currency: {
    code: {
      type: String,
      default: 'INR'
    },
    symbol: {
      type: String,
      default: '₹'
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
ExpenseSchema.pre('save', function(next) {
  this.amountInBaseCurrency = this.amount * this.currency.rate;
  next();
});

// Create index for faster queries
ExpenseSchema.index({ user: 1, date: -1 });
ExpenseSchema.index({ user: 1, category: 1 });
ExpenseSchema.index({ 'currency.code': 1 });

module.exports = mongoose.model('Expense', ExpenseSchema); 