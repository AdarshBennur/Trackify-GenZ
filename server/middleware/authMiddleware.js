const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - middleware to check if user is authenticated
exports.protect = async (req, res, next) => {
  let token;
  
  try {
    // Check if token exists in headers
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      // Set token from Bearer token in header
      token = req.headers.authorization.split(' ')[1];
    } 
    // Check if token exists in cookies
    else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    // Check if token was found
    if (!token) {
      console.log('No authentication token provided');
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route - no token provided'
      });
    }

    // Verify JWT_SECRET exists
    if (!process.env.JWT_SECRET) {
      console.warn('JWT_SECRET not found in environment variables, using fallback secret');
    }

    // Verify token
    console.log('Verifying authentication token...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'trackify-secret-key');
    console.log(`Token verified for user ID: ${decoded.id}`);

    // Find user with the id from the token
    const user = await User.findById(decoded.id);

    if (!user) {
      console.log(`User not found with ID: ${decoded.id}`);
      return res.status(401).json({
        success: false,
        message: 'User not found with this ID'
      });
    }

    // Check if user is a guest
    if (user.role === 'guest' || user.email === 'guest@demo.com') {
      console.log(`Guest user (${user.email}) accessing: ${req.method} ${req.originalUrl}`);
    } else {
      console.log(`Authenticated user (${user.email}) accessing: ${req.method} ${req.originalUrl}`);
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication middleware error:', error.message);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token format or signature'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired. Please log in again'
      });
    }
    
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(500).json({
        success: false,
        message: 'Server error - user object not available'
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    
    next();
  };
}; 