const mongoose = require('mongoose');
const colors = require('colors');

// Track connection status
let isConnected = false;

const connectDB = async () => {
  try {
    // If already connected, reuse the connection
    if (mongoose.connection.readyState === 1) {
      console.log('Using existing MongoDB connection'.cyan);
      isConnected = true;
      return mongoose.connection;
    }
    
    // Get the connection string and handle potential line breaks
    let mongoURI = process.env.MONGO_URI;
    if (mongoURI) {
      // Remove any line breaks that might be in the connection string
      mongoURI = mongoURI.replace(/\n/g, '').replace(/\r/g, '');
      console.log('Using MongoDB Atlas connection (sensitive parts masked):'.cyan);
      console.log(mongoURI.replace(/:[^:]*@/, ':****@').substring(0, 80) + '...'.cyan);
    }

    // Set connection options optimized for MongoDB Atlas
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000, // Increased timeout for Atlas
      socketTimeoutMS: 75000, // Increased socket timeout
      family: 4, // Use IPv4, skip trying IPv6
      maxPoolSize: 10, // Maintain up to 10 socket connections
      retryWrites: true,
      w: 'majority'
    };

    console.log('Attempting connection to MongoDB Atlas...'.yellow);
    const conn = await mongoose.connect(mongoURI, options);

    console.log(`MongoDB Atlas Connected: ${conn.connection.host}`.cyan.underline.bold);
    
    // Log the database name
    console.log(`Database: ${conn.connection.db.databaseName}`.yellow);
    
    // Set up connection event handlers
    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB Atlas disconnected'.yellow.bold);
      isConnected = false;
    });

    mongoose.connection.on('error', (err) => {
      console.error('MongoDB Atlas connection error:'.red.bold, err.message);
      isConnected = false;
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB Atlas reconnected'.green.bold);
      isConnected = true;
    });
    
    // Return the connection
    isConnected = true;
    return conn;
  } catch (err) {
    console.error(`MongoDB Atlas Connection Error: ${err.message}`.red.bold);
    
    // More detailed error diagnostics
    if (err.name === 'MongoParseError') {
      console.error('Invalid MongoDB connection string. Please check your Atlas connection string'.red);
    } else if (err.name === 'MongoServerSelectionError') {
      console.error('Could not connect to MongoDB Atlas. Check your connection string and network'.red);
      console.error('Make sure your IP is whitelisted in Atlas and credentials are correct'.red);
    } else if (err.code === 8000) {
      console.error('Authentication failed. Check your Atlas username and password'.red);
    }
    
    // Don't exit the process, let the caller handle it
    throw err;
  }
};

// Function to check if database is connected
const isDbConnected = () => {
  return isConnected && mongoose.connection.readyState === 1;
};

module.exports = {
  connectDB,
  isDbConnected
}; 