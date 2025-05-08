const express = require('express');
const { check } = require('express-validator');
const {
  getReminders,
  getReminder,
  createReminder,
  updateReminder,
  deleteReminder,
  completeReminder
} = require('../controllers/reminderController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply protect middleware to all routes
router.use(protect);

// @route   GET /api/reminders
// @desc    Get all reminders
// @access  Private
router.get('/', getReminders);

// @route   GET /api/reminders/:id
// @desc    Get single reminder
// @access  Private
router.get('/:id', getReminder);

// @route   POST /api/reminders
// @desc    Create new reminder
// @access  Private
router.post(
  '/',
  [
    check('title', 'Title is required').not().isEmpty(),
    check('amount', 'Amount is required and must be a number').isNumeric(),
    check('dueDate', 'Due date is required').not().isEmpty(),
    check('category', 'Category is required').not().isEmpty()
  ],
  createReminder
);

// @route   PUT /api/reminders/:id
// @desc    Update reminder
// @access  Private
router.put(
  '/:id',
  [
    check('title', 'Title is required').optional().not().isEmpty(),
    check('amount', 'Amount must be a number').optional().isNumeric(),
    check('dueDate', 'Due date must be a valid date').optional().isISO8601(),
    check('category', 'Category is required').optional().not().isEmpty()
  ],
  updateReminder
);

// @route   DELETE /api/reminders/:id
// @desc    Delete reminder
// @access  Private
router.delete('/:id', deleteReminder);

// @route   PUT /api/reminders/:id/complete
// @desc    Mark reminder as completed
// @access  Private
router.put('/:id/complete', completeReminder);

module.exports = router; 