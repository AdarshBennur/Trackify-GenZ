const mongoose = require('mongoose');
const dotenv = require('dotenv');
const colors = require('colors');

// Load environment variables
dotenv.config();

async function listAtlasUsers() {
  console.log('=== MongoDB Atlas Users List ==='.green.bold);
  
  // Get MongoDB URI from .env and fix any line breaks
  let mongoURI = process.env.MONGO_URI;
  
  if (!mongoURI) {
    console.error('❌ ERROR: MONGO_URI not found in .env file'.red.bold);
    process.exit(1);
  }
  
  // Fix line breaks in connection string
  mongoURI = mongoURI.replace(/\n/g, '').replace(/\r/g, '');
  
  console.log(`Connection string (masked): ${mongoURI.replace(/:[^:]*@/, ':****@').substring(0, 40)}...`.cyan);
  
  try {
    console.log('Connecting to MongoDB Atlas...'.yellow);
    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('✅ Successfully connected to MongoDB Atlas!'.green.bold);
    console.log(`Connected to: ${conn.connection.host}`.cyan);
    console.log(`Database: ${conn.connection.db.databaseName}`.cyan);
    
    // Get users collection
    const usersCollection = conn.connection.db.collection('users');
    const users = await usersCollection.find({}).toArray();
    
    console.log(`\nFound ${users.length} users in the database:`.green);
    
    if (users.length === 0) {
      console.log('No users found in the database'.yellow);
    } else {
      users.forEach((user, index) => {
        const safeUser = { ...user };
        if (safeUser.password) safeUser.password = '[HIDDEN]';
        
        console.log(`\nUser ${index + 1}:`.yellow);
        console.log(`- ID: ${safeUser._id}`.cyan);
        console.log(`- Username: ${safeUser.username || safeUser.name || 'N/A'}`.cyan);
        console.log(`- Email: ${safeUser.email || 'N/A'}`.cyan);
        console.log(`- Role: ${safeUser.role || 'N/A'}`.cyan);
        console.log(`- Created: ${safeUser.createdAt ? new Date(safeUser.createdAt).toLocaleString() : 'N/A'}`.cyan);
      });
    }
    
  } catch (error) {
    console.error('❌ MongoDB Atlas Connection Error:'.red.bold);
    console.error(error);
  } finally {
    try {
      await mongoose.connection.close();
      console.log('\nMongoDB connection closed'.yellow);
    } catch (err) {
      // Ignore close errors
    }
    process.exit(0);
  }
}

// Run the function
listAtlasUsers(); 