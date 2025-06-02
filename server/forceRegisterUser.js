const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const colors = require('colors');

// Load environment variables
dotenv.config();

// MongoDB connection string
const mongoURI = process.env.MONGO_URI;

// Function to create a user document directly
async function createUser() {
  console.log('=== FORCE REGISTER USER TEST ==='.green.bold);
  console.log(`Using MongoDB URI: ${mongoURI}`.cyan);
  
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...'.yellow);
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB Connected!'.green);
    
    // Create a timestamp for unique user
    const timestamp = Date.now();
    
    // Generate a hashed password
    console.log('Hashing password...'.yellow);
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);
    console.log('Password hashed successfully'.green);

    // Create user document directly in MongoDB
    console.log('Creating user directly in MongoDB...'.yellow);
    const user = {
      username: `testuser_${timestamp}`,
      email: `test_${timestamp}@example.com`,
      password: hashedPassword,
      role: 'user',
      createdAt: new Date()
    };
    
    // Insert directly into the users collection
    const result = await mongoose.connection.db.collection('users').insertOne(user);
    
    if (result.acknowledged) {
      console.log('✅ USER SUCCESSFULLY INSERTED INTO MONGODB!'.green.bold);
      console.log('User Details:'.cyan);
      console.log(`- ID: ${result.insertedId}`.cyan);
      console.log(`- Username: ${user.username}`.cyan);
      console.log(`- Email: ${user.email}`.cyan);
      
      // Verify the user was indeed saved by querying it back
      const savedUser = await mongoose.connection.db.collection('users').findOne({ _id: result.insertedId });
      
      if (savedUser) {
        console.log('✅ USER SUCCESSFULLY RETRIEVED FROM MONGODB!'.green.bold);
      } else {
        console.error('❌ User was inserted but could not be retrieved!'.red.bold);
      }
    } else {
      console.error('❌ User insertion failed!'.red.bold);
    }
    
    // Check all users in the collection
    const userCount = await mongoose.connection.db.collection('users').countDocuments();
    console.log(`Total users in database: ${userCount}`.cyan);
    
  } catch (error) {
    console.error('❌ ERROR:'.red.bold, error.message);
    console.error(error);
  } finally {
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed'.yellow);
    process.exit(0);
  }
}

// Run the function
createUser(); 