const express = require('express');
const router = express.Router();
const {
  getExpenses,
  getExpense,
  createExpense,
  updateExpense,
  deleteExpense,
  getExpenseStats,
  exportExpenses
} = require('../controllers/expenseController');

const { protect } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(protect);

// Routes
router.route('/')
  .get(getExpenses)
  .post(createExpense);

router.route('/stats')
  .get(getExpenseStats);

router.route('/export')
  .get(exportExpenses);

router.route('/:id')
  .get(getExpense)
  .put(updateExpense)
  .delete(deleteExpense);

module.exports = router; 