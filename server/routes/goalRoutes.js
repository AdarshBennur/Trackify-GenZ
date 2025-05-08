const express = require('express');
const { check } = require('express-validator');
const {
  getGoals,
  getGoal,
  createGoal,
  updateGoal,
  deleteGoal,
  updateProgress
} = require('../controllers/goalController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply protect middleware to all routes
router.use(protect);

// @route   GET /api/goals
// @desc    Get all goals
// @access  Private
router.get('/', getGoals);

// @route   GET /api/goals/:id
// @desc    Get single goal
// @access  Private
router.get('/:id', getGoal);

// @route   POST /api/goals
// @desc    Create new goal
// @access  Private
router.post(
  '/',
  [
    check('title', 'Title is required').not().isEmpty(),
    check('targetAmount', 'Target amount is required and must be a number').isNumeric(),
    check('category', 'Category is required').not().isEmpty(),
    check('endDate', 'End date is required').not().isEmpty()
  ],
  createGoal
);

// @route   PUT /api/goals/:id
// @desc    Update goal
// @access  Private
router.put(
  '/:id',
  [
    check('title', 'Title is required').optional().not().isEmpty(),
    check('targetAmount', 'Target amount must be a number').optional().isNumeric(),
    check('currentAmount', 'Current amount must be a number').optional().isNumeric(),
    check('category', 'Category is required').optional().not().isEmpty(),
    check('endDate', 'End date must be a valid date').optional().isISO8601()
  ],
  updateGoal
);

// @route   DELETE /api/goals/:id
// @desc    Delete goal
// @access  Private
router.delete('/:id', deleteGoal);

// @route   PUT /api/goals/:id/progress
// @desc    Update goal progress
// @access  Private
router.put(
  '/:id/progress',
  [
    check('amount', 'Amount is required and must be a number').isNumeric()
  ],
  updateProgress
);

module.exports = router; 