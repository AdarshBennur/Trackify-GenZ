const mongoose = require('mongoose');
const dotenv = require('dotenv');
const colors = require('colors');
const fs = require('fs');

// Load environment variables
dotenv.config();

async function testAtlasConnection() {
  console.log('=== MongoDB Atlas Connection Test ==='.green.bold);
  
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
    
    // List collections
    console.log('\nCollections in database:'.yellow);
    const collections = await conn.connection.db.listCollections().toArray();
    
    if (collections.length === 0) {
      console.log('No collections found in database'.yellow);
    } else {
      for (const collection of collections) {
        const count = await conn.connection.db.collection(collection.name).countDocuments();
        console.log(`- ${collection.name}: ${count} documents`.cyan);
      }
    }
    
    // Test inserting a document into users collection
    console.log('\nTesting user creation...'.yellow);
    const testUser = {
      username: `test_atlas_${Date.now()}`,
      email: `test_atlas_${Date.now()}@example.com`,
      password: 'hashedpassword123',
      role: 'test',
      createdAt: new Date()
    };
    
    try {
      const result = await conn.connection.db.collection('users').insertOne(testUser);
      
      if (result.acknowledged) {
        console.log('✅ Successfully inserted test user into users collection'.green);
        console.log(`Test user ID: ${result.insertedId}`.cyan);
        
        // Verify we can read the test user
        const foundUser = await conn.connection.db.collection('users').findOne({ _id: result.insertedId });
        if (foundUser) {
          console.log('✅ Successfully retrieved test user from database'.green);
        } else {
          console.log('❌ Failed to retrieve test user after insertion'.red);
        }
        
        // Clean up test user
        await conn.connection.db.collection('users').deleteOne({ _id: result.insertedId });
        console.log('Test user cleaned up'.yellow);
      } else {
        console.log('❌ Failed to insert test user'.red);
      }
    } catch (insertError) {
      console.error('❌ Error inserting test user:'.red, insertError);
    }
    
  } catch (error) {
    console.error('❌ MongoDB Atlas Connection Error:'.red.bold);
    console.error(error);
    
    if (error.name === 'MongoParseError') {
      console.log('\nThere appears to be an issue with your connection string format.'.yellow);
      
      // Save original .env file as backup
      const envContent = fs.readFileSync('./.env', 'utf8');
      fs.writeFileSync('./.env.backup', envContent);
      console.log('Created .env.backup file with your original .env content'.yellow);
      
      // Try to fix the connection string
      let fixedContent = envContent.replace(/MONGO_URI=(.+?)(\r?\n|\r|$)/s, (match, uri) => {
        const fixedUri = uri.replace(/\s+/g, '');
        return `MONGO_URI=${fixedUri}\n`;
      });
      
      console.log('\nTrying to fix your .env file...'.yellow);
      fs.writeFileSync('./.env.fixed', fixedContent);
      console.log('Created .env.fixed with corrections'.green);
      console.log('Please use the following corrected connection string in your .env file:'.cyan);
      
      // Extract and print the corrected connection string
      const match = fixedContent.match(/MONGO_URI=([^\n]+)/);
      if (match) {
        console.log(match[1].replace(/:[^:]*@/, ':****@'));
      }
    }
    
    if (error.name === 'MongoServerSelectionError') {
      console.log('\nPossible causes:'.yellow);
      console.log('1. Network connectivity issues'.yellow);
      console.log('2. MongoDB Atlas cluster is not available'.yellow);
      console.log('3. IP address not whitelisted in MongoDB Atlas'.yellow);
      console.log('\nMake sure to:'.cyan);
      console.log('1. Check your network connection'.cyan);
      console.log('2. Verify cluster is running in MongoDB Atlas'.cyan);
      console.log('3. Add your current IP address to the IP whitelist in MongoDB Atlas'.cyan);
    }
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

// Run the test
testAtlasConnection(); 