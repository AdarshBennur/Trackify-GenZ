const Income = require('../models/Income');
const { validationResult } = require('express-validator');

// @desc    Get all incomes for a user
// @route   GET /api/incomes
// @access  Private
exports.getIncomes = async (req, res) => {
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
};

// @desc    Get single income
// @route   GET /api/incomes/:id
// @access  Private
exports.getIncome = async (req, res) => {
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
};

// @desc    Create new income
// @route   POST /api/incomes
// @access  Private
exports.createIncome = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // Add user to request body
    req.body.user = req.user.id;
    
    const income = await Income.create(req.body);

    res.status(201).json({
      success: true,
      data: income
    });
  } catch (error) {
    console.error('Error creating income:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Update income
// @route   PUT /api/incomes/:id
// @access  Private
exports.updateIncome = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
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
};

// @desc    Delete income
// @route   DELETE /api/incomes/:id
// @access  Private
exports.deleteIncome = async (req, res) => {
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
};

// @desc    Get income statistics (monthly, yearly, by category)
// @route   GET /api/incomes/stats
// @access  Private
exports.getIncomeStats = async (req, res) => {
  try {
    const { period = 'month', year, month } = req.query;
    
    let matchStage = { user: req.user.id };
    let timeGrouping = {};
    
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    
    // Build the date filter based on period
    if (period === 'year') {
      // Filter by specific year or current year
      const targetYear = year ? parseInt(year) : currentYear;
      
      matchStage.date = {
        $gte: new Date(`${targetYear}-01-01`),
        $lte: new Date(`${targetYear}-12-31T23:59:59.999Z`)
      };
      
      // Group by month within year
      timeGrouping = {
        _id: { month: { $month: '$date' } },
        total: { $sum: '$amount' },
        count: { $sum: 1 }
      };
    } else if (period === 'month') {
      // Filter by specific month in specific year, or current month
      const targetYear = year ? parseInt(year) : currentYear;
      const targetMonth = month ? parseInt(month) : currentDate.getMonth() + 1;
      
      const daysInMonth = new Date(targetYear, targetMonth, 0).getDate();
      
      matchStage.date = {
        $gte: new Date(`${targetYear}-${targetMonth.toString().padStart(2, '0')}-01`),
        $lte: new Date(`${targetYear}-${targetMonth.toString().padStart(2, '0')}-${daysInMonth}T23:59:59.999Z`)
      };
      
      // Group by day within month
      timeGrouping = {
        _id: { day: { $dayOfMonth: '$date' } },
        total: { $sum: '$amount' },
        count: { $sum: 1 }
      };
    }
    
    // Time-based stats
    const timeStats = await Income.aggregate([
      { $match: matchStage },
      { $group: timeGrouping },
      { $sort: { '_id.month': 1, '_id.day': 1 } }
    ]);
    
    // Category stats
    const categoryStats = await Income.aggregate([
      { $match: matchStage },
      { 
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { total: -1 } }
    ]);
    
    // Total income in period
    const totalStats = await Income.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);
    
    const total = totalStats.length > 0 ? totalStats[0].total : 0;
    const count = totalStats.length > 0 ? totalStats[0].count : 0;
    
    res.status(200).json({
      success: true,
      data: {
        period,
        timeStats,
        categoryStats,
        total,
        count
      }
    });
  } catch (error) {
    console.error('Error getting income stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

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
          user: req.user.id,
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
          user: req.user.id,
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
          user: req.user.id,
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
          user: req.user.id,
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