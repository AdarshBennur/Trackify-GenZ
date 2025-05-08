const Expense = require('../models/Expense');
const { validationResult } = require('express-validator');
const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');

// @desc    Get all expenses for a user
// @route   GET /api/expenses
// @access  Private
exports.getExpenses = asyncHandler(async (req, res) => {
  // Build query
  let query = { user: req.user.id };
  
  // Add date range filter if provided
  if (req.query.startDate && req.query.endDate) {
    query.date = {
      $gte: new Date(req.query.startDate),
      $lte: new Date(req.query.endDate)
    };
  }
  
  // Add category filter if provided
  if (req.query.category) {
    query.category = req.query.category;
  }
  
  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  
  const expenses = await Expense.find(query)
    .sort({ date: -1 })
    .skip(startIndex)
    .limit(limit);
  
  const total = await Expense.countDocuments(query);
  
  res.status(200).json({
    success: true,
    count: expenses.length,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    },
    data: expenses
  });
});

// @desc    Get single expense
// @route   GET /api/expenses/:id
// @access  Private
exports.getExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.findById(req.params.id);
  
  if (!expense) {
    res.status(404);
    throw new Error('Expense not found');
  }
  
  // Make sure user owns the expense
  if (expense.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('Not authorized to access this expense');
  }
  
  res.status(200).json({
    success: true,
    data: expense
  });
});

// @desc    Create expense
// @route   POST /api/expenses
// @access  Private
exports.createExpense = asyncHandler(async (req, res) => {
  // Add user to request body
  req.body.user = req.user.id;
  
  const expense = await Expense.create(req.body);
  
  res.status(201).json({
    success: true,
    data: expense
  });
});

// @desc    Update expense
// @route   PUT /api/expenses/:id
// @access  Private
exports.updateExpense = asyncHandler(async (req, res) => {
  let expense = await Expense.findById(req.params.id);
  
  if (!expense) {
    res.status(404);
    throw new Error('Expense not found');
  }
  
  // Make sure user owns the expense
  if (expense.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('Not authorized to update this expense');
  }
  
  expense = await Expense.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  
  res.status(200).json({
    success: true,
    data: expense
  });
});

// @desc    Delete expense
// @route   DELETE /api/expenses/:id
// @access  Private
exports.deleteExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.findById(req.params.id);
  
  if (!expense) {
    res.status(404);
    throw new Error('Expense not found');
  }
  
  // Make sure user owns the expense
  if (expense.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('Not authorized to delete this expense');
  }
  
  await expense.remove();
  
  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Get expense statistics
// @route   GET /api/expenses/stats
// @access  Private
exports.getExpenseStats = asyncHandler(async (req, res) => {
  // Default to current month if no date range provided
  const startDate = req.query.startDate 
    ? new Date(req.query.startDate) 
    : new Date(new Date().setDate(1)); // First day of current month
  
  const endDate = req.query.endDate 
    ? new Date(req.query.endDate) 
    : new Date(); // Today
  
  // Get total expenses
  const totalExpenses = await Expense.aggregate([
    {
      $match: {
        user: mongoose.Types.ObjectId(req.user.id),
        date: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$amount' }
      }
    }
  ]);
  
  // Get expenses by category
  const categoryStats = await Expense.aggregate([
    {
      $match: {
        user: mongoose.Types.ObjectId(req.user.id),
        date: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: '$category',
        totalAmount: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { totalAmount: -1 }
    }
  ]);
  
  // Calculate daily average
  const days = Math.max(1, Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)));
  const avgDailyExpense = totalExpenses.length > 0 
    ? totalExpenses[0].total / days 
    : 0;
  
  // Get expenses by day for the period
  const timelineStats = await Expense.aggregate([
    {
      $match: {
        user: mongoose.Types.ObjectId(req.user.id),
        date: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
        totalAmount: { $sum: '$amount' }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);
  
  res.status(200).json({
    success: true,
    data: {
      totalExpenses: totalExpenses.length > 0 ? totalExpenses[0].total : 0,
      avgDailyExpense,
      categoryStats,
      timelineStats
    }
  });
});

// @desc    Export expenses (CSV)
// @route   GET /api/expenses/export
// @access  Private
exports.exportExpenses = asyncHandler(async (req, res) => {
  // Build query
  let query = { user: req.user.id };
  
  // Add date range filter if provided
  if (req.query.startDate && req.query.endDate) {
    query.date = {
      $gte: new Date(req.query.startDate),
      $lte: new Date(req.query.endDate)
    };
  }
  
  // Add category filter if provided
  if (req.query.category) {
    query.category = req.query.category;
  }
  
  const expenses = await Expense.find(query).sort({ date: -1 });
  
  // Create CSV
  const fields = ['title', 'amount', 'category', 'date', 'notes'];
  const opts = { fields };
  
  try {
    const parser = new (require('json2csv').Parser)(opts);
    const csv = parser.parse(expenses);
    
    res.header('Content-Type', 'text/csv');
    res.attachment(`expenses-export-${Date.now()}.csv`);
    
    return res.send(csv);
  } catch (err) {
    res.status(500);
    throw new Error('Error generating CSV export');
  }
}); 