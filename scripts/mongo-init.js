// MongoDB initialization script for expense tracker

// Switch to the expense database
db = db.getSiblingDB('expenseDB');

// Create collections with proper indexes
db.createCollection('users');
db.createCollection('expenses');
db.createCollection('incomes');
db.createCollection('budgets');
db.createCollection('goals');
db.createCollection('reminders');
db.createCollection('currencies');

// Create indexes for better performance
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "username": 1 }, { unique: true });

db.expenses.createIndex({ "userId": 1 });
db.expenses.createIndex({ "date": -1 });
db.expenses.createIndex({ "category": 1 });

db.incomes.createIndex({ "userId": 1 });
db.incomes.createIndex({ "date": -1 });

db.budgets.createIndex({ "userId": 1 });
db.budgets.createIndex({ "category": 1 });

db.goals.createIndex({ "userId": 1 });
db.goals.createIndex({ "targetDate": 1 });

db.reminders.createIndex({ "userId": 1 });
db.reminders.createIndex({ "reminderDate": 1 });

db.currencies.createIndex({ "code": 1 }, { unique: true });

// Insert default currencies
db.currencies.insertMany([
  {
    code: "USD",
    name: "US Dollar",
    symbol: "$",
    exchangeRate: 1.0,
    isDefault: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    code: "EUR",
    name: "Euro",
    symbol: "€",
    exchangeRate: 0.85,
    isDefault: false,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    code: "GBP",
    name: "British Pound",
    symbol: "£",
    exchangeRate: 0.73,
    isDefault: false,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    code: "INR",
    name: "Indian Rupee",
    symbol: "₹",
    exchangeRate: 83.0,
    isDefault: false,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

print('Database expenseDB initialized successfully with collections and indexes');
print('Default currencies added');
print('Collections created: ' + db.getCollectionNames().join(', ')); 