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
      console.log('Using MongoDB connection string (sensitive parts masked):'.cyan);
      console.log(mongoURI.replace(/:[^:]*@/, ':****@').substring(0, 50) + '...'.cyan);
    }

    // Set connection options for better reliability
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000, // Timeout for server selection
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      family: 4 // Use IPv4, skip trying IPv6
    };

    const conn = await mongoose.connect(mongoURI, options);

    console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.underline.bold);
    
    // Log the database name
    console.log(`Database: ${conn.connection.db.databaseName}`.yellow);
    
    // Set up connection event handlers
    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected'.yellow.bold);
      isConnected = false;
    });

    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:'.red.bold, err);
      isConnected = false;
    });

    // Set up automatic reconnection
    mongoose.connection.on('disconnected', async () => {
      console.log('Attempting to reconnect to MongoDB...'.yellow);
      try {
        await mongoose.connect(mongoURI, options);
        console.log('Reconnected to MongoDB successfully'.green);
        isConnected = true;
      } catch (err) {
        console.error('Failed to reconnect:'.red, err);
      }
    });
    
    // Return the connection
    isConnected = true;
    return conn;
  } catch (err) {
    console.error(`MongoDB Connection Error: ${err.message}`.red.bold);
    
    // More detailed error diagnostics
    if (err.name === 'MongoParseError') {
      console.error('Invalid MongoDB connection string. Please check your .env file'.red);
    } else if (err.name === 'MongoServerSelectionError') {
      console.error('Could not connect to MongoDB server. Check network or credentials'.red);
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