const mongoose = require('mongoose');
const dotenv = require('dotenv');
const colors = require('colors');
const bcrypt = require('bcryptjs');

// Load models
const User = require('./models/User');
const Expense = require('./models/Expense');
const Income = require('./models/Income');
const Budget = require('./models/Budget');

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://aditrack:track999@tracker.pq6xgts.mongodb.net/?retryWrites=true&w=majority&appName=tracker', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Sample data
const users = [
  {
    username: 'testuser',
    email: 'test@example.com',
    password: bcrypt.hashSync('password123', 10)
  },
  {
    username: 'Guest User',
    email: 'guest@example.com',
    password: bcrypt.hashSync('guest123', 10),
    role: 'guest'
  }
];

// Create default guest data
const createGuestData = async (userId) => {
  // Create guest expenses
  const guestExpenses = [
    {
      title: 'Groceries',
      amount: 2500,
      category: 'Food',
      date: new Date('2023-10-01'),
      notes: 'Monthly grocery shopping',
      currency: { code: 'USD', symbol: '$' },
      user: userId
    },
    {
      title: 'Electricity Bill',
      amount: 1200,
      category: 'Utilities',
      date: new Date('2023-10-05'),
      notes: 'Monthly electricity bill',
      currency: { code: 'USD', symbol: '$' },
      user: userId
    },
    {
      title: 'Dinner with friends',
      amount: 1850,
      category: 'Entertainment',
      date: new Date('2023-10-10'),
      currency: { code: 'USD', symbol: '$' },
      user: userId
    },
    {
      title: 'Uber ride',
      amount: 350,
      category: 'Transportation',
      date: new Date('2023-10-15'),
      currency: { code: 'USD', symbol: '$' },
      user: userId
    },
    {
      title: 'Movie tickets',
      amount: 800,
      category: 'Entertainment',
      date: new Date('2023-10-20'),
      currency: { code: 'USD', symbol: '$' },
      user: userId
    },
    {
      title: 'Internet Bill',
      amount: 999,
      category: 'Utilities',
      date: new Date('2023-10-12'),
      currency: { code: 'USD', symbol: '$' },
      user: userId
    },
    {
      title: 'Apartment Rent',
      amount: 15000,
      category: 'Housing',
      date: new Date('2023-10-01'),
      currency: { code: 'USD', symbol: '$' },
      user: userId
    },
    {
      title: 'Health Insurance',
      amount: 2500,
      category: 'Healthcare',
      date: new Date('2023-10-05'),
      currency: { code: 'USD', symbol: '$' },
      user: userId
    }
  ];

  // Create guest incomes
  const guestIncomes = [
    {
      title: 'Salary',
      amount: 50000,
      category: 'Salary',
      date: new Date('2023-10-01'),
      notes: 'Monthly salary',
      currency: { code: 'USD', symbol: '$' },
      user: userId
    },
    {
      title: 'Freelance work',
      amount: 15000,
      category: 'Freelance',
      date: new Date('2023-10-15'),
      notes: 'Website development project',
      currency: { code: 'USD', symbol: '$' },
      user: userId
    },
    {
      title: 'Investments',
      amount: 5000,
      category: 'Investment',
      date: new Date('2023-10-20'),
      notes: 'Stock dividends',
      currency: { code: 'USD', symbol: '$' },
      user: userId
    }
  ];

  // Create guest budgets
  const guestBudgets = [
    {
      category: 'Food',
      amount: 5000,
      period: 'monthly',
      currency: { code: 'USD', symbol: '$' },
      user: userId,
      startDate: new Date('2023-10-01')
    },
    {
      category: 'Utilities',
      amount: 3000,
      period: 'monthly',
      currency: { code: 'USD', symbol: '$' },
      user: userId,
      startDate: new Date('2023-10-01')
    },
    {
      category: 'Entertainment',
      amount: 3000,
      period: 'monthly',
      currency: { code: 'USD', symbol: '$' },
      user: userId,
      startDate: new Date('2023-10-01')
    },
    {
      category: 'Housing',
      amount: 15000,
      period: 'monthly',
      currency: { code: 'USD', symbol: '$' },
      user: userId,
      startDate: new Date('2023-10-01')
    },
    {
      category: 'Transportation',
      amount: 2000,
      period: 'monthly',
      currency: { code: 'USD', symbol: '$' },
      user: userId,
      startDate: new Date('2023-10-01')
    }
  ];

  // Clear any existing guest data
  await Expense.deleteMany({ user: userId });
  await Income.deleteMany({ user: userId });
  await Budget.deleteMany({ user: userId });

  // Insert guest data
  await Expense.insertMany(guestExpenses);
  await Income.insertMany(guestIncomes);
  await Budget.insertMany(guestBudgets);

  console.log(`Guest data created for user ID: ${userId}`.green.inverse);
};

