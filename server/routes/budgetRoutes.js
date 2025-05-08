const express = require('express');
const { check } = require('express-validator');
const {
  getBudgets,
  getBudget,
  createBudget,
  updateBudget,
  deleteBudget,
  getBudgetUtilization
} = require('../controllers/budgetController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply protect middleware to all routes
router.use(protect);

// @route   GET /api/budgets/utilization
// @desc    Get budget utilization
// @access  Private
router.get('/utilization', getBudgetUtilization);

// @route   GET /api/budgets
// @desc    Get all budgets
// @access  Private
router.get('/', getBudgets);

// @route   GET /api/budgets/:id
// @desc    Get single budget
// @access  Private
router.get('/:id', getBudget);

// @route   POST /api/budgets
// @desc    Create new budget
// @access  Private
router.post(
  '/',
  [
    check('category', 'Category is required').not().isEmpty(),
    check('amount', 'Amount is required and must be a number').isNumeric(),
    check('period', 'Period must be monthly, quarterly, or yearly').isIn(['monthly', 'quarterly', 'yearly'])
  ],
  createBudget
);

// @route   PUT /api/budgets/:id
// @desc    Update budget
// @access  Private
router.put(
  '/:id',
  [
    check('category', 'Category is required').optional().not().isEmpty(),
    check('amount', 'Amount must be a number').optional().isNumeric(),
    check('period', 'Period must be monthly, quarterly, or yearly').optional().isIn(['monthly', 'quarterly', 'yearly'])
  ],
  updateBudget
);

// @route   DELETE /api/budgets/:id
// @desc    Delete budget
// @access  Private
router.delete('/:id', deleteBudget);

module.exports = router; 