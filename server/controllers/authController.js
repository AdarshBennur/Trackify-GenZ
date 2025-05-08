const User = require('../models/User');
const asyncHandler = require('express-async-handler');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res) => {
  console.log('Registration process started');
  
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Validation errors:', errors.array());
    return res.status(400).json({ 
      success: false,
      errors: errors.array() 
    });
  }

  try {
    const { username, email, password } = req.body;

    // Log registration attempt for debugging
    console.log(`Registration attempt for email: ${email}, username: ${username}`);

    // Check if all required fields are provided
    if (!username || !email || !password) {
      console.log('Missing required fields');
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: username, email, password'
      });
    }

    // Check if user with this email exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      console.log(`User with email ${email} already exists`);
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Check username uniqueness
    const usernameExists = await User.findOne({ username });
    if (usernameExists) {
      console.log(`Username ${username} is already taken`);
      return res.status(400).json({
        success: false,
        message: 'Username is already taken'
      });
    }

    // Create user (password will be hashed in the User model pre-save middleware)
    console.log('Creating new user...');
    const user = await User.create({
      username,
      email,
      password
    });

    if (user) {
      console.log(`User registered successfully: ${email}`);
      // Generate JWT token and send response
      sendTokenResponse(user, 201, res);
    } else {
      console.log('Failed to create user');
      return res.status(400).json({
        success: false,
        message: 'Invalid user data'
      });
    }
  } catch (error) {
    console.error('Error in registration process:', error);
    
    // Check for MongoDB connection errors
    if (error.name === 'MongooseServerSelectionError') {
      console.error('MongoDB connection error during registration:', error);
      return res.status(500).json({
        success: false,
        message: 'Database connection error. Please try again later.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    } 
    // Check for MongoDB duplicate key errors
    else if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      console.error(`Duplicate ${field} error:`, error.keyValue);
      return res.status(400).json({
        success: false,
        message: `${field === 'email' ? 'Email' : 'Username'} is already in use`
      });
    } 
    // Handle validation errors
    else if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      console.error('Validation error:', messages);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    } 
    // Handle bcrypt or password hashing errors 
    else if (error.message.includes('bcrypt')) {
      console.error('Password hashing error:', error);
      return res.status(500).json({
        success: false,
        message: 'Error during password encryption. Please try again.'
      });
    }
    // Otherwise, return a general error
    else {
      console.error('Unexpected error in registration:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error during registration',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res) => {
  console.log('Login process started');
  
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Validation errors:', errors.array());
    return res.status(400).json({ 
      success: false,
      errors: errors.array() 
    });
  }

  const { email, password } = req.body;

  // Validate email & password
  if (!email || !password) {
    console.log('Missing email or password');
    return res.status(400).json({
      success: false,
      message: 'Please provide an email and password'
    });
  }

  try {
    // Check for user
    console.log(`Attempting to find user with email: ${email}`);
    // select('+password') is needed because password field has select: false by default
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      console.log(`No user found with email: ${email}`);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if password matches using bcrypt.compare via the method in the User model
    console.log('Verifying password...');
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      console.log('Password verification failed');
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    console.log(`User logged in successfully: ${email}`);
    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error('Error in login process:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Login as guest
// @route   POST /api/auth/guest
// @access  Public
exports.guestLogin = asyncHandler(async (req, res) => {
  console.log('Guest login process started');
  
  try {
    // Find existing guest user or create new one
    let guestUser = await User.findOne({ email: 'guest@example.com' });

    if (!guestUser) {
      console.log('Creating guest user account');
      // Create a guest user account
      guestUser = await User.create({
        username: 'Guest User',
        email: 'guest@example.com',
        password: 'guest123', // This will be hashed by the User model's pre-save hook
        role: 'guest'
      });
    }

    console.log('Guest user logged in successfully');
    // Generate guest token with shorter expiry
    const token = guestUser.getSignedJwtToken();

    const options = {
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day for guest
      httpOnly: true
    };

    if (process.env.NODE_ENV === 'production') {
      options.secure = true;
    }

    // Send guest response
    res.status(200)
      .cookie('token', token, options)
      .json({
        success: true,
        token,
        user: {
          id: guestUser._id,
          username: guestUser.username,
          email: guestUser.email,
          role: guestUser.role
        },
        message: 'Logged in as guest. You can explore all features!'
      });
  } catch (error) {
    console.error('Error in guest login process:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during guest login',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error in getMe process:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving user data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Log user out / clear cookie
// @route   GET /api/auth/logout
// @access  Private
exports.logout = asyncHandler(async (req, res) => {
  console.log('User logout process started');
  
  try {
    res.cookie('token', 'none', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true
    });

    console.log('User logged out successfully');
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Error in logout process:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during logout',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Helper function to get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  try {
    console.log('Generating JWT token...');
    
    // Verify JWT_SECRET exists
    if (!process.env.JWT_SECRET) {
      console.warn('JWT_SECRET not found in environment variables, using fallback secret');
    }
    
    // Create token
    const token = user.getSignedJwtToken();
    console.log('JWT token generated successfully');

    const options = {
      expires: new Date(
        Date.now() + (process.env.JWT_COOKIE_EXPIRE || 30) * 24 * 60 * 60 * 1000
      ),
      httpOnly: true
    };

    // Set secure flag in production
    if (process.env.NODE_ENV === 'production') {
      options.secure = true;
    }

    res
      .status(statusCode)
      .cookie('token', token, options)
      .json({
        success: true,
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      });
  } catch (error) {
    console.error('Error in token generation:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating authentication token',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}; 