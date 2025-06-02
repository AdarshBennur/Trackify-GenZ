const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

// Protect routes
exports.protect = asyncHandler(async (req, res, next) => {
  let token;
  
  // Check for token in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    // Set token from Bearer token in header
    token = req.headers.authorization.split(' ')[1];
    console.log('Token from Authorization header:', token.substring(0, 15) + '...');
  } 
  // Check for token in cookies
  else if (req.cookies.token) {
    token = req.cookies.token;
    console.log('Token from cookies:', token.substring(0, 15) + '...');
  }

  // Check if no token
  if (!token) {
    console.log('No token provided, access denied');
    res.status(401);
    throw new Error('Not authorized to access this route');
  }

  try {
    // Verify token
    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET || 'trackify-secret-key'
    );
    
    console.log('Token decoded successfully, user ID:', decoded.id);

    // Check if it's a guest user token
    if (decoded.id === 'guest-user-id') {
      console.log('Guest user authenticated');
      req.user = {
        id: 'guest-user-id',
        username: 'Guest User',
        email: 'guest@demo.com',
        role: 'guest'
      };
      return next();
    }

    // Find the user by ID
    const user = await User.findById(decoded.id);
    
    if (!user) {
      console.log('User not found for ID:', decoded.id);
      res.status(401);
      throw new Error('User not found with this ID');
    }
    
    console.log('User authenticated:', user.email, 'Role:', user.role);
    req.user = user;
    next();
  } catch (err) {
    console.error('Token verification error:', err.message);
    res.status(401);
    throw new Error('Not authorized to access this route');
  }
});

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user.role || !roles.includes(req.user.role)) {
      console.log('User role not authorized. Required:', roles, 'User has:', req.user.role);
      res.status(403);
      throw new Error(
        `User role ${req.user.role} is not authorized to access this route`
      );
    }
    console.log(`User with role ${req.user.role} authorized to access this route`);
    next();
  };
}; 