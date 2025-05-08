const mongoose = require('mongoose');

const ReminderSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  amount: {
    type: Number,
    required: [true, 'Please provide an amount'],
    min: [0, 'Amount cannot be negative']
  },
  dueDate: {
    type: Date,
    required: [true, 'Please provide a due date']
  },
  category: {
    type: String,
    required: [true, 'Please provide a category'],
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
  recurringType: {
    type: String,
    enum: ['none', 'daily', 'weekly', 'monthly', 'yearly'],
    default: 'none'
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

// Create index for querying upcoming reminders efficiently
ReminderSchema.index({ user: 1, dueDate: 1, isCompleted: 1 });

module.exports = mongoose.model('Reminder', ReminderSchema); 