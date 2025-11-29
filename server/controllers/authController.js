const User = require('../models/User');
const asyncHandler = require('express-async-handler');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const colors = require('colors');
const { OAuth2Client } = require('google-auth-library');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res) => {
  console.log('=== Registration process started ==='.cyan.bold);
  console.log('Request body:', JSON.stringify({ ...req.body, password: '[HIDDEN]' }, null, 2));

  // Check MongoDB connection status and details
  console.log(`MongoDB connection state: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Not connected'}`.yellow);
  console.log(`Database name: ${mongoose.connection.name}`.yellow);

  if (mongoose.connection.readyState !== 1) {
    console.error('MongoDB not connected. Current state:', mongoose.connection.readyState);
    return res.status(500).json({
      success: false,
      message: 'Database connection error. Please try again later.'
    });
  }

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
    console.log(`Registration attempt for email: ${email}, username: ${username}`.yellow);

    // Check if all required fields are provided
    if (!username || !email || !password) {
      console.log('Missing required fields');
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: username, email, password'
      });
    }

    // Check if user with this email exists
    console.log('Checking if email already exists...'.yellow);
    const userExists = await User.findOne({ email });
    if (userExists) {
      console.log(`User with email ${email} already exists`);
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Check username uniqueness
    console.log('Checking if username already exists...'.yellow);
    const usernameExists = await User.findOne({ username });
    if (usernameExists) {
      console.log(`Username ${username} is already taken`);
      return res.status(400).json({
        success: false,
        message: 'Username is already taken'
      });
    }

    // Create user (password will be hashed in the User model pre-save middleware)
    console.log('Creating new user with details:', { username, email, role: 'user' });

    try {
      // Create user document directly using the mongoose model
      const user = new User({
        username,
        email,
        password,
        role: 'user' // Ensure role is set to 'user' for regular registered users
      });

      // Save to MongoDB
      console.log('Saving user to MongoDB...'.cyan);
      const savedUser = await user.save();

      if (!savedUser || !savedUser._id) {
        console.error('User save operation did not return a valid user document'.red);
        return res.status(500).json({
          success: false,
          message: 'Failed to save user to database'
        });
      }

      console.log('User saved to MongoDB with ID:', savedUser._id);

      // Double check the user was saved by querying it directly from MongoDB
      const verifyUser = await User.findById(savedUser._id);

      if (!verifyUser) {
        console.error('CRITICAL ERROR: User not found in database after save'.red.bold);
        // Try direct MongoDB collection access as a fallback
        const directDbCheck = await mongoose.connection.db.collection('users').findOne({ _id: savedUser._id });

        if (directDbCheck) {
          console.log('User found directly in MongoDB collection but not through Mongoose'.yellow);
        } else {
          console.error('User not found in MongoDB collection after save - registration FAILED'.red.bold);
          return res.status(500).json({
            success: false,
            message: 'User registration failed. Please try again.'
          });
        }
      } else {
        console.log('User successfully verified in MongoDB'.green);
      }

      // Generate JWT token and send response
      console.log(`User registered successfully: ${email}`.green);
      sendTokenResponse(savedUser, 201, res);

    } catch (createError) {
      console.error('Error creating user document:'.red, createError);

      // Try direct MongoDB insertion as a fallback if Mongoose fails
      if (createError.name === 'MongooseError' || createError.name === 'ValidationError') {
        console.log('Attempting direct MongoDB insertion as fallback...'.yellow);
        try {
          // Create a user document manually
          const hashedPassword = await bcrypt.hash(password, 10);
          const userDoc = {
            username,
            name: username, // For backward compatibility
            email,
            password: hashedPassword,
            role: 'user',
            createdAt: new Date()
          };

          const result = await mongoose.connection.db.collection('users').insertOne(userDoc);

          if (result.acknowledged && result.insertedId) {
            console.log('User inserted directly into MongoDB with ID:', result.insertedId);

            // Convert to Mongoose document for token generation
            const insertedUser = await User.findById(result.insertedId);
            if (insertedUser) {
              console.log('Successfully retrieved inserted user for token generation'.green);
              sendTokenResponse(insertedUser, 201, res);
              return;
            } else {
              console.log('Direct insertion succeeded but could not retrieve user for authentication'.yellow);
              // Continue to error response
            }
          }
        } catch (directInsertError) {
          console.error('Direct MongoDB insertion also failed:'.red, directInsertError);
          // Continue to error response
        }
      }

      return res.status(500).json({
        success: false,
        message: 'Failed to register user. Please try again.',
        error: process.env.NODE_ENV === 'development' ? createError.message : undefined
      });
    }
  } catch (error) {
    console.error('Error in registration process:'.red, error);

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
    else if (error.message && error.message.includes('bcrypt')) {
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

  // Check if the login is for the guest account
  if (email === 'guest@demo.com') {
    console.log('Guest login detected, forwarding to guest login handler');
    return this.guestLogin(req, res);
  }

  try {
    // Ensure database connection
    if (mongoose.connection.readyState !== 1) {
      console.log('MongoDB not connected, attempting to reconnect...');
      try {
        await mongoose.connect(process.env.MONGO_URI.replace(/\n/g, '').replace(/\r/g, ''), {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        });
        console.log('Reconnected to MongoDB successfully');
      } catch (connectError) {
        console.error('Failed to reconnect to MongoDB:', connectError);
        return res.status(500).json({
          success: false,
          message: 'Database connection error. Please try again later.'
        });
      }
    }

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
    let guestUser = await User.findOne({ email: 'guest@demo.com' });

    if (!guestUser) {
      console.log('Creating guest user account');
      // Create a guest user account
      guestUser = await User.create({
        username: 'Guest User',
        email: 'guest@demo.com',
        password: 'guest123', // This will be hashed by the User model's pre-save hook
        role: 'guest'
      });
    } else {
      // Ensure the role is set to 'guest' even if it was changed
      if (guestUser.role !== 'guest') {
        guestUser.role = 'guest';
        await guestUser.save();
      }
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
        message: 'Logged in as guest. You can explore all features with sample data!'
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

// @desc    Google OAuth login/signup
// @route   POST /api/auth/google
// @access  Public
exports.googleAuth = asyncHandler(async (req, res) => {
  console.log('Google OAuth process started');

  const { credential } = req.body;

  if (!credential) {
    return res.status(400).json({
      success: false,
      message: 'Google credential is required'
    });
  }

  try {
    // Initialize Google OAuth client
    const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

    // Verify Google token
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, sub: googleId, picture } = payload;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email not provided by Google'
      });
    }

    console.log(`Google auth attempt for email: ${email}`);

    // Check if user exists
    let user = await User.findOne({ email });

    if (!user) {
      // Create new user from Google account
      console.log(`Creating new user from Google auth: ${email}`);

      // Generate a random password (won't be used for Google login)
      const randomPassword = Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12);

      user = await User.create({
        username: name || email.split('@')[0],
        email,
        password: randomPassword,
        googleId,
        role: 'user'
      });

      console.log(`User created successfully via Google: ${email}`);
    } else {
      // Update Google ID if not set
      if (!user.googleId) {
        user.googleId = googleId;
        await user.save();
        console.log(`Updated existing user with Google ID: ${email}`);
      } else {
        console.log(`Existing user logged in via Google: ${email}`);
      }
    }

    console.log(`User authenticated via Google: ${email}`);
    sendTokenResponse(user, 200, res);

  } catch (error) {
    console.error('Error in Google OAuth:', error);

    if (error.message && error.message.includes('Token used too early')) {
      return res.status(401).json({
        success: false,
        message: 'Invalid Google token timestamp'
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Invalid Google token',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});
