const mongoose = require('mongoose');

const GoalSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  targetAmount: {
    type: Number,
    required: [true, 'Please provide a target amount'],
    min: [0, 'Target amount cannot be negative']
  },
  currentAmount: {
    type: Number,
    default: 0,
    min: [0, 'Current amount cannot be negative']
  },
  category: {
    type: String,
    required: [true, 'Please provide a category'],
    enum: [
      'Housing',
      'Transportation',
      'Education',
      'Investment',
      'Savings',
      'Emergency Fund',
      'Vacation',
      'Retirement',
      'Debt Payoff',
      'Major Purchase',
      'Other'
    ]
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  startDate: {
    type: Date,
    required: [true, 'Please provide a start date'],
    default: Date.now
  },
  endDate: {
    type: Date,
    required: [true, 'Please provide a target end date']
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot be more than 500 characters']
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
});

// Create index for querying goals efficiently
GoalSchema.index({ user: 1, isCompleted: 1 });

// Virtual for progress percentage
GoalSchema.virtual('progressPercentage').get(function() {
  if (this.targetAmount === 0) return 0;
  const percentage = (this.currentAmount / this.targetAmount) * 100;
  return Math.min(percentage, 100).toFixed(2);
});

// Check if goal is completed when current amount is updated
GoalSchema.pre('save', function(next) {
  if (this.currentAmount >= this.targetAmount && !this.isCompleted) {
    this.isCompleted = true;
  }
  next();
});

module.exports = mongoose.model('Goal', GoalSchema); 