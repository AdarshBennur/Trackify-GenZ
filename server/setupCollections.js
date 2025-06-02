const mongoose = require('mongoose');
const dotenv = require('dotenv');
const colors = require('colors');

// Load models
const User = require('./models/User');
const Expense = require('./models/Expense');
const Income = require('./models/Income');
const Budget = require('./models/Budget');
const Currency = require('./models/Currency');

// Load environment variables
dotenv.config();

async function setupCollections() {
  console.log('=== Setting up MongoDB Collections ==='.green.bold);
  
  try {
    // Check if we already have a connection
    if (mongoose.connection.readyState !== 1) {
      console.log('No active MongoDB connection, using existing server connection...'.yellow);
      // We'll use the existing connection from the server
      if (mongoose.connection.readyState === 0) {
        throw new Error('No database connection available');
      }
    }
    
    console.log(`Connected to MongoDB: ${mongoose.connection.host}`.green);
    console.log(`Database: ${mongoose.connection.db.databaseName}`.green);
    
    // Check for existing collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    console.log('Existing collections:'.cyan, collectionNames.join(', '));
    
    // Make sure required collections exist
    const requiredCollections = ['users', 'expenses', 'incomes', 'budgets', 'currencies'];
    
    for (const collName of requiredCollections) {
      if (!collectionNames.includes(collName)) {
        console.log(`Collection '${collName}' does not exist. Creating...`.yellow);
        
        // Create collection by making a sample document
        let model;
        switch (collName) {
          case 'users':
            model = User;
            break;
          case 'expenses':
            model = Expense;
            break;
          case 'incomes':
            model = Income;
            break;
          case 'budgets':
            model = Budget;
            break;
          case 'currencies':
            model = Currency;
            break;
          default:
            continue;
        }
        
        // Force the collection to be created by ensuring indexes
        await model.createCollection();
        console.log(`Created collection: ${collName}`.green);
      } else {
        console.log(`Collection '${collName}' already exists`.green);
      }
    }
    
    // Set up USD as the base currency if it doesn't exist
    const currencyExists = await Currency.findOne({ code: 'USD' });
    if (!currencyExists) {
      console.log('Setting up USD as base currency...'.yellow);
      await Currency.create({
        code: 'USD',
        name: 'US Dollar',
        symbol: '$',
        rate: 1,
        isActive: true,
        isBase: true
      });
      console.log('USD currency created successfully'.green);
    }
    
    // Create indexes if they don't exist
    console.log('\nEnsuring indexes exist...'.yellow);
    
    // Add expense indexes if missing
    await Expense.collection.createIndex({ user: 1, date: -1 });
    await Expense.collection.createIndex({ user: 1, category: 1 });
    
    // Add income indexes if missing
    await Income.collection.createIndex({ user: 1, date: -1 });
    await Income.collection.createIndex({ user: 1, category: 1 });
    
    // Add budget indexes if missing
    await Budget.collection.createIndex({ user: 1, category: 1, period: 1 }, { unique: true });
    
    console.log('Indexes created successfully'.green);
    
    // Verify collections after setup
    const updatedCollections = await mongoose.connection.db.listCollections().toArray();
    const updatedNames = updatedCollections.map(c => c.name);
    console.log('\nFinal collections:'.cyan, updatedNames.join(', '));
    
    console.log('\n✅ Database setup complete'.green.bold);
  } catch (error) {
    console.error('❌ Error setting up collections:'.red.bold);
    console.error(error);
    throw error; // Rethrow so the caller can handle it
  }
}

// Run setup if not being imported
if (require.main === module) {
  // If run directly, we need to handle the database connection
  (async () => {
    try {
      // Get MongoDB URI and fix line breaks
      let mongoURI = process.env.MONGO_URI;
      if (!mongoURI) {
        console.error('❌ MONGO_URI not defined in environment variables'.red.bold);
        process.exit(1);
      }
      
      // Fix any line breaks in the connection string
      mongoURI = mongoURI.replace(/\n/g, '').replace(/\r/g, '');
      
      // Connect to MongoDB
      console.log('Connecting to MongoDB...'.yellow);
      await mongoose.connect(mongoURI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
      
      await setupCollections();
    } catch (error) {
      console.error('Setup failed:', error);
      process.exit(1);
    } finally {
      // Close the database connection when run standalone
      await mongoose.connection.close();
      console.log('MongoDB connection closed'.yellow);
      process.exit(0);
    }
  })();
}

module.exports = setupCollections; 