// Function to import data
const importData = async () => {
  try {
    // Clear existing data
    await User.deleteMany();
    await Expense.deleteMany();
    await Income.deleteMany();
    await Budget.deleteMany();

    console.log('Data cleaned...'.yellow.inverse);

    // Insert users
    const createdUsers = await User.insertMany(users);
    
    const regularUserId = createdUsers[0]._id;
    const guestUserId = createdUsers[1]._id;

    console.log(`${createdUsers.length} users created...`.green.inverse);

    // Create guest data
    await createGuestData(guestUserId);

    // Create expenses for regular user
    const expenses = [
      {
        title: 'Groceries',
        amount: 125.50,
        category: 'Food',
        date: new Date('2023-10-01'),
        notes: 'Weekly grocery shopping',
        currency: { code: 'USD', symbol: '$' },
        user: regularUserId
      },
      {
        title: 'Electricity Bill',
        amount: 85.20,
        category: 'Utilities',
        date: new Date('2023-10-05'),
        notes: 'Monthly electricity bill',
        currency: { code: 'USD', symbol: '$' },
        user: regularUserId
      },
      {
        title: 'Dinner with friends',
        amount: 65.30,
        category: 'Entertainment',
        date: new Date('2023-10-10'),
        currency: { code: 'USD', symbol: '$' },
        user: regularUserId
      },
      {
        title: 'Uber ride',
        amount: 25.00,
        category: 'Transportation',
        date: new Date('2023-10-15'),
        currency: { code: 'USD', symbol: '$' },
        user: regularUserId
      }
    ];

    await Expense.insertMany(expenses);
    console.log(`${expenses.length} expenses created...`.green.inverse);

    // Create incomes for regular user
    const incomes = [
      {
        title: 'Salary',
        amount: 5000.00,
        category: 'Salary',
        date: new Date('2023-10-01'),
        notes: 'Monthly salary',
        currency: { code: 'USD', symbol: '$' },
        user: regularUserId
      },
      {
        title: 'Freelance work',
        amount: 500.00,
        category: 'Freelance',
        date: new Date('2023-10-15'),
        notes: 'Website development project',
        currency: { code: 'USD', symbol: '$' },
        user: regularUserId
      }
    ];

    await Income.insertMany(incomes);
    console.log(`${incomes.length} incomes created...`.green.inverse);

    // Create budgets for regular user
    const budgets = [
      {
        category: 'Food',
        amount: 500.00,
        period: 'monthly',
        currency: { code: 'USD', symbol: '$' },
        user: regularUserId
      },
      {
        category: 'Utilities',
        amount: 200.00,
        period: 'monthly',
        currency: { code: 'USD', symbol: '$' },
        user: regularUserId
      },
      {
        category: 'Entertainment',
        amount: 300.00,
        period: 'monthly',
        currency: { code: 'USD', symbol: '$' },
        user: regularUserId
      }
    ];

    await Budget.insertMany(budgets);
    console.log(`${budgets.length} budgets created...`.green.inverse);

    console.log('Data imported successfully!'.green.bold);
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`.red.bold);
    process.exit(1);
  }
};

// Function to destroy data
const destroyData = async () => {
  try {
    await User.deleteMany();
    await Expense.deleteMany();
    await Income.deleteMany();
    await Budget.deleteMany();

    console.log('Data destroyed successfully!'.red.bold);
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`.red.bold);
    process.exit(1);
  }
};

// Create just guest data if requested
const createGuestDataOnly = async () => {
  try {
    // Find or create guest user
    let guestUser = await User.findOne({ email: 'guest@example.com' });
    
    if (!guestUser) {
      guestUser = await User.create({
        username: 'Guest User',
        email: 'guest@example.com',
        password: bcrypt.hashSync('guest123', 10),
        role: 'guest'
      });
      console.log('Guest user created...'.green.inverse);
    } else {
      console.log('Guest user already exists...'.yellow.inverse);
    }
    
    // Create guest data
    await createGuestData(guestUser._id);
    
    console.log('Guest data created successfully!'.green.bold);
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`.red.bold);
    process.exit(1);
  }
};

// Check command line argument
if (process.argv[2] === '-d') {
  destroyData();
} else if (process.argv[2] === '-g') {
  createGuestDataOnly();
} else {
  importData();
} 