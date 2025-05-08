const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Please provide a username'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'guest'],
    default: 'user'
  },
  currencyPreference: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Currency'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  try {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) {
      return next();
    }
    
    console.log(`Hashing password for user: ${this.email}`);
    
    // Generate salt with 10 rounds
    const salt = await bcrypt.genSalt(10);
    
    // Hash password with salt
    this.password = await bcrypt.hash(this.password, salt);
    
    console.log('Password hashed successfully');
    next();
  } catch (error) {
    console.error('Error hashing password:', error);
    next(new Error('Error hashing password. Please try again.'));
  }
});

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function() {
  try {
    const jwtSecret = process.env.JWT_SECRET || 'trackify-secret-key';
    
    if (!process.env.JWT_SECRET) {
      console.warn('JWT_SECRET not defined in environment variables, using fallback secret');
    }
    
    const jwtExpire = process.env.JWT_EXPIRE || '30d';
    
    return jwt.sign(
      { id: this._id },
      jwtSecret,
      { expiresIn: jwtExpire }
    );
  } catch (error) {
    console.error('Error signing JWT token:', error);
    throw new Error('Failed to generate authentication token');
  }
};

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function(enteredPassword) {
  try {
    return await bcrypt.compare(enteredPassword, this.password);
  } catch (error) {
    console.error('Error comparing passwords:', error);
    throw new Error('Error verifying password');
  }
};

module.exports = mongoose.model('User', UserSchema); 