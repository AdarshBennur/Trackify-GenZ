const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const path = require('path');
const colors = require('colors');
const mongoose = require('mongoose');

// Load environment variables first before any other operations
dotenv.config();
console.log(process.env.MONGO_URI);
// Import route files
const authRoutes = require('./routes/authRoutes');
const expenseRoutes = require('./routes/expenseRoutes');

// Initialize express app
const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

// Allow all origins in development mode for testing
if (process.env.NODE_ENV === 'development') {
  app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
  }));
  console.log('CORS enabled for all origins in development mode'.yellow);
} else {
  app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
  }));
}

// Check for essential environment variables
if (!process.env.MONGO_URI) {
  console.error('MONGO_URI is not defined in environment variables'.red.bold);
  console.error('Please check your .env file and set the MONGO_URI variable'.red);
}

if (!process.env.JWT_SECRET) {
  console.warn('JWT_SECRET is not defined in environment variables'.yellow.bold);
  console.warn('Using fallback secret for JWT. This is not secure for production!'.yellow);
}

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
  console.log(`Running in ${process.env.NODE_ENV} mode`.cyan.bold);
}

// Connect to database and start server
(async function() {
  try {
    console.log('Connecting to MongoDB...'.cyan);
    await connectDB();
    console.log('Database connection established'.green.bold);

    // Mount routes
    app.use('/api/auth', authRoutes);
    app.use('/api/expenses', expenseRoutes);

    // Define port
    const PORT = process.env.PORT || 5001;

    // Start server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`.yellow.bold);
      console.log(`API available at: http://localhost:${PORT}/api`.yellow);
    });
  } catch (error) {
    console.error(`Server failed to start: ${error.message}`.red.bold);
    console.error('Application is exiting...'.red);
    
    // Exit with failure code
    process.exit(1);
  }
})();

// API health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'API is running',
    env: process.env.NODE_ENV,
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date()
  });
});

// Error handler middleware - keep this after routes
app.use(errorHandler);

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static(path.join(__dirname, '../client/build')));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client', 'build', 'index.html'));
  });
} 