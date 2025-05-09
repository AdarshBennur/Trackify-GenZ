const mongoose = require('mongoose');
const colors = require('colors');

const connectDB = async () => {
  try {
    // Get the connection string from environment or use fallback
    const connectionString = process.env.MONGO_URI;
    
    if (!connectionString) {
      console.error('MONGO_URI is not defined in environment variables'.red.bold);
      throw new Error('MongoDB connection string is missing. Please check your .env file.');
    }
    
    console.log('Attempting to connect to MongoDB...'.yellow);
    console.log(`Connection string: ${connectionString}`.yellow);
    
    // Set up connection options
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000, // Timeout after 10s
      connectTimeoutMS: 10000,         // Give up initial connection after 10s
      socketTimeoutMS: 45000,          // Close sockets after 45s of inactivity
    };
    
    // Connect with options
    const conn = await mongoose.connect(connectionString, options);
    
    console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.bold);
    console.log(`Database Name: ${conn.connection.name}`.cyan);
    
    // Verify the connection by making a test query
    try {
      // Try to find any document to verify connection is working
      const dbList = await mongoose.connection.db.admin().listDatabases();
      console.log(`Available databases: ${dbList.databases.map(db => db.name).join(', ')}`.cyan);
    } catch (testError) {
      console.warn(`Could not verify connection with a test query: ${testError.message}`.yellow);
    }
    
    // Set up event handlers to track connection status
    mongoose.connection.on('error', err => {
      console.error(`MongoDB connection error: ${err.message}`.red.bold);
      console.error(err.stack);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected'.yellow.bold);
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected'.green.bold);
    });
    
    // Handle app termination to close the connection
    process.on('SIGINT', async () => {
      try {
        await mongoose.connection.close();
        console.log('MongoDB connection closed due to app termination'.yellow);
        process.exit(0);
      } catch (err) {
        console.error('Error closing MongoDB connection:'.red, err);
        process.exit(1);
      }
    });
    
    return conn;
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`.red.bold);
    console.error('Error Details:'.red, error);
    
    // Check for common MongoDB connection errors and provide more helpful messages
    if (error.name === 'MongoNetworkError') {
      console.error('Network error connecting to MongoDB. Is MongoDB running?'.red);
    } else if (error.name === 'MongoServerSelectionError') {
      console.error('Could not select a MongoDB server. Check your connection string and network.'.red);
    }
    
    // Don't exit the process, let the app decide how to handle it
    throw new Error(`Failed to connect to MongoDB: ${error.message}`);
  }
};

module.exports = connectDB; 