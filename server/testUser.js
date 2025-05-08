const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

// Load environment variables
dotenv.config();

async function testRegistration() {
  try {
    console.log('Starting test registration...');
    console.log('MONGO_URI:', process.env.MONGO_URI ? 'Defined' : 'Not defined');
    console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Defined' : 'Not defined');
    
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB successfully!');
    
    // Create a timestamp to ensure uniqueness
    const timestamp = Date.now();
    const testEmail = `test${timestamp}@example.com`;
    const testUsername = `testuser${timestamp}`;
    
    console.log(`Creating test user with email: ${testEmail} and username: ${testUsername}`);
    
    // Create a new test user
    const newUser = new User({
      username: testUsername,
      email: testEmail,
      password: 'password123'
    });
    
    // Save the user to database
    const savedUser = await newUser.save();
    console.log('Test user created successfully!');
    console.log('User ID:', savedUser._id);
    console.log('Username:', savedUser.username);
    console.log('Email:', savedUser.email);
    
    // Generate a token
    console.log('Generating JWT token...');
    const token = savedUser.getSignedJwtToken();
    console.log('JWT token generated successfully!');
    
    // Test password comparison
    console.log('Testing password matching...');
    const isMatch = await savedUser.matchPassword('password123');
    console.log('Password match result:', isMatch);
    
    console.log('Test completed successfully!');
  } catch (error) {
    console.error('Test failed with error:', error);
    console.error(error.stack);
  } finally {
    // Close database connection
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('Database connection closed.');
    }
    process.exit();
  }
}

// Run the test
testRegistration();
