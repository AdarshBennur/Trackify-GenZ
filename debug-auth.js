#!/usr/bin/env node

const axios = require('axios');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const colors = require('colors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';
const MONGO_URI = process.env.MONGO_URI || 'mongodb://admin:password123@localhost:27017/trackify?authSource=admin';

console.log('🔍 Authentication Debug Tool'.cyan.bold);
console.log('================================'.cyan);

async function testDatabaseConnection() {
  console.log('\n📊 Testing Database Connection...'.yellow.bold);
  
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Database connection successful'.green);
    
    // List collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`📁 Found ${collections.length} collections:`.cyan);
    collections.forEach(col => console.log(`   - ${col.name}`.white));
    
    // Count users
    const userCount = await mongoose.connection.db.collection('users').countDocuments();
    console.log(`👥 Total users in database: ${userCount}`.cyan);
    
    return true;
  } catch (error) {
    console.log('❌ Database connection failed:'.red.bold, error.message);
    return false;
  }
}

async function testServerHealth() {
  console.log('\n🏥 Testing Server Health...'.yellow.bold);
  
  try {
    const response = await axios.get(`${API_BASE.replace('/api', '')}/api/health`);
    console.log('✅ Server health check successful'.green);
    console.log('📊 Server status:'.cyan, response.data);
    return true;
  } catch (error) {
    console.log('❌ Server health check failed:'.red.bold);
    if (error.response) {
      console.log(`   Status: ${error.response.status}`.red);
      console.log(`   Data: ${JSON.stringify(error.response.data)}`.red);
    } else {
      console.log(`   Error: ${error.message}`.red);
    }
    return false;
  }
}

async function createTestUser() {
  console.log('\n👤 Creating Test User...'.yellow.bold);
  
  const timestamp = Date.now();
  const testUser = {
    username: `testuser${timestamp}`,
    email: `test${timestamp}@example.com`,
    password: 'password123'
  };
  
  try {
    console.log(`📝 Registering: ${testUser.username} / ${testUser.email}`.cyan);
    
    const response = await axios.post(`${API_BASE}/auth/register`, testUser, {
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true
    });
    
    console.log('✅ User registration successful'.green);
    console.log('👤 User data:'.cyan, response.data.user);
    console.log('🔐 Token generated:'.cyan, response.data.token ? 'Yes' : 'No');
    
    return testUser;
  } catch (error) {
    console.log('❌ User registration failed:'.red.bold);
    if (error.response) {
      console.log(`   Status: ${error.response.status}`.red);
      console.log(`   Data: ${JSON.stringify(error.response.data, null, 2)}`.red);
    } else {
      console.log(`   Error: ${error.message}`.red);
    }
    return null;
  }
}

async function testUserLogin(testUser) {
  console.log('\n🔐 Testing User Login...'.yellow.bold);
  
  if (!testUser) {
    console.log('⏭️  Skipping login test - no test user available'.yellow);
    return false;
  }
  
  try {
    console.log(`🔑 Logging in: ${testUser.email}`.cyan);
    
    const response = await axios.post(`${API_BASE}/auth/login`, {
      email: testUser.email,
      password: testUser.password
    }, {
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true
    });
    
    console.log('✅ User login successful'.green);
    console.log('👤 User data:'.cyan, response.data.user);
    console.log('🔐 Token generated:'.cyan, response.data.token ? 'Yes' : 'No');
    
    return true;
  } catch (error) {
    console.log('❌ User login failed:'.red.bold);
    if (error.response) {
      console.log(`   Status: ${error.response.status}`.red);
      console.log(`   Data: ${JSON.stringify(error.response.data, null, 2)}`.red);
    } else {
      console.log(`   Error: ${error.message}`.red);
    }
    return false;
  }
}

async function testPasswordHashing() {
  console.log('\n🔒 Testing Password Hashing...'.yellow.bold);
  
  const testPassword = 'password123';
  
  try {
    // Test bcrypt directly
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(testPassword, salt);
    
    console.log('✅ Password hashing successful'.green);
    console.log(`🔑 Original: ${testPassword}`.cyan);
    console.log(`🔐 Hashed: ${hashedPassword}`.cyan);
    
    // Test password comparison
    const isMatch = await bcrypt.compare(testPassword, hashedPassword);
    console.log(`🔍 Password verification: ${isMatch ? '✅ Success' : '❌ Failed'}`.cyan);
    
    return true;
  } catch (error) {
    console.log('❌ Password hashing failed:'.red.bold, error.message);
    return false;
  }
}

