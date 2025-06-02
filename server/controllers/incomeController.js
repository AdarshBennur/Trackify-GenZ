const Income = require('../models/Income');
const { validationResult } = require('express-validator');
const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');

// Hardcoded dummy incomes for guest users
const GUEST_INCOMES = [
  {
    _id: 'guest-income-1',
    title: 'Monthly Salary',
    amount: 5000.00,
    category: 'Salary',
    date: new Date('2023-05-01T09:00:00Z'),
    notes: 'Monthly salary payment',
    currency: { code: 'USD', symbol: '$' },
    user: 'guest-user'
  },
  {
    _id: 'guest-income-2',
    title: 'Freelance Project',
    amount: 1200.00,
    category: 'Freelance',
    date: new Date('2023-05-15T16:30:00Z'),
    notes: 'Website development project',
    currency: { code: 'USD', symbol: '$' },
    user: 'guest-user'
  },
  {
    _id: 'guest-income-3',
    title: 'Stock Dividend',
    amount: 350.25,
    category: 'Investment',
    date: new Date('2023-05-10T14:00:00Z'),
    notes: 'Quarterly dividend payment',
    currency: { code: 'USD', symbol: '$' },
    user: 'guest-user'
  }
];

// @desc    Get all incomes for a user
// @route   GET /api/incomes
// @access  Private
exports.getIncomes = asyncHandler(async (req, res) => {
  // Check if the user is a guest
  if (req.user.role === 'guest' || req.user.email === 'guest@demo.com') {
    console.log('Returning guest incomes');
    
    // Return hardcoded guest incomes
    return res.status(200).json({
      success: true,
      count: GUEST_INCOMES.length,
      pagination: {
        page: 1,
        limit: GUEST_INCOMES.length,
        total: GUEST_INCOMES.length,
        pages: 1
      },
      data: GUEST_INCOMES,
      totalAmount: GUEST_INCOMES.reduce((acc, curr) => acc + curr.amount, 0)
    });
  }
  
  try {
    // Parse query parameters for filtering
    const { category, startDate, endDate, frequency, sort, limit = 10, page = 1 } = req.query;
    const queryObj = { user: req.user.id };

    // Apply category filter if provided
    if (category && category !== 'All') {
      queryObj.category = category;
    }

    // Apply date range filter if provided
    if (startDate || endDate) {
      queryObj.date = {};
      if (startDate) {
        queryObj.date.$gte = new Date(startDate);
      }
      if (endDate) {
        // Add one day to include the end date in results
        const endDateObj = new Date(endDate);
        endDateObj.setDate(endDateObj.getDate() + 1);
        queryObj.date.$lte = endDateObj;
      }
    }

    // Apply frequency filter if provided
    if (frequency) {
      queryObj.frequency = frequency;
    }

    // Create query
    let query = Income.find(queryObj);

    // Count total before applying pagination
    const total = await Income.countDocuments(queryObj);

    // Add sorting
    if (sort) {
      const sortBy = sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-date');
    }

    // Add pagination
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(parseInt(limit));

    // Execute query
    const incomes = await query;

    // Calculate total amount of filtered incomes
    const totalAmount = incomes.reduce((acc, curr) => acc + curr.amount, 0);

    // Pagination result
    const pagination = {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit)
    };

    res.status(200).json({
      success: true,
      count: incomes.length,
      pagination,
      data: incomes,
      totalAmount
    });
  } catch (error) {
    console.error('Error getting incomes:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
});

// @desc    Get single income
// @route   GET /api/incomes/:id
// @access  Private
exports.getIncome = asyncHandler(async (req, res) => {
  // Check if user is guest and looking for a guest income
  if ((req.user.role === 'guest' || req.user.email === 'guest@demo.com') && 
      req.params.id.startsWith('guest-income-')) {
    
    const guestIncome = GUEST_INCOMES.find(inc => inc._id === req.params.id);
    
    if (!guestIncome) {
      return res.status(404).json({
        success: false,
        message: 'Income not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: guestIncome
    });
  }
  
  try {
    const income = await Income.findById(req.params.id);

    if (!income) {
      return res.status(404).json({
        success: false,
        message: 'Income not found'
      });
    }

    // Make sure user owns the income
    if (income.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this income'
      });
    }

    res.status(200).json({
      success: true,
      data: income
    });
  } catch (error) {
    console.error('Error getting income:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
});

// @desc    Create new income
// @route   POST /api/incomes
// @access  Private
exports.createIncome = asyncHandler(async (req, res) => {
  try {
    // First validate the request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ 
        success: false, 
        errors: errors.array(),
        message: 'Validation failed' 
      });
    }

    // Ensure all required fields are in the correct format
    const { title, amount, category, date } = req.body;
    
    // Additional validation checks
    if (!title || title.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Title is required'
      });
    }
    
    // Validate amount is a number and > 0
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be a positive number'
      });
    }
    
    // Validate date
    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date is required'
      });
    }
    
    // For guest users, return success but don't actually save
    if (req.user.role === 'guest' || req.user.email === 'guest@demo.com') {
      console.log('Guest user trying to create income - returning mock response');
      
      // Create a mock response with a new ID
      const mockIncome = {
        _id: `guest-income-${Date.now()}`,
        ...req.body,
        user: req.user.id,
        date: new Date(date),
        createdAt: new Date()
      };
      
      return res.status(201).json({
        success: true,
        data: mockIncome
      });
    }

    // Prepare the income data
    const incomeData = {
      ...req.body,
      user: req.user.id
    };
    
    // Ensure currency has a rate property if it exists
    if (incomeData.currency && !incomeData.currency.rate) {
      incomeData.currency.rate = 1;
    }
    
    console.log('Creating income:', JSON.stringify(incomeData, null, 2));
    
    // Create the income record
    const income = await Income.create(incomeData);
    console.log('Income created with ID:', income._id);

    // Return success response
    res.status(201).json({
      success: true,
      data: income
    });
  } catch (error) {
    console.error('Error creating income:', error);
    // If it's a Mongoose validation error, return more specific info
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: messages
      });
    } 
    // If it's a duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Duplicate entry'
      });
    }
    // General server error
    res.status(500).json({
      success: false,
      message: 'Server Error: Unable to create income',
      error: error.message
    });
  }
});

