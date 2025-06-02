const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: function() {
      // Generate a custom ID if not provided
      return `exp_${Date.now()}`;
    }
  },
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
    enum: {
      values: [
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
      ],
      message: '{VALUE} is not a valid expense category'
    }
  },
  date: {
    type: Date,
    default: Date.now,
    required: [true, 'Please provide a date for the expense']
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot be more than 500 characters'],
    default: ''
  },
  currency: {
    code: {
      type: String,
      default: 'USD',
      required: [true, 'Currency code is required']
    },
    symbol: {
      type: String,
      default: '$',
      required: [true, 'Currency symbol is required']
    },
    rate: {
      type: Number,
      default: 1,
      required: [true, 'Currency rate is required'],
      min: [0, 'Currency rate must be a positive number']
    }
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { 
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
  _id: false // This ensures we use our custom _id field
});

// Calculate amountInBaseCurrency before saving
ExpenseSchema.pre('save', function(next) {
  try {
    // Use currency rate or default to 1 if not provided
    const rate = this.currency && this.currency.rate ? this.currency.rate : 1;
    this.amountInBaseCurrency = this.amount * rate;
    console.log(`Calculated amountInBaseCurrency: ${this.amountInBaseCurrency} (amount: ${this.amount} * rate: ${rate})`);
    next();
  } catch (error) {
    console.error('Error in pre-save hook:', error);
    next(error);
  }
});

// Create index for faster queries
ExpenseSchema.index({ user: 1, date: -1 });
ExpenseSchema.index({ user: 1, category: 1 });
ExpenseSchema.index({ 'currency.code': 1 });

module.exports = mongoose.model('Expense', ExpenseSchema); 