async function checkExistingUsers() {
  console.log('\n👥 Checking Existing Users...'.yellow.bold);
  
  try {
    const users = await mongoose.connection.db.collection('users').find({}).limit(5).toArray();
    
    console.log(`📊 Found ${users.length} sample users:`.cyan);
    
    users.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.username} (${user.email}) - Role: ${user.role}`.white);
      console.log(`      Created: ${user.createdAt}`.gray);
      console.log(`      Password Hash: ${user.password ? 'Present' : 'Missing'}`.gray);
    });
    
    return users;
  } catch (error) {
    console.log('❌ Failed to check existing users:'.red.bold, error.message);
    return [];
  }
}

async function testExistingUserLogin(users) {
  console.log('\n🔐 Testing Login with Existing User...'.yellow.bold);
  
  if (!users || users.length === 0) {
    console.log('⏭️  No existing users to test with'.yellow);
    return false;
  }
  
  // Try to login with the first user (we don't know their password, so this will likely fail)
  const testUser = users[0];
  
  try {
    console.log(`🔑 Attempting login with: ${testUser.email}`.cyan);
    console.log('🚨 Note: Using test password "password123" - this will likely fail unless it matches'.yellow);
    
    const response = await axios.post(`${API_BASE}/auth/login`, {
      email: testUser.email,
      password: 'password123'
    }, {
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true
    });
    
    console.log('✅ Existing user login successful (password matched!)'.green);
    return true;
  } catch (error) {
    console.log('❌ Existing user login failed (expected if password doesn\'t match)'.red);
    if (error.response && error.response.data) {
      console.log(`   Message: ${error.response.data.message}`.red);
    }
    return false;
  }
}

async function testGuestLogin() {
  console.log('\n🎭 Testing Guest Login...'.yellow.bold);
  
  try {
    const response = await axios.post(`${API_BASE}/auth/login`, {
      email: 'guest@demo.com',
      password: 'guest123'
    }, {
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true
    });
    
    console.log('✅ Guest login successful'.green);
    console.log('👤 Guest user data:'.cyan, response.data.user);
    
    return true;
  } catch (error) {
    console.log('❌ Guest login failed:'.red.bold);
    if (error.response) {
      console.log(`   Status: ${error.response.status}`.red);
      console.log(`   Data: ${JSON.stringify(error.response.data, null, 2)}`.red);
    }
    return false;
  }
}

async function runDiagnostics() {
  console.log('🚀 Starting Authentication Diagnostics...'.green.bold);
  console.log(`🌐 API Base URL: ${API_BASE}`.cyan);
  console.log(`🗄️  MongoDB URI: ${MONGO_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}`.cyan);
  
  const results = {
    database: false,
    server: false,
    passwordHashing: false,
    registration: false,
    login: false,
    guestLogin: false
  };
  
  // Test database connection
  results.database = await testDatabaseConnection();
  
  // Test server health
  results.server = await testServerHealth();
  
  // Test password hashing
  results.passwordHashing = await testPasswordHashing();
  
  // Check existing users
  const existingUsers = await checkExistingUsers();
  
  // Test existing user login
  if (existingUsers.length > 0) {
    await testExistingUserLogin(existingUsers);
  }
  
  // Test guest login
  results.guestLogin = await testGuestLogin();
  
  // Test user registration and login
  if (results.database && results.server) {
    const testUser = await createTestUser();
    if (testUser) {
      results.registration = true;
      results.login = await testUserLogin(testUser);
    }
  }
  
  // Summary
  console.log('\n📋 Diagnostic Summary'.yellow.bold);
  console.log('===================='.yellow);
  
  Object.entries(results).forEach(([test, passed]) => {
    const status = passed ? '✅ PASS' : '❌ FAIL';
    const color = passed ? 'green' : 'red';
    console.log(`${test.padEnd(20)}: ${status}`[color]);
  });
  
  // Recommendations
  console.log('\n💡 Recommendations'.yellow.bold);
  console.log('================='.yellow);
  
  if (!results.database) {
    console.log('🔧 Database connection failed - check MongoDB container and connection string'.red);
  }
  
  if (!results.server) {
    console.log('🔧 Server health check failed - ensure server is running and accessible'.red);
  }
  
  if (!results.passwordHashing) {
    console.log('🔧 Password hashing failed - check bcrypt installation and configuration'.red);
  }
  
  if (results.registration && !results.login) {
    console.log('🔧 Registration works but login fails - check password hashing consistency'.red);
  }
  
  if (!results.guestLogin) {
    console.log('🔧 Guest login failed - check if guest user exists and credentials are correct'.red);
  }
  
  // Close database connection
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.close();
  }
  
  console.log('\n🏁 Diagnostics complete!'.green.bold);
}

// Run diagnostics if called directly
if (require.main === module) {
  runDiagnostics().catch(console.error);
}

module.exports = { runDiagnostics }; 