// @desc    Update income
// @route   PUT /api/incomes/:id
// @access  Private
exports.updateIncome = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // For guest users
  if ((req.user.role === 'guest' || req.user.email === 'guest@demo.com') && 
      req.params.id.startsWith('guest-income-')) {
    
    console.log('Guest user trying to update income - returning mock response');
    
    // Create a mock response
    const mockIncome = {
      _id: req.params.id,
      ...req.body,
      user: req.user.id,
      updatedAt: new Date()
    };
    
    return res.status(200).json({
      success: true,
      data: mockIncome
    });
  }

  try {
    let income = await Income.findById(req.params.id);

    if (!income) {
      return res.status(404).json({
        success: false,
        message: 'Income not found'
      });
    }

    // Make sure user owns the income
    if (income.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this income'
      });
    }

    income = await Income.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: income
    });
  } catch (error) {
    console.error('Error updating income:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
});

// @desc    Delete income
// @route   DELETE /api/incomes/:id
// @access  Private
exports.deleteIncome = asyncHandler(async (req, res) => {
  // For guest users
  if ((req.user.role === 'guest' || req.user.email === 'guest@demo.com') && 
      req.params.id.startsWith('guest-income-')) {
    
    console.log('Guest user trying to delete income - returning mock success');
    
    return res.status(200).json({
      success: true,
      data: {}
    });
  }

  try {
    const income = await Income.findById(req.params.id);

    if (!income) {
      return res.status(404).json({
        success: false,
        message: 'Income not found'
      });
    }

    // Make sure user owns the income
    if (income.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to delete this income'
      });
    }

    await Income.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Error deleting income:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
});

