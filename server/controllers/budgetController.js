const Budget = require('../models/Budget');
const Expense = require('../models/Expense');
const { validationResult } = require('express-validator');

// @desc    Get all budgets for a user
// @route   GET /api/budgets
// @access  Private
exports.getBudgets = async (req, res) => {
  try {
    const budgets = await Budget.find({ user: req.user.id });

    res.status(200).json({
      success: true,
      count: budgets.length,
      data: budgets
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Get single budget
// @route   GET /api/budgets/:id
// @access  Private
exports.getBudget = async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.id);

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found'
      });
    }

    // Make sure user owns the budget
    if (budget.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this budget'
      });
    }

    res.status(200).json({
      success: true,
      data: budget
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Create new budget
// @route   POST /api/budgets
// @access  Private
exports.createBudget = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // Add user to request body
    req.body.user = req.user.id;
    
    const budget = await Budget.create(req.body);

    res.status(201).json({
      success: true,
      data: budget
    });
  } catch (error) {
    // Check for duplicate key error (code 11000)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'You already have a budget for this category and period'
      });
    }
    
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Update budget
// @route   PUT /api/budgets/:id
// @access  Private
exports.updateBudget = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    let budget = await Budget.findById(req.params.id);

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found'
      });
    }

    // Make sure user owns the budget
    if (budget.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this budget'
      });
    }

    budget = await Budget.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: budget
    });
  } catch (error) {
    // Check for duplicate key error (code 11000)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'You already have a budget for this category and period'
      });
    }
    
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Delete budget
// @route   DELETE /api/budgets/:id
// @access  Private
exports.deleteBudget = async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.id);

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found'
      });
    }

    // Make sure user owns the budget
    if (budget.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to delete this budget'
      });
    }

    await Budget.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Get budget utilization
// @route   GET /api/budgets/utilization
// @access  Private
exports.getBudgetUtilization = async (req, res) => {
  try {
    // Get all budgets for the user
    const budgets = await Budget.find({ user: req.user.id });
    
    if (budgets.length === 0) {
      return res.status(200).json({
        success: true,
        data: []
      });
    }

    // Get current date info for calculating date ranges
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Calculate start and end dates based on budget periods
    const dateRanges = budgets.map(budget => {
      let startDate, endDate;
      
      if (budget.period === 'monthly') {
        startDate = new Date(currentYear, currentMonth, 1);
        endDate = new Date(currentYear, currentMonth + 1, 0);
      } else if (budget.period === 'quarterly') {
        const quarterStartMonth = Math.floor(currentMonth / 3) * 3;
        startDate = new Date(currentYear, quarterStartMonth, 1);
        endDate = new Date(currentYear, quarterStartMonth + 3, 0);
      } else if (budget.period === 'yearly') {
        startDate = new Date(currentYear, 0, 1);
        endDate = new Date(currentYear, 11, 31);
      }
      
      return {
        budgetId: budget._id,
        category: budget.category,
        amount: budget.amount,
        startDate,
        endDate
      };
    });

    // Get expenses grouped by category within each budget's time range
    const utilizationPromises = dateRanges.map(async range => {
      const expenses = await Expense.aggregate([
        { 
          $match: { 
            user: req.user._id,
            category: range.category,
            date: { $gte: range.startDate, $lte: range.endDate }
          } 
        },
        { 
          $group: { 
            _id: null, 
            total: { $sum: '$amount' } 
          } 
        }
      ]);
      
      const spent = expenses.length > 0 ? expenses[0].total : 0;
      const remaining = range.amount - spent;
      const percentage = (spent / range.amount) * 100;
      
      return {
        budgetId: range.budgetId,
        category: range.category,
        budgetAmount: range.amount,
        spent,
        remaining,
        utilizationPercentage: parseFloat(percentage.toFixed(2)),
        period: budgets.find(b => b._id.toString() === range.budgetId.toString()).period,
        startDate: range.startDate,
        endDate: range.endDate
      };
    });

    const utilization = await Promise.all(utilizationPromises);

    res.status(200).json({
      success: true,
      data: utilization
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
}; 