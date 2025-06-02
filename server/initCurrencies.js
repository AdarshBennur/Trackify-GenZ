const mongoose = require('mongoose');
const Currency = require('./models/Currency');
const colors = require('colors');

/**
 * Initialize currencies in the database
 * Ensures that USD exists as the base currency
 */
async function initCurrencies() {
  try {
    console.log('Initializing currencies...'.yellow);
    
    // Check if any currencies exist
    const count = await Currency.countDocuments();
    
    if (count === 0) {
      console.log('No currencies found. Creating default currencies...'.yellow);
      
      // Create USD as the base currency
      await Currency.create({
        code: 'USD',
        name: 'US Dollar',
        symbol: '$',
        rate: 1,
        isActive: true,
        isBase: true
      });
      
      // Create some other common currencies
      const commonCurrencies = [
        { code: 'EUR', name: 'Euro', symbol: '€', rate: 0.85 },
        { code: 'GBP', name: 'British Pound', symbol: '£', rate: 0.74 },
        { code: 'JPY', name: 'Japanese Yen', symbol: '¥', rate: 110.2 },
        { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', rate: 1.25 },
        { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', rate: 1.35 },
        { code: 'INR', name: 'Indian Rupee', symbol: '₹', rate: 74.5 }
      ];
      
      await Currency.insertMany(commonCurrencies.map(c => ({
        ...c,
        isActive: true,
        isBase: false
      })));
      
      console.log(`Created ${commonCurrencies.length + 1} currencies`.green);
    } else {
      // Ensure USD exists
      const usd = await Currency.findOne({ code: 'USD' });
      
      if (!usd) {
        console.log('USD currency not found. Creating...'.yellow);
        
        // Create USD
        await Currency.create({
          code: 'USD',
          name: 'US Dollar',
          symbol: '$',
          rate: 1,
          isActive: true,
          isBase: true
        });
        
        console.log('USD currency created successfully'.green);
      } else {
        // Make sure USD is base currency
        if (!usd.isBase) {
          console.log('Setting USD as base currency...'.yellow);
          
          // Unset any existing base currency
          await Currency.updateMany({ isBase: true }, { isBase: false });
          
          // Set USD as base
          await Currency.findOneAndUpdate(
            { code: 'USD' },
            { isBase: true, rate: 1 }
          );
          
          console.log('USD set as base currency'.green);
        }
      }
    }
    
    console.log('Currency initialization complete'.green);
  } catch (error) {
    console.error('Error initializing currencies:'.red, error);
  }
}

module.exports = initCurrencies; 