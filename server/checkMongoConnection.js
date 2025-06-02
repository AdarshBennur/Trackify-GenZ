const mongoose = require('mongoose');
const dotenv = require('dotenv');
const colors = require('colors');

// Load environment variables
dotenv.config();

// MongoDB connection string
const mongoURI = process.env.MONGO_URI;

async function checkConnection() {
  console.log('=== MongoDB Connection Test ==='.green.bold);
  console.log(`Using MongoDB URI: ${mongoURI}`.cyan);
  
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...'.yellow);
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('✅ MongoDB Connected!'.green.bold);
    
    // Get DB stats
    console.log('\nDatabase Information:'.cyan);
    const db = mongoose.connection.db;
    
    // List collections
    console.log('\nCollections in database:'.yellow);
    const collections = await db.listCollections().toArray();
    
    if (collections.length === 0) {
      console.log('No collections found in database'.yellow);
    } else {
      for (const collection of collections) {
        const count = await db.collection(collection.name).countDocuments();
        console.log(`- ${collection.name}: ${count} documents`.cyan);
      }
    }
    
    // Check users collection specifically
    const usersCollection = collections.find(c => c.name === 'users');
    if (usersCollection) {
      console.log('\nUsers Collection:'.green);
      const users = await db.collection('users').find({}).limit(5).toArray();
      
      if (users.length > 0) {
        console.log(`Found ${users.length} users (showing up to 5):`.green);
        users.forEach((user, index) => {
          const safeUser = { ...user };
          if (safeUser.password) safeUser.password = '[HIDDEN]';
          
          console.log(`\nUser ${index + 1}:`.yellow);
          console.log(`- ID: ${safeUser._id}`.cyan);
          console.log(`- Username: ${safeUser.username || safeUser.name || 'N/A'}`.cyan);
          console.log(`- Email: ${safeUser.email || 'N/A'}`.cyan);
          console.log(`- Role: ${safeUser.role || 'N/A'}`.cyan);
        });
      } else {
        console.log('No users found in the users collection'.yellow);
      }
    } else {
      console.log('\n❌ Users collection does not exist'.red.bold);
    }
    
    // Check MongoDB connection status
    console.log('\nConnection Details:'.cyan);
    console.log(`- Connection State: ${mongoose.connection.readyState} (1 = Connected)`.cyan);
    console.log(`- Database Name: ${mongoose.connection.name}`.cyan);
    console.log(`- Host: ${mongoose.connection.host}`.cyan);
    console.log(`- Port: ${mongoose.connection.port}`.cyan);
    
  } catch (error) {
    console.error('❌ MongoDB Connection Error:'.red.bold);
    console.error(error);
    
    // Provide more detailed diagnostics
    if (error.name === 'MongoServerSelectionError') {
      console.log('\nPossible causes:'.yellow);
      console.log('1. MongoDB server is not running'.yellow);
      console.log('2. Connection string is incorrect'.yellow);
      console.log('3. Network connectivity issues'.yellow);
      console.log('\nTry these steps:'.green);
      console.log('1. Verify MongoDB is running: mongod --version'.green);
      console.log('2. Check your .env file MONGO_URI value'.green);
      console.log('3. Try connecting with MongoDB Compass or shell'.green);
    }
  } finally {
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('\nMongoDB connection closed'.yellow);
    process.exit(0);
  }
}

// Run the function
checkConnection(); 