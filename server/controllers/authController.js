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

  const { username, email, password } = req.body;

  try {
    // Check if user already exists with email
    let userExists = await User.findOne({ email });

    if (userExists) {
      console.log(`User with email ${email} already exists`.yellow);
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Check if username is taken
    userExists = await User.findOne({ username });

    if (userExists) {
      console.log(`Username ${username} already taken`.yellow);
      return res.status(400).json({
        success: false,
        message: 'Username already taken'
      });
    }

    // Create user
    console.log('Creating new user...'.cyan);
    const user = await User.create({
      username,
      email,
      password
    });

    console.log(`User created successfully with ID: ${user._id}`.green.bold);
    console.log(`Username: ${user.username}, Email: ${user.email}`.green);

    sendTokenResponse(user, 201, res);

  } catch (error) {
    console.error('Error during registration:'.red.bold, error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({
        success: false,
        message: `${field} already exists`
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  const { email, password } = req.body;

  // Check for user
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }

  // Check password
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }

  sendTokenResponse(user, 200, res);
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res) => {
  console.log('getMe called');

  try {
    const user = await User.findById(req.user.id);
    const GmailToken = require('../models/GmailToken');

    if (!user) {
      console.log(`User not found with ID: ${req.user.id}`);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check Gmail connection status
    const gmailToken = await GmailToken.findOne({ user: user._id, isActive: true });
    const userObj = user.toObject();
    userObj.gmailConnected = !!gmailToken;

    console.log(`User data retrieved: ${user.email}, Gmail connected: ${userObj.gmailConnected}`);

    res.status(200).json({
      success: true,
      data: userObj
    });
  } catch (error) {
    console.error('Error in getMe:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving user data'
    });
  }
});

// @desc    Logout user / clear cookie
// @route   GET /api/auth/logout
// @access  Private
exports.logout = asyncHandler(async (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Login as guest
// @route   POST /api/auth/guest
// @access  Public
exports.guestLogin = asyncHandler(async (req, res) => {
  try {
    // Try to find existing guest user
    let guestUser = await User.findOne({ email: 'guest@demo.com' }).select('+password');

    // If guest user doesn't exist, create one
    if (!guestUser) {
      console.log('Creating new guest user...');

      guestUser = await User.create({
        username: 'Guest User',
        email: 'guest@demo.com',
        password: 'guest123',
        role: 'guest'
      });

      console.log('Guest user created successfully');
    }

    sendTokenResponse(guestUser, 200, res);

  } catch (error) {
    console.error('Guest login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Guest login failed',
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

    console.log('Sending token response...');

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
    console.log('Sending token response for Google auth...');
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

// @desc    Initiate Gmail OAuth consent
// @route   GET /api/auth/google/gmail
// @access  Private
exports.initiateGmailConsent = asyncHandler(async (req, res) => {
  const gmailService = require('../services/gmailService');

  try {
    // Generate authorization URL with user ID in state
    const authUrl = gmailService.generateAuthUrl(req.user.id);

    res.status(200).json({
      success: true,
      authUrl
    });
  } catch (error) {
    console.error('Error generating Gmail auth URL:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate Gmail authorization URL'
    });
  }
});

// @desc    Handle Gmail OAuth callback
// @route   GET /api/auth/google/gmail/callback
// @access  Public
exports.handleGmailCallback = asyncHandler(async (req, res) => {
  const gmailService = require('../services/gmailService');
  const { code, state } = req.query;

  if (!code || !state) {
    return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/profile?gmail=error&reason=missing_params`);
  }

  try {
    // Exchange authorization code for tokens
    const tokens = await gmailService.exchangeCodeForTokens(code);

    // Save encrypted tokens for user (state contains userId)
    await gmailService.saveTokensForUser(state, tokens);

    // Redirect to frontend with success message
    res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/profile?gmail=connected`);
  } catch (error) {
    console.error('Gmail OAuth callback error:', error);
    res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/profile?gmail=error&reason=token_exchange_failed`);
  }
});
