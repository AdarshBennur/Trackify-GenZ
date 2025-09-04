const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const { connectDB, isDbConnected } = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const path = require('path');
const colors = require('colors');
const mongoose = require('mongoose');

// Load environment variables first before any other operations
dotenv.config();
console.log('Environment loaded'.green);

if (process.env.MONGO_URI) {
  console.log(`MongoDB URI configured: ${process.env.MONGO_URI}`.green);
} else {
  console.error('MONGO_URI is not defined in environment variables'.red.bold);
  console.error('Please check your .env file and set the MONGO_URI variable'.red);
}

// Import route files
const authRoutes = require('./routes/authRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const currencyRoutes = require('./routes/currencyRoutes');
const incomeRoutes = require('./routes/incomeRoutes');
const budgetRoutes = require('./routes/budgetRoutes');
const goalRoutes = require('./routes/goalRoutes');
const reminderRoutes = require('./routes/reminderRoutes');
const userRoutes = require('./routes/userRoutes');

// Import setupCollections
const setupCollections = require('./setupCollections');
const initCurrencies = require('./initCurrencies');

// Initialize express app
const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

// CORS configuration for both development and production
const allowedOrigins = [
  'http://localhost:3000',
  'https://trackify-gen-z.vercel.app',
  process.env.CLIENT_URL
].filter(Boolean); // Remove any undefined values

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log(`CORS blocked request from origin: ${origin}`.red);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

console.log(`CORS enabled for origins: ${allowedOrigins.join(', ')}`.green);

// Check for essential environment variables
const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error(`❌ Missing required environment variables: ${missingEnvVars.join(', ')}`.red.bold);
  console.error('Please set these variables in your Render dashboard:'.red);
  missingEnvVars.forEach(envVar => {
    console.error(`  - ${envVar}`.red);
  });
  
  if (process.env.NODE_ENV === 'production') {
    console.error('Cannot start production server without required environment variables'.red.bold);
    process.exit(1);
  } else {
    console.warn('Using fallback values for development. NOT SECURE FOR PRODUCTION!'.yellow.bold);
  }
} else {
  console.log('✅ All required environment variables are set'.green);
}

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
  console.log(`Running in ${process.env.NODE_ENV} mode`.cyan.bold);
}

// Connect to database and start server with retry logic
async function startServer() {
  const maxRetries = 5;
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      console.log(`Connecting to MongoDB... (attempt ${retries + 1}/${maxRetries})`.cyan);
      
      // Extract database name from URI for logging
      const dbName = process.env.MONGO_URI?.includes('/expense_tracker') 
        ? 'expense_tracker' 
        : (process.env.MONGO_URI?.match(/\/([^/?]+)(\?|$)/) || [])[1] || 'unknown';
      
      console.log(`Target MongoDB database: ${dbName}`.cyan);
      
      // Connect to database
      const conn = await connectDB();
      console.log('Database connection established'.green.bold);
      
      // Only run setup if connected successfully
      if (isDbConnected()) {
        try {
          // Setup collections
          console.log('Setting up database collections...'.yellow);
          await setupCollections();
          
          // Initialize currencies
          await initCurrencies();
          
          // Print database stats
          const stats = await mongoose.connection.db.stats();
          console.log(`MongoDB stats: ${stats.collections} collections, ${stats.objects} documents`.cyan);
          
          // Verify User collection exists
          const collections = await mongoose.connection.db.listCollections().toArray();
          const userCollectionExists = collections.some(collection => collection.name === 'users');
          
          if (userCollectionExists) {
            console.log('Users collection found in database'.green);
            // Count users for verification
            const userCount = await mongoose.connection.db.collection('users').countDocuments();
            console.log(`Current user count in database: ${userCount}`.cyan);
          } else {
            console.log('Users collection not found in database. It will be created on first user registration.'.yellow);
          }
        } catch (setupError) {
          console.warn(`Setup error: ${setupError.message}`.yellow);
          console.log('Continuing server startup despite setup errors'.yellow);
        }
      } else {
        console.warn('Database not fully connected, skipping database setup'.yellow);
      }

      // Mount routes
      app.use('/api/auth', authRoutes);
      app.use('/api/expenses', expenseRoutes);
      app.use('/api/currencies', currencyRoutes);
      app.use('/api/incomes', incomeRoutes);
      app.use('/api/budgets', budgetRoutes);
      app.use('/api/goals', goalRoutes);
      app.use('/api/reminders', reminderRoutes);
      app.use('/api/users', userRoutes);

      // Define port
      const PORT = process.env.PORT || 5001;

      // Start server
      app.listen(PORT, '0.0.0.0', () => {
        console.log('🚀 SERVER STARTED SUCCESSFULLY'.green.bold);
        console.log(`📡 Port: ${PORT}`.yellow);
        console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`.cyan);
        console.log(`🔗 API Base URL: ${process.env.NODE_ENV === 'production' ? 'https://trackify-genz.onrender.com/api' : `http://localhost:${PORT}/api`}`.yellow);
        console.log(`❤️  Health Check: ${process.env.NODE_ENV === 'production' ? 'https://trackify-genz.onrender.com/api/health' : `http://localhost:${PORT}/api/health`}`.cyan);
        console.log(`🌍 Server bound to all interfaces (0.0.0.0:${PORT})`.green);
        
        if (process.env.NODE_ENV === 'production') {
          console.log('🔒 Production mode: Enhanced security enabled'.green);
          console.log(`🎯 CORS allowed origins: ${allowedOrigins.join(', ')}`.blue);
        }
      });
      
      // Success - break out of retry loop
      break;
      
    } catch (error) {
      retries++;
      console.error(`Server startup attempt ${retries} failed: ${error.message}`.red.bold);
      
      if (retries >= maxRetries) {
        console.error('Error Details:'.red, error);
        console.error(`Maximum retry attempts (${maxRetries}) reached. Application is exiting...`.red.bold);
        process.exit(1);
      } else {
        const waitTime = Math.min(5000 * retries, 30000); // Progressive backoff up to 30 seconds
        console.log(`Waiting ${waitTime/1000} seconds before retry...`.yellow);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }
}

// Start the server
startServer();

// Enhanced API health check route
app.get('/api/health', async (req, res) => {
  try {
    // Check database connection
    const dbStatus = isDbConnected() ? 'connected' : 'disconnected';
    
    // Get database stats if connected
    let dbInfo = { status: dbStatus };
    if (isDbConnected()) {
      try {
        const stats = await mongoose.connection.db.stats();
        dbInfo = {
          status: 'connected',
          collections: stats.collections,
          documents: stats.objects,
          database: mongoose.connection.db.databaseName
        };
      } catch (statsError) {
        dbInfo.status = 'connected_but_stats_unavailable';
      }
    }
    
    res.status(200).json({
      status: 'success',
      message: 'API is running smoothly',
      environment: process.env.NODE_ENV || 'development',
      database: dbInfo,
      server: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: process.version
      },
      cors: {
        allowedOrigins: [
          'http://localhost:3000',
          'https://trackify-gen-z.vercel.app',
          process.env.CLIENT_URL
        ].filter(Boolean)
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Health check failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Error handler middleware - keep this after routes
app.use(errorHandler);

// Production API-only server - Frontend is deployed separately on Vercel
// No need to serve React build files from Express backend 