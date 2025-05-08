const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

// Load environment variables
dotenv.config();

async function testDB() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Create a test user
    const newUser = new User({
      username: 'testuser123',
      email: 'testuser123@example.com',
      password: 'password123'
    });

    const savedUser = await newUser.save();
    console.log('User saved:', savedUser);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
  }
}

testDB();
