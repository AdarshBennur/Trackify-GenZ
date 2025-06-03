const mongoose = require('mongoose');
const dotenv = require('dotenv');
const colors = require('colors');

// Load environment variables
dotenv.config({ path: '../.env' });

async function testAtlasConnection() {
  try {
    console.log('🚀 Testing MongoDB Atlas Connection...'.cyan.bold);
    
    // Check if MONGO_URI is defined
    if (!process.env.MONGO_URI) {
      console.error('❌ MONGO_URI not found in environment variables'.red.bold);
      process.exit(1);
    }
    
    console.log(`📡 Connecting to: ${process.env.MONGO_URI.replace(/:[^:]*@/, ':****@').substring(0, 50)}...`.yellow);
    
    // Connect to MongoDB Atlas
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
    });
    
    console.log('✅ Successfully connected to MongoDB Atlas!'.green.bold);
    console.log(`📊 Database: ${mongoose.connection.db.databaseName}`.cyan);
    console.log(`🏠 Host: ${mongoose.connection.host}`.cyan);
    
    // Test data write and read
    console.log('\n🧪 Testing data operations...'.yellow.bold);
    
    // Create a test collection
    const testCollection = mongoose.connection.db.collection('connection_test');
    
    // Insert test document
    const testDoc = {
      timestamp: new Date(),
      test: 'MongoDB Atlas connection successful',
      env: process.env.NODE_ENV || 'development'
    };
    
    const insertResult = await testCollection.insertOne(testDoc);
    console.log(`✅ Test document inserted with ID: ${insertResult.insertedId}`.green);
    
    // Read test document
    const readResult = await testCollection.findOne({ _id: insertResult.insertedId });
    console.log(`✅ Test document retrieved: ${readResult.test}`.green);
    
    // Clean up test document
    await testCollection.deleteOne({ _id: insertResult.insertedId });
    console.log(`🧹 Test document cleaned up`.yellow);
    
    // Check collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`\n📚 Available collections: ${collections.map(c => c.name).join(', ')}`.cyan);
    
    console.log('\n🎉 MongoDB Atlas connection test completed successfully!'.green.bold);
    
  } catch (error) {
    console.error('\n❌ MongoDB Atlas connection test failed:'.red.bold);
    console.error(`Error: ${error.message}`.red);
    
    if (error.name === 'MongoParseError') {
      console.error('💡 Check your MONGO_URI format in .env file'.yellow);
    } else if (error.name === 'MongoServerSelectionError') {
      console.error('💡 Check your network connection and MongoDB Atlas credentials'.yellow);
    }
    
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB Atlas'.gray);
  }
}

// Run the test
testAtlasConnection(); 