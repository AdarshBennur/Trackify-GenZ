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
  try {
    // Find expense by ID (string ID)
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
  } catch (error) {
    console.error(`Error getting expense with ID ${req.params.id}:`, error);
    
    // Handle ID casting errors
    if (error.name === 'CastError' && error.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        message: 'Invalid expense ID format',
        errors: ['The provided ID is not in the correct format']
      });
    }
    
    // Re-throw any other errors
    throw error;
  }
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
  try {
    // Log the full request body for debugging
    console.log('Raw expense data received:', JSON.stringify(req.body, null, 2));
    
    // Validate required fields
    const { title, amount, category } = req.body;
    
    if (!title) {
      console.log('Validation failed: Missing title');
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: ['Please provide a title for the expense']
      });
    }
    
    if (amount === undefined || amount === null || isNaN(parseFloat(amount))) {
      console.log('Validation failed: Invalid amount', amount);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: ['Please provide a valid amount for the expense']
      });
    }
    
    if (!category) {
      console.log('Validation failed: Missing category');
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: ['Please provide a category for the expense']
      });
    }
    
    // Check if category is in the allowed list
    const validCategories = [
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
    ];
    
    if (!validCategories.includes(category)) {
      console.log('Validation failed: Invalid category', category);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: [`Invalid category. Must be one of: ${validCategories.join(', ')}`]
      });
    }
    
    // Add user to request body
    req.body.user = req.user.id;
    console.log('Creating expense for user:', req.user.id);
    
    // Normalize the currency object if it's missing properties
    if (!req.body.currency) {
      console.log('Currency data missing, using defaults');
      req.body.currency = { code: 'USD', symbol: '$', rate: 1 };
    } else if (typeof req.body.currency === 'object') {
      // Log currency structure
      console.log('Currency data received:', JSON.stringify(req.body.currency, null, 2));
      
      // Normalize the currency object
      if (!req.body.currency.code) {
        console.log('Currency code missing, using USD');
        req.body.currency.code = 'USD';
      }
      if (!req.body.currency.symbol) {
        console.log('Currency symbol missing, using $');
        req.body.currency.symbol = '$';
      }
      if (!req.body.currency.rate) {
        console.log('Currency rate missing, using 1');
        req.body.currency.rate = 1;
      }
    } else {
      // Currency is not an object
      console.log('Currency data invalid, using defaults');
      req.body.currency = { code: 'USD', symbol: '$', rate: 1 };
    }
    
    // Generate a custom ID if needed
    if (!req.body._id || typeof req.body._id !== 'string') {
      req.body._id = `exp_${Date.now()}`;
      console.log('Generated custom ID:', req.body._id);
    }
    
    // Log the final expense data before saving
    console.log('Final expense data to save:', JSON.stringify(req.body, null, 2));
    
    const expense = await Expense.create(req.body);
    console.log('Expense created with ID:', expense._id);
    
    // Verify the expense was saved
    const savedExpense = await Expense.findById(expense._id);
    if (!savedExpense) {
      console.error('Failed to verify saved expense');
      return res.status(500).json({
        success: false,
        message: 'Failed to verify expense was saved'
      });
    }
    
    console.log('Expense verified in database');
    
    res.status(201).json({
      success: true,
      data: expense
    });
  } catch (error) {
    console.error('Error creating expense:', error);
    
    // Check for validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      console.error('Mongoose validation errors:', messages);
      
      // Log detailed validation error information
      for (const field in error.errors) {
        console.error(`Field "${field}" error:`, error.errors[field].message);
        console.error('Value received:', error.errors[field].value);
      }
      
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: messages
      });
    }
    
    // Check for duplicate key error
    if (error.code === 11000) {
      console.error('Duplicate key error:', error.keyValue);
      return res.status(400).json({
        success: false,
        message: 'Duplicate key error',
        errors: [`A record with this ${Object.keys(error.keyValue).join(', ')} already exists`]
      });
    }
    
    // General server error
    res.status(500).json({
      success: false,
      message: 'Server error occurred, please try again later',
      errors: [error.message]
    });
  }
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
  try {
    console.log(`Attempting to update expense with ID: ${req.params.id}`);
    
    // Find the expense first to verify ownership
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
    
    console.log('Update data:', req.body);
    
    // Don't allow changing the _id
    if (req.body._id) {
      delete req.body._id;
    }
    
    // Update the expense - use findOneAndUpdate with _id as a string
    expense = await Expense.findOneAndUpdate({ _id: req.params.id }, req.body, {
      new: true,
      runValidators: true
    });
    
    console.log('Expense updated successfully');
    
    res.status(200).json({
      success: true,
      data: expense
    });
  } catch (error) {
    console.error('Error updating expense:', error);
    
    // Handle ID casting errors
    if (error.name === 'CastError' && error.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        message: 'Invalid expense ID format',
        errors: ['The provided ID is not in the correct format']
      });
    }
    
    res.status(500).json({
      success: false,
      message: error.message || 'Server Error'
    });
  }
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
  try {
    console.log(`Attempting to delete expense with ID: ${req.params.id}`);
    
    // Find the expense
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
    
    // Use findOneAndDelete with _id as a string
    await Expense.findOneAndDelete({ _id: req.params.id });
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Error deleting expense:', error);
    
    // Handle ID casting errors
    if (error.name === 'CastError' && error.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        message: 'Invalid expense ID format',
        errors: ['The provided ID is not in the correct format']
      });
    }
    
    throw error;
  }
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
        user: new mongoose.Types.ObjectId(req.user.id),
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
        user: new mongoose.Types.ObjectId(req.user.id),
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
        user: new mongoose.Types.ObjectId(req.user.id),
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