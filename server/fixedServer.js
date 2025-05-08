const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Middleware with verbose logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Regular middleware
app.use(express.json());
app.use(cors({
  origin: '*', // Allow all origins for testing
  credentials: true
}));

// Check if MongoDB connection string is valid
const mongoUri = process.env.MONGO_URI || 'mongodb+srv://aditrack:track999@tracker.pq6xgts.mongodb.net/expensetracker?retryWrites=true&w=majority&appName=tracker';
console.log('Using MongoDB URI:', mongoUri.replace(/:[^:]*@/, ':****@'));

// Simple User schema for registration
const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    default: 'user'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  console.log(`Hashing password for user: ${this.email}`);
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  console.log('Password hashed successfully');
  next();
});

// User model
const User = mongoose.model('User', UserSchema);

// Register endpoint
app.post('/api/auth/register', async (req, res) => {
  console.log('🔄 Registration process started');
  console.log('📦 Request body:', { ...req.body, password: '[HIDDEN]' });
  
  try {
    const { username, email, password } = req.body;

    // Check if all required fields are provided
    if (!username || !email || !password) {
      console.log('❌ Missing required fields');
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: username, email, password'
      });
    }

    // Check if user exists 
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });
    
    if (existingUser) {
      console.log('❌ User already exists');
      return res.status(400).json({
        success: false,
        message: existingUser.email === email 
          ? 'Email already in use' 
          : 'Username already taken'
      });
    }

    // Create user
    console.log('⏳ Creating new user...');
    const user = new User({ username, email, password });
    const savedUser = await user.save();
    
    console.log('✅ User created successfully');
    
    // Generate JWT token
    const token = jwt.sign(
      { id: savedUser._id },
      process.env.JWT_SECRET || 'trackify-secret-key',
      { expiresIn: '30d' }
    );
    
    // Send success response
    return res.status(201).json({
      success: true,
      token,
      user: {
        id: savedUser._id,
        username: savedUser.username,
        email: savedUser.email,
        role: savedUser.role
      }
    });
  } catch (error) {
    console.error('❌ Registration error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: error.message
    });
  }
});

// Same endpoint for /signup route
app.post('/api/auth/signup', async (req, res) => {
  console.log('Signup endpoint called, forwarding to register endpoint');
  
  // Forward to the register handler
  app.handle(req, res, () => {});
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Fixed server is running',
    time: new Date().toISOString(),
    mongo_status: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' 
  });
});

// Connect to database and start server
(async function() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB connected successfully');

    // Define port - different from main server
    const PORT = 5010;

    // Start server
    app.listen(PORT, () => {
      console.log(`✅ Fixed server running on port ${PORT}`);
      console.log(`📡 API available at: http://localhost:${PORT}/api`);
      console.log('🚀 Use this server for testing registration');
      
      // Print test command
      console.log('\n📋 Test with:');
      console.log(`curl -X POST -H "Content-Type: application/json" -d '{"username":"test"$(date +%s),"email":"test"$(date +%s)"@example.com","password":"password123"}' http://localhost:${PORT}/api/auth/register\n`);
    });
  } catch (error) {
    console.error(`❌ Server failed to start: ${error.message}`);
    process.exit(1);
  }
})(); 