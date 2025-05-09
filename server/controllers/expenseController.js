const Expense = require('../models/Expense');
const { validationResult } = require('express-validator');
const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');

// Hardcoded dummy expenses for guest users
const GUEST_EXPENSES = [
  {
    _id: 'guest-expense-1',
    title: 'Grocery shopping',
    amount: 85.95,
    category: 'Food',
    date: new Date('2023-05-07T14:30:00Z'),
    notes: 'Weekly grocery shopping',
    currency: { code: 'USD', symbol: '$' },
    user: 'guest-user'
  },
  {
    _id: 'guest-expense-2',
    title: 'Electricity bill',
    amount: 125.75,
    category: 'Utilities',
    date: new Date('2023-05-04T10:00:00Z'),
    notes: 'Monthly electric bill',
    currency: { code: 'USD', symbol: '$' },
    user: 'guest-user'
  },
  {
    _id: 'guest-expense-3',
    title: 'Movie tickets',
    amount: 35.00,
    category: 'Entertainment',
    date: new Date('2023-05-05T19:45:00Z'),
    notes: 'Movie night with friends',
    currency: { code: 'USD', symbol: '$' },
    user: 'guest-user'
  },
  {
    _id: 'guest-expense-4',
    title: 'Uber ride',
    amount: 24.50,
    category: 'Transportation',
    date: new Date('2023-05-06T08:15:00Z'),
    notes: 'Ride to work',
    currency: { code: 'USD', symbol: '$' },
    user: 'guest-user'
  },
  {
    _id: 'guest-expense-5',
    title: 'Internet bill',
    amount: 65.00,
    category: 'Utilities',
    date: new Date('2023-05-02T11:30:00Z'),
    notes: 'Monthly internet service',
    currency: { code: 'USD', symbol: '$' },
    user: 'guest-user'
  },
  {
    _id: 'guest-expense-6',
    title: 'Restaurant dinner',
    amount: 94.80,
    category: 'Food',
    date: new Date('2023-05-01T20:15:00Z'),
    notes: 'Dinner with family',
    currency: { code: 'USD', symbol: '$' },
    user: 'guest-user'
  }
];

// @desc    Get all expenses for a user
// @route   GET /api/expenses
// @access  Private
exports.getExpenses = asyncHandler(async (req, res) => {
  // Check if the user is a guest
  if (req.user.role === 'guest' || req.user.email === 'guest@demo.com') {
    console.log('Returning guest expenses');
    
    // Return hardcoded guest expenses
    return res.status(200).json({
      success: true,
      count: GUEST_EXPENSES.length,
      pagination: {
        page: 1,
        limit: GUEST_EXPENSES.length,
        total: GUEST_EXPENSES.length,
        pages: 1
      },
      data: GUEST_EXPENSES
    });
  }
  
  // For registered users, continue with normal flow
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
  // Check if user is guest and looking for a guest expense
  if ((req.user.role === 'guest' || req.user.email === 'guest@demo.com') && 
      req.params.id.startsWith('guest-expense-')) {
    
    const guestExpense = GUEST_EXPENSES.find(exp => exp._id === req.params.id);
    
    if (!guestExpense) {
      res.status(404);
      throw new Error('Expense not found');
    }
    
    return res.status(200).json({
      success: true,
      data: guestExpense
    });
  }
  
  // For registered users
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
  // For guest users, return success but don't actually save
  if (req.user.role === 'guest' || req.user.email === 'guest@demo.com') {
    console.log('Guest user trying to create expense - returning mock response');
    
    // Create a mock response with a new ID
    const mockExpense = {
      _id: `guest-expense-${Date.now()}`,
      ...req.body,
      user: req.user.id,
      date: new Date(),
      createdAt: new Date()
    };
    
    return res.status(201).json({
      success: true,
      data: mockExpense
    });
  }
  
  // For registered users, save to database
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
  // For guest users
  if ((req.user.role === 'guest' || req.user.email === 'guest@demo.com') && 
      req.params.id.startsWith('guest-expense-')) {
    
    console.log('Guest user trying to update expense - returning mock response');
    
    // Create a mock response
    const mockExpense = {
      _id: req.params.id,
      ...req.body,
      user: req.user.id,
      updatedAt: new Date()
    };
    
    return res.status(200).json({
      success: true,
      data: mockExpense
    });
  }
  
  // For registered users
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
  // For guest users
  if ((req.user.role === 'guest' || req.user.email === 'guest@demo.com') && 
      req.params.id.startsWith('guest-expense-')) {
    
    console.log('Guest user trying to delete expense - returning mock success');
    
    return res.status(200).json({
      success: true,
      data: {}
    });
  }
  
  // For registered users
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
  
  // Use deleteOne() instead of remove() as remove() is deprecated
  await Expense.deleteOne({ _id: req.params.id });
  
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