const express = require('express');
const { check } = require('express-validator');
const {
  getIncomes,
  getIncome,
  createIncome,
  updateIncome,
  deleteIncome,
  getIncomeStats,
  getIncomeExpenseComparison
} = require('../controllers/incomeController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply protect middleware to all routes
router.use(protect);

// @route   GET /api/incomes
// @desc    Get all incomes
// @access  Private
router.get('/', getIncomes);

// @route   GET /api/incomes/stats
// @desc    Get income statistics
// @access  Private
router.get('/stats', getIncomeStats);

// @route   GET /api/incomes/comparison
// @desc    Get income vs. expense comparison
// @access  Private
router.get('/comparison', getIncomeExpenseComparison);

// @route   GET /api/incomes/:id
// @desc    Get single income
// @access  Private
router.get('/:id', getIncome);

// @route   POST /api/incomes
// @desc    Create new income
// @access  Private
router.post(
  '/',
  [
    check('title', 'Title is required').not().isEmpty(),
    check('amount', 'Amount is required and must be a number').isNumeric(),
    check('date', 'Date is required').not().isEmpty(),
    check('category', 'Category is required').not().isEmpty()
  ],
  createIncome
);

// @route   PUT /api/incomes/:id
// @desc    Update income
// @access  Private
router.put(
  '/:id',
  [
    check('title', 'Title is required').optional().not().isEmpty(),
    check('amount', 'Amount must be a number').optional().isNumeric(),
    check('date', 'Date must be a valid date').optional().isISO8601(),
    check('category', 'Category is required').optional().not().isEmpty()
  ],
  updateIncome
);

// @route   DELETE /api/incomes/:id
// @desc    Delete income
// @access  Private
router.delete('/:id', deleteIncome);

module.exports = router; 