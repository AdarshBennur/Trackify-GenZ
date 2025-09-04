const errorHandler = (err, req, res, next) => {
  // Enhanced logging for production debugging
  console.error('🚨 ERROR OCCURRED:'.red.bold);
  console.error(`📍 Route: ${req.method} ${req.originalUrl}`.yellow);
  console.error(`🕒 Time: ${new Date().toISOString()}`.cyan);
  console.error(`👤 User: ${req.user ? req.user.email : 'Not authenticated'}`.cyan);
  console.error(`🔍 Error Type: ${err.name}`.yellow);
  console.error(`📝 Error Message: ${err.message}`.red);
  
  // Log stack trace only in development or if specifically needed
  if (process.env.NODE_ENV === 'development' || process.env.LOG_STACK_TRACE === 'true') {
    console.error('📚 Stack trace:'.gray);
    console.error(err.stack.gray);
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    console.log(`CastError: ${err.message}`.yellow);
    return res.status(404).json({
      success: false,
      message: 'Resource not found',
      error: err.message
    });
  }
  
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(error => error.message);
    console.log(`ValidationError: ${messages.join(', ')}`.yellow);
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: messages
    });
  }
  
  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    console.log(`DuplicateKey: ${field} already exists`.yellow);
    return res.status(400).json({
      success: false,
      message: 'Duplicate field value entered',
      error: `${field} already exists`
    });
  }
  
  // JWT token errors
  if (err.name === 'JsonWebTokenError') {
    console.log(`JWT Error: ${err.message}`.yellow);
    return res.status(401).json({
      success: false,
      message: 'Invalid token',
      error: err.message
    });
  }
  
  if (err.name === 'TokenExpiredError') {
    console.log(`JWT Error: Token expired`.yellow);
    return res.status(401).json({
      success: false,
      message: 'Token expired',
      error: err.message
    });
  }

  // MongoDB connection errors
  if (err.name === 'MongooseServerSelectionError') {
    console.log(`MongoDB Connection Error: ${err.message}`.red);
    return res.status(500).json({
      success: false,
      message: 'Database connection error',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Could not connect to database'
    });
  }

  // Password hashing errors
  if (err.message && err.message.includes('bcrypt')) {
    console.log(`Bcrypt Error: ${err.message}`.red);
    return res.status(500).json({
      success: false,
      message: 'Error with password encryption',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }

  // Default to 500 server error with enhanced production debugging
  console.log(`General Error: ${err.message}`.red);
  
  const errorResponse = {
    success: false,
    message: err.message || 'Server Error',
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    method: req.method,
    error: process.env.NODE_ENV === 'development' || process.env.DETAILED_ERRORS === 'true' 
      ? err.stack 
      : 'An unexpected error occurred'
  };
  
  res.status(err.statusCode || 500).json(errorResponse);
};

module.exports = errorHandler; 