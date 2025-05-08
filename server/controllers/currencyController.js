const Currency = require('../models/Currency');
const { validationResult } = require('express-validator');
const axios = require('axios');

// @desc    Get all currencies
// @route   GET /api/currencies
// @access  Private
exports.getCurrencies = async (req, res) => {
  try {
    const { active = 'true' } = req.query;
    
    const filter = {};
    if (active === 'true' || active === 'false') {
      filter.isActive = active === 'true';
    }
    
    const currencies = await Currency.find(filter).sort('code');
    
    res.status(200).json({
      success: true,
      count: currencies.length,
      data: currencies
    });
  } catch (error) {
    console.error('Error getting currencies:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Get single currency
// @route   GET /api/currencies/:code
// @access  Private
exports.getCurrency = async (req, res) => {
  try {
    const currency = await Currency.findOne({ code: req.params.code.toUpperCase() });

    if (!currency) {
      return res.status(404).json({
        success: false,
        message: 'Currency not found'
      });
    }

    res.status(200).json({
      success: true,
      data: currency
    });
  } catch (error) {
    console.error('Error getting currency:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Create new currency
// @route   POST /api/currencies
// @access  Private (admin)
exports.createCurrency = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // Check if currency already exists
    const exists = await Currency.findOne({ code: req.body.code.toUpperCase() });
    if (exists) {
      return res.status(400).json({
        success: false,
        message: 'Currency already exists'
      });
    }
    
    // If this is the first currency or explicitly set as base, ensure only one base currency
    if (req.body.isBase) {
      await Currency.updateMany({}, { isBase: false });
    } else {
      // If no base currency exists, make this one the base
      const baseExists = await Currency.findOne({ isBase: true });
      if (!baseExists) {
        req.body.isBase = true;
      }
    }
    
    // Ensure code is uppercase
    req.body.code = req.body.code.toUpperCase();
    
    const currency = await Currency.create(req.body);

    res.status(201).json({
      success: true,
      data: currency
    });
  } catch (error) {
    console.error('Error creating currency:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Update currency
// @route   PUT /api/currencies/:code
// @access  Private (admin)
exports.updateCurrency = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    let currency = await Currency.findOne({ code: req.params.code.toUpperCase() });

    if (!currency) {
      return res.status(404).json({
        success: false,
        message: 'Currency not found'
      });
    }
    
    // Cannot change the code
    if (req.body.code && req.body.code !== currency.code) {
      return res.status(400).json({
        success: false,
        message: 'Currency code cannot be changed'
      });
    }
    
    // If setting as base, ensure only one base currency
    if (req.body.isBase) {
      await Currency.updateMany({ _id: { $ne: currency._id } }, { isBase: false });
    } else if (currency.isBase && req.body.isBase === false) {
      // Cannot unset the base currency without setting another
      return res.status(400).json({
        success: false,
        message: 'Cannot unset base currency without setting another currency as base'
      });
    }
    
    // Update the updated timestamp
    req.body.updatedAt = new Date();
    
    currency = await Currency.findOneAndUpdate(
      { code: req.params.code.toUpperCase() }, 
      req.body, 
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: currency
    });
  } catch (error) {
    console.error('Error updating currency:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Delete currency
// @route   DELETE /api/currencies/:code
// @access  Private (admin)
exports.deleteCurrency = async (req, res) => {
  try {
    const currency = await Currency.findOne({ code: req.params.code.toUpperCase() });

    if (!currency) {
      return res.status(404).json({
        success: false,
        message: 'Currency not found'
      });
    }

    // Cannot delete base currency
    if (currency.isBase) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete base currency'
      });
    }

    await Currency.findByIdAndDelete(currency._id);

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Error deleting currency:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Sync currency rates with external API
// @route   POST /api/currencies/sync
// @access  Private (admin)
exports.syncCurrencyRates = async (req, res) => {
  try {
    // Get base currency
    const baseCurrency = await Currency.findOne({ isBase: true });
    
    if (!baseCurrency) {
      return res.status(400).json({
        success: false,
        message: 'No base currency set'
      });
    }
    
    // Get all active currencies
    const currencies = await Currency.find({ isActive: true });
    
    // Prepare currency codes to fetch
    const currencyCodes = currencies
      .map(c => c.code)
      .filter(code => code !== baseCurrency.code);
    
    if (currencyCodes.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No currencies to sync',
        data: []
      });
    }
    
    try {
      // Using exchangerate-api.com as an example
      // You would need to sign up for an API key
      const API_KEY = process.env.EXCHANGE_RATE_API_KEY;
      
      if (!API_KEY) {
        return res.status(500).json({
          success: false,
          message: 'Exchange Rate API key not configured'
        });
      }
      
      const response = await axios.get(
        `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/${baseCurrency.code}`
      );
      
      if (response.data && response.data.result === 'success') {
        const rates = response.data.conversion_rates;
        
        // Update rates for all currencies
        const updatePromises = currencies.map(async (currency) => {
          if (currency.code === baseCurrency.code) {
            // Base currency always has rate of 1
            if (currency.rate !== 1) {
              await Currency.findByIdAndUpdate(currency._id, { 
                rate: 1,
                updatedAt: new Date()
              });
            }
            return { code: currency.code, rate: 1, updated: currency.rate !== 1 };
          } else if (rates[currency.code]) {
            // Update rate if it has changed
            if (currency.rate !== rates[currency.code]) {
              await Currency.findByIdAndUpdate(currency._id, { 
                rate: rates[currency.code],
                updatedAt: new Date()
              });
            }
            return { 
              code: currency.code, 
              rate: rates[currency.code], 
              updated: currency.rate !== rates[currency.code] 
            };
          }
          return { code: currency.code, rate: currency.rate, updated: false };
        });
        
        const results = await Promise.all(updatePromises);
        
        return res.status(200).json({
          success: true,
          message: 'Currency rates synced successfully',
          data: results
        });
      } else {
        return res.status(500).json({
          success: false,
          message: 'Failed to fetch exchange rates'
        });
      }
    } catch (apiError) {
      console.error('API Error:', apiError);
      return res.status(500).json({
        success: false,
        message: 'Failed to sync with exchange rate API'
      });
    }
  } catch (error) {
    console.error('Error syncing currency rates:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Get user's preferred currency
// @route   GET /api/currencies/preference
// @access  Private
exports.getUserCurrencyPreference = async (req, res) => {
  try {
    // Get user from database with currency preference
    const user = await req.user.populate('currencyPreference');
    
    // If user has no preference, return base currency
    if (!user.currencyPreference) {
      const baseCurrency = await Currency.findOne({ isBase: true });
      return res.status(200).json({
        success: true,
        data: baseCurrency
      });
    }
    
    res.status(200).json({
      success: true,
      data: user.currencyPreference
    });
  } catch (error) {
    console.error('Error getting user currency preference:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Set user's preferred currency
// @route   PUT /api/currencies/preference
// @access  Private
exports.setUserCurrencyPreference = async (req, res) => {
  try {
    const { currencyCode } = req.body;
    
    if (!currencyCode) {
      return res.status(400).json({
        success: false,
        message: 'Currency code is required'
      });
    }
    
    // Find the currency
    const currency = await Currency.findOne({ 
      code: currencyCode.toUpperCase(),
      isActive: true
    });
    
    if (!currency) {
      return res.status(404).json({
        success: false,
        message: 'Currency not found or not active'
      });
    }
    
    // Update user's currency preference
    const User = require('../models/User');
    await User.findByIdAndUpdate(req.user.id, { currencyPreference: currency._id });
    
    res.status(200).json({
      success: true,
      data: currency
    });
  } catch (error) {
    console.error('Error setting user currency preference:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
}; 