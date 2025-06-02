const mongoose = require('mongoose');
const dotenv = require('dotenv');
const colors = require('colors');
const User = require('./models/User');

// Load environment variables
dotenv.config();

// Simple function to check MongoDB connection
async function checkMongoDB() {
  console.log('========== MongoDB Connection Test =========='.green);
  
  try {
    // Check if MONGO_URI is defined
    if (!process.env.MONGO_URI) {
      console.error('MONGO_URI is not defined in environment variables!'.red.bold);
      console.log('Please make sure you have a .env file with MONGO_URI specified.'.yellow);
      process.exit(1);
    }
    
    console.log(`MONGO_URI: ${process.env.MONGO_URI}`.cyan);
    
    // Connect to MongoDB
    console.log('\nAttempting to connect to MongoDB...'.yellow);
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('MongoDB Connected Successfully!'.green.bold);
    console.log(`Connected to: ${mongoose.connection.host}`.cyan);
    console.log(`Database name: ${mongoose.connection.name}`.cyan);
    
    // Check database stats
    const dbStats = await mongoose.connection.db.stats();
    console.log('\nDatabase Stats:'.yellow);
    console.log(`Collections: ${dbStats.collections}`.cyan);
    console.log(`Documents: ${dbStats.objects}`.cyan);
    
    // List all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\nCollections in database:'.yellow);
    collections.forEach(collection => {
      console.log(`- ${collection.name}`.cyan);
    });
    
    // Check if User collection exists
    const userCollection = collections.find(c => c.name === 'users');
    if (userCollection) {
      console.log('\nUser collection exists!'.green);
      
      // Count users
      const userCount = await User.countDocuments();
      console.log(`Total users in database: ${userCount}`.cyan);
      
      // Display a sample user (without password)
      if (userCount > 0) {
        const sampleUser = await User.findOne().select('-password');
        console.log('\nSample user from database:'.yellow);
        console.log(sampleUser);
      }
    } else {
      console.log('\nUser collection does not exist yet.'.yellow);
      console.log('It will be created when the first user registers.'.yellow);
      
      // Test creating a user
      console.log('\nTesting user creation...'.yellow);
      try {
        const timestamp = Date.now();
        const testUser = new User({
          username: `test_${timestamp}`,
          email: `test_${timestamp}@example.com`,
          password: 'password123'
        });
        
        const savedUser = await testUser.save();
        console.log('Test user created successfully!'.green);
        console.log(`User ID: ${savedUser._id}`.cyan);
        console.log(`Username: ${savedUser.username}`.cyan);
        console.log(`Email: ${savedUser.email}`.cyan);
        
        // Clean up test user
        await User.deleteOne({ _id: savedUser._id });
        console.log('Test user deleted.'.yellow);
      } catch (userError) {
        console.error('Error creating test user:'.red, userError);
      }
    }
    
    console.log('\nMongoDB test completed successfully!'.green.bold);
  } catch (error) {
    console.error('Error connecting to MongoDB:'.red.bold, error.message);
    console.error(error);
  } finally {
    // Close connection
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('\nMongoDB connection closed.'.yellow);
    }
    process.exit(0);
  }
}

// Run the function
checkMongoDB(); 