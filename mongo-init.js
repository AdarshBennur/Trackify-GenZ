// MongoDB Initialization Script for Expense Tracker
// This script runs when MongoDB container starts for the first time

// Switch to the expense tracker database
db = db.getSiblingDB('expensetracker');

// Create the application user with read/write access
db.createUser({
  user: 'appuser',
  pwd: 'apppassword',
  roles: [
    {
      role: 'readWrite',
      db: 'expensetracker'
    }
  ]
});

// Create initial collections with basic structure
db.createCollection('users');
db.createCollection('expenses');
db.createCollection('incomes');
db.createCollection('budgets');
db.createCollection('goals');
db.createCollection('reminders');
db.createCollection('currencies');

// Create indexes for better performance
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "createdAt": 1 });

db.expenses.createIndex({ "userId": 1 });
db.expenses.createIndex({ "date": -1 });
db.expenses.createIndex({ "category": 1 });

db.incomes.createIndex({ "userId": 1 });
db.incomes.createIndex({ "date": -1 });

db.budgets.createIndex({ "userId": 1 });
db.budgets.createIndex({ "month": 1, "year": 1 });

db.goals.createIndex({ "userId": 1 });
db.goals.createIndex({ "targetDate": 1 });

db.reminders.createIndex({ "userId": 1 });
db.reminders.createIndex({ "dueDate": 1 });

db.currencies.createIndex({ "code": 1 }, { unique: true });

// Insert default currencies
db.currencies.insertMany([
  {
    code: 'USD',
    name: 'US Dollar',
    symbol: '$',
    isDefault: true,
    createdAt: new Date()
  },
  {
    code: 'EUR',
    name: 'Euro',
    symbol: '€',
    isDefault: false,
    createdAt: new Date()
  },
  {
    code: 'GBP',
    name: 'British Pound',
    symbol: '£',
    isDefault: false,
    createdAt: new Date()
  },
  {
    code: 'INR',
    name: 'Indian Rupee',
    symbol: '₹',
    isDefault: false,
    createdAt: new Date()
  },
  {
    code: 'CAD',
    name: 'Canadian Dollar',
    symbol: 'C$',
    isDefault: false,
    createdAt: new Date()
  }
]);

print('✅ Database initialization completed successfully!');
print('📊 Collections created: users, expenses, incomes, budgets, goals, reminders, currencies');
print('🔍 Indexes created for optimal performance');
print('💰 Default currencies initialized');
print('👤 Application user created with readWrite permissions'); 