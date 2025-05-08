const express = require('express');
const { check } = require('express-validator');
const {
  getCurrencies,
  getCurrency,
  createCurrency,
  updateCurrency,
  deleteCurrency,
  syncCurrencyRates,
  getUserCurrencyPreference,
  setUserCurrencyPreference
} = require('../controllers/currencyController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply protect middleware to all routes
router.use(protect);

// User currency preference routes
router.route('/preference')
  .get(getUserCurrencyPreference)
  .put(setUserCurrencyPreference);

// Currency sync route (admin only)
router.post('/sync', authorize('admin'), syncCurrencyRates);

// Basic currency routes
router.route('/')
  .get(getCurrencies)
  .post(
    authorize('admin'),
    [
      check('code', 'Currency code is required and must be 3 characters').isLength({ min: 3, max: 3 }),
      check('name', 'Currency name is required').not().isEmpty(),
      check('symbol', 'Currency symbol is required').not().isEmpty(),
      check('rate', 'Rate must be a positive number').isFloat({ min: 0 })
    ],
    createCurrency
  );

router.route('/:code')
  .get(getCurrency)
  .put(
    authorize('admin'),
    [
      check('name', 'Currency name is required').optional().not().isEmpty(),
      check('symbol', 'Currency symbol is required').optional().not().isEmpty(),
      check('rate', 'Rate must be a positive number').optional().isFloat({ min: 0 }),
      check('isActive', 'IsActive must be a boolean').optional().isBoolean()
    ],
    updateCurrency
  )
  .delete(authorize('admin'), deleteCurrency);

module.exports = router; 