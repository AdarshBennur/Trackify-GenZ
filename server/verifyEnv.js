const mongoose = require('mongoose');
const dotenv = require('dotenv');
const colors = require('colors');

// Load environment variables first
dotenv.config();

console.log('\n----- Environment Variables Check -----\n'.yellow.bold);

// Check critical environment variables
const criticalVars = ['MONGO_URI', 'JWT_SECRET'];
let hasErrors = false;

criticalVars.forEach(variable => {
  if (!process.env[variable]) {
    console.error(`❌ ${variable}: Not found or empty`.red.bold);
    hasErrors = true;
  } else {
    const value = variable === 'JWT_SECRET' 
      ? `${process.env[variable].substring(0, 3)}...${process.env[variable].substring(process.env[variable].length - 3)}`
      : (variable === 'MONGO_URI' 
        ? process.env[variable].replace(/:([^\/]+)@/, ':****@').substring(0, 30) + '...' 
        : process.env[variable]);
    
    console.log(`✅ ${variable}: ${value}`.green);
  }
});

console.log('\n----- Optional Environment Variables -----\n'.yellow);

// Check optional variables
const optionalVars = ['NODE_ENV', 'PORT', 'JWT_EXPIRE', 'JWT_COOKIE_EXPIRE', 'CLIENT_URL'];

optionalVars.forEach(variable => {
  if (!process.env[variable]) {
    console.log(`⚠️ ${variable}: Not set (will use default)`.yellow);
  } else {
    console.log(`✅ ${variable}: ${process.env[variable]}`.green);
  }
});

// Test database connection
console.log('\n----- MongoDB Connection Test -----\n'.yellow.bold);

async function testConnection() {
  try {
    if (!process.env.MONGO_URI) {
      console.error('❌ Cannot test MongoDB connection: MONGO_URI is not defined'.red.bold);
      return false;
    }
    
    console.log('Attempting to connect to MongoDB...'.cyan);
    
    // Set up options
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Short timeout for testing
    };
    
    // Connect with timeout
    const conn = await mongoose.connect(process.env.MONGO_URI, options);
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`.green.bold);
    console.log(`✅ Database Name: ${conn.connection.name}`.green);
    
    // Close connection
    await mongoose.connection.close();
    console.log('✅ Connection closed properly'.green);
    
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection error:'.red.bold);
    console.error(`   ${error.message}`.red);
    
    if (error.name === 'MongooseServerSelectionError') {
      console.error('   This error typically indicates:'.yellow);
      console.error('   1. Network connectivity issues'.yellow);
      console.error('   2. MongoDB Atlas IP whitelist restrictions'.yellow);
      console.error('   3. Incorrect username/password in connection string'.yellow);
      console.error('   4. MongoDB service might be down'.yellow);
    }
    
    return false;
  }
}

// Summary
async function runTests() {
  const dbConnected = await testConnection();
  
  console.log('\n----- Environment Check Summary -----\n'.yellow.bold);
  
  if (hasErrors) {
    console.error('❌ Critical environment variables missing!'.red.bold);
    console.error('   Please check your .env file and set all required variables.'.red);
  } else {
    console.log('✅ All critical environment variables are set'.green);
  }
  
  if (dbConnected) {
    console.log('✅ MongoDB connection successful'.green);
  } else {
    console.error('❌ MongoDB connection failed'.red.bold);
    console.error('   Please check your MONGO_URI variable and network connection.'.red);
  }
  
  console.log('\nIf all checks pass, your server should be ready to handle authentication.'.cyan);
  console.log('If not, please fix the issues before proceeding.'.cyan);
  
  // Exit after tests
  process.exit(dbConnected && !hasErrors ? 0 : 1);
}

runTests(); 