// @desc    Get income statistics
// @route   GET /api/incomes/stats
// @access  Private
exports.getIncomeStats = asyncHandler(async (req, res) => {
  try {
    // Get period from query params (month or year)
    const { period = 'month' } = req.query;
    console.log(`Fetching income stats for period: ${period}`);
    
    // For guest users, return mock stats
    if (req.user.role === 'guest' || req.user.email === 'guest@demo.com') {
      // Mock statistics for guest users
      const mockStats = {
        total: 6550.25,
        average: 2183.42,
        count: 3,
        timeStats: period === 'month' 
          ? [
              { _id: { day: 1 }, total: 5000 },
              { _id: { day: 10 }, total: 350.25 },
              { _id: { day: 15 }, total: 1200 }
            ]
          : [
              { _id: { month: 4 }, total: 6550.25 }
            ],
        categoryStats: [
          { _id: 'Salary', total: 5000 },
          { _id: 'Freelance', total: 1200 },
          { _id: 'Investment', total: 350.25 }
        ]
      };
      
      return res.status(200).json({
        success: true,
        data: mockStats
      });
    }
    
    // Set date range based on period
    const now = new Date();
    let startDate;
    
    if (period === 'month') {
      // Current month
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (period === 'year') {
      // Current year
      startDate = new Date(now.getFullYear(), 0, 1);
    } else {
      // Default to month if invalid period
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }
    
    console.log(`Date range: ${startDate.toISOString()} to ${now.toISOString()}`);
    
    // 1. Get total income amount in date range
    const totalResult = await Income.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(req.user.id),
          date: { $gte: startDate, $lte: now }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);
    
    console.log('Total result:', totalResult);
    
    // Default values if no incomes exist
    let total = 0;
    let count = 0;
    let average = 0;
    
    if (totalResult.length > 0) {
      total = totalResult[0].total;
      count = totalResult[0].count;
      average = count > 0 ? total / count : 0;
    }
    
    // 2. Group by date (day of month or month of year)
    const timeGrouping = period === 'month' 
      ? { day: { $dayOfMonth: '$date' } }
      : { month: { $month: '$date' } };
    
    const timeStats = await Income.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(req.user.id),
          date: { $gte: startDate, $lte: now }
        }
      },
      {
        $group: {
          _id: timeGrouping,
          total: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.day': 1, '_id.month': 1 } }
    ]);
    
    console.log('Time stats:', timeStats);
    
    // 3. Group by category
    const categoryStats = await Income.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(req.user.id),
          date: { $gte: startDate, $lte: now }
        }
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' }
        }
      },
      { $sort: { total: -1 } }
    ]);
    
    console.log('Category stats:', categoryStats);
    
    // 4. Return all stats
    res.status(200).json({
      success: true,
      data: {
        total,
        average,
        count,
        timeStats,
        categoryStats
      }
    });
    
  } catch (error) {
    console.error('Error fetching income stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error: Unable to fetch income statistics',
      error: error.message
    });
  }
});

// @desc    Get income vs. expense comparison
// @route   GET /api/incomes/comparison
// @access  Private
exports.getIncomeExpenseComparison = async (req, res) => {
  try {
    const { period = 'month', year, month } = req.query;
    
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    
    // Determine time period for comparison
    let startDate, endDate, groupBy;
    
    if (period === 'year') {
      const targetYear = year ? parseInt(year) : currentYear;
      startDate = new Date(`${targetYear}-01-01`);
      endDate = new Date(`${targetYear}-12-31T23:59:59.999Z`);
      groupBy = { month: { $month: '$date' } };
    } else if (period === '6months') {
      // Last 6 months
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(currentDate.getMonth() - 5);
      sixMonthsAgo.setDate(1);
      sixMonthsAgo.setHours(0, 0, 0, 0);
      
      startDate = sixMonthsAgo;
      endDate = new Date(currentDate);
      endDate.setHours(23, 59, 59, 999);
      groupBy = { 
        year: { $year: '$date' },
        month: { $month: '$date' } 
      };
    } else {
      // Default: current month
      const targetYear = year ? parseInt(year) : currentYear;
      const targetMonth = month ? parseInt(month) : currentMonth;
      
      const daysInMonth = new Date(targetYear, targetMonth, 0).getDate();
      
      startDate = new Date(`${targetYear}-${targetMonth.toString().padStart(2, '0')}-01`);
      endDate = new Date(`${targetYear}-${targetMonth.toString().padStart(2, '0')}-${daysInMonth}T23:59:59.999Z`);
      groupBy = { day: { $dayOfMonth: '$date' } };
    }
    
    // Get income data
    const incomeData = await Income.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(req.user.id),
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: groupBy,
          total: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);
    
    // Get expense data (assumes Expense model is already defined)
    const Expense = require('../models/Expense');
    const expenseData = await Expense.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(req.user.id),
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: groupBy,
          total: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);
    
    // Get total summary
    const incomeSummary = await Income.aggregate([
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
    
    const expenseSummary = await Expense.aggregate([
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
    
    const totalIncome = incomeSummary.length > 0 ? incomeSummary[0].total : 0;
    const totalExpense = expenseSummary.length > 0 ? expenseSummary[0].total : 0;
    const netAmount = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? (netAmount / totalIncome) * 100 : 0;
    
    res.status(200).json({
      success: true,
      data: {
        period,
        startDate,
        endDate,
        incomeData,
        expenseData,
        summary: {
          totalIncome,
          totalExpense,
          netAmount,
          savingsRate: savingsRate.toFixed(2)
        }
      }
    });
  } catch (error) {
    console.error('Error getting income vs expense comparison:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
}; 