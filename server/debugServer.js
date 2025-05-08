const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const colors = require('colors');
const mongoose = require('mongoose');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Debug middleware - log all requests
app.use((req, res, next) => {
  console.log('=================================='.yellow);
  console.log(`Received request: ${req.method} ${req.url}`.green);
  console.log('Headers:'.cyan, JSON.stringify(req.headers, null, 2));
  console.log('Body:'.cyan, req.body);
  console.log('=================================='.yellow);
  
  // Store original response methods to intercept
  const originalSend = res.send;
  const originalJson = res.json;
  
  // Override send to log response
  res.send = function(body) {
    console.log('=================================='.yellow);
    console.log(`Sending response: ${res.statusCode}`.green);
    console.log('Response body:'.cyan, body);
    console.log('=================================='.yellow);
    return originalSend.call(this, body);
  };
  
  // Override json to log response
  res.json = function(body) {
    console.log('=================================='.yellow);
    console.log(`Sending JSON response: ${res.statusCode}`.green);
    console.log('Response body:'.cyan, JSON.stringify(body, null, 2));
    console.log('=================================='.yellow);
    return originalJson.call(this, body);
  };
  
  next();
});

// Regular middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: '*',
  credentials: true
}));
console.log('CORS enabled for all origins for debugging'.yellow);

// Import route files
const authRoutes = require('./routes/authRoutes');

// Connect to database
(async function() {
  try {
    console.log('Connecting to MongoDB...'.cyan);
    await connectDB();
    console.log('Database connection established'.green.bold);

    // Mount routes
    app.use('/api/auth', authRoutes);

    // Debug endpoint
    app.get('/api/debug', (req, res) => {
      res.status(200).json({
        message: 'Debug server is running',
        time: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        mongo_uri_defined: !!process.env.MONGO_URI,
        jwt_secret_defined: !!process.env.JWT_SECRET,
        mongo_connection: mongoose.connection.readyState
      });
    });

    // Define port - use a different port from the main server
    const PORT = 5005;

    // Start server
    app.listen(PORT, () => {
      console.log(`Debug server running on port ${PORT}`.yellow.bold);
      console.log(`Debug API available at: http://localhost:${PORT}/api`.yellow);
    });
  } catch (error) {
    console.error(`Debug server failed to start: ${error.message}`.red.bold);
    process.exit(1);
  }
})(); 