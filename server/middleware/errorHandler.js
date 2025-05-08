const errorHandler = (err, req, res, next) => {
  // Log the error stack for debugging
  console.error('Error stack:'.red);
  console.error(err.stack.red);

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

  // Default to 500 server error
  console.log(`General Error: ${err.message}`.red);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Server Error',
    error: process.env.NODE_ENV === 'development' ? err.stack : 'An unexpected error occurred'
  });
};

module.exports = errorHandler; 