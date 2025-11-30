const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Define the schema options
const schemaOptions = {
  collection: 'users', // Explicitly specify the collection name
  strict: false, // Allow fields not defined in the schema
  timestamps: false, // Don't add timestamps automatically
  autoIndex: true, // Ensure indexes are created
  autoCreate: true // Create the collection if it doesn't exist
};

// Define the User schema
const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Please provide a username'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters']
  },
  // Support both username and name fields for backward compatibility
  name: {
    type: String,
    required: false
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
  googleId: {
    type: String,
    unique: true,
    sparse: true  // Allows null values while maintaining uniqueness
  },
  currencyPreference: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Currency'
  },
  // Gmail Automation Fields
  gmailMessageIdsProcessed: {
    type: [String],
    default: [],
    select: false // Don't return by default to keep payload small
  },
  lastGmailAutoSync: {
    type: Date,
    default: null
  },
  gmailSyncError: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, schemaOptions);

// Set a pre-save middleware to ensure username/name compatibility
UserSchema.pre('save', async function (next) {
  console.log(`Pre-save middleware for user: ${this.email}`.cyan);

  // If name is provided but username is not, use name as username
  if (this.name && !this.username) {
    this.username = this.name;
  }

  // If username is provided but name is not, use username as name
  if (this.username && !this.name) {
    this.name = this.username;
  }

  next();
});

// Hash password before saving
UserSchema.pre('save', async function (next) {
  try {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) {
      console.log('Password not modified, skipping hashing');
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
    next(error); // Pass the error to the next middleware
  }
});

// Log after successful save
UserSchema.post('save', function (doc) {
  console.log(`User ${doc.email} saved successfully with ID: ${doc._id}`.green);
});

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function () {
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
UserSchema.methods.matchPassword = async function (enteredPassword) {
  try {
    return await bcrypt.compare(enteredPassword, this.password);
  } catch (error) {
    console.error('Error comparing passwords:', error);
    throw new Error('Error verifying password');
  }
};

// Create the model
const User = mongoose.model('User', UserSchema);

// Log the model creation
console.log(`User model initialized with collection: ${User.collection.name}`.cyan);

module.exports = User; 